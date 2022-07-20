const axios = require('axios');
function getStatusDay() {
  let statusDay;
  let date = new Date();
  const timezone = date.getTimezoneOffset() / -60;
  const hour = date.getHours();
  if (hour < 5 + timezone) {
    statusDay = 'Morning';
  } else if (hour < 11 + timezone) {
    statusDay = 'Afternoon';
  }
  return statusDay;
}

async function getUserOffWork(date) {
  try {
    let userOffFullday = [];
    let userOffMorning = [];
    let userOffAffternoon = [];

    const url = date
      ? `http://timesheetapi.nccsoft.vn/api/services/app/Public/GetAllUserLeaveDay?date=${date.toDateString()}`
      : 'http://timesheetapi.nccsoft.vn/api/services/app/Public/GetAllUserLeaveDay';
    const response = await axios.get(url);
    if (response.data && response.data.result) {
      userOffFullday = response.data.result
        .filter((user) => user.message.includes('Off Fullday'))
        .map((item) => item.emailAddress.replace('@ncc.asia', ''));
      userOffMorning = response.data.result
        .filter((user) => user.message.includes('Off Morning'))
        .map((item) => item.emailAddress.replace('@ncc.asia', ''));
      userOffAffternoon = response.data.result
        .filter((user) => user.message.includes('Off Afternoon'))
        .map((item) => item.emailAddress.replace('@ncc.asia', ''));
    }

    let notSendUser =
      getStatusDay() === 'Morning'
        ? [...userOffFullday, ...userOffMorning]
        : [...userOffFullday, ...userOffAffternoon];

    return { notSendUser, userOffFullday, userOffMorning, userOffAffternoon };
  } catch (error) {
    console.log(error);
  }
}
module.exports = getUserOffWork;
