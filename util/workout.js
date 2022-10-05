const workoutData = require('../models/workoutData');
const userData = require('../models/userData');
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const { sendErrorToDevTest } = require('./komubotrest');

const workout = async (interaction, client) => {
  const arrIds = interaction.customId.split('#');
  const labelImageId = arrIds.length > 1 ? arrIds[4] : '';
  const labelImageEmail = arrIds.length > 1 ? arrIds[1] : '';
  const workourid = arrIds[2];

  const authorId = interaction.message.author.id;
  const checkRole = await userData.find({
    id: interaction.user.id,
    deactive: { $ne: true },
    $or: [{ roles_discord: { $all: ['HR'] } }],
  });
  if (
    checkRole.length > 0 ||
    interaction.user.id === '921261168088190997' ||
    interaction.user.id === '868040521136873503' ||
    interaction.user.id === '922148445626716182'
  ) {
    if (
      arrIds.length > 2 &&
      arrIds[0] == 'workout_reject' &&
      // labelImageId == interaction.user.id &&
      authorId == client.user.id
    ) {
      const workoutDb = await workoutData
        .findOne({ _id: workourid })
        .catch(console.error);
      if (!workoutDb) {
        interaction
          .reply({ content: 'No workout found', ephemeral: true })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        return;
      }

      if (!workoutDb.status) {
        interaction
          .reply({
            content: 'You have already rejected.',
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        return;
      }
      const userdb = await userData
        .findOne({ id: labelImageId, deactive: { $ne: true } })
        .catch(console.error);
      if (!userdb) {
        return interaction
          .reply({ content: '`User is not valid`', ephemeral: true })
          .catch(console.error);
      }
      const message = `${interaction.user.username} just confirmed workout reject from ${labelImageEmail}`;

      await client.channels.cache
        .get(arrIds[3])
        .send(message)
        .catch(console.error);
      await workoutData
        .updateOne(
          { _id: workourid },
          {
            status: false,
          }
        )
        .catch(console.error);

      await interaction
        .reply({
          content: `You just confirmed workout reject for ${labelImageEmail}`,
          ephemeral: true,
        })
        .catch(console.error);
      return;
    } else if (
      arrIds.length > 2 &&
      arrIds[0] == 'workout_approve' &&
      // labelImageId == interaction.user.id &&
      authorId == client.user.id
    ) {
      if (arrIds.length === 5) {
        const workoutDb = await workoutData
          .findOne({ _id: workourid })
          .catch(console.error);
        if (!workoutDb) {
          interaction
            .reply({ content: 'No workout found', ephemeral: true })
            .catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
          return;
        }

        if (workoutDb.status) {
          interaction
            .reply({
              content: 'You have already approved.',
              ephemeral: true,
            })
            .catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
          return;
        }
        const userdb = await userData
          .findOne({ id: labelImageId, deactive: { $ne: true } })
          .catch(console.error);
        if (!userdb) {
          return interaction
            .reply({ content: '`User is not valid`', ephemeral: true })
            .catch(console.error);
        }
        const message = `${interaction.user.username} just confirmed workout approve from ${labelImageEmail}`;
        await workoutData
          .updateOne(
            { _id: workourid },
            {
              status: true,
            }
          )
          .catch(console.error);
        await client.channels.cache
          .get(arrIds[3])
          .send(message)
          .catch(console.error);
        await interaction
          .reply({
            content: `You just confirmed workout approve for ${labelImageEmail}`,
            ephemeral: true,
          })
          .catch(console.error);
      }
      return;
    }
  } else {
    interaction
      .reply({
        content: 'You do not have permission to execute this workout',
        ephemeral: true,
      })
      .catch((err) => {
        sendErrorToDevTest(client, authorId, err);
      });
    return;
  }
};

module.exports = workout;
