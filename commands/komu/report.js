const axios = require("axios");
const dailyData = require("../../models/dailyData");
const userData = require("../../models/userData");

function getDateDay() {
  const date = new Date();
  return {
    morning: {
      fisttime: new Date(setTime(date, 7, 0, 0, 0)).getTime(),
      lastime: new Date(setTime(date, 10, 0, 0, 0)).getTime(),
    },
    afternoon: {
      fisttime: new Date(setTime(date, 12, 0, 0, 0)).getTime(),
      lastime: new Date(setTime(date, 15, 0, 0, 0)).getTime(),
    },
  };
}

function setTime(date, hours, minute, second, msValue) {
  return date.setHours(hours, minute, second, msValue);
}

function getUserNameByEmail(string) {
  if (string.includes("@ncc.asia")) {
    return string.slice(0, string.length - 9);
  }
}
function findCountNotDaily(arr, email) {
  return arr.filter((item) => item.email === email)[0].countnotdaily;
}
module.exports = {
  name: "report",
  description: "show no daily",
  cat: "komu",
  async execute(message, args, client, guildDB) {
    try {
      if (args[0] === "daily") {
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

        //if no wfh
        if (
          (Array.isArray(wfhUserEmail) && wfhUserEmail.length === 0) ||
          !wfhUserEmail
        ) {
          return;
        }

        const dailyMorning = await dailyData.find({
          createdAt: {
            $lte: getDateDay().morning.lastime,
            $gte: getDateDay().morning.fisttime,
          },
        });

        const dailyAfternoon = await dailyData.find({
          createdAt: {
            $lte: getDateDay().afternoon.lastime,
            $gte: getDateDay().afternoon.fisttime,
          },
        });

        const dailyEmailMorning = dailyMorning.map((item) => item.email);
        const dailyEmailAfternoon = dailyAfternoon.map((item) => item.email);

        let notDailyMorning = [];
        for (let wfhData of wfhUserEmail) {
          if (!dailyEmailMorning.includes(wfhData) && wfhData !== undefined) {
            notDailyMorning.push(wfhData);
          }
        }

        let notDailyAfternoon = [];
        for (let wfhData of wfhUserEmail) {
          if (!dailyEmailAfternoon.includes(wfhData) && wfhData !== undefined) {
            notDailyAfternoon.push(wfhData);
          }
        }

        // => notDaily : {email : "", countnotdaily : }
        const notDaily = notDailyMorning.reduce((acc, cur) => {
          if (notDailyAfternoon.some((username) => username === cur)) {
            acc.push({ email: cur, countnotdaily: 2 });
          } else {
            acc.push({ email: cur, countnotdaily: 1 });
          }
          return acc;
        }, []);

        let userNotDaily;
        try {
          userNotDaily = await Promise.all(
            notDaily.map((user) => userData.findOne({ username: user.email }))
          );
        } catch (error) {
          console.log(error);
        }

        for (let i = 0; i < userNotDaily.length; i++) {
          if (userNotDaily[i] === null) {
            userNotDaily[i] = notDaily[i];
          }
        }
        let mess;
        if (!userNotDaily) {
          return;
        } else if (Array.isArray(userNotDaily) && userNotDaily.length === 0) {
          mess = "```" + "Tất cả đều đã daily" + "```";
          return message.channel.send(mess).catch(console.error);
        } else {
          for (let i = 0; i <= Math.ceil(userNotDaily.length / 50); i += 1) {
            if (userNotDaily.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess =
              "```" +
              "những người chưa daily hôm nay" +
              "```" +
              userNotDaily
                .slice(i * 50, (i + 1) * 50)
                .map((user, index) => {
                  if (user.id) {
                    return `<@${user.id}> (${findCountNotDaily(
                      notDaily,
                      user.username
                    )})`;
                  } else {
                    return `${user.email} (${user.countnotdaily})`;
                  }
                })
                .join("\n");
            await message.channel.send(mess).catch(console.error);
          }
        }
      } else {
        return message.channel
          .send("```" + "*report daily" + "```")
          .catch(console.error);
      }
    } catch (error) {
      console.log(error);
    }
  },
};
