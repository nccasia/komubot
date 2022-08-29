const parseDuration = require('parse-duration')
const chrono = require('chrono-node')
const axios = require('axios')
const config = require('../config.js')

let DEBUG = false

const normalizeString = (str) => {
  return (str || '').trim()
}

const parseTimeSheetTask = (chunk) => {
  const [note, meta] = (chunk || '').split(';')
  const [timeRaw, type, name] = (meta || '').split(',')
  const time = normalizeString(timeRaw)
  const duration = parseDuration(time)
  const task = {
    note: normalizeString(note),
    time: time,
    duration: duration,
    type: normalizeString(type),
    name: normalizeString(name),
  }
  return task
}

const parseTimeSheetSentence = (sentence) => {
  const chunks = sentence.split(new RegExp('\\+', 'ig'))
  const items = chunks
    .filter((chunk) => chunk.trim())
    .map((chunk) => parseTimeSheetTask(chunk))
  return items
}

const parseDailyMessage = (message) => {
  const [, metaRaw, yesterday, todayRaw, block] = message.split(
    new RegExp('\\*daily|- yesterday:|- today:|- block:', 'ig'),
  )
  const [projectRaw, dateRaw] = metaRaw.trim().split(/\s+/)
  const dateStr = dateRaw
    ? normalizeString(dateRaw)
    : normalizeString(projectRaw)
  const projectCode = dateRaw ? normalizeString(projectRaw) : null
  const todayStr = normalizeString(todayRaw)
  const date = chrono.parseDate(dateStr)
  const tasks = parseTimeSheetSentence(todayStr)
  const contentObj = {
    date: dateStr,
    projectCode,
    timeStamp: date,
    yesterday: normalizeString(yesterday),
    today: todayStr,
    block: normalizeString(block),
    tasks,
  }

  return contentObj
}

const logTimeSheetForTask = async ({ task, projectCode, emailAddress }) => {
  // {
  //   "emailAddress": "string",
  //   "projectCode": "string",
  //   "taskName": "string",
  //   "hour": 0,
  //   "typeOfWork": 0,
  //   "note": "string"
  // }
  const typeOfWork = task.type === 'ot' ? 1 : 0
  const hour = task.duration ? task.duration / 3600000 : 0
  const taskName = task.name
  const timesheetPayload = {
    note: task.note,
    emailAddress,
    projectCode,
    typeOfWork,
    taskName,
    hour,
  }

  const url =
    !hour || !projectCode
      ? config.api_url_logTimesheetByKomu
      : config.api_url_logTimesheetFullByKomu

  return await axios.post(url, timesheetPayload, {
    headers: {
      headers: { 'X-Secret-Key': process.env.WIKI_API_KEY_SECRET },
    },
  })
}

const logTimeSheetFromDaily = async ({ content, emailAddress }) => {
  const data = parseDailyMessage(content)
  const projectCode = data.projectCode
  for (const task of data.tasks) {
    try {
      await logTimeSheetForTask({ projectCode, task, emailAddress })
    } catch (e) {
      // TODO: return result
      console.log(e)
    }
  }
}

const debug = (...messages) => {
  if (DEBUG) console.log(...messages)
}
const setDebug = () => (DEBUG = true)
const getDebug = () => DEBUG

module.exports = {
  parseTimeSheetTask,
  parseTimeSheetSentence,
  parseDailyMessage,
  logTimeSheetFromDaily,
  debug,
  setDebug,
  getDebug,
}
