const reportDaily = require("../../util/reportdaily");

function getTimeWeekMondayToFriday(dayNow) {
  let curr = new Date();
  // current date of week
  let currentWeekDay = curr.getDay();
  let lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
  let firstweek = new Date(new Date(curr).setDate(curr.getDate() - lessDays));
  let arrayDay;
  if (dayNow === 0 || dayNow === 6 || dayNow === 5) {
    arrayDay = [2, 3, 4, 5, 6];
  } else {
    arrayDay = Array.from({ length: dayNow }, (v, i) => i + 2);
  }
  function getDayofWeek(rank) {
    // rank 2 -> 6 (Monday -> Friday)
    return new Date(
      new Date(firstweek).setDate(firstweek.getDate() + rank - 2)
    );
  }
  return arrayDay.map((item) => getDayofWeek(item));
}

module.exports = {
  name: "report",
  description: "show no daily",
  cat: "komu",
  async execute(message, args, client, guildDB) {
    try {
      if (args[0] === "daily") {
        await reportDaily(null, message, args, client, guildDB);
      } else if (args[0] === "weekly") {
        for (day of getTimeWeekMondayToFriday(new Date().getDay())) {
          await reportDaily(day, message, args, client, guildDB);
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
