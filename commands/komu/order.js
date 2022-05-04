const axios = require('axios');
const orderData = require('../../models/orderData');

module.exports = {
  name: 'order',
  description: 'order',
  cat: 'komu',
  async execute(message, args) {
    try {
      const list = args.slice(0, args.length).join(' ');
      const channel = message.channelId;
      const author = message.author.id;
      const username = message.author.username;

      await new orderData({
        channelId: channel,
        userId: author,
        username: username,
        menu: list,
        createdTimestamp: Date.now(),
      })
        .save()
        .catch((err) => console.log(err));
      message.reply({
        content: '`✅` Bạn đã đặt đơn!!!',
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
    }
  },
};
