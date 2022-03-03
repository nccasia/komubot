const meetingData = require('../../models/meetingData');
const messHelp =
  '```' +
  '*meeting task dd/mm/yyyy 00:00 once' +
  '\n' +
  '*meeting task dd/mm/yyyy 00:00 daily' +
  '\n' +
  '*meeting task dd/mm/yyyy 00:00 weekly' +
  '```';

module.exports = {
  name: 'meeting',
  description: 'Meeting',
  cat: 'komu',
  async execute(message, args) {
    try {
      const channel_id = message.channel.id;
      if (!args[0] || !args[1] || !args[2]) {
        return message.channel.send(messHelp);
      }
      const task = args.slice(0, 1).join(' ');
      const datetime = args.slice(1, 3).join(' ');
      let repeat = args.slice(3, args.length).join(' ');
      const checkDate = args.slice(1, 2).join(' ');
      const checkTime = args.slice(2, 3).join(' ');

      if (
        !/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/.test(
          checkDate
        )
      ) {
        return message.channel.send(messHelp);
      }
      if (!/(2[0-3]|[01][0-9]):[0-5][0-9]/.exec(checkTime)) {
        return message.channel.send(messHelp);
      }

      if (repeat === '') repeat = 'once';

      const list = ['once', 'daily', 'weekly'];
      if (list.includes(repeat) === false)
        return message.channel.send(messHelp);

      const day = datetime.slice(0, 2);
      const month = datetime.slice(3, 5);
      const year = datetime.slice(6);

      const fomat = `${month}/${day}/${year}`;
      const dateObject = new Date(fomat);
      var timestamp = dateObject.getTime();
      const response = await meetingData({
        channelId: channel_id,
        task: task,
        createdTimestamp: timestamp,
        repeat: repeat,
      }).save();
      message.reply({ content: '`✅` Meeting saved.', ephemeral: true });
    } catch (err) {
      console.log(err);
    }
  },
};
