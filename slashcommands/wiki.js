const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const wikiData = require('../models/wikiData');
const userData = require('../models/userData');
const keepData = require('../models/keepData');

const axios = require("axios");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('show wiki')
		.addStringOption(option =>
			option.setName('topic')
				.setDescription('topic is link|office|project|hr|tx8... or @user')
				.setRequired(true)),
    async execute(message, client) {
        try {
            var topic = message.options.get("topic").value;
            var supportTypes = await wikiData.find().distinct('type');
            supportTypes = supportTypes.concat(client.config.wiki.options);
            supportTypes = [ ...new Set(supportTypes)];
            if (topic == "help" || (topic.substring(0,3) != "<@!" && topic.substring(21) != ">" && !supportTypes.includes(topic))) {
                message.reply({ content: "Available commands: \n" + '\`@user\` ' + supportTypes.map(x => `\`${x}\``).join(' '), ephemeral: true })
                .catch(console.error);
                return;
            }
            if (topic.substring(0,4) == "note") {
                await keepData.find({userid: message.user.id, status : "active"}, (err, docs) => {
                    if (err) {
                        console.log(err);
                        message.reply({ content:"Error", ephemeral: true });
                        return;
                    }
                    if (docs.length === 0) {
                        message.reply({ content:"No data", ephemeral: true }).catch(console.error);
                        return;
                    }
                    let result = "\`\`\`\n";
                    docs.forEach(doc => {
                        result += `${doc.note}\n`;
                    });
                    result += "\`\`\`";
                    message.reply({ content: result, ephemeral: true }).catch(console.error);
                });
                return;
            }
            if (topic.substring(0,3) == "<@!" && topic.substring(21) == ">") {
                topic = topic.substring(3,21);

                const userdb = await userData.findOne({$and: [
                    { id: topic },
                    { email: { $ne: null } },
                ]});

                if (userdb == null) {
                    message.reply({ content: "Email not found.", ephemeral: true })
                    .catch(console.error);
                    return;
                }

                const { data } = await axios.get(
                    `${client.config.wiki.api_url}${userdb.email}@ncc.asia`,
                    { headers: { 'X-Secret-Key': client.config.wiki.api_key_secret} }
                ).catch((err) => {
                    console.log("Error ", err);
                    message.reply({ content: `Error while looking up for **${userdb.email}**.`, ephemeral: true }).catch(console.error);
                    return { data: "There was an error!" };
                });

                if (data == null || data == undefined || data.length == 0 || data.result == null || data.result == undefined || data.result.length == 0) {
                    return message.reply({ content: `No data for **${userdb.email}**.`, ephemeral: true }).catch(console.error);
                }

                const infos = [];
                const projects = [];

                infos.push(data.result.employeeName);
                infos.push(data.result.emailAddress);
                infos.push(data.result.phoneNumber);
                infos.push(data.result.roleType);
                infos.push(data.result.branch);

                data.result.projectDtos.forEach(item => {                    
                    projects.push(item.projectName);
                    projects.push(item.pmName);
                    projects.push(item.startTime);
                    projects.push(item.projectRole);                    
                })

                const embed = new MessageEmbed()
                    .setColor("#3A871F")
                    .setTitle(data.result.employeeName)
                    .addFields(
                        { name: "Infos", value: infos.join("\n"), inline: false },
                        { name: "Projects", value: projects.join("\n").substring(0, 1024), inline: false },
                    );
                message.reply({ embeds: [embed], ephemeral: true }).catch((err) => console.log(err));
                return;
            }

            var filter = {type: topic};
            if(topic == 'all') {
                filter = {};
            }
            wikiData.find(filter, (err, docs) => {
                if (err) {
                    console.log(err);
                    message.reply({ content:"Error", ephemeral: true });
                    return;
                }
                if (docs.length === 0) {
                    message.reply({ content:"No data", ephemeral: true });
                    return;
                }
                let result = "\`\`\`\n";
                docs.forEach(doc => {
                    result += `${doc.name}\n`;
                    result += `${doc.value}\n\n`;
                });
                result += "\`\`\`";
                message.reply({ content: result, ephemeral: true });
                return;
            });
        } catch (err) {
            console.log(err);
            message.reply({ content:"Error " + err, ephemeral: true });
            return;
        }
    }
};