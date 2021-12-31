const wfhData = require('../models/wfhData');
const axios = require("axios");
const userData = require("../models/userData");
const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
  } = require('discord.js');

const wfh = async (interaction, client) => {    
    const arrIds = interaction.customId.split("#");
    const customId = arrIds[0];
    const labelImageId = (arrIds.length > 1)?arrIds[1]:"";
    var isCheckin = true;
    var msg = "";
    
    if (arrIds.length > 1 && arrIds[0] == "komu_wfh_complain" && 
    labelImageId == interaction.user.id && 
    interaction.message.author.id == client.user.id) {
        if (arrIds.length == 2) {
            // send message to PM
            const userdb = await userData.findOne({ id: interaction.message.author.id }).catch(console.error);
            if (!userdb) {
                return interaction.reply("`User is not valid`").catch(console.error);
            }
            const { data } = await axios.get(
                `${client.config.wiki.api_url}${userdb.email}@ncc.asia`,
                { headers: { 'X-Secret-Key': client.config.wiki.api_key_secret} }
            ).catch((err) => {
                interaction.reply(`Error while looking up for **${userdb.email}**.`).catch(console.error);
                return { data: "There was an error!" };
            });
            var pmid;
            if (data == null || data == undefined || data.length == 0 || data.result == null || data.result == undefined || data.result.length == 0) {
                pmid = client.config.komubotrest.pmid;
                console.log(`There is no PM to confirm for **${userdb.email}**. Please confirm with SAODO!!!`);
            } else {
                pmid = data.result.projectDtos[0].pmUsername;
            }
            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('komu_wfh_complain#' + labelImageId + '#reject#' + pmid)
                    .setLabel("Reject")
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('komu_wfh_complain#' + labelImageId + '#confirm#' + pmid)
                    .setLabel("Confirm")
                    .setStyle('SECONDARY'),
            );
            const embed = new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle("Xác nhận WFH Complain")
                    .setDescription(`<@${labelImageId}> vừa complain v/v không trả lời msg WFH. Hãy xác nhận?`);
            const user = await client.users.fetch(pmid).catch(console.error);
            await user.send({ embeds: [embed], components: [row] }).catch(console.error);
            // update database
            await wfhData.updateOne({
                userid: labelImageId
            }, {
                complain: true,
            }).catch(console.error);
            await interaction.reply(`<@${labelImageId}> your complain is sent to <@${pmid}>.`).catch(console.error);
        } else if (arrIds.length >= 3) {
            // If PM approved, send message to channel
            if (arrIds.length > 2 && arrIds[2] == "confirm") {
                if (arrIds.length > 3) {
                    const pmid = arrIds[3];
                    const message = `<@${pmid}> đã xác nhận WFH Complain của <@${labelImageId}>`;
                    await wfhData.updateOne(
                        { userid: labelImageId }, { confirm: true, data: message, status: "APPROVED" }
                    ).catch(console.error);
                    await client.channels.cache.get(client.config.komubotrest.machleo_channel_id).send(message).catch(console.error);
                    await interaction.reply(`You just confirmed WFH complain for <@${labelImageId}>`).catch(console.error);
                } else if(arrIds.length > 2 && arrIds[2] == "reject") {
                    await interaction.reply(`You just rejected WFH complain for <@${labelImageId}>`).catch(console.error);
                }
            }
        }
        return;
    }
    if (customId == "komu_checkin_yes" || customId == "komu_checkin_no") {
        console.log(interaction.user.username + " check in! " + customId);
        msg = `👍 Have a good day!!!`;
        if (customId == "komu_checkin_no") {
            msg = `👎 Let me check!`;
        }                    
    } else if (customId == "komu_wfh_lbl1" || customId == "komu_wfh_lbl2") {
        console.log(interaction.user.username + " wfh in! " + customId);
        msg = `👍 Let's rock!!!`;
        if (customId == "komu_wfh_lbl2") {
            msg = "`👎 Thanks!`";
        }
        isCheckin = false;
    } else {
        interaction.reply("Invalid customId " + customId);
        return;
    }
    try {
        const verifiedImageId = labelImageId;
        const imageLabelId = labelImageId;
        const answerFaceConfirm = interaction.user.username;
        const answerValue = customId;
        await axios.put(`${client.config.komubotrest.CHECK_IN_URL}/v1/employees/image-label/update-image-label`,
        {
            verifiedImageId: verifiedImageId,
            imageLabelId: imageLabelId,
            answerFaceConfirm: answerFaceConfirm,
            answerValue: answerValue,
            isCheckin: isCheckin
        }, 
        { headers: { 'X-Secret-Key': client.config.komubotrest.komu_bot_secret_key} })
        .catch(error => {
            console.log(error);
            item.reply("Error: " + error).catch(console.error);
        });
        console.log('Update update message WFH successfully!');
        // end process wfh command
        interaction.reply({ content: msg, ephemeral: false }).catch(console.error);
    } catch (error) {
        console.log('Update update message WFH! - ERROR: ' + error);
        interaction.reply("Error! " + error).catch(console.error);
    }
}

module.exports = wfh;