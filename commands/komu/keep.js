module.exports = {
    name: 'keep',
    description: 'add to Google Keep',
    cat: 'komu',
    async execute(message, args, client, guildDB) {
        console.log(args.join(' '));
    },
};