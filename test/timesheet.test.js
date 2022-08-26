const { logTimesheet } = require('../commands/komu/timesheet')
const { setDebug, debug, extractTasks } = require('../util/timesheet')
setDebug()
debug('[Test case 1]')
logTimesheet({
   author: {
      id: 1,
      username: 'dung.buihuu',
   },
   reply: async ({ content }) => { }
},
   ('- project: Test log timesheet' +
      '\n' +
      '- note: Working on task 1234' +
      '\n' +
      '- workingTime: 1' +
      '\n' +
      '- task: 0').split(' '))
debug('===========================================[Should be sucess]======================================')
debug('[Test case 2]')
logTimesheet({
   author: {
      id: 1,
      username: 'dung.buihuu',
   },
   reply: async ({ content }) => { }
},
   ('- project: Test log timesheet' +
      '\n' +
      '- note: Working on task 1234' +
      '\n' +
      '- workingTime: a' +
      '\n' +
      '- task: 0').split(' '))
debug('============================[Should be failed. Working time is not number]======================================')
debug('[Test case 3]')
logTimesheet({
   author: {
      id: 1,
      username: 'dung.buihuu',
   },
   reply: async ({ content }) => { }
},
   ('- note: Working on task 1234' +
      '\n' +
      '- workingTime: 1' +
      '\n' +
      '- task: 0').split(' '))
debug('====================================[Should be failed. Mising reuired fields]======================================')
debug('[Test case 4]')
logTimesheet({
   author: {
      id: 1,
      username: 'dung.buihuu',
   },
   reply: async ({ content }) => { }
},
   ('- project: Test log timesheet' +
      '\n' +
      '- note: ' +
      '\n' +
      '- workingTime: 1' +
      '\n' +
      '- task: 0').split(' '))
debug('====================================[Should be failed. Empty value]======================================')

debug('====================================[Task extract testing]======================================')
debug('[Test case 1]')
debug(`  - Input: ''`)
debug(`  - Output: ${JSON.stringify(extractTasks(''))}`)
debug(`Should return `)
debug('[Test case 2]')
debug(`  - Input: 'task1 '`)
debug(`  - Output: ${JSON.stringify(extractTasks('task1 '))}`)
debug(`Should return `)
debug('[Test case 3]')
debug(`  - Input: 'task1 2.'`)
debug(`  - Output: ${JSON.stringify(extractTasks('task1 2.'))}`)
debug(`Should return `)
debug('[Test case 4]')
debug(`  - Input: 'task1 2.'`)
debug(`  - Output: ${JSON.stringify(extractTasks('task1 2.'))}`)
debug(`Should return `)
debug('[Test case 5]')
debug(`  - Input: 'task1 2.5h;'`)
debug(`  - Output: ${JSON.stringify(extractTasks('task1 2.5h;'))}`)
debug(`Should return `)
debug('[Test case 6]')
debug(`  - Input: 'task1 2.5h'`)
debug(`  - Output: ${JSON.stringify(extractTasks('task1 2.5h'))}`)
debug(`Should return `)
debug('[Test case 7]')
debug(`  - Input: 'task1 2.5h; task2'`)
debug(`  - Output: ${JSON.stringify(extractTasks('task1 2.5h; task2'))}`)
debug(`Should return `)
debug('[Test case 7]')
debug(`  - Input: 'task1 2.5h; task2 4h'`)
debug(`  - Output: ${JSON.stringify(extractTasks('task1 2.5h; task2 4h'))}`)
debug(`Should return `)

