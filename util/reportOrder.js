const orderData = require('../models/orderData');
const { MessageEmbed } = require('discord.js');

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

async function reportOrder(message) {
  try {
    const channel = message.channelId;

    const listOrder = await orderData.aggregate([
      {
        $match: {
          channelId: channel,
          createdTimestamp: {
            $gte: getYesterdayDate(),
            $lte: getTomorrowDate(),
          },
        },
      },
      {
        $group: {
          _id: '$userId',
          menu: { $last: '$menu' },
          username: { $last: '$username' },
          createdTimestamp: { $last: '$createdTimestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          menu: 1,
          username: 1,
          createdTimestamp: 1,
        },
      },
    ]);

    if (!listOrder) {
      return;
    } else if (Array.isArray(listOrder) && listOrder.length === 0) {
      mess = '```' + 'Không có ai order' + '```';
      return message.reply(mess).catch(console.error);
    } else {
      for (let i = 0; i <= Math.ceil(listOrder.length / 50); i += 1) {
        if (listOrder.slice(i * 50, (i + 1) * 50).length === 0) break;
        mess = listOrder
          .slice(i * 50, (i + 1) * 50)
          .map(
            (list) => `<${list.username}> 🧑‍🔧order ${list.menu.toUpperCase()}`
          )
          .join('\n');
        const Embed = new MessageEmbed()
          .setTitle(
            `Danh sách order ngày hôm nay tổng là ${listOrder.length} người`
          )
          .setColor('RED')
          .setDescription(`${mess}`);
        await message.reply({ embeds: [Embed] }).catch(console.error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports = reportOrder;
