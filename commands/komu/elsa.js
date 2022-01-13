module.exports = {
    name: 'elsa',
    description: 'Elsa daily english group',
    cat: 'komu',
    async execute(message, args, client, guildDB) {
        try {
            userId = message.author.id;
                      
        } catch (err) {
            console.log(err);
            message.reply({ content: "```Error```", ephemeral: true });
        }     
    },
};