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
      const noti = message.content.slice(10, message.content.length);
      const checkRole = await userData.find({
        id: authorId,
        deactive: { $ne: true },
        $or: [
          { roles_discord: { $all: ['ADMIN'] } },
          { roles_discord: { $all: ['HR'] } },
        ],
      });

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

      if (checkRole.length > 0 || authorId === '871713984670216273') {
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
          '990141662665777172',
          '1022323179563270244',
        ];

        fetchChannel.map(async (channel) => {
          const userDiscord = await client.channels.fetch(channel);
          if (message.attachments && message.attachments.first())
            userDiscord
              .send({
                content: `${noti}`,
                files: [message.attachments.first().url],
              })
              .catch(console.error);
          else userDiscord.send(`${noti} `).catch(console.error);
        });
      } else {
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
    } catch (err) {
      console.log(err);
    }
  },
};
