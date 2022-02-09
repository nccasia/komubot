const elsaDailyData = require('../models/elsaDailyData');

function withoutFirstTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}

function withoutLastTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getyesterdaydate() {
  const today = new Date();
  const yesterday = new Date(withoutLastTime(today));
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

function gettomorrowdate() {
  const today = new Date();
  const yesterday = new Date(withoutFirstTime(today));
  yesterday.setDate(yesterday.getDate() + 1);
  return yesterday;
}

async function elsaReport(message) {
  const report = await elsaDailyData.find({
    attachment: false,
    createdAt: { $gte: getyesterdaydate(), $lte: gettomorrowdate() },
  });

  let mess;
  if (!report) {
    return;
  } else if (Array.isArray(report) && report.length === 0) {
    mess = '```' + 'No violation for the day' + '```';
    return message.channel.send(mess).catch(console.error);
  } else {
    for (let i = 0; i <= Math.ceil(report.length / 50); i += 1) {
      if (report.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess =
        '```' +
        "Those who haven't submitted their homework today" +
        '```' +
        report
          .slice(i * 50, (i + 1) * 50)
          .map((elsa) => `<@${elsa.userid}> `)
          .join('\n');
      return message.channel.send(mess).catch(console.error);
    }
  }
}

module.exports = { elsaReport };
