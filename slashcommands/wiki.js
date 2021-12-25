const { SlashCommandBuilder } = require('@discordjs/builders');
const wikiData = require('../models/wikiData');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('show wiki')
		.addStringOption(option =>
			option.setName('topic')
				.setDescription('topic is link|office|project|hr|tx8...')
				.setRequired(true)),
    async execute(message, client) {
        const topic = message.options.get("topic").value;
        var supportTypes = await wikiData.find().distinct('type');        
        supportTypes = supportTypes.concat(client.config.wiki.options);
        supportTypes = [ ...new Set(supportTypes)];
        if (topic == "help" || !supportTypes.includes(topic)) {
            message.reply({ content: "Available commands: \n" + supportTypes.map(x => `\`${x}\``).join(' '), ephemeral: true });
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
    }         
};