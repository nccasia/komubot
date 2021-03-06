const channelData = require('../../models/channelData');
const userData = require('../../models/userData');
const messHelp = `*mv <this|channel> <category>`;
module.exports = {
  name: 'mv',
  description: 'moveChannel',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      let authorId = message.author.id;
      const checkRole = await userData.find({
        id: authorId,
        deactive: { $ne: true },
        $or: [{ roles_discord: { $all: ['PM'] } }],
      });

      if (checkRole.length === 0) {
        return message
          .reply({
            content:
              '```You do not have permission to execute this command!```',
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      }
      if (args[0] && args[1]) {
        const findCategory = args.slice(1, args.length).join(' ');

        let category = client.channels.cache.find(
          (cat) =>
            cat.id === findCategory ||
            cat.name.toUpperCase() === findCategory.toUpperCase()
        );
        const getChannel = client.channels.cache.find(
          (guild) =>
            guild.id === args[0] ||
            guild.name.toUpperCase() === args[0].toUpperCase()
        );

        if (getChannel && category) {
          const channel = await client.channels.fetch(getChannel.id);
          channel.setParent(category.id, { lockPermissions: false });
          await channelData.updateOne(
            { id: args[0] },
            { $set: { parentId: category.id } }
          );
          await message
            .reply({
              content: `move channel to ${category.name} successfully`,
              ephemeral: true,
            })
            .catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
        } else {
          return message
            .reply({ content: messHelp, ephemeral: true })
            .catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
        }
      } else {
        return message
          .reply({ content: messHelp, ephemeral: true })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
