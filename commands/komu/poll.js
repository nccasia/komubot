const pollEmbed = require("../../util/pollEmbed.js");
module.exports = {
    name: 'poll',
    description: 'create a poll',
    cat: 'komu',
    async execute(message, args, client, guildDB) {
        const cmds = args.join(" ").split("+");
        const options = cmds.slice(1);

        await pollEmbed(message, cmds[0].trim(), options.map(element => {
            return element.trim();
          }));
    },
};