const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { sendMessageKomuToUser } = require("./komubotrest");
const {
  randomQuiz,
  embedQuestion,
  addScores,
  saveQuestionCorrect,
  saveQuestionInCorrect,
} = require("./quiz");
const newEmbed = (message, color) =>
  new MessageEmbed().setTitle(message).setColor(color);

async function sendQuizToSingleUser(client, userInput) {
  try {
    //random userid
    if (!userInput) return;
    const userid = userInput.id;
    const username = userInput.username;

    const q = await randomQuiz(userInput, client, "scheduler");
    if (!q) return;
    console.log("run");
    const Embed = embedQuestion(q);

    const row = new MessageActionRow();
    for (let i = 0; i < q.options.length; i++) {
      row.addComponents(
        new MessageButton()
          .setCustomId(`question_${userid}_key${i + 1}`)
          .setLabel((i + 1).toString())
          .setStyle("PRIMARY")
      );
    }

    const user = await sendMessageKomuToUser(
      client,
      { embeds: [Embed], components: [row] },
      username
    );
    // user.dmChannel
    // id
    const filterAwaitMessage = (interaction) =>
      interaction.customId === `question_${userid}_key${i}`;
    let interaction;
    try {
      interaction = await user.dmChannel.awaitMessageComponent({
        filterAwaitMessage,
        max: 1,
        time: 86400000,
        errors: ["time"],
      });
    } catch (error) {
      const EmbedDidNotAnswer = newEmbed("You did not answer!", "YELLOW");
      return user.send({ embeds: [EmbedDidNotAnswer] });
    }
    if (interaction) {
      const key = interaction.customId.slice(
        interaction.customId.length - 1,
        interaction.customId.length
      );
      if (key == q.correct) {
        const newUser = await addScores(userid);
        if (!newUser) return;
        await saveQuestionCorrect(userid, q._id, key);

        const EmbedCorrect = newEmbed(
          `Correct!!!, you have ${newUser.scores_quiz} points`,
          "GREEN"
        );

        return interaction.reply({ embeds: [EmbedCorrect] });
      } else {
        await saveQuestionInCorrect(userid, q._id, key);
        const EmbedInCorrect = newEmbed(`Incorrect!!!`, "RED");
        return interaction.reply({ embeds: [EmbedInCorrect] });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendQuizToSingleUser;
