const wfhData = require('../models/wfhData');
const axios = require('axios');
const userData = require('../models/userData');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const wfh = async (interaction, client) => {
  const arrIds = interaction.customId.split('#');
  const customId = arrIds[0];
  const labelImageId = arrIds.length > 1 ? arrIds[1] : '';
  let isCheckin = true;
  let msg = '';

  if (
    arrIds.length > 2 &&
    (arrIds[0] == 'komu_wfh_complain' || arrIds[0] == 'komu_wfh_accept') &&
    // labelImageId == interaction.user.id &&
    interaction.message.author.id == client.user.id
  ) {
    console.log('wfh complain from', interaction.user.id);

    const wfhid = arrIds[2];
    if (arrIds[0] == 'komu_wfh_accept' || arrIds[0] == 'komu_wfh_accept_but') {
      await wfhData
        .updateOne(
          { userid: labelImageId },
          { pmconfirm: false, data: arrIds[0], status: 'ACCEPT' }
        )
        .catch(console.error);
      interaction.reply({ content: 'Thanks!!!', ephemeral: true });
      return;
    }
    if (arrIds.length == 3) {
      const wfhdata = await wfhData
        .findOne({ _id: wfhid })
        .catch(console.error);
      if (!wfhdata) {
        interaction.reply({ content: 'No WFH found', ephemeral: true });
        return;
      }
      const msec = new Date() - new Date(wfhdata.createdAt);
      if (msec > 3600000) {
        interaction.reply({
          content: 'WFH complain is expired. You have an hour to request.',
          ephemeral: true,
        });
        return;
      }

      if (wfhdata.complain) {
        interaction.reply({
          content: 'You have already complained.',
          ephemeral: true,
        });
        return;
      }

      // send message to PM
      const userdb = await userData
        .findOne({ id: labelImageId, deactive: { $ne: true } })
        .catch(console.error);
      if (!userdb) {
        return interaction
          .reply({ content: '`User is not valid`', ephemeral: true })
          .catch(console.error);
      }
      const { data } = await axios
        .get(`${client.config.wiki.api_url}${userdb.email}@ncc.asia`, {
          headers: { 'X-Secret-Key': client.config.wiki.api_key_secret },
        })
        .catch(() => {
          interaction
            .reply({
              content: `Error while looking up for **${userdb.email}**.`,
              ephemeral: true,
            })
            .catch(console.error);
          return { data: 'There was an error!' };
        });
      if (
        data == null ||
        data == undefined ||
        data.length == 0 ||
        data.result == null ||
        data.result == undefined ||
        data.result.length == 0 ||
        data.result.projectDtos == undefined ||
        data.result.projectDtos.length == 0
      ) {
        msg = `There is no PM to confirm for **${userdb.email}**. Please contact to your PM`;
        console.log(msg);
        interaction
          .reply({ content: msg, ephemeral: true })
          .catch(console.error);
        return;
      }

      const pmdb = await userData
        .findOne({
          $or: [
            {
              username: data.result.projectDtos[0].pmUsername,
              deactive: { $ne: true },
            },
            {
              email: data.result.projectDtos[0].pmUsername,
              deactive: { $ne: true },
            },
          ],
        })
        .catch(console.error);
      if (!pmdb) {
        interaction
          .reply({
            content: `Cannot fetch data for PM ${data.result.projectDtos[0].pmUsername}`,
            ephemeral: true,
          })
          .catch(console.error);
        return;
      }
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(
            'komu_wfh_complain#' +
              labelImageId +
              '#' +
              wfhid +
              '#reject#' +
              pmdb.id
          )
          .setLabel('Reject')
          .setStyle('DANGER'),
        new MessageButton()
          .setCustomId(
            'komu_wfh_complain#' +
              labelImageId +
              '#' +
              wfhid +
              '#confirm#' +
              pmdb.id
          )
          .setLabel('Confirm')
          .setStyle('PRIMARY')
      );
      const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle('Verify WFH Complain')
        .setDescription(
          `<@${labelImageId}> just sent WFH complain. Please check?`
        );
      const user = await client.users.fetch(pmdb.id).catch(console.error);
      if (!user) {
        interaction
          .reply({
            content: `Cannot fetch username: ${pmdb.username}, with id: ${pmdb.id}`,
            ephemeral: true,
          })
          .catch(console.error);
        return;
      }
      await user
        .send({ embeds: [embed], components: [row] })
        .catch(console.error);
      // update database
      await wfhData
        .updateOne(
          {
            _id: wfhid,
          },
          {
            complain: true,
          }
        )
        .catch(console.error);
      await interaction
        .reply({
          content: `<@${labelImageId}> your WFH complain is sent to <@${pmdb.id}>.`,
          ephemeral: true,
        })
        .catch(console.error);
    } else if (arrIds.length >= 3) {
      // If PM approved, send message to channel
      if (
        arrIds.length > 2 &&
        (arrIds[3] == 'confirm' || arrIds[3] == 'reject')
      ) {
        if (arrIds.length > 3) {
          const pmid = arrIds[4];
          const message = `<@${pmid}> just ${arrIds[3]}ed WFH complain from <@${labelImageId}>`;
          await wfhData
            .updateOne(
              { _id: wfhid },
              {
                pmconfirm: arrIds[3] == 'confirm',
                data: message,
                status: 'APPROVED',
              }
            )
            .catch(console.error);
          await client.channels.cache
            .get(client.config.komubotrest.machleo_channel_id)
            .send(message)
            .catch(console.error);
          await interaction
            .reply({
              content: `You just ${arrIds[3]}ed WFH complain for <@${labelImageId}>`,
              ephemeral: true,
            })
            .catch(console.error);
        }
      }
    }
    return;
  }
  if (customId == 'komu_checkin_yes' || customId == 'komu_checkin_no') {
    console.log(interaction.user.username + ' check in! ' + customId);
    msg = '👍 Have a good day!!!';
    if (customId == 'komu_checkin_no') {
      msg = '👎 Let me check!';
    }
  } else if (customId == 'komu_wfh_lbl1' || customId == 'komu_wfh_lbl2') {
    console.log(interaction.user.username + ' wfh in! ' + customId);
    msg = "👍 Let's rock!!!";
    if (customId == 'komu_wfh_lbl2') {
      msg = '`👎 Thanks!`';
    }
    isCheckin = false;
  } else {
    interaction
      .reply({
        content: 'You are not the right people to complain:)',
        ephemeral: true,
      })
      .catch(console.error);
    return;
  }
  try {
    const verifiedImageId = labelImageId;
    const imageLabelId = labelImageId;
    const answerFaceConfirm = interaction.user.username;
    const answerValue = customId;
    await axios
      .put(
        `${client.config.komubotrest.CHECK_IN_URL}/v1/employees/image-label/update-image-label`,
        {
          verifiedImageId: verifiedImageId,
          imageLabelId: imageLabelId,
          answerFaceConfirm: answerFaceConfirm,
          answerValue: answerValue,
          isCheckin: isCheckin,
        },
        {
          headers: {
            'X-Secret-Key': client.config.komubotrest.komu_bot_secret_key,
          },
        }
      )
      .catch((error) => {
        console.log(error);
        interaction.reply('Error: ' + error).catch(console.error);
      });
    console.log('Update update message WFH successfully!');
    // end process wfh command
    interaction.reply({ content: msg, ephemeral: false }).catch(console.error);
  } catch (error) {
    console.log('Update update message WFH! - ERROR: ' + error);
    interaction.reply('Error! ' + error).catch(console.error);
  }
};

module.exports = wfh;
