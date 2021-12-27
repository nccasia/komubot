const { SlashCommandBuilder } = require('@discordjs/builders');
const wikiData = require('../models/ticketData');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tiket')
		.setDescription('manage tiket')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('query is add|remove|list')
				.setRequired(true)),
    async execute(message, client) {
        const topic = message.options.get("query").value;
        
    }         
};