const opentalkData = require('../models/opentalkData');
const { MessageEmbed } = require('discord.js');

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

async function reportOpentalk(message) {
  try {
    const listOpentalk = await opentalkData.aggregate([
      {
        $match: {
          date: {
            $gte: getTimeWeek().firstday.timestamp,
            $lte: getTimeWeek().lastday.timestamp,
          },
        },
      },
      {
        $group: {
          _id: '$userId',
          username: { $last: '$username' },
          date: { $last: '$date' },
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: 1,
          date: 1,
        },
      },
    ]);

    if (!listOpentalk) {
      return;
    } else if (Array.isArray(listOpentalk) && listOpentalk.length === 0) {
      mess = '```' + 'Không có ai đăng kí' + '```';
      return message.reply(mess).catch(console.error);
    } else {
      for (let i = 0; i <= Math.ceil(listOpentalk.length / 50); i += 1) {
        if (listOpentalk.slice(i * 50, (i + 1) * 50).length === 0) break;
        mess = listOpentalk
          .slice(i * 50, (i + 1) * 50)
          .map((list) => `<@${list.userId}>(${list.username}) `)
          .join('\n');
        const Embed = new MessageEmbed()
          .setTitle(
            `Danh sách đăng kí tham gia opentalk (${listOpentalk.length})`
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
module.exports = reportOpentalk;
