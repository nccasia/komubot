let DEBUG = false
const LOG_TIMESHEET_REQUIRED_FILEDS = ["project", "note", "workingTime", "task"]
const TIMESHEET_MESSAGE_HELP =
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
const checkLogTimeFormat = (contentArray) => {
   let errorArray = []
   for (let field of LOG_TIMESHEET_REQUIRED_FILEDS) {
      let isValid = false
      for (let line of contentArray) {
         if (line.includes(`- ${field}:`)) {
            isValid = true
            break
         }
      }
      if (!isValid) errorArray.push(field)
   }
   return errorArray
}
const extractLogTimeValue = (contentArray) => {
   const contentObj = {}
   for (let field of LOG_TIMESHEET_REQUIRED_FILEDS) {
      for (let line of contentArray) {
         if (line.includes(`- ${field}:`)) {
            contentObj[field] = line.replace(`- ${field}:`, '').trim()
            break
         }
      }
   }
   return contentObj
}
const validateFields = (contentObj) => {
   let errorArray = []
   const NORMAL_WORKING_TIME = 8

   for (let [key, value] of Object.entries(contentObj))
      if (value === '') errorArray.push(`Emmpty content at fields "${key}"\n`)
   if (!contentObj['workingTime'] || contentObj['workingTime'] === '' || isNaN(parseFloat(contentObj['workingTime'])))
      errorArray.push(`Invalid number in field "workingTime"\n`)
   return errorArray
}
/* <task_name> 1h;
   .+ any chracters
   \s space
   d+(\.\d*)?h  === 1h | 1.1h
*/

const VALID_TASK_FORMAT = /^.+\s\d+(\.\d*)?h$/

const extractTasks = (noteStr) => {
   const taskArray = noteStr.split(';').filter(item => VALID_TASK_FORMAT.test(item))
   const trimTask = taskArray.map(item => item.trim())
   const taskWithoutHourCharacter = trimTask.map(item => item.slice(0, -1))
   return taskWithoutHourCharacter.map(item => ({ task: item.split(' ')[0], workingTime: parseFloat(item.split(' ')[1]) }))
}

const debug = (...messages) => {
   if (DEBUG) console.log(...messages)
}
const setDebug = () => DEBUG = true
const getDebug = () => DEBUG

module.exports = {
   checkLogTimeFormat,
   extractLogTimeValue,
   validateFields,
   debug,
   setDebug,
   getDebug,
   extractTasks,
   TIMESHEET_MESSAGE_HELP,
}