const axios = require('axios');
const wfhData = require('../models/wfhData');
const { MessageEmbed } = require('discord.js');
const { sendErrorToDevTest } = require('../util/komubotrest');

function withoutTime(dateTime) {
  const date = new Date(dateTime);
  const curDate = new Date();
  const timezone = curDate.getTimezoneOffset() / -60;
  date.setHours(0 + timezone, 0, 0, 0);
  return date;
}

function getTimeToDay() {
  const today = new Date();
  const tomorrows = new Date();
  const tomorrowsDate = tomorrows.setDate(tomorrows.getDate() + 1);

  return {
    firstDay: new Date(withoutTime(today)),
    lastDay: new Date(withoutTime(tomorrowsDate)),
  };
}

async function reportMention(message) {
  let authorId = message.author.id;
  const mentionFullday = await wfhData.aggregate([
    {
      $match: {
        type: 'mention',
        createdAt: {
          $gte: getTimeToDay().firstDay,
          $lte: getTimeToDay().lastDay,
        },
        $or: [
          { status: 'ACCEPT' },
          { status: 'ACTIVE' },
          {
            status: 'APPROVED',
            pmconfirm: false,
          },
        ],
      },
    },
    {
      $group: {
        _id: '$userid',
        total: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'komu_users',
        localField: '_id',
        foreignField: 'id',
        as: 'users',
      },
    },
    {
      $project: {
        _id: 1,
        total: 1,
        username: {
          $first: '$users.username',
        },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);
  let mess;

  if (!mentionFullday) {
    return;
  } else if (Array.isArray(mentionFullday) && mentionFullday.length === 0) {
    mess = '```' + 'Không có ai vi phạm trong ngày' + '```';
    return message.reply(mess).catch((err) => {
      sendErrorToDevTest(client, authorId, err);
    });
  } else {
    for (let i = 0; i <= Math.ceil(mentionFullday.length / 50); i += 1) {
      if (mentionFullday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess = mentionFullday
        .slice(i * 50, (i + 1) * 50)
        .map(
          (mention) =>
            `<@${mention._id}>(${mention.username}) (${mention.total})`
        )
        .join('\n');
      const Embed = new MessageEmbed()
        .setTitle('Những người không trả lời mention trong ngày hôm nay')
        .setColor('RED')
        .setDescription(`${mess}`);
      await message.reply({ embeds: [Embed] }).catch((err) => {
        sendErrorToDevTest(client, authorId, err);
      });
    }
  }
}

module.exports = { reportMention };
