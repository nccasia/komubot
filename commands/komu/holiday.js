const holidayData = require('../../models/holidayData.js');
const { sendErrorToDevTest } = require('../../util/komubotrest.js');

const messHelp = '```' + '*holiday register dd/MM/YYYY content' + '```';

module.exports = {
  name: 'holiday',
  description: 'Holiday',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      let authorId = message.author.id;
      if (!args[0] && !args[1] && !args[2]) {
        return message.channel.send(messHelp);
      }

      const dateTime = args.slice(1, 2).join(' ');
      const messageHoliday = args.slice(2).join(' ');
      if (
        !/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/.test(
          dateTime
        )
      ) {
        return message.channel.send(messHelp);
      }

      await new holidayData({
        dateTime: dateTime,
        content: messageHoliday,
      })
        .save()
        .catch((err) => console.log(err));
      message
        .reply({ content: '`✅` holiday saved.', ephemeral: true })
        .catch((err) => {
          sendErrorToDevTest(client, authorId, err);
        });
    } catch (err) {
      console.log(err);
    }
  },
};
