const userData = require("../models/userData");

async function reportScore(message, args, client, guildDB) {
  try {
    const userid = message.author.id;
    const username = message.author.username;

    if (!userid || !username) return;

    const scoresQuizData = await userData.aggregate([
      {
        $project: {
          _id: 0,
          id: 1,
          scores_quiz: 1,
        },
      },
      {
        $sort: {
          scores_quiz: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);
    let mess;
    if (Array.isArray(scoresQuizData) && scoresQuizData.length === 0) {
      mess = "```" + "no result" + "```";
    } else {
      mess = scoresQuizData
        .map((item) => `<@${item.id}> - ${item.scores_quiz || 0} score`)
        .join("\n");
    }

    return message.channel
      .send("```" + "Top 10 quiz score :" + "\n" + "```" + "\n" + mess)
      .catch(console.error);
  } catch (error) {
    console.log(error);
  }
}
module.exports = reportScore;
