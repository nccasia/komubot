const { SlashCommandBuilder } = require('@discordjs/builders');
const keepData = require('../models/keepData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('keep')
    .setDescription('manage yourself note')
    // .addStringOption(option =>
    //	option.setName('mode')
    //		.setDescription('list|add|archive')
    //		.setRequired(true)
    //		.addChoice('list', 'list')
    //		.addChoice('add', 'add')
    //		.addChoice('archive', 'archive'))
    .addStringOption((option) =>
      option
        .setName('note')
        .setDescription('what ever you want to keep')
        .setRequired(true)
    ),
  async execute(message) {
    try {
      const note = message.options.get('note').value;

      await new keepData({
        userid: message.user.id,
        note: note,
        createdAt: new Date(),
        status: 'active',
      }).save();
      message.reply({
        content: '`✅` Note saved. Use `/wiki note` to list.',
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
    }
  },
};
