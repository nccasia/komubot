const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketdev')
    .setDescription('manage ticket')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('query is add|remove|list')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('assignee')
        .setDescription('assignee email (example: a.nguyenvan)')
        .setRequired(true)
    )
    .addStringOption(
      (option) =>
        option
          .setName('task')
          .setDescription('task title (example: Add Login UI)')
      // .setRequired(true)
    ),
  async execute(message, client) {
    const topic = message.options.get('query').value;
    const topicAssignee = message.options.get('assignee').value;

    try {
      if (topic === 'add') {
        const topicTask = message.options.get('task').value;
        await axios
          .post(
            `${client.config.ticket.api_url_create}`,

            {
              recipientemail: `${topicAssignee}@ncc.asia`,
              creatoremail: `${message.user.username}@ncc.asia`,
              jobname: topicTask,
            },

            {
              headers: {
                'X-Secret-Key': client.config.ticket.api_key_secret,
                'Content-Type': 'application/json',
              },
            }
          )
          .catch((err) => {
            console.log('Email address not found', err);
            message
              .reply({ content: 'Email address not found', ephemeral: true })
              .catch(console.error);
            return { data: 'There was an error!' };
          });
        message.reply({ content: '`✅` Ticket saved.', ephemeral: true });
      } else if (topic === 'list') {
        const { data } = await axios
          .get(
            `${client.config.ticket.api_url_get}?email=${topicAssignee}@ncc.asia`,
            {
              headers: {
                'X-Secret-Key': client.config.ticket.api_key_secret,
              },
            }
          )
          .catch((err) => {
            console.log('Error ', err);
            message
              .reply({
                content: `Error while looking up for **${topicAssignee}**.`,
                ephemeral: true,
              })
              .catch(console.error);
            return { data: 'There was an error!' };
          });
        if (!data || !data.result) return;
        const dataJobs = data.result.map((item) => [
          item.jobId,
          item.jobName,
          item.creatorEmail,
          item.creatorUsername,
          item.status,
        ]);
        let mess = '';
        dataJobs.forEach((job) => {
          mess =
            mess +
            `jobId:${job[0]}` +
            '\n' +
            `jobName:${job[1]}` +
            '\n' +
            `creatorEmail:${job[2]}` +
            '\n' +
            `creatorUsername:${job[3]}` +
            '\n' +
            `status:${job[4]}` +
            '\n' +
            '\n';
        });
        message.reply({ content: mess, ephemeral: true });

        if (
          data == null ||
          data == undefined ||
          data.length == 0 ||
          data.result == null ||
          data.result == undefined ||
          data.result.length == 0
        ) {
          return message
            .reply({
              content: `No data for **${topicAssignee}**.`,
              ephemeral: true,
            })
            .catch(console.error);
        }
      } else {
        return message.chanel
          .send('```' + '*No query ticket' + '```')
          .catch(console.error);
      }
    } catch (error) {
      console.log(error);
      message.reply({ content: 'Error ' + error, ephemeral: true });
      return;
    }
  },
};
