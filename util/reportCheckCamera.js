const checkCameraData = require('../models/checkCameraData');
const userData = require('../models/userData');
const getUserOffWork = require('../util/getUserOffWork');
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

async function reportCheckCamera(message) {
  const userCheckCamera = await checkCameraData.find({
    createdTimestamp: { $gte: getYesterdayDate(), $lte: getTomorrowDate() },
  });

  let userCheckCameraId;

  if (userCheckCamera) {
    userCheckCameraId = userCheckCamera.map((item) => item.userId);
  } else {
    return;
  }

  const { userOffFullday, userOffMorning } = await getUserOffWork();
  const checkCameraFullday = await userData
    .find({
      id: { $nin: userCheckCameraId },
      email: { $nin: [...userOffFullday, ...userOffMorning] },
      deactive: { $ne: true },
      roles_discord: { $nin: ['CLIENT', 'HR', 'ADMIN'], $exists: true },
    })
    .select('id -_id');

  let mess;
  if (!checkCameraFullday) {
    return;
  } else if (
    Array.isArray(checkCameraFullday) &&
    checkCameraFullday.length === 0
  ) {
    mess = '```' + 'Không có ai vi phạm trong ngày' + '```';
    return message.reply(mess).catch(console.error);
  } else {
    for (let i = 0; i <= Math.ceil(checkCameraFullday.length / 50); i += 1) {
      if (checkCameraFullday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess = checkCameraFullday
        .slice(i * 50, (i + 1) * 50)
        .map((checkCamera) => `<@${checkCamera.id}>`)
        .join('\n');
      const Embed = new MessageEmbed()
        .setTitle('Những người không bật camera trong ngày hôm nay')
        .setColor('RED')
        .setDescription(`${mess}`);
      await message.reply({ embeds: [Embed] }).catch(console.error);
    }
  }
}

module.exports = { reportCheckCamera };
