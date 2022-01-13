const axios = require("axios");
const dailyData = require("../models/dailyData");
const userData = require("../models/userData");
function getDateDay(time) {
  let date;
  if (!time) {
    date = new Date();
  } else {
    date = new Date(time);
  }
  return {
    morning: {
      fisttime: new Date(setTime(date, 7, 0, 0, 0)).getTime(),
      lastime: new Date(setTime(date, 9, 31, 0, 0)).getTime(),
    },
    afternoon: {
      fisttime: new Date(setTime(date, 12, 0, 0, 0)).getTime(),
      lastime: new Date(setTime(date, 14, 1, 0, 0)).getTime(),
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
async function getUserNotDaily(date, message, args, client, guildDB) {
  try {
    let wfhGetApi;
    try {
      let url = date
        ? `${client.config.wfh.api_url}?date=${date.toDateString()}`
        : client.config.wfh.api_url;
      wfhGetApi = await axios.get(url, {
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
        $lte: getDateDay(date).morning.lastime,
        $gte: getDateDay(date).morning.fisttime,
      },
    });

    const dailyAfternoon = await dailyData.find({
      createdAt: {
        $lte: getDateDay(date).afternoon.lastime,
        $gte: getDateDay(date).afternoon.fisttime,
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
    let spreadNotDaily = [...notDailyMorning, ...notDailyAfternoon];
    // => notDaily : {email : "", countnotdaily : }
    const notDaily = spreadNotDaily.reduce((acc, cur) => {
      if (Array.isArray(acc) && acc.length === 0) {
        acc.push({ email: cur, countnotdaily: 1 });
      } else {
        let indexExist = acc.findIndex((item) => item.email === cur);
        if (indexExist !== -1) {
          acc[indexExist] = {
            email: acc[indexExist].email,
            countnotdaily: acc[indexExist].countnotdaily + 1,
          };
        } else {
          acc.push({ email: cur, countnotdaily: 1 });
        }
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
    return { notDaily, userNotDaily, notDailyMorning };
  } catch (error) {
    console.log(error);
  }
}

module.exports = getUserNotDaily;
