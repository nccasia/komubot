const axios = require('axios');
const { sendErrorToDevTest } = require('../../util/komubotrest');
const {
   checkLogTimeFormat,
   extractLogTimeValue,
   validateFields,
   debug,
   getDebug,
   TIMESHEET_MESSAGE_HELP,
} = require('../../util/timesheet')
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

const getProjectByName = async (prjName) => { }
const createTimesheetPayload = (username, contentObj) => {
   return ({
      username,
      projectTaskId,
      projectId: contentObj['projectId'],
      note: contentObj['note'],
      workingTime: contentObj['workingTime'],
      targetUserWorkingTime: 0,
      typeOfWork: 0,
      isCharged: true,
      dateAt: new Date(),
      status: 0,
      projectTargetUserId: 0,
      isTemp: true,
   })
}
const replyMesage = async (message, messageContent) => {
   console.log(`[Reply user]: ${messageContent}`)
   return message
      .reply({
         content: messageContent,
         ephemeral: true,
      })
}

module.exports = {
   name: 'logTimesheet',
   description: 'Log timesheet komu',
   cat: 'komu',
   async logTimesheet(message, args, client) {
      let authorId = message.author.id;
      let username = message.author.username;
      const logTimeContent = args.join(' ').split('\n');
      debug('[Check arguments length]')
      if (!logTimeContent.length)
         return replyMesage(message, TIMESHEET_MESSAGE_HELP).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
         });
      debug('[Check valid format]')
      const requiredFields = checkLogTimeFormat(logTimeContent)
      if (requiredFields.length)
         return replyMesage(message, `Mising required fields "${requiredFields.join(' ')}"\n${TIMESHEET_MESSAGE_HELP}`).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
         });
      debug('[extract value from template]')
      const contentObj = extractLogTimeValue(logTimeContent)
      debug({ contentObj })
      debug('[Validate fields]')
      const invalidFieldsErrr = validateFields(contentObj)
      if (invalidFieldsErrr.length)
         return replyMesage(message, invalidFieldsErrr + TIMESHEET_MESSAGE_HELP).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
         });
      if (getDebug()) return debug('[Success !!!]')

      try {
         const projectName = contentObj['project']
         const projectId = await getProjectByName(projectName)
         if (!projectId) return replyMesage(message, 'Project not found')
         contentObj['projectId'] = projectId
      } catch (err) {
         console.log(err)
         return replyMesage(message, 'Get project failed')
      }

      const timesheetPayload = await createTimesheetPayload(username, contentObj)
      const timesheetUrl = `${client.config.submitTimesheet.api_url_logTimesheetByKomu}`

      try {
         await axios.post(timesheetUrl, timesheetPayload, {
            headers: {
               securitycode: process.env.WFH_API_KEY_SECRET,
            },
         })
         return replyMesage(message, '✅ Timesheet saved.').catch((err) => {
            sendErrorToDevTest(client, authorId, err);
         });
      } catch (err) {
         console.log(err)
         replyMesage(mesage, 'Log timsheet failed')
      }
   },
};