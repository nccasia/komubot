const audioPlayer = require('../../util/audioPlayer');
const uploadFileData = require('../../models/uploadFileData');

const checkNumber = (string) =>
  !isNaN(parseFloat(string)) && !isNaN(string - 0) && parseInt(string);

module.exports = {
  name: 'ncc8',
  description: 'Ncc8',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (args[0] === 'playlist') {
        dataMp3 = await uploadFileData.find().sort({ episode: -1 });
        if (!dataMp3) {
          return;
        } else if (Array.isArray(dataMp3) && dataMp3.length === 0) {
          mess = '```' + 'Không có NCC nào' + '```';
          return message.reply(mess).catch(console.error);
        } else {
          for (let i = 0; i <= Math.ceil(dataMp3.length / 50); i += 1) {
            if (dataMp3.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess =
              '```' +
              `Danh sách NCC8` +
              '```' +
              dataMp3
                .slice(i * 50, (i + 1) * 50)
                .filter((item) => item.episode)
                .map((list) => `NCC8 số ${list.episode}`)
                .join('\n');
            await message.reply(mess).catch(console.error);
          }
        }
      } else if (args[0] === 'play') {
        if (args[0] !== 'play' || !args[1]) {
          return message.reply('```' + '*ncc8 play episode' + '```');
        }
        if (!checkNumber(args[1])) {
          return message.reply('```' + 'episode must be number' + '```');
        }
        await audioPlayer(client, message, args[1]);
      } else {
        return message.reply('```' + '*ncc8 play episode' + '```');
      }
    } catch (err) {
      console.log(err);
    }
  },
};
