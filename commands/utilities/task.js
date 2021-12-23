const taskData = require('../../models/taskData');

module.exports = {
    name: 'task',
    description: 'manage tasks',
    cat: 'utilities',
    async execute(message, args, client, guildDB) {
        if (args[0] === "create" || args[0] === "c") {            
            message.reply("Going to create task");
            return;
        }
        if (args[0] === "list" || args[0] === "l") {
            message.reply("Goinig to list");
            return;
        }
    },
};