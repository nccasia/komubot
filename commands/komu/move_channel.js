const channelData = require('../../models/channelData');
const msgData = require('../../models/msgData');
module.exports = {
  name: 'move_channel',
  description: 'Test',
  cat: 'komu',
  async execute(_, args, client) {
    try {
      const CATEGORY_ACHIEVED_CHANNEL_ID = '994886940950265856';
      const TIME = 7 * 24 * 60 * 60 * 1000;

      const channels = await channelData.find({
        parentId: { $ne: CATEGORY_ACHIEVED_CHANNEL_ID, $exists: true },
        type: { $nin: ['GUILD_CATEGORY'] },
      });
      const channelIds = channels.map((channel) => channel.id);

      for (channelId of channelIds) {
        try {
          const channel = await client.channels.fetch(channelId);
          const message = await channel.messages.fetch({ limit: 1 });
          const messageId = message.map((mes) => mes.id)[0];

          if (!messageId) continue;

          const messData = await msgData
            .findOne({ id: messageId })
            .select('-_id createdTimestamp');

          if (Date.now() - messData.createdTimestamp >= TIME) {
            channel.setParent(CATEGORY_ACHIEVED_CHANNEL_ID);
            channelData.updateOne(
              { id: channelId },
              { $set: { parentId: CATEGORY_ACHIEVED_CHANNEL_ID } }
            );
          }
        } catch (error) {
          continue;
        }
      }
      await _.reply('move channel successfully');
    } catch (error) {
      console.log(error);
    }
  },
};
