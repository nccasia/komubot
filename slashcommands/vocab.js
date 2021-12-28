const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vocab')
		.setDescription('Vocabulary search')
		.addStringOption(option =>
			option.setName('word')
				.setDescription('word for search')
				.setRequired(true)),
    async execute(message, client) {
        const word = message.options.get("word").value;
        const { data } = await axios
        .get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
        ).catch((err) => {
            console.log("WTF WTF WTF", err);
            message.reply({ content: `Nothing match... **${word}**.`, ephemeral: true });
            return { data: "There was an error!" };
        });

        if (data == undefined || data.length == undefined || data.length == 0) {
            message.reply({ content: `Nothing match... **${word}**.`, ephemeral: true });
            return;
        }

        const botTexts = [];
        const botExamples = [];

        let d;
        for (d = 0; d < data.length; d++) {
            let i, j, k;
            for (i = 0; i < data[d].phonetics.length; i++) {
                if (data[d].phonetics[i].audio !== undefined) {
                    botTexts.push(data[d].phonetics[i].text + " (https:" + data[d].phonetics[i].audio + ")");
                } else {
                    botTexts.push(data[d].phonetics[i].text);
                }
            }

            for (i = 0; i < data[0].meanings.length; i++) {
                let meaning = data[0].meanings[i].partOfSpeech + "\n";
                for (j = 0; j < data[0].meanings[i].definitions.length; j++) {
                    meaning += "\t" + data[0].meanings[i].definitions[j].definition + "\n";
                    meaning += "\t" + data[0].meanings[i].definitions[j].example + "\n";
                    meaning += "\n\t *Synonyms* \n";
                    for (k = 0; k < data[0].meanings[i].definitions[j].synonyms.length; k++) {
                        meaning += "\t\t" + data[0].meanings[i].definitions[j].synonyms[k] + "\n";
                    }
                    botExamples.push(meaning);
                }
            }
        }

        const embed = new MessageEmbed()
            .setColor("#EFFF00")
            .setTitle(word)
            .addFields(
                { name: "phonetics", value: botTexts.join("\n"), inline: false },
                { name: "meanings", value: botExamples.join("\n").substring(0, 1024), inline: false },
            );
        message.reply({ embeds: [embed], ephemeral: true }).catch((err) => console.log(err));    
    },
};
