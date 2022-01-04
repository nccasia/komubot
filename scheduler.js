const cron = require("cron");
const dailyData = require("./models/dailyData");
const userData = require("./models/userData");
const axios = require("axios");
function getDateDay() {
  const date = new Date();
  const datenow = date.toUTCString();
  const tomorrowDate = new Date(date.setDate(date.getDate() + 1)).toUTCString();
  return [
    new Date(withoutTime(datenow)).getTime(),
    new Date(withoutTime(tomorrowDate)).getTime(),
  ];
}
function withoutTime(dateTime) {
  var date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getUserNameByEmail(string) {
  if (string.includes("@ncc.asia")) {
    return string.slice(0, string.length - 9);
  }
}
async function sendMessageKomuUser(client, msg, userInput) {
  try {
    if (!msg) return;
    const user = await client.users.fetch(userInput.id).catch(console.error);
    if (!user) {
      const message = `<@${client.config.komubotrest.admin_user_id}> ơi, đồng chí ${userInput.username} không đúng format rồi!!!`;
      await client.channels.cache
        .get(client.config.komubotrest.machleo_channel_id)
        .send(message)
        .catch(console.error);
      return null;
    }
    await user.send(msg);
    return user;
  } catch (error) {
    console.log("error", error);
    const message = `<@${client.config.komubotrest.admin_user_id}> ơi, KOMU không thể gửi tin nhắn cho ${userInput.username}!!!`;
    await client.channels.cache
      .get(client.config.komubotrest.machleo_channel_id)
      .send(message)
      .catch(console.error);
    return null;
  }
}

async function showDaily(client) {
  console.log("[Scheduler] Run");
  try {
    const wfhGetApi = await axios
      .get(
        `http://timesheetapi.nccsoft.vn/api/services/app/HRM/GetUserWorkFromHome`,
        {
          headers: {
            securitycode: "Xnsks4@llslhl%hjsksCCHHA145",
          },
        }
      )
      .catch((err) => {
        console.log("Error ", err);
      });
    if (!wfhGetApi.data) {
      return;
    }
    const wfhUserName = wfhGetApi.data.result.map((item) =>
      getUserNameByEmail(item.emailAddress)
    );

    //if no wfh
    if (
      (Array.isArray(wfhUserName) && wfhUserName.length === 0) ||
      !wfhUserName
    ) {
      return null;
    }

    const daily = await dailyData.find({
      createdAt: { $lte: getDateDay[1], $gte: getDateDay[0] },
    });

    const dailyUserId = daily.map((item) => item.email);

    let notDaily = [];

    for (let wfhData of wfhUserName) {
      if (!dailyUserId.includes(wfhData)) {
        notDaily.push(wfhData);
      }
    }

    const userNotDaily = await Promise.all(
      notDaily.map((email) => userData.findOne({ email }))
    );

    // send message komu to user
    await Promise.all(
      userNotDaily.map((user, index) =>
        sendMessageKomuUser(client, "bạn chưa daily ngày hôm nay", user)
      )
    );
  } catch (error) {
    console.log(error);
  }
}
exports.scheduler = {
  async run(client) {
    return new cron.CronJob(
      "00 00 8 * * 1-5",
      async () => await showDaily(client),
      null,
      false,
      "Asia/Ho_Chi_Minh"
    ).start();
  },
};
