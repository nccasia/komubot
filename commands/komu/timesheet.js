const axios = require('axios');
const { sendErrorToDevTest } = require('./komubotrest.js');
/* CreateTimesheetDto
   {
      dateAt: "2022-08-25"
      note: "dfadasd"
      projectId: 1234
      projectTargetUserId: null
      projectTaskId: 1234
      targetUserWorkingTime: 0
      typeOfWork: 0
      workingTime: 480
   }

   {
      dateAt: "2022-08-25"
      id: 201110
      isCharged: true
      isTemp: false
      note: "dfadasd"
      projectId: 20193
      projectTargetUserId: null
      projectTaskId: 40766
      status: 0
      targetUserWorkingTime: 0
      typeOfWork: 1
      workingTime: 480
   }
*/
// TODO
const messHelp =
   '```' +
   'Please log timesheet follow this template' +
   '\n' +
   '*logTimesheet dd/mm/yyyy' +
   '\n' +
   '- project:' +
   '\n' +
   '- note:' +
   '\n' +
   '- workingTime: ' +
   '\n' +
   '- task: ' +
   '```';
const getProjectByName = async (prjName) => { }
// const wordInString = (s, word) => new RegExp('\b' + word + '\b', 'i').test(s);
const LOG_TIMESHEET_REQUIRED_FILEDS = ["- project:", "- note:", "- workingTime:", "- task:"]
const checkLogTimeFormat = (contentArray) => {
   for (let field of LOG_TIMESHEET_REQUIRED_FILEDS) {
      let isValid = false
      for (let line of contentArray) {
         if (line.include(field)) {
            isValid = true
            break
         }
      }
      if (!isValid) return false
   }
   return true
}
const extractLogTimeValue = (contentArray) => {
   const contentObj = {}
   for (let field of LOG_TIMESHEET_REQUIRED_FILEDS) {
      for (let line of contentArray) {
         if (line.include(field)) {
            contentObj[field] = line.replace(field).trim()
            break
         }
      }
   }
   return contentObj
}
const validateFields = (contentObj) => {
   if (Object.values(contentObj).length !== LOG_TIMESHEET_REQUIRED_FILEDS)
      return false
   for (let value of Object.values(contentObj))
      if (value === '') return false
   if (!contentObj['- workingTime:'] || contentObj['- workingTime:'] === '')
      contentObj['- workingTime:'] = 8
   if (isNaN(parseFloat(contentObj['- workingTime:'])))
      return false
   contentObj['- workingTime:'] = parseFloat(contentObj['- workingTime:'])
   return true
}
const createTimesheetPayload = (username, contentObj) => {
   return ({
      username,
      projectTaskId,
      projectId: contentObj['projectId'],
      note: contentObj['- note:'],
      workingTime: contentObj['- workingTime:'],
      targetUserWorkingTime: 0,
      typeOfWork: 0,
      isCharged: true,
      dateAt: new Date(),
      status: 0,
      projectTargetUserId: 0,
      isTemp: true,
   })
}
const inValidSynctax = async (message, messageContent) => message
   .reply({
      content: messageContent,
      ephemeral: true,
   })
   .catch((err) => {
      sendErrorToDevTest(client, authorId, err);
   });

module.exports = {
   name: 'logTimesheet',
   description: 'Log timesheet komu',
   cat: 'komu',
   async logTimesheet(message, args, client) {
      let authorId = message.author.id;
      let username = message.author.username;
      const logTimeContent = args.join(' ').split('\n');
      if (!logTimeContent.length)
         return inValidSynctax(message, messHelp)
      let isValidContent = checkLogTimeFormat(logTimeContent);
      if (!isValidContent)
         return inValidSynctax(message, messHelp)
      const contentObj = extractLogTimeValue(logTimeContent)
      if (!validateFields(contentObj))
         return inValidSynctax(message, messHelp)
      try {
         const projectName = contentObj['- project:']
         const projectId = await getProjectByName(projectName)
         if (!projectId) return inValidSynctax(message, 'Project not found')
         contentObj['projectId'] = projectId
      } catch (err) {
         console.log(err)
         return inValidSynctax(message, 'Get project failed')
      }
      const timesheetPayload = await createTimesheetPayload(username, contentObj)
      const timesheetUrl = `${client.config.submitTimesheet.api_url_logTimesheetByKomu}`

      try {
         await axios.post(timesheetUrl, timesheetPayload, {
            headers: {
               securitycode: process.env.WFH_API_KEY_SECRET,
            },
         })
      } catch (err) {
         console.log(err)
         message
            .reply({ content: 'Log timsheet failed', ephemeral: true })
            .catch((err) => {
               sendErrorToDevTest(client, authorId, err);
            });
      }
   },
};