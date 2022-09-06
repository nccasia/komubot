const { sendErrorToDevTest } = require('../../util/komubotrest.js');
const { parseTimesheetMessage,
  validateTimesheetFormat,
  logTimeSheetForTask,
  checkHelpMessage,
  getProjectOfUser,
  debug,
  getDebug
} = require('../../util/timesheet.js');

const messHelp = `
Please log timesheet follow this template:
   *timesheet help
  -------------------------------------
   *timesheet [projectCode] dd/mm/yyyy
      + task description; 2h, nt, coding
      + task description; 2h, nt, coding
      + task description; 2h, nt, coding
  `;

module.exports = {
  name: 'timesheet',
  description: 'Log timesheet',
  cat: 'komu',
  async execute(message, args, client) {
    const authorId = message.author.id;
    const username = message.author.username;
    const content = message.content;
    console.log('content timesheet', content);
    const timesheetObj = parseTimesheetMessage(content);
    debug('timesheetObj', timesheetObj);
    const IS_HELP_MESSAGE = checkHelpMessage(timesheetObj);
    if (IS_HELP_MESSAGE) {
      try {
        debug('=> Input syntax is help syntax');
        const projects = await getProjectOfUser(`${username}@ncc.asia`);
        let replyMessage = 'Các dự án mà bạn tham gia:\n';
        projects.forEach(item => {
          if (item.projectName &&
                  item.projectCode)
          {replyMessage += `  - Dự án: ${item.projectName}, code: ${item.projectCode}\n`;}
        });
        return message
          .reply({
            content: replyMessage,
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      } catch (error) {
        console.log(error);
        return message
          .reply({
            content: 'Lấy danh sách dự án lỗi',
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      }
    }
    const INVLALID_FORMAT = !validateTimesheetFormat(timesheetObj);
    if (INVLALID_FORMAT)
    {return message
      .reply({
        content: messHelp,
        ephemeral: true,
      })
      .catch((err) => {
        sendErrorToDevTest(client, authorId, err);
      });};

    if (getDebug()) return debug('Successfully');

    const results = [];

    for (const task of timesheetObj.tasks) {
      try {
        const response = await logTimeSheetForTask({
          task,
          projectCode: timesheetObj.projectCode,
          emailAddress: `${username}@ncc.asia`
        });
        const result = response.data;
        results.push(result);
      } catch (e) {
        results.push({
          success: false,
          result:
            e.response && e.response.message ? e.response.message : e.message,
        });
      }
    }

    const resultsReport = results.map(res => res && res.result).join('\n');

    return message
      .reply({
        content: resultsReport,
        ephemeral: true,
      });
  },
};
