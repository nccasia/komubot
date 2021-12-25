const axios = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'exp',
    description: 'Vocabulary explainer',
    cat: 'komu',
    async execute(message, args, client, guildDB) {
        if (!args.length) {
            return message.channel.send("Oops. Wrong format. Try { *exp vocable }");
        }
        try {
            const { data } = await axios
            .get(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${args.join(" ")}`,
            ).catch((err) => console.log("WTF WTF WTF " + err));

            if (!data || !data.length || data === undefined) {
                return message.channel.send(`Nothing match... **${args.join(" ")}**.`);
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
                .setTitle(args.join(" "))
                .addFields(
                    { name: "phonetics", value: botTexts.join("\n"), inline: false },
                    { name: "meanings", value: botExamples.join("\n").substring(0, 1024), inline: false },
                );
            message.channel.send({ embeds: [embed] }).catch((err) => console.log(err));    
        } catch (err) {
            console.log(err);
            message.channel.send("Oops. Something went wrong. Try to input a single word.");
        }
    },
};