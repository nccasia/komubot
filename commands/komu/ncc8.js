const audioPlayer = require('../../util/audioPlayer');
const checkNumber = (string) =>
  !isNaN(parseFloat(string)) && !isNaN(string - 0) && parseInt(string);

module.exports = {
  name: 'ncc8',
  description: 'Ncc8',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (args[0] !== 'play' || args[0] === 'help' || !args[1]) {
        return message.reply('```' + '*ncc8 play episode' + '```');
      }
      if (!checkNumber(args[1])) {
        return message.reply('```' + 'episode must be number' + '```');
      }
      await audioPlayer(client, message, args[1]);
    } catch (err) {
      console.log(err);
    }
  },
};
