const axios = require('axios');
const orderData = require('../../models/orderData');

module.exports = {
  name: '1',
  description: 'order',
  cat: 'komu',
  async execute(message, args) {
    try {
      const list = args.slice(0, args.length).join(' ');
      const channel = message.channelId;
      const author = message.author.id;

      await new orderData({
        channelId: channel,
        userId: author,
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
