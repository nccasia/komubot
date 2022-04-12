const remindData = require('../../models/remindData.js');

const messHelp = '```' + '*remind @username dd/MM/YYYY HH:mm content' + '```';

module.exports = {
  name: 'remind',
  description: 'Remind',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (!args[0]) {
        return message.channel.send(messHelp);
      }

      const checkMention = message.mentions.members.first();
      const author = message.author.id;
      const channel = message.channelId;
      const datetime = args.slice(1, 3).join(' ');
      const messageRemind = args.slice(3, args.length).join(' ');
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

      const day = datetime.slice(0, 2);
      const month = datetime.slice(3, 5);
      const year = datetime.slice(6);

      const fomat = `${month}/${day}/${year}`;
      const dateObject = new Date(fomat);
      const whenTime = dateObject.getTime();

      await new remindData({
        channelId: channel,
        mentionUserId: checkMention.user.id,
        authorId: author,
        content: messageRemind,
        cancel: false,
        createdTimestamp: whenTime,
      })
        .save()
        .catch((err) => console.log(err));
      message.reply({ content: '`✅` remind saved.', ephemeral: true });
    } catch (err) {
      console.log(err);
    }
  },
};
