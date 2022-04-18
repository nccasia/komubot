const holidayData = require('../models/holidayData');
const { MessageEmbed } = require('discord.js');
const { sendErrorToDevTest } = require('../util/komubotrest');

async function reportHoliday(message, args, client) {
  let authorId = message.author.id;
  const today = Date.now();
  const getYear = new Date(today).getFullYear();
  const holiday = await holidayData.find();

  let mess;
  if (!holiday) {
    return;
  } else if (Array.isArray(holiday) && holiday.length === 0) {
    mess = '```' + 'Không có lịch nghỉ lễ nào' + '```';
    return message.reply(mess).catch((err) => {
      const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
      sendErrorToDevTest(client, msg);
    });
  } else {
    for (let i = 0; i <= Math.ceil(holiday.length / 50); i += 1) {
      if (holiday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess = holiday
        .slice(i * 50, (i + 1) * 50)
        .filter((item) => item.dateTime.slice(6) === getYear.toString())
        .map((check) => `${check.dateTime} ${check.content}`)
        .join('\n');
      const Embed = new MessageEmbed()
        .setTitle('Các ngày nghỉ lễ trong năm')
        .setColor('RED')
        .setDescription(`${mess}`);
      await message.reply({ embeds: [Embed] }).catch((err) => {
        const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
        sendErrorToDevTest(client, msg);
      });
    }
  }
}

module.exports = { reportHoliday };
