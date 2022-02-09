const bwlReactData = require('../../models/bwlReactData.js');

function getTimeWeek(time) {
  let curr;
  if (time) {
    if (!validateTimeDDMMYYYY(time)) {
      return;
    }
    const timeFormat = formatDayMonth(time);
    curr = new Date(timeFormat);
  } else {
    curr = new Date();
  }
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
      date: formatDate(new Date(withoutTime(firstweek))),
    },
    lastday: {
      timestamp: new Date(withoutTime(lastweek)).getTime(),
      date: formatDate(new Date(withoutTime(lastweek))),
    },
  };
}

function withoutTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}
function formatDayMonth(time) {
  const day = time.split('').slice(0, 2).join('');
  const month = time.split('').slice(3, 5).join('');
  const year = time.split('').slice(6, 10).join('');
  return `${month}/${day}/${year}`;
}

function formatDate(time) {
  const today = new Date(time);
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function validateTimeDDMMYYYY(time) {
  return /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(
    time
  );
}

module.exports = {
  name: 'bwl',
  description: 'BWL leaderboard',
  cat: 'komu',
  async execute(message, args) {
    try {
      if (args[0] === 'help') {
        return message.channel.send(
          '```' +
            '*bwl channel_id top dd/mm/yyyy' +
            '\n' +
            'channel_id : right click to the channel & copy' +
            '```'
        );
      }

      const channelId = args[0] || message.channel.id;

      const top =
        (!isNaN(parseFloat(args[1])) &&
          !isNaN(args[1] - 0) &&
          parseInt(args[1])) ||
        5;
      const time = args[2];
      if (!channelId || !getTimeWeek(time)) {
        return message.channel.send('```invalid channel or time```');
      }

      const aggregatorOpts = [
        {
          $match: { channelId },
        },
        {
          $group: {
            _id: '$messageId',
            totalReact: { $addToSet: '$authorId' },
          },
        },
        {
          $project: {
            _id: 0,
            messageId: '$_id',
            totalReact: {
              $size: '$totalReact',
            },
          },
        },
        {
          $lookup: {
            from: 'komu_bwls',
            localField: 'messageId',
            foreignField: 'messageId',
            as: 'author_message',
          },
        },
        {
          $unwind: '$author_message',
        },
        {
          $lookup: {
            from: 'komu_users',
            localField: 'author_message.authorId',
            foreignField: 'id',
            as: 'author',
          },
        },
        {
          $unwind: '$author',
        },
        {
          $sort: { totalReact: -1 },
        },
        {
          $group: {
            _id: '$author.id',
            author: { $first: '$author' },
            message: { $first: '$author_message' },
            totalReact: { $first: '$totalReact' },
          },
        },
        {
          $match: {
            $and: [
              {
                'message.createdTimestamp': {
                  $gte: getTimeWeek(time).firstday.timestamp,
                },
              },
              {
                'message.createdTimestamp': {
                  $lte: getTimeWeek(time).lastday.timestamp,
                },
              },
            ],
          },
        },
        {
          $sort: { totalReact: -1 },
        },
        { $limit: top },
      ];

      bwlReactData
        .aggregate(aggregatorOpts)
        .exec()
        .then((docs) => {
          let name = [];
          if (docs.length) {
            name = docs.map((doc, index) => {
              return `Top ${index + 1} ${doc.author.username}: ${
                doc.totalReact
              } votes`;
            });
          }
          if (Array.isArray(name) && name.length === 0) {
            message.channel.send('```no result```');
          } else {
            message.channel
              .send(
                '```' +
                  getTimeWeek(time).firstday.date +
                  ' - ' +
                  getTimeWeek(time).lastday.date +
                  '\n' +
                  name.join('\n') +
                  '```'
              )
              .catch(console.error);
          }
        });
    } catch (e) {
      console.log(e);
    }
  },
};
