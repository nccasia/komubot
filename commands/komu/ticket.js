const ticketData = require('../../models/ticketData');

module.exports = {
    name: 'ticket',
    description: 'manage ticket',
    cat: 'komu',
    async execute(message, args, client, guildDB) {
        if (args[0] === "create" || args[0] === "c") {            
            message.reply("Going to create ticket");
            return;
        }
        if (args[0] === "list" || args[0] === "l") {
            message.reply("Goinig to list");
            return;
        }
    },
};