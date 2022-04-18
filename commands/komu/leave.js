const leaveData = require('../../models/leaveData');
const { sendErrorToDevTest } = require('../../util/komubotrest');
module.exports = {
  name: 'leave',
  description: 'Leave Work',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      let authorId = message.author.id;
      if (!args[0] || !args[1]) {
        return message
          .reply('```' + '*leave minute reason ' + '```')
          .catch((err) => {
            const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
            sendErrorToDevTest(client, msg);
          });
      }
      const minute =
        !isNaN(parseFloat(args[0])) && !isNaN(args[0] - 0) && parseInt(args[0]);

      if (minute === false) {
        return message.reply('Minute must be a number').catch((err) => {
          const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
          sendErrorToDevTest(client, msg);
        });
      }
      const reason = args.slice(1, args.length).join(' ');
      const newLeave = new leaveData({
        channelId: message.channel.id,
        userId: message.author.id,
        minute,
        reason,
      });

      await newLeave.save();

      return message.reply('`✅` Leave saved').catch((err) => {
        const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
        sendErrorToDevTest(client, msg);
      });
    } catch (err) {
      console.log(err);
    }
  },
};
