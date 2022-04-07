const puppeteer = require('puppeteer');
const { startOfWeek, format } = require('date-fns');
const path = require('path');
const fs = require('fs');

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
  // TODO: implement report handle
  message.reply('To be implemented.');
}

module.exports = {
  getKomuWeeklyReport,
  handleKomuWeeklyReport,
};
