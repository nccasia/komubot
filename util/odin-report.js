const puppeteer = require('puppeteer');
const { startOfWeek, format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const { MessageEmbed, MessageAttachment } = require('discord.js');

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function downloadKomuWeeklyReport({
  url,
  username,
  password,
  reportPath,
  screenUrl,
}) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 768, height: 1366 });
    await page.goto(url);
    await page.type('#username', username);
    await page.type('#password', password);
    await page.click('input[type="submit"]');
    await delay(1000);

    await page.goto(screenUrl);
    await delay(10000);

    await page.click('#save-dash-split-button');
    await delay(1000);
    await page.click('.ant-dropdown ul li:last-child');
    await delay(10000);

    await page.screenshot({ path: reportPath, fullPage: true });
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}

async function getKomuWeeklyReport(options) {
  const reportNameDir = path.join(__dirname, '../assets/odin-reports');
  if (!fs.existsSync(reportNameDir)) {
    fs.mkdirSync(reportNameDir);
  }

  const reportDate = startOfWeek(new Date());
  const reportDateStr = format(reportDate, 'yyyy-mm-dd');
  const reportFileName = `${options.reportName}-${reportDateStr}.png`;
  const reportPath = path.join(reportNameDir, reportFileName);

  if (fs.existsSync(reportPath)) {
    return { filePath: reportPath };
  }

  await downloadKomuWeeklyReport({
    ...options,
    reportPath,
  });

  return { filePath: reportPath };
}

async function handleKomuWeeklyReport(message, args, client, guildDB) {
  if (!args[1]) {
    const dateObject = startOfWeek(new Date());
    const reportDateStr = format(dateObject, 'yyyy-mm-dd');

    const attachment = new MessageAttachment(
      `../komubot/assets/odin-reports/komu-weekly-${reportDateStr}.png`
    );
    const embed = new MessageEmbed().setTitle('odin-reports weekly');
    await message.channel.send({ files: [attachment], embed: embed });
  } else {
    if (
      !/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/.test(
        args[1]
      )
    ) {
      return message.channel
        .send('```' + '*report help' + '```')
        .catch(console.error);
    }
    const day = args[1].slice(0, 2);
    const month = args[1].slice(3, 5);
    const year = args[1].slice(6);
    const fomat = `${month}/${day}/${year}`;
    const dateTime = new Date(fomat);
    const dateTimeObject = startOfWeek(dateTime);
    const reportDateTimeStr = format(dateTimeObject, 'yyyy-mm-dd');

    const attachment = new MessageAttachment(
      `../komubot/assets/odin-reports/komu-weekly-${reportDateTimeStr}.png`
    );
    const embed = new MessageEmbed().setTitle('odin-reports weekly');
    await message.channel.send({ files: [attachment], embed: embed });
  }
}

module.exports = {
  getKomuWeeklyReport,
  handleKomuWeeklyReport,
};
