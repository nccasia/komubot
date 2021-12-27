const bwlReactData = require("../../models/bwlReactData")

module.exports = {
    async execute(messageReaction, user, client) {
        try {
            const { message, emoji } = messageReaction;
            
            const chid = message.channel.id;
            const messageId = message.id;
            const guildId = message.guildId;
            const createdTimestamp = message.createdTimestamp;

            let data = await bwlReactData.findOne({ 
                authorId: user.id, 
                messageId: messageId, 
                guildId: guildId, 
                channelId: chid }).catch(console.error);
            if (data != null) {
                await data.updateOne({count: data.count + 1}).catch(console.error);
                return;
            }

            await new bwlReactData({
                channelId: chid,
                guildId: guildId,
                messageId: messageId,
                authorId: user.id,
                emoji: emoji.name,
                count: 1,
                createdTimestamp: createdTimestamp
            }).save().catch(console.error);
        } catch (error) {
            console.error(error);
        }
    }
};