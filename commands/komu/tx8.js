const tx8Data = require("../../models/tx8Data.js");
const userData = require("../../models/userData");

module.exports = {
    name: 'tx8',
    description: 'YEP lucky draw',
    cat: 'komu',
    async execute(message, args, client, guildDB) {
        try {
            userId = message.author.id;
                        
            if (args.length == 0) {
                return message.reply({ content: "```please add your lucky draw number (100 - 999)```", ephemeral: true }).catch(console.error);
            }

            if (args.length == 1 && args[0] != "draw") {
                const tx8Number = args[0];                

                if (isNaN(tx8Number) || (tx8Number >>> 0 !== parseFloat(tx8Number)) || tx8Number < 100 || tx8Number > 999) {
                    message.reply({ content: "Please enter a number between 100 and 999", ephemeral: true });
                    return;
                }

                const data = await new tx8Data({
                    messageId: message.id,
                    userId: userId,
                    tx8number: tx8Number,
                    status: "pending",
                    createdTimestamp: message.createdTimestamp,
                }).save();
                message.reply({ content: `\`✅\` Lucky number saved.`, ephemeral: true });
                return;
            }

            if (userId != "694732284116598797" && userId != "871713984670216273" && args[0] == "draw") {
                message.reply({ content: "```You are not allowed to use this command.```", ephemeral: true }).catch(console.error);
                return;    
            }

            if (args[0] == "draw") {
                var now = new Date();
                var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const starttime = startOfDay.getTime() + 8 * 3600000;
	            const endtime = starttime + 12 * 3600000;
                const aggregatorOpts = [
                    { 
                        "$match": {
                            status: "pending",
                            createdTimestamp: {
                                $gte: starttime,
                                $lt: endtime
                            },
                            tx8number: {
                                $gte: 99,
                                $lt: 1000
                            }
                        } 
                    },
                    {
                        "$group": {
                            "_id": "$userId",
                            "lastId": { $last: '$_id' },
                            "tx8number": { $last: '$tx8number' },
                            "createdTimestamp" : { $last: '$createdTimestamp' }
                        }
                    },
                    {
                        $project: {
                          _id: '$lastId',
                          userId: '$_id',
                          tx8number: 1,
                          createdTimestamp: 1
                        }
                    },
                    {
                        $lookup: {
                            from: "komu_users",
                            localField: "userId",
                            foreignField: "id",
                            as: "user",
                        },
                    },
                    {
                        $sort: {
                            createdTimestamp: -1
                        }
                    }
                ];
                const data = await tx8Data.aggregate(aggregatorOpts).exec();
                if (data.length == 0) {
                    message.reply({ content: "```No lucky number found```", ephemeral: true });
                    return;
                }
                const rndNumber = Math.floor(Math.random() * data.length);
                const tx8Number = data[rndNumber].tx8number;
                
                await tx8Data.updateMany({ userId: data[rndNumber].userId }, { status: "done" });
                message.reply({ content: `\`🎉\` Lucky number is \`${tx8Number}\` by \`${data[rndNumber].user[0].email}\``, ephemeral: false });
            }
        } catch (err) {
            console.log(err);
            message.reply({ content: "```Error```", ephemeral: true });
        }  
    },
};