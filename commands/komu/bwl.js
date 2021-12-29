const userData = require("../../models/userData.js");
const bwlReactData = require("../../models/bwlReactData.js");

module.exports = {
    name: 'bwl',
    description: 'BWL leaderboard',
    cat: 'komu',
    async execute(message, args, client, guildDB) {
        const aggregatorOpts = [
            {
                $group: {
                    _id: "$messageId",
                    count: { $sum: 1 }
                }
            },
            { 
                $sort: { "count": -1 }
            },
            { $limit: 10 }
        ]
        
        bwlReactData.aggregate(aggregatorOpts).exec().then(docs => {
            docs.forEach(doc => {
                console.log(doc._id);
                userData.findOne({id: doc._id}).then(user => {
                    console.log(user.username, doc.count);
                });
            });
        });
        message.channel.send("1K TX8 cho top1").catch(console.error);
    },
};