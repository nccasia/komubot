const opentalkData = require('../../models/opentalkData');

function getTimeWeek() {
  let curr = new Date();
  // current date of week
  const currentWeekDay = curr.getDay();
  const lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
  const firstweek = new Date(new Date(curr).setDate(curr.getDate() - lessDays));
  const lastweek = new Date(
    new Date(firstweek).setDate(firstweek.getDate() + 7)
  );

  return {
    firstday: {
      timestamp: new Date(withoutTime(firstweek)).getTime(),
    },
    lastday: {
      timestamp: new Date(withoutTime(lastweek)).getTime(),
    },
  };
}

function withoutTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}
module.exports = {
  name: 'opentalk',
  description: 'Opentalk',
  cat: 'komu',
  async execute(message, args, client) {
    let userId = message.author.id;
    let username = message.author.username;
    if (args[0] === 'remove') {
      const opentalkUser = await opentalkData.findOne({
        userId,
        username,
        $and: [
          { date: { $gte: getTimeWeek().firstday.timestamp } },
          { date: { $lte: getTimeWeek().lastday.timestamp } },
        ],
      });

      await opentalkData.deleteOne({
        _id: opentalkUser._id,
      });

      return message.reply('Remove opentalk this week successfully');
    } else {
      const date = Date.now();
      const opentalkUser = await opentalkData.findOne({
        userId,
        username,
        $and: [
          { date: { $gte: getTimeWeek().firstday.timestamp } },
          { date: { $lte: getTimeWeek().lastday.timestamp } },
        ],
      });
      if (opentalkUser) {
        return message.reply('You have registered to join Opentalk this week');
      }

      await new opentalkData({ userId, username, date }).save();
      message.reply('`✅` Opentalk saved.');
    }
  },
};
