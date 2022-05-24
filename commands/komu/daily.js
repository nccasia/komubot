const dailyData = require('../../models/dailyData.js');
const { sendErrorToDevTest } = require('../../util/komubotrest.js');

function setTime(date, hours, minute, second, msValue) {
  return date.setHours(hours, minute, second, msValue);
}

function checkTimeSheet() {
  let result = false;
  const time = new Date();
  const cur = new Date();
  const timezone = time.getTimezoneOffset() / -60;
  const fisrtTimeMorning = new Date(
    setTime(time, 7 + timezone, 30, 0, 0)
  ).getTime();
  const lastTimeMorning = new Date(
    setTime(time, 9 + timezone, 31, 0, 0)
  ).getTime();
  const fisrtTimeAfternoon = new Date(
    setTime(time, 12 + timezone, 0, 0, 0)
  ).getTime();
  const lastTimeAfternoon = new Date(
    setTime(time, 14 + timezone, 1, 0, 0)
  ).getTime();
  if (
    (cur.getTime() >= fisrtTimeMorning && cur.getTime() <= lastTimeMorning) ||
    (cur.getTime() >= fisrtTimeAfternoon && cur.getTime() <= lastTimeAfternoon)
  ) {
    result = true;
  }
  return result;
}

module.exports = {
  name: 'daily',
  description: 'WFH Daily',
  cat: 'komu',
  async execute(message, args, client) {
    try {
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

      if (!checkTimeSheet()) {
        return message
          .reply({
            content:
              '```✅ Daily saved. (Invalid daily time frame. Please daily at 7h30-9h30, 12h-14h. WFH not daily 20k/day.)```',
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
