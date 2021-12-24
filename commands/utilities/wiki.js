const taskData = require('../../models/wikiData');

module.exports = {
    name: 'wiki',
    description: 'manage wiki',
    cat: 'utilities',
    async execute(message, args, client, guildDB) {
        if (args[0] == "help" || !client.config.wiki.options.includes(args[0])) {
            message.reply("Available commands: \n" + client.config.wiki.options.map(x => `\`${x}\``).join(' '));
            return;
        }
        var filter = {type: args[0]};
        if(args[0] == 'all') {
            filter = {};
        }
        console.log(filter);
        taskData.find(filter, (err, docs) => {
            if (err) {
                console.log(err);
                message.reply("Error");
                return;
            }
            if (docs.length === 0) {
                message.reply("No data");
                return;
            }
            let result = "\`\`\`\n";
            docs.forEach(doc => {
                result += `*${doc.name}*\n`;
                result += `${doc.value}\n\n`;
            });
            result += "\`\`\`";
            console.log(result);
            message.reply(result);
            return;
        });
    },
};