const { sendErrorToDevTest } = require('../../util/komubotrest.js');
const axios = require('axios');
const userData = require('../../models/userData');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
  name: 'thongbao',
  description: 'Thong bao',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      const authorId = message.author.id;
      const noti = args.join(' ');
      const checkRole = await userData.find({
        id: authorId,
        deactive: { $ne: true },
        $or: [
          { roles_discord: { $all: ['ADMIN'] } },
          { roles_discord: { $all: ['INTERN'] } },
        ],
        // roles_discord: 'INTERN',
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
            // securityCode: process.env.QUICKNEWS_KEY_SECRET,
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
        // // '922445995420315701',
        // '968696449128869968',
        // // '978500975637725204',
      ];

      fetchChannel.map(async (channel) => {
        const userDiscord = await client.channels.fetch(channel);
        if (message.attachments.first().url)
          userDiscord.send({
            content: `${noti}`,
            files: [message.attachments.first().url],
          });
        else userDiscord.send(`${noti} `);
      });
    } catch (err) {
      console.log(err);
    }
  },
};
