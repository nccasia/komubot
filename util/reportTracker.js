const trackerSpentTimeData = require('../models/trackerSpentTimeData');
const userData = require('../models/userData');
const { MessageEmbed } = require('discord.js');

async function reportTracker(message, args, client) {
  const today = Date.now();
  const date = new Date(today).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const hours = Math.floor(3600 * 8);

  const tracker = await trackerSpentTimeData.aggregate([
    {
      $match: {
        spent_time: { $lt: hours },
        date: date,
      },
    },
    {
      $group: {
        _id: '$email',
        spent_time: { $last: '$spent_time' },
      },
    },
    {
      $project: {
        _id: 0,
        email: '$_id',
        spent_time: 1,
      },
    },
  ]);

  let userTracker = [];
  await Promise.all(
    tracker.map(async (item) => {
      const findUser = await userData
        .find({
          email: item.email,
          deactive: { $ne: true },
        })
        .select('id email -_id');

      findUser.map((user) => {
        if (user.email === item.email)
          userTracker.push({ id: user.id, spent_time: item.spent_time / 60 });
      });
    })
  );

  userTracker.sort(
    (a, b) => parseFloat(a.spent_time) - parseFloat(b.spent_time)
  );

  let mess;
  if (!userTracker) {
    return;
  } else if (Array.isArray(userTracker) && userTracker.length === 0) {
    mess = '```' + 'Không có ai vi phạm trong ngày' + '```';
    return message.reply(mess).catch(console.error);
  } else {
    for (let i = 0; i <= Math.ceil(userTracker.length / 50); i += 1) {
      if (userTracker.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess = userTracker
        .slice(i * 50, (i + 1) * 50)
        .map((check) => `<@${check.id}> ${check.spent_time.toFixed(2)} phút`)
        .join('\n');
      const Embed = new MessageEmbed()
        .setTitle(
          'Những người không bật đủ thời gian tracker trong ngày hôm nay'
        )
        .setColor('RED')
        .setDescription(`${mess}`);
      await message.reply({ embeds: [Embed] }).catch(console.error);
    }
  }
}

module.exports = { reportTracker };
