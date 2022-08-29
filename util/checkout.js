const axios = require('axios');
const { intervalToDuration } = require('date-fns');
const { MessageEmbed } = require('discord.js');
const getUserOffWork = require('./getUserOffWork');

function withoutLastTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getyesterdaydate() {
  const today = new Date();
  const yesterday = new Date(withoutLastTime(today));
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    yesterday.getFullYear() +
    '-' +
    (yesterday.getMonth() + 1) +
    '-' +
    yesterday.getDate()
  );
}

function getUserNameByEmail(string) {
  if (string.includes('@ncc.asia')) {
    return string.slice(0, string.length - 9);
  }
}

const dateCalculate = async (lists, date) => {
  const result = [];
  const dateCheck = new Date(date);
  const { userOffFullday } = date
    ? await getUserOffWork(dateCheck)
    : await getUserOffWork();

  lists.map((list) => {
    list.listDate.map((item) => {
      const timeWork = item.timeSheetMinute - item.checkOutInMinute;
      const email = getUserNameByEmail(list.emailAddress);
      if (timeWork > 30 && !userOffFullday.includes(email)) {
        result.push({
          email: email,
          time: timeWork,
        });
      }
    });
  });

  return result;
};

const messHelp =
  '```' +
  '*report ts' +
  '\n' +
  '*report ts dd/mm/yyyy' +
  '\n' +
  '*report ts weekly' +
  '```';

async function reportCheckout(message, args, client) {
  if (!args[1]) {
    try {
      const lists = await axios
        .get(
          `${
            client.config.checkinTimesheet.api_url
          }?startDate=${getyesterdaydate()}&endDate=${getyesterdaydate()}`
        )
        .then((result) => result.data.result);
      const checkTimesheet = await dateCalculate(lists, getyesterdaydate());

      let mess;
      if (!checkTimesheet) {
        return;
      } else if (Array.isArray(checkTimesheet) && checkTimesheet.length === 0) {
        mess = '```' + 'Không có ai vi phạm' + '```';
        return message.reply(mess).catch(console.error);
      } else {
        for (let i = 0; i <= Math.ceil(checkTimesheet.length / 50); i += 1) {
          if (checkTimesheet.slice(i * 50, (i + 1) * 50).length === 0) break;
          mess = checkTimesheet
            .slice(i * 50, (i + 1) * 50)
            .map(
              (list) =>
                `<${list.email}> chênh lệch ${showTrackerTime(list.time)}`
            )
            .join('\n');
          const Embed = new MessageEmbed()
            .setTitle('Danh sách vi phạm')
            .setColor('RED')
            .setDescription(`${mess}`);
          await message.reply({ embeds: [Embed] }).catch(console.error);
        }
      }
    } catch (err) {
      console.log(err);
    }
  } else if (args[1] === 'help') {
    await message
      .reply({
        content: messHelp,
        ephemeral: true,
      })
      .catch(console.error);
  } else if (args[1] === 'weekly') {
    const dateMondayToSFriday = [];
    const current = new Date();
    const first = current.getDate() - current.getDay();
    for (let i = 1; i < 6; i++) {
      const next = new Date(current.getTime());
      next.setDate(first + i);
      const date = new Date(next).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      dateMondayToSFriday.push(date);
    }
    try {
      for (const itemDay of dateMondayToSFriday) {
        let startDate = itemDay.split('/');
        const formatDate =
          startDate[1] + '-' + startDate[0] + '-' + startDate[2];
        startDate = startDate[2] + '-' + startDate[0] + '-' + startDate[1];
        const lists = await axios
          .get(
            `${client.config.checkinTimesheet.api_url}?startDate=${startDate}&endDate=${startDate}`
          )
          .then((result) => result.data.result);
        const checkTimesheet = await dateCalculate(lists, startDate);

        let mess;
        if (!checkTimesheet) {
          return;
        } else if (
          Array.isArray(checkTimesheet) &&
          checkTimesheet.length === 0
        ) {
          mess = '```' + 'Không có ai vi phạm' + '```';
          return message.reply(mess).catch(console.error);
        } else {
          for (let i = 0; i <= Math.ceil(checkTimesheet.length / 50); i += 1) {
            if (checkTimesheet.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess = checkTimesheet
              .slice(i * 50, (i + 1) * 50)
              .map(
                (list) =>
                  `<${list.email}> chênh lệch ${showTrackerTime(list.time)}`
              )
              .join('\n');
            const Embed = new MessageEmbed()
              .setTitle(`Danh sách vi phạm ngày ${formatDate}`)
              .setColor('RED')
              .setDescription(`${mess}`);
            await message.reply({ embeds: [Embed] }).catch(console.error);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  } else if (args[1]) {
    let startDate = args[1].split('/');
    startDate = startDate[2] + '-' + startDate[1] + '-' + startDate[0];
    try {
      const lists = await axios
        .get(
          `${client.config.checkinTimesheet.api_url}?startDate=${startDate}&endDate=${startDate}`
        )
        .then((result) => result.data.result);
      const checkTimesheet = await dateCalculate(lists, startDate);

      let mess;
      if (!checkTimesheet) {
        return;
      } else if (Array.isArray(checkTimesheet) && checkTimesheet.length === 0) {
        mess = '```' + 'Không có ai vi phạm' + '```';
        return message.reply(mess).catch(console.error);
      } else {
        for (let i = 0; i <= Math.ceil(checkTimesheet.length / 50); i += 1) {
          if (checkTimesheet.slice(i * 50, (i + 1) * 50).length === 0) break;
          mess = checkTimesheet
            .slice(i * 50, (i + 1) * 50)
            .map(
              (list) =>
                `<${list.email}> chênh lệch ${showTrackerTime(list.time)}`
            )
            .join('\n');
          const Embed = new MessageEmbed()
            .setTitle(`Danh sách vi phạm ngày ${args[1]}`)
            .setColor('RED')
            .setDescription(`${mess}`);
          await message.reply({ embeds: [Embed] }).catch(console.error);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}

function showTrackerTime(spentTime) {
  const duration = intervalToDuration({ start: 0, end: spentTime * 1000 * 60 });
  return `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
}

module.exports = reportCheckout;
