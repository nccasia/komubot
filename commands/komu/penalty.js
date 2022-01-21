const userData = require("../../models/userData");
const { sendMessageKomuToUser } = require("../../util/komubotrest");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const penatlyData = require("../../models/penatlyData");

const checkIsNumber = (number) => {
  return !isNaN(parseFloat(number)) && !isNaN(number - 0) && parseInt(number);
};
const transAmmount = (ammout) => {
  ammout = ammout.toLowerCase();
  const lastString = ammout.slice(ammout.length - 1, ammout.length);
  const startString = ammout.slice(0, ammout.length - 1);

  const checkNumber = (string) =>
    !isNaN(parseFloat(string)) && !isNaN(string - 0);

  if (lastString == "k" && checkNumber(startString)) {
    return startString * 1000;
  } else {
    if (checkNumber(ammout)) return checkNumber(ammout);
  }
  return;
};
const transArgs = (userArgs) => {
  if (userArgs.includes("<@!")) {
    return {
      id: userArgs.slice(3, userArgs.length - 1),
    };
  } else {
    return { username: userArgs };
  }
};

module.exports = {
  name: "penalty",
  description: "penalty",
  cat: "komu",
  async execute(message, args, client, guildDB) {
    try {
      if (args[0] === "help") {
        return message.channel.send(
          "```" +
            "*penalty @username ammount<50k> reason" +
            "\n" +
            "*penalty summary" +
            "\n" +
            "*penalty detail username" +
            "```"
        );
      } else if (args[0] === "summary") {
        const aggregatorOpts = [
          {
            $match: {
              is_reject: false,
              channel_id: message.channel.id,
            },
          },
          {
            $group: {
              _id: "$user_id",
              amount: { $sum: "$ammount" },
            },
          },
          {
            $sort: {
              amount: -1,
            },
          },
        ];

        const result = await penatlyData.aggregate(aggregatorOpts);

        let mess;
        if (Array.isArray(result) && result.length === 0) {
          mess = "```" + "no result" + "```";
        } else {
          mess = result
            .map((item) => `<@${item._id}> : ${item.amount}`)
            .join("\n");
        }

        return message.channel
          .send("```" + `Top bị phạt :` + "\n" + "```" + "\n" + mess)
          .catch(console.error);
      } else if (args[0] === "detail") {
        //detail
        const username = args[1];
        if (!username)
          return message.channel.send("```" + "*penalty help" + "```");
        const dataPen = await penatlyData.find({ username });

        if (!dataPen || (Array.isArray(dataPen) && dataPen.length === 0))
          return message.channel.send("```" + "no result" + "```");
        let mess = dataPen
          .map((item, index) => `${index + 1} - ${item.reason}`)
          .join("\n");
        return message.channel.send(
          "```" + `Lý do ${username} bị phạt` + "\n" + mess + "```"
        );
      } else {
        const channel_id = message.channel.id;
        if (!args[0] || !args[1]) {
          return message.channel.send("```" + "*penalty help" + "```");
        }
        const userArgs = transArgs(args[0]);
        const ammount = transAmmount(args[1]);
        if (!transAmmount || !userArgs) {
          return message.channel.send("```" + "no result" + "```");
        }
        const reason = args.slice(2, args.length).join(" ");

        let user;
        if (userArgs?.id) {
          user = await userData.findOne({ id: userArgs.id });
        } else {
          user = await userData.findOne({ username: userArgs.username });
        }
        if (!user) return message.channel.send("```" + "no result" + "```");

        const newPenatly = new penatlyData({
          user_id: user.id,
          username: user.username,
          ammount,
          reason,
          createdTimestamp: Date.now(),
          is_reject: false,
          channel_id,
        });
        const newPenatlyData = await newPenatly.save();

        const embed = new MessageEmbed()
          .setColor("#0099ff")
          .setTitle("PENALTY")
          .setDescription(
            `Bạn vừa bị ${message.author.username} phạt ${ammount} vì lý do ${reason}`
          );
        const row = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`rejectpenalty${newPenatlyData._id}`)
            .setLabel("REJECT")
            .setStyle("DANGER")
        );

        const userSend = await sendMessageKomuToUser(
          client,
          {
            components: [row],
            embeds: [embed],
          },
          user.username
        );
        const filter = (interaction) =>
          interaction.customId === `rejectpenalty${newPenatlyData._id}`;

        const interaction = await userSend.dmChannel.awaitMessageComponent({
          filter,
        });
        if (interaction) {
          message.channel.send(`<@!${user.id}> từ chối nạp phạt`);
          await interaction.reply(`Đã gửi từ chối!!!`);
          await penatlyData.updateOne(
            { _id: newPenatlyData._id },
            {
              is_reject: true,
            }
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
};
