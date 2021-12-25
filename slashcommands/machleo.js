const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('machleo')
		.setDescription('Thích machleo')
		.addStringOption(option =>
			option.setName('message')
				.setDescription('mách gì nè')
				.setRequired(true))
};