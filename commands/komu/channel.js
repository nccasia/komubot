const userData = require('../../models/userData');
const {
    sendMessageKomuToUser,
    sendErrorToDevTest,
} = require('../../util/komubotrest');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const individualOwner = require('../../models/individualOwner');

const messHelp =
    '```' +
    '*channel add @username' +
    '\n' +
    '*channel create <channelName>' +
    '\n' +
    '*channel remove @username' +
    '\n' +
    '*channel delete' +
    '```';
module.exports = {
    name: 'channel',
    description: 'channel',
    cat: 'komu',
    async execute(message, args, client) {
        try {
            let authorId = message.author.id;
            if (args[0] === 'help') {
                return message.channel.send(messHelp);
            } else if (args[0] === 'add') {
                const userArgs = message.mentions.members.first();
                message.channel.permissionOverwrites.edit(userArgs, {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true
                });
                return message
                    .reply({
                        content: '`✅` Added User.',
                        ephemeral: true,
                    })
                    .catch((err) => {
                        sendErrorToDevTest(client, authorId, err);
                    });
            } else if (args[0] === 'remove') {
                const userArgs = message.mentions.members.first();
                message.channel.permissionOverwrites.edit(userArgs, {
                    SEND_MESSAGES: false,
                    VIEW_CHANNEL: false
                });
                return message
                    .reply({
                        content: '`✅` Removed User.',
                        ephemeral: true,
                    })
                    .catch((err) => {
                        sendErrorToDevTest(client, authorId, err);
                    });
            } else if (args[0] === 'create') {
                let arrName = args.filter((v, i) => i > 0);
                message.guild.channels.create(arrName.join('-'))
                    .then(channel => {
                        let category = message.guild.channels.cache.find(c => c.id == "975781713647112192");
                        if (category) channel.setParent(category.id);
                        message.channel.permissionOverwrites.edit(message.author, {
                            SEND_MESSAGES: true,
                            VIEW_CHANNEL: true
                        });
                        const saveD = new individualOwner({
                            id: channel.id,
                            username: message.author.username,
                            ownerId: message.author.id,
                            name: arrName.join('-')
                        });
                        saveD.save();
                        return message
                            .reply({
                                content: '`✅` Created Channel.',
                                ephemeral: true,
                            })
                            .catch((err) => {
                                sendErrorToDevTest(client, authorId, err);
                            });
                    }).catch(console.error);
            } else if (args[0] === 'delete') {
                let list = await individualOwner.find({
                    id: args[1],
                    username: message.author.username,
                    ownerId: message.author.id,
                });
                if (list.length > 0) {
                    const fetchedChannel = message.guild.channels.cache.get(args[1]);
                    fetchedChannel.delete();
                    return message
                        .reply({
                            content: '`✅` Delete Channel.',
                            ephemeral: true,
                        })
                        .catch((err) => {
                            sendErrorToDevTest(client, authorId, err);
                        });
                }
            }
        } catch (error) {
            console.log(error);
        }
    },
};
