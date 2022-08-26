const { logTimesheet } = require('../commands/komu/timesheet')

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