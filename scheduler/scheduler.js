const cron = require("cron");
const dailyData = require("../models/dailyData");
const userData = require("../models/userData");
const axios = require("axios");
const getUserNotDaily = require("../util/getUserNotDaily");
const {
  sendMessageKomuToUser,
  sendMessageToNhaCuaChung,
} = require("../util/komubotrest");
const birthdayUser = require("../util/birthday");

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
          "Hôm nay bạn daily chưa? Nếu chưa thì *daily nhé.",
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
    const arrayMessUser = result.filter(
      (user) => Date.now() - user.last_message_time >= 1800000
    );

    if (
      (Array.isArray(arrayMessUser) && arrayMessUser.length === 0) ||
      !arrayMessUser
    ) {
      return;
    }
    await Promise.all(
      arrayMessUser.map((user, index) =>
        sendMessageKomuToUser(
          client,
          "Bạn đang online đấy chứ? Hãy trả lời tin nhắn nhé!",
          user.username
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
        sendMessageToNhaCuaChung(client, `${item.wish} <@${item.user.id}> +1 trà sữa nhé anh zai`)
      )
    );
  } catch (error) {
    console.log(error);
  }
}

exports.scheduler = {
  async run(client) {
    new cron.CronJob(
      "00 00 8 * * 1-5",
      async () => await showDaily(client),
      null,
      false,
      "Asia/Ho_Chi_Minh"
    ).start();
    new cron.CronJob(
      "*/30 8-17 * * 1-5",
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
