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

function getTimeToDay(date) {
  let today;
  let tomorrows;
  if (date) {
    today = new Date(date);
    tomorrows = new Date(date);
  } else {
    today = new Date();
    tomorrows = new Date();
  }
  const tomorrowsDate = tomorrows.setDate(tomorrows.getDate() + 1);

  return {
    firstDay: new Date(withoutTime(today)),
    lastDay: new Date(withoutTime(tomorrowsDate)),
  };
}

async function reportWfh(message, args, client) {
  let authorId = message.author.id;
  // let wfhGetApi;
  // try {
  //   wfhGetApi = await axios.get(client.config.wfh.api_url, {
  //     headers: {
  //       securitycode: process.env.WFH_API_KEY_SECRET,
  //     },
  //   });
  // } catch (error) {
  //   console.log(error);
  // }

  // if (!wfhGetApi || wfhGetApi.data == undefined) {
  //   return;
  // }
  let fomatDate;
  if (args[1]) {
    const day = args[1].slice(0, 2);
    const month = args[1].slice(3, 5);
    const year = args[1].slice(6);

    fomatDate = `${month}/${day}/${year}`;
  } else {
    fomatDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  const wfhFullday = await wfhData.aggregate([
    {
      $match: {
        type: 'wfh',
        createdAt: {
          $gte: getTimeToDay(fomatDate).firstDay,
          $lte: getTimeToDay(fomatDate).lastDay,
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
  if (!wfhFullday) {
    return;
  } else if (Array.isArray(wfhFullday) && wfhFullday.length === 0) {
    mess = '```' + 'Không có ai vi phạm trong ngày' + '```';
    return message.reply(mess).catch((err) => {
      sendErrorToDevTest(client, authorId, err);
    });
  } else {
    for (let i = 0; i <= Math.ceil(wfhFullday.length / 50); i += 1) {
      if (wfhFullday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess = wfhFullday
        .slice(i * 50, (i + 1) * 50)
        .map((wfh) => `<@${wfh._id}>(${wfh.username}) - (${wfh.total})`)
        .join('\n');
      const Embed = new MessageEmbed()
        .setTitle('Những người bị phạt vì không trả lời wfh trong ngày hôm nay')
        .setColor('RED')
        .setDescription(`${mess}`);
      return message.reply({ embeds: [Embed] }).catch((err) => {
        sendErrorToDevTest(client, authorId, err);
      });
    }
  }
}

async function reportCompalinWfh(message, args, client) {
  // let wfhGetApi;
  // try {
  //   wfhGetApi = await axios.get(client.config.wfh.api_url, {
  //     headers: {
  //       securitycode: process.env.WFH_API_KEY_SECRET,
  //     },
  //   });
  // } catch (error) {
  //   console.log(error);
  // }

  // if (!wfhGetApi || wfhGetApi.data == undefined) {
  //   return;
  // }
  let fomatDate;
  if (args[2]) {
    const day = args[2].slice(0, 2);
    const month = args[2].slice(3, 5);
    const year = args[2].slice(6);

    fomatDate = `${month}/${day}/${year}`;
  } else {
    fomatDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  const wfhFullday = await wfhData.find({
    status: 'APPROVED',
    complain: true,
    createdAt: {
      $gte: getTimeToDay(fomatDate).firstDay,
      $lte: getTimeToDay(fomatDate).lastDay,
    },
  });

  let mess;
  if (!wfhFullday) {
    return;
  } else if (Array.isArray(wfhFullday) && wfhFullday.length === 0) {
    mess = '```' + 'Không có ai được approved trong ngày' + '```';
    return message.reply(mess).catch((err) => {
      sendErrorToDevTest(client, authorId, err);
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
        sendErrorToDevTest(client, authorId, err);
      });
    }
  }
}

module.exports = { reportWfh, reportCompalinWfh };
