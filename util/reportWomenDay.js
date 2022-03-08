const userData = require('../models/userData');
const womenDayData = require('../models/womenDayData');
async function reportWomenDay(message, args, client) {
  try {
    const userWin = await womenDayData.find({
      win: true,
    });

    if (!userWin) {
      return;
    } else if (Array.isArray(userWin) && userWin.length === 0) {
      mess = '```' + 'Không có ai trúng thưởng' + '```';
      return message.reply(mess).catch(console.error);
    } else {
      for (let i = 0; i <= Math.ceil(userWin.length / 50); i += 1) {
        if (userWin.slice(i * 50, (i + 1) * 50).length === 0) break;
        mess =
          '```' +
          'Những người may mắn được nhận quà: ' +
          '```' +
          userWin
            .slice(i * 50, (i + 1) * 50)
            .map((userW) => `<@${userW.userid}> : ${userW.gift}`)
            .join('\n');
        message.reply(mess).catch(console.error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports = reportWomenDay;
