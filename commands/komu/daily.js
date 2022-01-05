const dailyData = require("../../models/dailyData.js");

module.exports = {
  name: "daily",
  description: "WFH Daily",
  cat: "komu",
  async execute(message, args, client, guildDB) {
    try {
      const daily = args.join(" ");
      if (!daily || daily == undefined) {
        return message.reply({ content: "```please add your daily text```", ephemeral: true }).catch(console.error);
      }
      const data = await new dailyData({
          userid: message.author.id,
          email: (message.member != null || message.member != undefined?message.member.displayName:message.author.username),
          daily: daily,
          createdAt: new Date(),
          channelid: message.channel.id
      }).save().catch(err => console.log(err));
      message.reply({ content: `\`✅\` Daily saved.`, ephemeral: true });
    } catch (err) {
      console.log(err);
    }
  },
};
