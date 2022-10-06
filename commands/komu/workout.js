const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const userData = require('../../models/userData');
const workoutData = require('../../models/workoutData');
const { sendErrorToDevTest } = require('../../util/komubotrest');

const monthSupport = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

module.exports = {
  name: 'workout',
  description: 'workout daily',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      const authorId = message.author.id;
      if (args[0] === 'summary') {
        if (!args[1]) {
          args[1] = `${new Date().getMonth() + 1}`;
        }
        if (monthSupport.includes(args[1].toUpperCase())) {
          const date = new Date();
          let dateFormat;
          const year = date.getFullYear();
          if (args[1].length > 2) {
            dateFormat = new Date(`${args[1]} ${year}`);
          } else {
            dateFormat = new Date(year, +args[1] - 1);
          }
          const y = dateFormat.getFullYear();
          const m = dateFormat.getMonth();
          const firstDay = new Date(y, m, 1);
          const lastDay = new Date(y, m + 1, 0);

          const userCheckWorkout = await workoutData.aggregate([
            {
              $match: {
                channelId: message.channelId,
                createdTimestamp: {
                  $gte: firstDay.getTime(),
                  $lte: lastDay.getTime(),
                },
                status: 'approve',
              },
            },
            {
              $group: {
                _id: '$userId',
                total: { $sum: 1 },
                email: { $first: '$email' },
                channelId: { $first: '$channelId' },
                userId: { $first: '$userId' },
              },
            },
            {
              $project: {
                _id: 0,
                total: 1,
                email: 1,
                channelId: 1,
                userId: 1,
              },
            },
          ]);

          let mess;
          if (!userCheckWorkout) {
            return;
          } else if (
            Array.isArray(userCheckWorkout) &&
            userCheckWorkout.length === 0
          ) {
            mess = '```' + 'No results' + '```';
            return message.reply(mess).catch((err) => {
              sendErrorToDevTest(client, m, err);
            });
          } else {
            for (
              let i = 0;
              i <= Math.ceil(userCheckWorkout.length / 50);
              i += 1
            ) {
              if (userCheckWorkout.slice(i * 50, (i + 1) * 50).length === 0) {
                break;
              }
              mess = userCheckWorkout
                .slice(i * 50, (i + 1) * 50)
                .map((item) => `${item.email} (${item.total})`)
                .join('\n');
              const Embed = new MessageEmbed()
                .setTitle('Top workout')
                .setColor('RED')
                .setDescription(`${mess}`);
              await message.reply({ embeds: [Embed] }).catch((err) => {
                sendErrorToDevTest(client, authorId, err);
              });
            }
          }
        }
      } else if (args[0] === 'help') {
        return message.channel
          .reply('```' + '*workout month' + '\n' + '*workout' + '```')
          .catch(console.error);
      } else {
        const links = [];
        if (message.attachments && message.attachments.first()) {
          message.attachments.forEach((attachment) => {
            try {
              const imageLink = attachment.proxyURL;
              links.push(imageLink);
            } catch (error) {
              console.error(error);
            }
          });
          if (links.length > 0) {
            const workout = await new workoutData({
              userId: message.author.id,
              email:
                message.member != null || message.member != undefined
                  ? message.member.displayName
                  : message.author.username,
              createdTimestamp: Date.now(),
              attachment: true,
              status: 'pending',
              channelId: message.channel.id,
            })
              .save()
              .catch((err) => console.log(err));

            const row = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  'workout_approve#' +
                    workout.email +
                    '#' +
                    workout._id +
                    '#' +
                    workout.channelId +
                    '#' +
                    message.author.id
                )
                .setLabel('APPROVE')
                .setStyle('PRIMARY'),
              new MessageButton()
                .setCustomId(
                  'workout_reject#' +
                    workout.email +
                    '#' +
                    workout._id +
                    '#' +
                    workout.channelId +
                    '#' +
                    message.author.id
                )
                .setLabel('REJECT')
                .setStyle('DANGER')
            );

            const workoutButton = await message
              .reply({
                content: '`✅` workout daily saved.',
                ephemeral: true,
                components: [row],
              })
              .catch();

            const collector = workoutButton.createMessageComponentCollector({
              time: 15000,
              max: 10,
            });

            collector.on('collect', async (i) => {
              const checkRole = await userData.find({
                id: i.user,
                deactive: { $ne: true },
                $or: [{ roles_discord: { $all: ['HR'] } }],
              });
              if (
                checkRole.length > 0 ||
                i.user.id === '921261168088190997' ||
                i.user.id === '868040521136873503'
              ) {
                const iCollect = i.customId.split('#');
                if (iCollect[0] === 'workout_approve') {
                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setCustomId('workout_approve_deactive#')
                      .setLabel('APPROVED ✅')
                      .setStyle('PRIMARY')
                      .setDisabled(true)
                  );
                  await i.update({
                    content: '`✅` workout daily saved.',
                    components: [row],
                  });
                } else {
                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setCustomId('workout_reject_deactive#')
                      .setLabel('REJECTED ❌')
                      .setStyle('DANGER')
                      .setDisabled(true)
                  );

                  await i.update({
                    content: '`✅` workout daily saved.',
                    components: [row],
                  });
                }
                return;
              }
            });
          }
        } else {
          message.reply('Please send the file attachment').catch(console.error);
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};
