const config = require('../../config.js');
const { scheduler } = require('../../scheduler/scheduler');
module.exports = {
  async execute(client) {
    console.log('[KOMU] Ready');
    (async () => {
      try {
        console.log('Successfully registered application commands globally');
      } catch (error) {
        if (error) console.error(error);
      }
    })();

    const DBL = require('dblapi.js');
    client.dbl = new DBL(config.topgg.token, client);
    const activities = [
      { name: 'KOMU • *help', type: 'WATCHING' },
      { name: 'KOMU • *help', type: 'WATCHING' },
    ];
    client.user.setActivity(activities[0].name, { type: 'WATCHING' });
    let activity = 1;
    setInterval(async () => {
      activities[2] = { name: 'KOMU', type: 'WATCHING' };
      activities[3] = { name: 'KOMU', type: 'WATCHING' };
      if (activity > 3) activity = 0;
      client.user.setActivity(activities[activity].name, { type: 'WATCHING' });
      activity++;
    }, 30000);

    // run schedule
    try {
      scheduler.run(client);
    } catch (error) {
      console.log(error);
    }
  },
};
