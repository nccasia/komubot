const userData = require("../../models/userData.js");
const bwlReactData = require("../../models/bwlReactData.js");

function getTimeWeek(time) {
  let curr;
  if (time) {
    if (!validateTimeDDMMYYYY(time)) {
      return;
    }
    const timeFormat = formatDayMonth(time);
    curr = new Date(timeFormat);
  } else {
    curr = new Date();
  }

  let first = curr.getDate() - curr.getDay() + 1;
  let last = first + 7;

  let firstday = new Date(curr.setDate(first)).toUTCString();
  let lastday = new Date(curr.setDate(last)).toUTCString();

  return {
    firstday: {
      timestamp: new Date(withoutTime(firstday)).getTime(),
      date: formatDate(new Date(withoutTime(firstday))),
    },
    lastday: {
      timestamp: new Date(withoutTime(lastday)).getTime(),
      date: formatDate(new Date(withoutTime(lastday))),
    },
  };
}

function withoutTime(dateTime) {
  var date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}
function formatDayMonth(time) {
  const day = time.split("").slice(0, 2).join("");
  const month = time.split("").slice(3, 5).join("");
  const year = time.split("").slice(6, 10).join("");
  return `${month}/${day}/${year}`;
}

function formatDate(time) {
  let today = new Date(time);
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function validateTimeDDMMYYYY(time) {
  return /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(
    time
  );
}

module.exports = {
  name: "bwl",
  description: "BWL leaderboard",
  cat: "komu",
  async execute(message, args, client, guildDB) {
    try {
      if (args[0] === "help") {
        return message.channel.send(
          "```" +
            "*bwl channel_id top dd/mm/yyyy" +
            "\n" +
            "channel_id : right click to the channel & copy" +
            "```"
        );
      }

      const channelId = args[0] || message.channel.id;

      const top =
        !isNaN(parseFloat(args[1])) && !isNaN(args[1] - 0) && parseInt(args[1]) || 5;
      const time = args[2];
      if (!channelId || !getTimeWeek(time)) {
        return message.channel.send("```invalid channel or time```");
      }

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
        {
          $group: {
            _id: "$author.id",
            author: { $first: "$author" },
            message: { $first: "$author_message" },
            totalReact: { $first: "$totalReact" },
          },
        },
        {
          $match: {
            $and: [
              {
                "message.createdTimestamp": {
                  $gte: getTimeWeek(time).firstday.timestamp,
                },
              },
              {
                "message.createdTimestamp": {
                  $lte: getTimeWeek(time).lastday.timestamp,
                },
              },
            ],
          },
        },
        {
          $sort: { totalReact: -1 },
        },
        { $limit: top ? top : 5 },
      ];

      bwlReactData
        .aggregate(aggregatorOpts)
        .exec()
        .then((docs) => {
          let name = [];
          if (docs.length) {
            name = docs.map((doc, index) => {
              return `Top ${index + 1} ${doc.author.username}: ${
                doc.totalReact
              } votes`;
            });
          }
          if (Array.isArray(name) && name.length === 0) {
            message.channel.send("```no result```");
          } else {
            message.channel
              .send(
                "```" +
                  getTimeWeek(time).firstday.date +
                  " - " +
                  getTimeWeek(time).lastday.date +
                  "\n" +
                  name.join("\n") +
                  "```"
              )
              .catch(console.error);
          }
        });
    } catch (e) {
      console.log(e);
    }
  },
};
