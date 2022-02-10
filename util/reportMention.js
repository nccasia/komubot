const axios = require('axios');
const mentionedData = require('../models/mentionedData');

function withoutFirstTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}

function withoutLastTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getYesterdayDate() {
  const today = new Date();
  const yesterday = new Date(withoutLastTime(today));
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(yesterday).valueOf();
}

function getTomorrowDate() {
  const today = new Date();
  const yesterday = new Date(withoutFirstTime(today));
  yesterday.setDate(yesterday.getDate() + 1);
  return new Date(yesterday).valueOf();
}

async function reportMention(message) {
  const mentionFullday = await mentionedData.aggregate([
    {
      $match: {
        punish: true,
        createdTimestamp: { $gte: getYesterdayDate(), $lte: getTomorrowDate() },
      },
    },
    {
      $group: {
        _id: '$mentionUserId',
        total: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
  let mess;

  if (!mentionFullday) {
    return;
  } else if (Array.isArray(mentionFullday) && mentionFullday.length === 0) {
    mess = '```' + 'Không có ai vi phạm trong ngày' + '```';
    return message.channel.send(mess).catch(console.error);
  } else {
    for (let i = 0; i <= Math.ceil(mentionFullday.length / 50); i += 1) {
      if (mentionFullday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess =
        '```' +
        'Những người không trả lời mention trong ngày hôm nay' +
        '```' +
        mentionFullday
          .slice(i * 50, (i + 1) * 50)
          .map((mention) => `<@${mention._id}> (${mention.total})`)
          .join('\n');
      return message.channel.send(mess).catch(console.error);
    }
  }
}

module.exports = { reportMention };
