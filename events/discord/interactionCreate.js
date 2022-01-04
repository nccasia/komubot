const Discord = require("discord.js")
const ms = require("ms")
const axios = require('axios')
const wfh = require('../../util/wfh.js')
module.exports = {
    async execute(interaction, client) {
        if (interaction.isButton()) {            
            // handle wfh button
            if (interaction.customId.startsWith("komu_")) {
                await wfh(interaction, client).catch(console.error);
                return;
            }
        }
        if (!interaction.isCommand()) return;
        const slashcmdexec = client.slashexeccommands.get(interaction.commandName);
        //await interaction.deferReply();
        if (slashcmdexec != null && slashcmdexec != undefined) {
            slashcmdexec(interaction, client).catch(console.error);
        } else {            
            await interaction.reply({ content: "`❌` Slash commands are under construction.\n", ephemeral: true });            
        }
        //await interaction.editReply("Done");
    }
};