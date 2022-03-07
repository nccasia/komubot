const getUserNotDaily = require('../util/getUserNotDaily');

function findCountNotDaily(arr, email) {
  return arr.filter((item) => item.email === email)[0].countnotdaily;
}
async function reportDaily(date, message, args, client, guildDB) {
  try {
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
      return message.reply(mess).catch(console.error);
    } else {
      for (let i = 0; i <= Math.ceil(userNotDaily.length / 50); i += 1) {
        if (userNotDaily.slice(i * 50, (i + 1) * 50).length === 0) break;
        mess =
          '```' +
          dateString +
          '\n' +
          dailyString +
          '\n' +
          '```' +
          userNotDaily
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
        await message.reply(mess).catch(console.error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = reportDaily;
