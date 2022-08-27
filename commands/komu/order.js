const orderData = require('../../models/orderData');
const { MessageEmbed } = require('discord.js');

function withoutFirstTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}

function withoutLastTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getYesterdayDate() {
  const today = new Date();
  const yesterday = new Date(withoutLastTime(today));
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(yesterday).valueOf();
}

function getTomorrowDate() {
  const today = new Date();
  const yesterday = new Date(withoutFirstTime(today));
  yesterday.setDate(yesterday.getDate() + 1);
  return new Date(yesterday).valueOf();
}

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
          const listOrder = await orderData.aggregate([
            {
              $match: {
                channelId: channel,
                createdTimestamp: {
                  $gte: getYesterdayDate(),
                  $lte: getTomorrowDate(),
                },
                isCancel: { $ne: true },
              },
            },
            {
              $group: {
                _id: '$userId',
                menu: { $last: '$menu' },
                username: { $last: '$username' },
                createdTimestamp: { $last: '$createdTimestamp' },
                id_order: { $last: '$_id' },
              },
            },
            {
              $project: {
                _id: '$id_order',
                userId: '$_id',
                menu: 1,
                username: 1,
                createdTimestamp: 1,
              },
            },
          ]);

          let mess;
          if (!listOrder) {
            return;
          } else if (Array.isArray(listOrder) && listOrder.length === 0) {
            mess = '```' + 'Không có ai order' + '```';
            return message.reply(mess).catch(console.error);
          } else {
            for (let i = 0; i <= Math.ceil(listOrder.length / 50); i += 1) {
              if (listOrder.slice(i * 50, (i + 1) * 50).length === 0) break;
              mess = listOrder
                .slice(i * 50, (i + 1) * 50)
                .map(
                  (list) =>
                    `<${list.username}> order ${list.menu.toUpperCase()}`
                )
                .join('\n');
              const Embed = new MessageEmbed()
                .setTitle(`Chốt đơn!!! Tổng là ${listOrder.length} người`)
                .setColor('RED')
                .setDescription(`${mess}`);
              await message.reply({ embeds: [Embed] }).catch(console.error);
            }
          }
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
