const axios = require('axios');
const userData = require('../models/userData');

const updateRoleProject = async (client) => {
  const userDb = await userData.find({ deactive: { $ne: true } });
  const emailArray = userDb.map((user) => user.email);

  for (const email of emailArray) {
    const url = encodeURI(`${client.config.wiki.api_url}${email}@ncc.asia`);
    let response;
    try {
      response = await axios.get(url, {
        headers: {
          'X-Secret-Key': client.config.wiki.api_key_secret,
        },
      });
    } catch (error) {
      continue;
    }
    if (!response || !response.data.result) {
      await userData.updateOne(
        { email, deactive: { $ne: true } },
        { roles: [] }
      );
      continue;
    }

    let roles;
    if (
      Array.isArray(response.data.result.projectDtos) &&
      response.data.result.projectDtos.length !== 0
    ) {
      roles = response.data.result.projectDtos.map(
        (project) => project.projectRole
      );
    } else {
      roles = [];
    }
    const rolesRemoveDuplicate = [...new Set(roles)];
    await userData.updateOne(
      { email, deactive: { $ne: true } },
      { roles: rolesRemoveDuplicate }
    );
  }
};
const updateRoleDiscord = async (client) => {
  const user = await userData
    .find({ deactive: { $ne: true } })
    .select('id -_id');
  const userids = user.map((item) => item.id);

  let guild = await client.guilds.fetch('921239248991055882');

  for (let userid of userids) {
    let member;
    try {
      member = await guild.members.fetch(userid);
    } catch (error) {
      continue;
    }
    const roles = member.roles.cache
      .filter((roles) => roles.id !== guild.id)
      .map((role) => role.name);
    await userData.updateOne({ id: userid }, { roles_discord: roles });
  }
};

module.exports = {
  updateRoleProject,
  updateRoleDiscord,
};
