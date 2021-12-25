const wikiData = require('../../models/wikiData');

module.exports = {
    name: 'wiki',
    description: 'manage wiki',
    cat: 'komu',
    async execute(message, args, client, guildDB) {
        var supportTypes = await wikiData.find().distinct('type');        
        supportTypes = supportTypes.concat(client.config.wiki.options);
        supportTypes = [ ...new Set(supportTypes)];
        if (args[0] == "help" || !supportTypes.includes(args[0])) {
            message.reply("Available commands: \n" + supportTypes.map(x => `\`${x}\``).join(' '));
            return;
        }
        var filter = {type: args[0]};
        if(args[0] == 'all') {
            filter = {};
        }
        wikiData.find(filter, (err, docs) => {
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
                result += `${doc.name}\n`;
                result += `${doc.value}\n\n`;
            });
            result += "\`\`\`";
            message.reply(result);
            return;
        });
    },
};