const { SlashCommandBuilder } = require('@discordjs/builders');
const keepData = require('../models/keepData');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('keep')
		.setDescription('manage yourself note')
        .addStringOption(option =>
			option.setName('mode')
				.setDescription('list|add|archive')
				.setRequired(true)
				.addChoice('list', 'list')
				.addChoice('add', 'add')
				.addChoice('archive', 'archive'))
		.addStringOption(option =>
			option.setName('note')
				.setDescription('what ever you want to keep')
				.setRequired(false)),
    async execute(message, client) {
        var note;
        const mode = message.options.get("mode").value;
        if (message.options.get("note") != undefined) {
            note = message.options.get("note").value;
        }

        if (mode == "list") {
            keepData.find({userid: message.user.id}, (err, docs) => {
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
                return;
            });
        } else if (mode == "add") {
            if (!note) {
                message.reply({ content:"Please input note", ephemeral: true });
                return;
            } else {
                const data = await new keepData({
                    userid: message.user.id,
                    note: note,
                    createdAt: new Date(),
                    status: 'active'
                }).save()
                message.reply({ content: `\`✅\` Note saved.`, ephemeral: true });
                return;
            }
        } else {        
            message.reply({ content: `\`✅\` This mode is not implemented.`, ephemeral: true }).catch(console.error);
        }
    }         
};