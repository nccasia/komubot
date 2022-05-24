const { sendErrorToDevTest } = require('../../util/komubotrest.js');
const axios = require('axios');
const userData = require('../../models/userData');

module.exports = {
  name: 'thongbao',
  description: 'Thong bao',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      const authorId = message.author.id;
      const noti = args.join(' ');
      const checkRoleHr = await userData.find({
        id: authorId,
        deactive: { $ne: true },
        roles_discord: { $nin: ['HR', 'ADMIN'], $exists: true },
      });

      if (checkRoleHr.length === 0) {
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

      if (!noti || noti == undefined) {
        return message
          .reply({
            content: '```please add your text```',
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      }

      await axios.post(
        client.config.noti.api_url_quickNews,
        {
          content: noti,
        },
        {
          headers: {
            securityCode: process.env.IMS_KEY_SECRET,
          },
        }
      );
      message
        .reply({ content: '`✅` Notification saved.', ephemeral: true })
        .catch((err) => {
          sendErrorToDevTest(client, authorId, err);
        });
      const fetchChannel = [
        '922135616962068520',
        '922402247260909569',
        '935151571581423626',
        '921686261943635988',
        '921652536933499002',
        '969511102885019688',
        '921239541388554240',
      ];
      fetchChannel.map(async (channel) => {
        const userDiscord = await client.channels.fetch(channel);
        userDiscord.send(`${noti}`);
      });
    } catch (err) {
      console.log(err);
    }
  },
};
