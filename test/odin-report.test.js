const { getKomuWeeklyReport } = require('../util/odin-report');

// please contact minh.lucvan to get further detail on implementation

async function test() {
  const result = await getKomuWeeklyReport({
    reportName: 'komu-weekly',
    url: 'http://172.16.100.157:8088/',
    username: 'SECRET',
    password: 'SECRET',
    screenUrl: 'http://172.16.100.157:8088/r/15',
  });
  console.log(result);
}

test();
