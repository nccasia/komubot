const axios = require("axios");
const userData = require("../models/userData");

async function getBirthdayUser(email, client) {
  try {
    const { data } = await axios
      .get(
        `${client.config.birthday.api_url_getUser}?email=${email}@ncc.asia`,
        {
          headers: {
            "X-Secret-Key": client.config.birthday.api_key_secret,
          },
        }
      )
      .catch((err) => {
        console.log("Error ", err);
        return { data: "There was an error!" };
      });
    if (!data || !data.result) return;
    const dobUser = {
      birthday: data.result.dob,
      // birthday: "01-20",
      name: data.result.employeeName,
      email: data.result.emailAddress.slice(0, -9),
    };
    const today = new Date();
    const currentDate = today.toISOString().substring(5, 10);
    if (dobUser.birthday !== null) {
      if (dobUser.birthday.slice(5, 10) === currentDate) {
        return dobUser.email;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function birthdayUser(client) {
  let result = [];
  const getAllUser = await userData.find();
  let emailArray = getAllUser.map((item) => item.email);
  // for (let email of ["tai.cumanhtuan", "thanh.levan"]) {
  for (let email of emailArray) {
    let emailBirthday = await getBirthdayUser(email, client);

    if (!emailBirthday) continue;
    const birthday = await userData.findOne({
      email: emailBirthday,
    });
    result.push(birthday);
  }
  return result;
}

module.exports = birthdayUser;
