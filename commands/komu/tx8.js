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

                if (isNaN(tx8Number)) {
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

            if (userId != "869928527607246858" && userId != "871713984670216273" && args[0] == "draw") {
                message.reply({ content: "```You are not allowed to use this command.```", ephemeral: true }).catch(console.error);
                return;    
            }

            if (args[0] == "draw") {
                var now = new Date();
                var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const starttime = startOfDay.getTime();
                const endtime = starttime + 24 * 3600000;

                const data = await tx8Data.find({ status: "pending", createdTimestamp: {
                    $gte: starttime,
                    $lt: endtime
                } }).sort({ createdTimestamp: -1 });
                if (data.length == 0) {
                    message.reply({ content: "```No lucky number found```", ephemeral: true });
                    return;
                }
                const rndNumber = Math.floor(Math.random() * data.length);
                const tx8Number = data[rndNumber].tx8number;
                const user = await userData.findOne({ id: data[rndNumber].userId });
                
                await tx8Data.updateOne({ _id: data[rndNumber]._id }, { status: "done" });
                message.reply({ content: `\`🎉\` Lucky number is \`${tx8Number}\` by \`${user.email}\``, ephemeral: false });
            }
        } catch (err) {
            console.log(err);
            message.reply({ content: "```Error```", ephemeral: true });
        }     
    },
};