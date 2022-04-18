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

async function reportWfh(message, args, client) {
  let authorId = message.author.id;
  let wfhGetApi;
  try {
    wfhGetApi = await axios.get(client.config.wfh.api_url, {
      headers: {
        securitycode: client.config.wfh.api_key_secret,
      },
    });
  } catch (error) {
    console.log(error);
  }

  if (!wfhGetApi || wfhGetApi.data == undefined) {
    return;
  }

  const wfhFullday = await wfhData.aggregate([
    {
      $match: {
        type: 'wfh',
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
      $sort: { total: -1 },
    },
  ]);

  let mess;
  if (!wfhFullday) {
    return;
  } else if (Array.isArray(wfhFullday) && wfhFullday.length === 0) {
    mess = '```' + 'Không có ai vi phạm trong ngày' + '```';
    return message.reply(mess).catch((err) => {
      const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
      sendErrorToDevTest(client, msg);
    });
  } else {
    for (let i = 0; i <= Math.ceil(wfhFullday.length / 50); i += 1) {
      if (wfhFullday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess = wfhFullday
        .slice(i * 50, (i + 1) * 50)
        .map((wfh) => `<@${wfh._id}> - (${wfh.total})`)
        .join('\n');
      const Embed = new MessageEmbed()
        .setTitle('Những người bị phạt vì không trả lời wfh trong ngày hôm nay')
        .setColor('RED')
        .setDescription(`${mess}`);
      return message.reply({ embeds: [Embed] }).catch((err) => {
        const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
        sendErrorToDevTest(client, msg);
      });
    }
  }
}

async function reportCompalinWfh(message, args, client) {
  let wfhGetApi;
  try {
    wfhGetApi = await axios.get(client.config.wfh.api_url, {
      headers: {
        securitycode: client.config.wfh.api_key_secret,
      },
    });
  } catch (error) {
    console.log(error);
  }

  if (!wfhGetApi || wfhGetApi.data == undefined) {
    return;
  }

  const wfhFullday = await wfhData.find({
    status: 'APPROVED',
    complain: true,
    createdAt: {
      $gte: getTimeToDay().firstDay,
      $lte: getTimeToDay().lastDay,
    },
  });

  let mess;
  if (!wfhFullday) {
    return;
  } else if (Array.isArray(wfhFullday) && wfhFullday.length === 0) {
    mess = '```' + 'Không có ai được approved trong ngày' + '```';
    return message.reply(mess).catch((err) => {
      const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
      sendErrorToDevTest(client, msg);
    });
  } else {
    for (let i = 0; i <= Math.ceil(wfhFullday.length / 50); i += 1) {
      if (wfhFullday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess = wfhFullday
        .slice(i * 50, (i + 1) * 50)
        .map((wfh) => `<@${wfh.userid}> `)
        .join('\n');
      const Embed = new MessageEmbed()
        .setTitle('Những người được approved trong ngày hôm nay')
        .setColor('RED')
        .setDescription(`${mess}`);
      return message.reply({ embeds: [Embed] }).catch((err) => {
        const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
        sendErrorToDevTest(client, msg);
      });
    }
  }
}

module.exports = { reportWfh, reportCompalinWfh };
