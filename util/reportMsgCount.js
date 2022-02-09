const msgData = require('../models/msgData');

function withoutTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getTimeToDay() {
  const today = new Date();
  const tomorrows = new Date();
  const tomorrowsDate = tomorrows.setDate(tomorrows.getDate() + 1);

  return {
    firstDay: new Date(withoutTime(today)).getTime(),
    lastDay: new Date(withoutTime(tomorrowsDate)).getTime(),
  };
}

async function reportMessageCount(message) {
  try {
    const userid = message.author.id;
    const username = message.author.username;

    if (!userid || !username) return;

    const messageData = await msgData.aggregate([
      {
        $match: {
          createdTimestamp: {
            $lte: getTimeToDay().lastDay,
            $gte: getTimeToDay().firstDay,
          },
          author: { $nin: ['922003239887581205', '931377010616451122'] },
        },
      },
      {
        $group: {
          _id: '$author',
          totalMess: { $addToSet: '$id' },
        },
      },
      {
        $project: {
          userid: '$id',
          countMessage: {
            $size: '$totalMess',
          },
        },
      },
      {
        $sort: {
          countMessage: -1,
        },
      },
      {
        $limit: 20,
      },
    ]);
    let mess;
    if (Array.isArray(messageData) && messageData.length === 0) {
      mess = '```' + 'no result' + '```';
    } else {
      mess = messageData
        .map((item) => `<@${item._id}> : ${item.countMessage}`)
        .join('\n');
    }

    return message.channel
      .send('```' + 'Top 20 message :' + '\n' + '```' + '\n' + mess)
      .catch(console.error);
  } catch (error) {
    console.log(error);
  }
}
module.exports = reportMessageCount;
