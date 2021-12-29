const userData = require("../../models/userData.js");
const bwlReactData = require("../../models/bwlReactData.js");

module.exports = {
  name: "bwl",
  description: "BWL leaderboard",
  cat: "komu",
  async execute(message, args, client, guildDB) {
    try {
        const channelId = args[0];
        const top = parseInt(args[1]);
        const aggregatorOpts = [
        {
            $match: { channelId },
        },
        {
            $group: {
                _id: "$messageId",
                totalReact: { $addToSet: "$authorId" },
            },
        },
        {
            $project: {
                _id: 0,
                messageId: "$_id",
                totalReact: {
                    $size: "$totalReact",
                },
            },
        },
        {
            $lookup: {
                from: "komu_bwls",
                localField: "messageId",
                foreignField: "messageId",
                as: "author_message",
            },
        },
        {
            $unwind: "$author_message",
        },
        {
            $lookup: {
                from: "komu_users",
                localField: "author_message.authorId",
                foreignField: "id",
                as: "author",
            },
        },
        {
            $unwind: "$author",
        },
        {
            $sort: { totalReact: -1 },
        },
        { $limit: top },
    ];

    bwlReactData
      .aggregate(aggregatorOpts)
      .exec()
      .then((docs) => {
        let name = 'nobody';
        if (docs.length) {
            name = docs.map((doc, index) => {
                return `Top ${index + 1} ${doc.author.username}: ${doc.totalReact} votes`;
            })
        }
        message.channel.send("```" + name.join('\n') + "```").catch(console.error);
      });
    } catch (e) {
        console.log(e)
    }
  },
};
