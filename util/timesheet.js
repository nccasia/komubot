const parseDuration = require('parse-duration');
const chrono = require('chrono-node');
const axios = require('axios');
const config = require('../config.js');

let DEBUG = false;

const normalizeString = (str) => {
  return (str || '').trim();
};

const parseTimeSheetTask = (chunk) => {
  const [note, meta] = (chunk || '').split(';');
  const [timeRaw, type, name] = (meta || '').split(',');
  const time = normalizeString(timeRaw);
  const duration = parseDuration(time);
  const task = {
    note: normalizeString(note),
    time: time,
    duration: duration,
    type: normalizeString(type),
    name: normalizeString(name),
  };
  return task;
};

const parseTimeSheetSentence = (sentence) => {
  const chunks = sentence.split(new RegExp('\\+', 'ig'));
  const items = chunks
    .filter((chunk) => chunk.trim())
    .map((chunk) => parseTimeSheetTask(chunk));
  return items;
};

const parseDailyMessage = (message) => {
  const [, metaRaw, yesterday, todayRaw, block] = message.split(
    new RegExp('\\*daily|- yesterday:|- today:|- block:', 'ig'),
  );
  const [projectRaw, dateRaw] = metaRaw.trim().split(/\s+/);
  const dateStr = dateRaw
    ? normalizeString(dateRaw)
    : normalizeString(projectRaw);
  const projectCode = dateRaw ? normalizeString(projectRaw) : null;
  const todayStr = normalizeString(todayRaw);
  const date = chrono.parseDate(dateStr);
  const tasks = parseTimeSheetSentence(todayStr);
  const contentObj = {
    date: dateStr,
    projectCode,
    timeStamp: date,
    yesterday: normalizeString(yesterday),
    today: todayStr,
    block: normalizeString(block),
    tasks,
  };
  return contentObj;
};

const parseTimesheetMessage = (message) => {
  const [, metaRaw, ...taskRaw] = message.split(
    new RegExp('\\*timesheet|\\+', 'ig'),
  );
  const [projectRaw, dateRaw] = metaRaw.trim().split(/\s+/);
  const dateStr = dateRaw
    ? normalizeString(dateRaw)
    : normalizeString(projectRaw);
  const projectCode = dateRaw ? normalizeString(projectRaw) : null;
  const date = chrono.parseDate(dateStr);
  const tasks = taskRaw
    .filter((chunk) => chunk.trim())
    .map((chunk) => parseTimeSheetTask(chunk));
  const contentObj = {
    date: dateStr,
    projectCode,
    timeStamp: date,
    tasks,
  };
  return contentObj;
};

const validateTimesheetFormat = (contentObj) => {
  const INVALID_TIME = !contentObj.timeStamp;
  const EMPTY_TASKS = !contentObj.tasks.length;
  const INVALID_TASKS = !validateTasks(contentObj.tasks);
  if (
    INVALID_TIME ||
    EMPTY_TASKS ||
    INVALID_TASKS ||
    !contentObj.projectCode ||
    contentObj.projectCode === ''
  )
  {return false;};
  return true;
};

const validateTasks = (tasks) => {
  for (const task of tasks) {
    if (
      task.note === '' ||
      task.time === '' ||
      task.type === '' ||
      task.name === '' ||
      !task.duration ||
      !['ot', 'nt'].includes(task.type)
    )
    {return false;};
  }
  return true;
};

const checkHelpMessage = (contentObj) => {
  if (
    contentObj?.date === 'help' &&
    contentObj?.projectCode === null &&
    contentObj?.timeStamp === null &&
    !contentObj?.tasks.length
  )
  {return true;};
  return false;
};

const logTimeSheetForTask = async ({ task, projectCode, emailAddress }) => {
  const typeOfWork = task.type === 'ot' ? 1 : 0;
  const hour = task.duration ? task.duration / 3600000 : 0;
  const taskName = task.name;
  const timesheetPayload = {
    note: task.note,
    emailAddress,
    projectCode,
    typeOfWork,
    taskName,
    hour,
  };

  const url =
    !hour || !projectCode
      ? config.submitTimesheet.api_url_logTimesheetByKomu
      : config.submitTimesheet.api_url_logTimesheetFullByKomu;

  const response = await axios.post(url, timesheetPayload, {
    headers: {
      'X-Secret-Key': process.env.WFH_API_KEY_SECRET,
      'Content-Type': 'application/json'
    },
  });
  console.log(response.data);

  return response;
};

const getProjectOfUser = async (email) => {
  const url = getDebug()
    ? 'http://timesheetapi.nccsoft.vn/api/services/app/Public/GetPMsOfUser'
    : config.project.api_url_getListProjectOfUser;
  const projects =
    (
      await axios.get(`${url}?email=${email}`, {
        headers: {
          headers: { 'X-Secret-Key': process.env.WFH_API_KEY_SECRET },
        },
      })
    )?.data?.result || [];
  return projects.map((item) => ({
    projectName: item?.projectName || '',
    projectCode: item?.projectCode || '',
  }));
};

const logTimeSheetFromDaily = async ({ content, emailAddress }) => {
  const data = parseDailyMessage(content);
  const projectCode = data.projectCode;
  const results = [];
  for (const task of data.tasks) {
    try {
      const response = await logTimeSheetForTask({
        projectCode,
        task,
        emailAddress,
      });
      const result = response.data;
      results.push(result);
    } catch (e) {
      console.log(e);
      results.push({
        success: false,
        result:
          e.response && e.response.message ? e.response.message : e.message,
      });
    }
  }
};

const debug = (...messages) => {
  if (DEBUG) console.log(...messages);
};
const setDebug = () => (DEBUG = true);
const getDebug = () => DEBUG;

module.exports = {
  parseTimeSheetTask,
  parseTimeSheetSentence,
  parseDailyMessage,
  logTimeSheetFromDaily,
  logTimeSheetForTask,
  checkHelpMessage,
  getProjectOfUser,
  parseTimesheetMessage,
  validateTimesheetFormat,
  debug,
  setDebug,
  getDebug,
};
