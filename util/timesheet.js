const parseDuration = require('parse-duration')
const chrono = require('chrono-node')
const axios = require('axios')

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
  const [, dateRaw, yesterday, todayRaw, block] = message.split(
    new RegExp('\\*daily|- yesterday:|- today:|- block:', 'ig'),
  )
  const dateStr = normalizeString(dateRaw)
  const todayStr = normalizeString(todayRaw)
  const date = chrono.parseDate(dateStr)
  const tasks = parseTimeSheetSentence(todayStr)
  const contentObj = {
    date: dateStr,
    timeStamp: date,
    yesterday: normalizeString(yesterday),
    today: todayStr,
    block: normalizeString(block),
    tasks,
  }

  return contentObj
}

const logTimeSheetFromDaily = async ({ content, emailAddress, url, token }) => {
  const data = parseDailyMessage(content)

  for (const task of data.tasks) {
    const timesheetPayload = {
      emailAddress,
      note: task.note,
    }
    try {
      await axios.post(url, timesheetPayload, {
        headers: {
          securitycode: token,
        },
      })
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
