const cron = require("cron");
const dailyData = require("../models/dailyData");
const userData = require("../models/userData");
const axios = require("axios");
const getUserNotDaily = require("../util/getUserNotDaily");
const { sendMessageKomuToUser, sendMessageToNhaCuaChung } = require("../util/komubotrest");
const birthdayUser = require("../util/birthday");
// const testQuiz = require("../testquiz");

function setTime(date, hours, minute, second, msValue) {
  return date.setHours(hours, minute, second, msValue);
}

function checkTime(time) {
  if (!time) return false;
  let result = false;
  const curDate = new Date();
  const timezone = curDate.getTimezoneOffset() / -60;
  const fFistTime = new Date(setTime(curDate, 6 + timezone, 0, 0, 0)).getTime();
  const lFistTime = new Date(
    setTime(curDate, 6 + timezone, 30, 0, 0)
  ).getTime();

  const lLastTime = new Date(
    setTime(curDate, 10 + timezone, 25, 0, 0)
  ).getTime();

  if (
    (time.getTime() >= fFistTime && time.getTime() < lFistTime) ||
    time.getTime() >= lLastTime
  )
    result = true;

  return result;
}

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
      notDailyMorning.map((email, index) =>
        sendMessageKomuToUser(
          client,
          "Don't forget to daily, dude! Don't be mad at me, we are friends I mean we are best friends.",
          email
        )
      )
    );
  } catch (error) {
    console.log(error);
  }
}

function getUserNameByEmail(string) {
  if (string.includes("@ncc.asia")) {
    return string.slice(0, string.length - 9);
  }
}
async function pingWfh(client) {
  try {
    if (checkTime(new Date())) return;
    let wfhGetApi;
    try {
      wfhGetApi = await axios.get(client.config.wfh.api_url, {
        headers: {
          securitycode: client.config.wfh.api_key_secret,
        },
      });
    } catch (error) {
      console.log(error);
    }

    if (!wfhGetApi || wfhGetApi.data == undefined) {
      return;
    }

    const wfhUserEmail = wfhGetApi.data.result.map((item) =>
      getUserNameByEmail(item.emailAddress)
    );

    if (
      (Array.isArray(wfhUserEmail) && wfhUserEmail.length === 0) ||
      !wfhUserEmail
    ) {
      return;
    }
    const result = await userData.aggregate([
      { $match: { email: { $in: wfhUserEmail } } },
      {
        $project: {
          _id: 0,
          username: 1,
          last_message_id: 1,
          // last_mentioned_message_id: 1,
        },
      },
      {
        $lookup: {
          from: "komu_msgs",
          localField: "last_message_id",
          foreignField: "id",
          as: "last_message",
        },
      },
      // {
      //   $lookup: {
      //     from: "komu_msgs",
      //     localField: "last_mentioned_message_id",
      //     foreignField: "id",
      //     as: "last_mentioned_message",
      //   },
      // },
      {
        $unwind: "$last_message",
      },
      // {
      //   $unwind: "$last_mentioned_message",
      // },
      {
        $project: {
          username: 1,
          last_message_time: "$last_message.createdTimestamp",
          // last_mentioned_time: "$last_mentioned_message.createdTimestamp",
        },
      },
    ]);
    let arrayMessUser = result.filter(
      (user) => Date.now() - user.last_message_time >= 1800000
    );

    if (
      (Array.isArray(arrayMessUser) && arrayMessUser.length === 0) ||
      !arrayMessUser
    ) {
      return;
    }
    arrayMessUser = [...new Set(arrayMessUser.map((user) => user.username))];
    await Promise.all(
      arrayMessUser.map((username, index) =>
        sendMessageKomuToUser(
          client,
          "Are you there? Please say something to me. I'm sad because they are so serious. I'm just an adorable bot, work for the money!!!",
          username
        )
      )
    );
  } catch (error) {
    console.log(error);
  }
}

async function happyBirthday(client) {
  const result = await birthdayUser(client);

  try {
    await Promise.all(
      await result.map((item, index) =>
        sendMessageToNhaCuaChung(client, `${item.wish} <@${item.user.id}> +1 trà sữa full topping nhé b iu`)
      )
    );
  } catch (error) {
    console.log(error);
  }
}

exports.scheduler = {
  async run(client) {
    new cron.CronJob(
      "00 00 9 * * 1-5",
      async () => await showDaily(client),
      null,
      false,
      "Asia/Ho_Chi_Minh"
    ).start();
    new cron.CronJob(
      "*/5 9-11,13-17 * * 1-5",
      async () => await pingWfh(client),

      null,
      false,
      "Asia/Ho_Chi_Minh"
    ).start();
    new cron.CronJob(
      "00 09 * * 0-6",
      async () => await happyBirthday(client),
      null,
      false,
      "Asia/Ho_Chi_Minh"
    ).start();
  },
};
