const audioPlayer = require('../../util/audioPlayer');
const uploadFileData = require('../../models/uploadFileData');
const { MessageEmbed } = require('discord.js');
const { sendErrorToDevTest } = require('../../util/komubotrest');

const checkNumber = (string) =>
  !isNaN(parseFloat(string)) && !isNaN(string - 0) && parseInt(string);

module.exports = {
  name: 'ncc8',
  description: 'Ncc8',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      let authorId = message.author.id;
      if (args[0] === 'playlist') {
        dataMp3 = await uploadFileData.find().sort({ episode: -1 });
        if (!dataMp3) {
          return;
        } else if (Array.isArray(dataMp3) && dataMp3.length === 0) {
          mess = '```' + 'Không có NCC nào' + '```';
          return message.reply(mess).catch((err) => {
            const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
            sendErrorToDevTest(client, msg);
          });
        } else {
          for (let i = 0; i <= Math.ceil(dataMp3.length / 50); i += 1) {
            if (dataMp3.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess = dataMp3
              .slice(i * 50, (i + 1) * 50)
              .filter((item) => item.episode)
              .map((list) => `NCC8 số ${list.episode}`)
              .join('\n');
            const Embed = new MessageEmbed()
              .setTitle('Danh sách NCC8')
              .setColor('RED')
              .setDescription(`${mess}`);
            await message.reply({ embeds: [Embed] }).catch((err) => {
              const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
              sendErrorToDevTest(client, msg);
            });
          }
        }
      } else if (args[0] === 'play') {
        if (args[0] !== 'play' || !args[1]) {
          return message
            .reply('```' + '*ncc8 play episode' + '```')
            .catch((err) => {
              const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
              sendErrorToDevTest(client, msg);
            });
        }
        if (!checkNumber(args[1])) {
          return message
            .reply('```' + 'episode must be number' + '```')
            .catch((err) => {
              const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
              sendErrorToDevTest(client, msg);
            });
        }
        await audioPlayer(client, message, args[1]);
      } else {
        return message
          .reply('```' + '*ncc8 play episode' + '```')
          .catch((err) => {
            const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
            sendErrorToDevTest(client, msg);
          });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
