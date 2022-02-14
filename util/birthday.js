const axios = require('axios');
const userData = require('../models/userData');
const birthdayData = require('../models/birthdayData');

async function getBirthdayUser(email, client) {
  try {
    const { data } = await axios
      .get(`${client.config.wiki.api_url}${email}@ncc.asia`, {
        headers: {
          'X-Secret-Key': client.config.wiki.api_key_secret,
        },
      })
      .catch((err) => {
        console.log('Error ', err);
        return { data: 'There was an error!' };
      });
    if (!data || !data.result) return;
    const dobUser = {
      birthday: data.result.dob,
      name: data.result.employeeName,
      email: data.result.emailAddress.slice(0, -9),
    };
    const today = new Date();
    const currentDate = today.toISOString().substring(5, 10);
    if (dobUser.birthday !== null) {
      if (dobUser.birthday.substring(5, 10) === currentDate) {
        return dobUser.email;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function birthdayUser(client) {
  const result = [];
  const getAllUser = await userData.find();
  const emailArray = getAllUser.map((item) => item.email);
  const resultBirthday = await birthdayData.find();
  const items = resultBirthday.map((item) => item.title);
  for (const email of emailArray) {
    const emailBirthday = await getBirthdayUser(email, client);

    const birthdayWishes = items[Math.floor(Math.random() * items.length)];
    if (!emailBirthday) continue;
    const birthday = await userData.findOne({
      email: emailBirthday,
    });
    result.push({ user: birthday, wish: birthdayWishes });
  }
  return result;
}

module.exports = birthdayUser;
