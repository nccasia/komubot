const cron = require("cron");
const dailyData = require("../models/dailyData");
const userData = require("../models/userData");
const axios = require("axios");
const getUserNotDaily = require("../util/getUserNotDaily");
const { sendMessageKomuToUser } = require("../util/komubotrest");

async function showDaily(client) {
  console.log("[Scheduler] Run");
  try {
    const { _, __, notDailyMorning } = await getUserNotDaily(
      null,
      null,
      null,
      client
    );
    // send message komu to user

    await Promise.all(
      ["anh.leduc1"].map((email, index) =>
        sendMessageKomuToUser(
          client,
          "Hôm nay bạn daily chưa? Nếu chưa thì *daily nhé.",
          email
        )
      )
    );
  } catch (error) {
    console.log(error);
  }
}
exports.scheduler = {
  async run(client) {
    return new cron.CronJob(
      "00 18 15 * * 1-5",
      async () => await showDaily(client),
      null,
      false,
      "Asia/Ho_Chi_Minh"
    ).start();
  },
};
