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
  const getAllUser = await userData.find({ deactive: { $ne: true } });
  const emailArray = getAllUser.map((item) => item.email);
  const resultBirthday = await birthdayData.find();
  const items = resultBirthday.map((item) => item.title);
  let wishes = items;
  for (const email of emailArray) {
    const emailBirthday = await getBirthdayUser(encodeURI(email), client);
    if (!emailBirthday) continue;
    if (!wishes.length) wishes = items;
    const index = Math.floor(Math.random() * items.length);
    const birthdayWish = wishes[index];
    wishes.splice(index, 1);
    const birthday = await userData.findOne({
      email: emailBirthday,
      deactive: { $ne: true },
    });
    result.push({ user: birthday, wish: birthdayWish });
  }
  return result;
}

module.exports = birthdayUser;
