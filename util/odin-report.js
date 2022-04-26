const puppeteer = require('puppeteer');
const { startOfWeek, format, toDate } = require('date-fns');
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
  if (!url || !username || !password || !reportPath || !screenUrl) {
    throw new Error('missing odin credentials.');
  }

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
  if (!options.reportName) {
    throw new Error('report name is not provided');
  }
  const reportNameDir = path.join(__dirname, '../assets/odin-reports');
  if (!fs.existsSync(reportNameDir)) {
    fs.mkdirSync(reportNameDir);
  }

  const reportDate = startOfWeek(options.date || new Date());
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

async function handleKomuWeeklyReport(client) {
  const fetchChannel = await client.channels.fetch('937343734100660254');
  try {
    const date = new Date();

    if (isNaN(date.getTime())) {
      throw Error('invalid date provided');
    }

    const report = await getKomuWeeklyReport({
      reportName: 'komu-weekly',
      url: process.env.ODIN_URL,
      username: process.env.ODIN_USERNAME,
      password: process.env.ODIN_PASSWORD,
      screenUrl: process.env.ODIN_KOMU_REPORT_WEEKLY_URL,
      date,
    });

    if (!report || !report.filePath || !fs.existsSync(report.filePath)) {
      throw new Error('requested report is not found');
    }

    const attachment = new MessageAttachment(report.filePath);
    const embed = new MessageEmbed().setTitle('Komu report weekly');
    await fetchChannel.send({ files: [attachment], embed: embed });
  } catch (error) {
    console.error(error);
    fetchChannel.send(`Sorry, ${error.message}`);
  }
}

module.exports = {
  getKomuWeeklyReport,
  handleKomuWeeklyReport,
};
