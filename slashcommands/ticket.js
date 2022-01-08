const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketdev")
    .setDescription("manage ticket")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("query is add|remove|list")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("assignee")
        .setDescription("assignee email (example: a.nguyenvan)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("task")
        .setDescription("task title (example: Add Login UI)")
        .setRequired(true)
    ),
  async execute(message, client) {
    const topic = message.options.get("query").value;
    const topicAssignee = message.options.get("assignee").value;
    const topicTask = message.options.get("task").value;

    try {
      if (topic === "add") {
        const data = await axios
          .post(
            `${client.config.ticket.api_url_create}`,

            {
              recipientemail: `${topicAssignee}@ncc.asia`,
              creatoremail: `${message.user.username}@ncc.asia`,
              jobname: topicTask,
            },

            {
              headers: {
                "X-Secret-Key": client.config.ticket.api_key_secret,
                "Content-Type": "application/json",
              },
            }
          )
          .catch((err) => {
            console.log("Error ", err);
            return { data: "There was an error!" };
          });
      } else {
        return message.chanel
          .send("```" + "*No query ticket" + "```")
          .catch(console.error);
      }
    } catch (error) {
      console.log(error);
    }
  },
};
