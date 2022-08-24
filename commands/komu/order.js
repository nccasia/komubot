const orderData = require('../../models/orderData');

module.exports = {
  name: 'order',
  description: 'order',
  cat: 'komu',
  async execute(message, args) {
    try {
      const channel = message.channelId;
      const author = message.author.id;
      const username = message.author.username;
      if (args[0] === 'cancel') {
        const userCancel = await orderData.find({
          userId: author,
          isCancel: { $ne: true },
          channelId: channel,
          username: username,
        });
        userCancel.map(async (item) => {
          await orderData.updateOne(
            {
              _id: item._id,
            },
            { $set: { isCancel: true } }
          );
        });
        message.reply({
          content: 'Bạn đã hủy đơn đặt hàng!!!',
          ephemeral: true,
        });
      } else if (args[0] === 'finish') {
        const userCancel = await orderData.find({
          userId: author,
          isCancel: { $ne: true },
          channelId: channel,
          username: username,
        });
        if (userCancel && userCancel.length > 0) {
          const reportOrder = await orderData.find({
            isCancel: { $ne: true },
            channelId: channel,
          });
          reportOrder.map(async (item) => {
            await orderData.updateOne(
              {
                _id: item._id,
              },
              { $set: { isCancel: true } }
            );
          });
          message.reply({
            content: 'Chốt đơn!!!',
            ephemeral: true,
          });
        } else {
          message.reply({
            content: 'Bạn không thể chốt đơn!!!',
            ephemeral: true,
          });
        }
      } else {
        const list = args.slice(0, args.length).join(' ');
        await new orderData({
          channelId: channel,
          userId: author,
          username: username,
          menu: list,
          createdTimestamp: Date.now(),
          isCancel: false,
        })
          .save()
          .catch((err) => console.log(err));
        message.reply({
          content: '`✅` Bạn đã đặt đơn!!!',
          ephemeral: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
