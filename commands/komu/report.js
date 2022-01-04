const axios = require("axios");
const dailyData = require("../../models/dailyData");
const userData = require("../../models/userData");

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
module.exports = {
  name: "report",
  description: "show no daily",
  cat: "komu",
  async execute(message, args, client, guildDB) {
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
        createdAt: { $lte: getDateDay()[1], $gte: getDateDay()[0] },
      });

      const dailyUserId = daily.map((item) => item.email);

      let notDaily = [];

      for (let wfhData of wfhUserName) {
        if (!dailyUserId.includes(wfhData) && wfhData !== undefined) {
          notDaily.push(wfhData);
        }
      }

      const userNotDaily = await Promise.all(
        notDaily.map((email) => userData.findOne({ email }))
      );

      const mess =
        "```" +
        "những người chưa daily hôm nay" +
        "```" +
        userNotDaily.map((user, index) => `<@${user.id}>`).join("\n");

      return message.channel.send(mess).catch(console.error);
    } catch (error) {
      console.log(error);
    }
  },
};
