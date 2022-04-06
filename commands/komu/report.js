const reportDaily = require('../../util/reportdaily');
const { reportWfh, reportCompalinWfh } = require('../../util/reportWfh');
const reportMessageCount = require('../../util/reportMsgCount');
const reportScore = require('../../util/reportScore');
const { reportMention } = require('../../util/reportMention');
const { reportCheckCamera } = require('../../util/reportCheckCamera');
const reportWomenDay = require('../../util/reportWomenDay');
const reportOrder = require('../../util/reportOrder');
const { handleKomuWeeklyReport } = require('../../util/odin-report');
function getTimeWeekMondayToFriday(dayNow) {
  const curr = new Date();
  // current date of week
  const currentWeekDay = curr.getDay();
  const lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
  const firstweek = new Date(new Date(curr).setDate(curr.getDate() - lessDays));
  let arrayDay;
  if (dayNow === 0 || dayNow === 6 || dayNow === 5) {
    arrayDay = [2, 3, 4, 5, 6];
  } else {
    arrayDay = Array.from({ length: dayNow }, (v, i) => i + 2);
  }
  function getDayofWeek(rank) {
    // rank 2 -> 6 (Monday -> Friday)
    return new Date(
      new Date(firstweek).setDate(firstweek.getDate() + rank - 2)
    );
  }
  return arrayDay.map((item) => getDayofWeek(item));
}

module.exports = {
  name: 'report',
  description: 'show no daily',
  cat: 'komu',
  async execute(message, args, client, guildDB) {
    try {
      if (args[0] === 'daily') {
        await reportDaily(null, message, args, client, guildDB);
      } else if (args[0] === 'weekly') {
        for (const day of getTimeWeekMondayToFriday(new Date().getDay())) {
          await reportDaily(day, message, args, client, guildDB);
        }
      } else if (args[0] === 'mention') {
        await reportMention(message, args, client, guildDB);
      } else if (args[0] === 'checkcamera') {
        await reportCheckCamera(message, args, client, guildDB);
      } else if (args[0] === 'wfh' && args[1] === 'complain') {
        await reportCompalinWfh(message, args, client, guildDB);
      } else if (args[0] === 'wfh') {
        await reportWfh(message, args, client, guildDB);
      } else if (args[0] === 'msgcount') {
        await reportMessageCount(message, args, client, guildDB);
      } else if (args[0] === 'quiz') {
        await reportScore(message, args, client, guildDB);
      } else if (args[0] === 'womenday') {
        await reportWomenDay(message);
      } else if (args[0] === 'order') {
        await reportOrder(message);
      } else if (args[0] === 'komuweekly') {
        await handleKomuWeeklyReport(message, args, client, guildDB);
      } else if (args[0] === 'help') {
        return message
          .reply(
            '```' +
              '*report options' +
              '\n' +
              'options  ' +
              '\n' +
              [
                { name: 'daily', des: 'show daily today' },
                { name: 'weekly', des: 'show daily weekly' },
                { name: 'mention', des: 'show check mention day' },
                { name: 'checkcamera', des: 'show checkcamera day' },
                {
                  name: 'wfh ',
                  des: "show user don't reply to bot ",
                },
                {
                  name: 'wfh complain',
                  des: "show user don't reply to bot & pm confirm",
                },
                {
                  name: 'msgcount',
                  des: 'show top 20 count message',
                },
                {
                  name: 'quiz',
                  des: 'show top 10 quiz',
                },
                {
                  name: 'komuweekly',
                  des: 'show Komu weekly report',
                },
              ]
                .map((item) => `- ${item.name} : ${item.des}`)
                .join('\n') +
              '```'
          )
          .catch(console.error);
      } else {
        return message
          .reply('```' + '*report help' + '```')
          .catch(console.error);
      }
    } catch (error) {
      console.log(error);
    }
  },
};
