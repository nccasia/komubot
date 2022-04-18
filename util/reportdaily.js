const getUserNotDaily = require('../util/getUserNotDaily');
const { MessageEmbed } = require('discord.js');
const { sendErrorToDevTest } = require('../util/komubotrest');

function findCountNotDaily(arr, email) {
  return arr.filter((item) => item.email === email)[0].countnotdaily;
}
async function reportDaily(date, message, args, client, guildDB) {
  try {
    let authorId = message.author.id;
    const { notDaily, userNotDaily } = await getUserNotDaily(
      date,
      message,
      args,
      client,
      guildDB
    );

    let mess;
    const dateString = (date && date.toDateString()) || '';
    const dailyString = date
      ? 'Những Người Chưa Daily'
      : 'Những Người Chưa Daily Hôm Nay';
    if (!userNotDaily) {
      return;
    } else if (Array.isArray(userNotDaily) && userNotDaily.length === 0) {
      mess = '```' + dateString + 'Tất Cả Đều Đã Daily' + '```';
      return message.reply(mess).catch((err) => {
        const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
        sendErrorToDevTest(client, msg);
      });
    } else {
      for (let i = 0; i <= Math.ceil(userNotDaily.length / 50); i += 1) {
        if (userNotDaily.slice(i * 50, (i + 1) * 50).length === 0) break;
        mess = userNotDaily
          .slice(i * 50, (i + 1) * 50)
          .map((user) => {
            if (user.id) {
              return `<@${user.id}> (${findCountNotDaily(
                notDaily,
                user.username
              )})`;
            } else {
              return `${user.email} (${user.countnotdaily})`;
            }
          })
          .join('\n');
        const Embed = new MessageEmbed()
          .setTitle(
            `${dateString} 
            ${dailyString}`
          )
          .setColor('RED')
          .setDescription(`${mess}`);
        await message.reply({ embeds: [Embed] }).catch((err) => {
          const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
          sendErrorToDevTest(client, msg);
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = reportDaily;
