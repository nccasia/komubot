const { execute, } = require('../commands/komu/timesheet')
const { setDebug, debug } = require('../util/timesheet')
setDebug()
debug('[Test case 1:]')
let content = `
*timesheet nca 29/08/2022
   + task description; 2h, nt, coding
   + task description; 2h, nt, coding
   + task description; 2h, nt, coding
`
console.log('===> Input:')
console.log(content)
execute({
   author: {
      id: 1,
      username: 'dung.buihuu'
   },
   reply: ({ content }) => {
      console.log(content)
      return { catch: () => { } }
   },
   content
}, null, null)
debug('Should be success')
console.log('___________________________________________________________________________________')
debug('[Test case 2:]')
content = '*timesheet help'
console.log('===> Input:')
console.log(content)
// const promiseFn = async () => {
execute({
   author: {
      id: 1,
      username: 'dung.buihuu'
   },
   reply: ({ content }) => {
      console.log(content)
      return { catch: () => { } }
   },
   content
}, null, null)
debug('Should return list project')
// }
// promiseFn()