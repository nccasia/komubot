const taskData = require('../../models/wikiData');

module.exports = {
    name: 'wiki',
    description: 'manage wiki',
    cat: 'utilities',
    async execute(message, args, client, guildDB) {        
        if (args[0] === "link" || args[0] === "l") {
            taskData.find({}, (err, docs) => {
                if (err) {
                    console.log(err);
                    message.reply("Error");
                    return;
                }
                if (docs.length === 0) {
                    message.reply("No data");
                    return;
                }
                let result = "";
                docs.forEach(doc => {
                    result += `${doc.name}: ${doc.value}\n`;
                });
                message.reply(result);
                return;
            });
        }
    },
};