const dailyData = require('../../models/dailyData.js');
const { sendErrorToDevTest } = require('../../util/komubotrest.js');
const moment = require('moment');

const TIME_BEGIN_MORNING = moment('7:30:59am', 'h:mma');
const TIME_END_MORNING = moment('9:31am', 'h:mma');
const TIME_BEGIN_AFTERNOON = moment('11:59:59am', 'h:mma');
const TIME_END_AFTERNOON = moment('14:01pm', 'h:mma');

function checkTimeSheet() {
  // let timeNow = new Date().toLocaleTimeString();
  let timeNow = new Date();
  timeNow.setHours(timeNow.getHours() + 7);
  const getTimeNow = timeNow.toLocaleTimeString();
  let checkTimeNow = moment(getTimeNow, 'h:mma');

  // check time morning
  if (
    checkTimeNow.isAfter(TIME_BEGIN_MORNING) &&
    checkTimeNow.isBefore(TIME_END_MORNING)
  ) {
    return true;
  }

  //check time afternoon
  if (
    checkTimeNow.isAfter(TIME_BEGIN_AFTERNOON) &&
    checkTimeNow.isBefore(TIME_END_AFTERNOON)
  ) {
    return true;
  }

  return false;
}

module.exports = {
  name: 'daily',
  description: 'WFH Daily',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (!checkTimeSheet()) {
        return message
          .reply({
            content: '```Invalid daily time frame```',
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      }
      let authorId = message.author.id;
      const daily = args.join(' ');
      if (!daily || daily == undefined) {
        return message
          .reply({
            content: '```please add your daily text```',
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      }
      await new dailyData({
        userid: message.author.id,
        email:
          message.member != null || message.member != undefined
            ? message.member.displayName
            : message.author.username,
        daily: daily,
        createdAt: new Date(),
        channelid: message.channel.id,
      })
        .save()
        .catch((err) => console.log(err));
      message
        .reply({ content: '`✅` Daily saved.', ephemeral: true })
        .catch((err) => {
          sendErrorToDevTest(client, authorId, err);
        });
    } catch (err) {
      console.log(err);
    }
  },
};
