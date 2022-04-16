const trackerSpentTimeData = require('../models/trackerSpentTimeData');
const userData = require('../models/userData');
const { MessageEmbed } = require('discord.js');
const { AWClient } = require('aw-client');

const HOURS_IN_SECONDS = 60 * 60;

const messTrackerHelp =
  '```' +
  '*report tracker daily' +
  '\n' +
  '*report tracker daily a.nguyenvan' +
  '\n' +
  '*report tracker weekly' +
  '\n' +
  '*report tracker weekly a.nguyenvan' +
  '\n' +
  '*report tracker time' +
  '\n' +
  '*report tracker time a.nguyenvan' +
  '\n' +
  '*report tracker dd/MM/YYYY' +
  '\n' +
  '*report tracker dd/MM/YYYY a.nguyenvan' +
  '```';

const messHelpDaily = '```' + 'Không có bản ghi nào trong ngày hôm qua' + '```';
const messHelpWeekly = '```' + 'Không có bản ghi nào trong tuần qua' + '```';
const messHelpDate = '```' + 'Không có bản ghi nào trong ngày này' + '```';
const messHelpTime = '```' + 'Không có bản ghi nào' + '```';

async function reportTracker(message, args, client) {
  if (!args[0] || !args[1])
    return message.reply({ content: messTrackerHelp, ephemeral: true });
  let hours = Math.floor(3600 * 7);
  if (args[1] === 'daily') {
    let setDateToday = new Date();
    setDateToday.setDate(setDateToday.getDate() - 1);
    const date = new Date(setDateToday).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    if (args[2]) {
      const tracker = await trackerSpentTimeData.aggregate([
        {
          $match: {
            email: args[2],
            date: date,
          },
        },
        {
          $group: {
            _id: '$email',
            spent_time: { $last: '$spent_time' },
          },
        },
        {
          $project: {
            _id: 0,
            email: '$_id',
            spent_time: 1,
            call_time: 1,
          },
        },
      ]);
      if (tracker.length === 0)
        return message.reply({ content: messHelpDaily, ephemeral: true });

      let userTracker = [];
      await Promise.all(
        tracker.map(async (item) => {
          const findUser = await userData
            .find({
              email: item.email,
              deactive: { $ne: true },
            })
            .select('id email -_id');

          findUser.map((user) => {
            if (user.email === item.email)
              userTracker.push({
                id: user.id,
                email: user.email,
                spent_time: item.spent_time / HOURS_IN_SECONDS,
                call_time: (item.call_time ?? 0) / HOURS_IN_SECONDS,
              });
          });
        })
      );

      userTracker.sort(
        (a, b) => parseFloat(a.spent_time) - parseFloat(b.spent_time)
      );

      let mess;
      if (!userTracker) {
        return;
      } else if (Array.isArray(userTracker) && userTracker.length === 0) {
        mess = '```' + 'Không có bản ghi nào cho ngày hôm qua' + '```';
        return message.reply(mess).catch(console.error);
      } else {
        for (let i = 0; i <= Math.ceil(userTracker.length / 50); i += 1) {
          if (userTracker.slice(i * 50, (i + 1) * 50).length === 0) break;
          mess = userTracker
            .slice(i * 50, (i + 1) * 50)
            .map(
              (check) =>
                `${check.email} ${check.spent_time.toFixed(
                  2
                )} giờ, call time: ${check.call_time.toFixed(2)} giờ`
            )
            .join('\n');
          const Embed = new MessageEmbed()
            .setTitle('Thời gian sử dụng tracker của bạn trong ngày hôm qua')
            .setColor('RED')
            .setDescription(`${mess}`);
          await message.reply({ embeds: [Embed] }).catch(console.error);
        }
      }
    } else {
      const tracker = await trackerSpentTimeData.aggregate([
        {
          $match: {
            spent_time: { $lt: hours },
            date: date,
            wfh: true,
          },
        },
        {
          $group: {
            _id: '$email',
            spent_time: { $last: '$spent_time' },
          },
        },
        {
          $project: {
            _id: 0,
            email: '$_id',
            spent_time: 1,
            call_time: 1,
          },
        },
      ]);

      let userTracker = [];
      await Promise.all(
        tracker.map(async (item) => {
          const findUser = await userData
            .find({
              email: item.email,
              deactive: { $ne: true },
            })
            .select('id email -_id');

          findUser.map((user) => {
            if (user.email === item.email)
              userTracker.push({
                id: user.id,
                email: user.email,
                spent_time: item.spent_time / HOURS_IN_SECONDS,
                call_time: (item.call_time ?? 0) / HOURS_IN_SECONDS,
              });
          });
        })
      );

      userTracker.sort(
        (a, b) => parseFloat(a.spent_time) - parseFloat(b.spent_time)
      );

      let mess;
      if (!userTracker) {
        return;
      } else if (Array.isArray(userTracker) && userTracker.length === 0) {
        mess = '```' + 'Không có ai vi phạm trong ngày' + '```';
        return message.reply(mess).catch(console.error);
      } else {
        for (let i = 0; i <= Math.ceil(userTracker.length / 50); i += 1) {
          if (userTracker.slice(i * 50, (i + 1) * 50).length === 0) break;
          mess = userTracker
            .slice(i * 50, (i + 1) * 50)
            .map(
              (check) =>
                `${check.email} ${check.spent_time.toFixed(
                  2
                )} giờ, call time: ${check.call_time.toFixed(2)} giờ`
            )
            .join('\n');
          const Embed = new MessageEmbed()
            .setTitle(
              'Những người không bật đủ thời gian tracker trong ngày hôm qua'
            )
            .setColor('RED')
            .setDescription(`${mess}`);
          await message.reply({ embeds: [Embed] }).catch(console.error);
        }
      }
    }
  } else if (args[1] === 'weekly') {
    let dateMondayToSFriday = [];
    const current = new Date();
    const first = current.getDate() - current.getDay();
    const firstday = new Date(current.setDate(first + 1)).toString();
    for (let i = 1; i < 6; i++) {
      const next = new Date(current.getTime());
      next.setDate(first + i);
      const date = new Date(next).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      dateMondayToSFriday.push(date);
    }
    if (args[2]) {
      const tracker = await trackerSpentTimeData.aggregate([
        {
          $match: {
            email: args[2],
            date: { $in: dateMondayToSFriday },
          },
        },
        {
          $group: {
            _id: '$email',
            spent_time: { $last: '$spent_time' },
          },
        },
        {
          $project: {
            _id: 0,
            email: '$_id',
            spent_time: 1,
            call_time: 1,
          },
        },
      ]);
      if (tracker.length === 0)
        return message.reply({ content: messHelpWeekly, ephemeral: true });

      let userTracker = [];
      await Promise.all(
        tracker.map(async (item) => {
          const findUser = await userData
            .find({
              email: item.email,
              deactive: { $ne: true },
            })
            .select('id email -_id');

          findUser.map((user) => {
            if (user.email === item.email)
              userTracker.push({
                id: user.id,
                email: user.email,
                spent_time: item.spent_time / HOURS_IN_SECONDS,
                call_time: (item.call_time ?? 0) / HOURS_IN_SECONDS,
                date: item.date,
              });
          });
        })
      );

      userTracker.sort(
        (a, b) => parseFloat(a.spent_time) - parseFloat(b.spent_time)
      );

      let mess;
      if (!userTracker) {
        return;
      } else if (Array.isArray(userTracker) && userTracker.length === 0) {
        mess = '```' + 'Không có bản ghi nào cho tuần qua' + '```';
        return message.reply(mess).catch(console.error);
      } else {
        for (let i = 0; i <= Math.ceil(userTracker.length / 50); i += 1) {
          if (userTracker.slice(i * 50, (i + 1) * 50).length === 0) break;
          dateMondayToSFriday.map((dateWeekly) => {
            let dataTracker = userTracker;
            mess = dataTracker
              .slice(i * 50, (i + 1) * 50)
              .filter((item) => item.date === dateWeekly)
              .map(
                (check) =>
                  `${check.email} ${check.spent_time.toFixed(
                    2
                  )} giờ, call time: ${check.call_time.toFixed(2)} giờ`
              )
              .join('\n');
            const day = dateWeekly.slice(0, 2);
            const month = dateWeekly.slice(3, 5);
            const year = dateWeekly.slice(6);

            const fomat = `${month}/${day}/${year}`;
            const Embed = new MessageEmbed()
              .setTitle(`Thời gian sử dụng tracker của bạn trong ngày ${fomat}`)
              .setColor('RED')
              .setDescription(`${mess}`);
            return message.reply({ embeds: [Embed] }).catch(console.error);
          });
        }
      }
    } else {
      const tracker = await trackerSpentTimeData.aggregate([
        {
          $match: {
            spent_time: { $lt: hours },
            date: { $in: dateMondayToSFriday },
            wfh: true,
          },
        },
        {
          $group: {
            _id: '$email',
            spent_time: { $last: '$spent_time' },
            date: { $last: '$date' },
          },
        },
        {
          $project: {
            _id: 0,
            email: '$_id',
            spent_time: 1,
            call_time: 1,
            date: 1,
          },
        },
      ]);

      let userTracker = [];
      await Promise.all(
        tracker.map(async (item) => {
          const findUser = await userData
            .find({
              email: item.email,
              deactive: { $ne: true },
            })
            .select('id email -_id');

          findUser.map((user) => {
            if (user.email === item.email)
              userTracker.push({
                id: user.id,
                email: user.email,
                spent_time: item.spent_time / HOURS_IN_SECONDS,
                call_time: (item.call_time ?? 0) / HOURS_IN_SECONDS,
                date: item.date,
              });
          });
        })
      );

      userTracker.sort(
        (a, b) => parseFloat(a.spent_time) - parseFloat(b.spent_time)
      );

      let mess;
      if (!userTracker) {
        return;
      } else if (Array.isArray(userTracker) && userTracker.length === 0) {
        mess = '```' + 'Không có ai vi phạm trong tuần' + '```';
        return message.reply(mess).catch(console.error);
      } else {
        for (let i = 0; i <= Math.ceil(userTracker.length / 50); i += 1) {
          if (userTracker.slice(i * 50, (i + 1) * 50).length === 0) break;
          dateMondayToSFriday.map((dateWeekly) => {
            let dataTracker = userTracker;
            mess = dataTracker
              .slice(i * 50, (i + 1) * 50)
              .filter((item) => item.date === dateWeekly)
              .map(
                (check) =>
                  `${check.email} ${check.spent_time.toFixed(
                    2
                  )} giờ, call time: ${check.call_time.toFixed(2)} giờ`
              )
              .join('\n');
            const day = dateWeekly.slice(0, 2);
            const month = dateWeekly.slice(3, 5);
            const year = dateWeekly.slice(6);

            const fomat = `${month}/${day}/${year}`;
            let Embed = new MessageEmbed()
              .setTitle(
                `Những người không bật đủ thời gian tracker trong ngày ${fomat}`
              )
              .setColor('RED')
              .setDescription(`${mess}`);
            return message.reply({ embeds: [Embed] }).catch(console.error);
          });
        }
      }
    }
  } else if (args[1] === 'time') {
    let email = args[2] || '';
    if (!email) {
      const user = await userData.findOne({ id: message.author.id });
      email = user.email;
    }
    const awc = new AWClient('komubot-client', {
      baseURL: 'http://tracker.komu.vn:5600',
      testing: false,
    });

    const currentDate = new Date();
    const timezone = currentDate.getTimezoneOffset() / -60;
    const startTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 1,
      17 + timezone,
      0,
      0
    );
    const endTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      17 + timezone,
      0,
      0
    );
    try {
      const query = [
        `events = flood(query_bucket("aw-watcher-window_${email}"));`,
        `not_afk = flood(query_bucket("aw-watcher-afk_${email}"));`,
        'not_afk = filter_keyvals(not_afk, "status", ["not-afk"]);',
        'browser_events = [];',
        'audible_events = filter_keyvals(browser_events, "audible", [true]);',
        'not_afk = period_union(not_afk, audible_events);',
        'events = filter_period_intersect(events, not_afk);',
        'events = categorize(events, [[["Work"],{"type":"regex","regex":"Google Docs|libreoffice|ReText|xlsx|docx|json|mstsc|Remote Desktop|Terminal"}],[["Work","Programming"],{"type":"regex","regex":"GitHub|Stack Overflow|BitBucket|Gitlab|vim|Spyder|kate|Ghidra|Scite|Jira|Visual Studio|Mongo|cmd"}],[["Work","Programming","IDEs"],{"type":"regex","regex":"deven|code|idea64","ignore_case":true}],[["Work","Programming","Others"],{"type":"regex","regex":"Bitbucket|gitlab|github|mintty|pgadmin","ignore_case":true}],[["Work","3D"],{"type":"regex","regex":"Blender"}],[["Media","Games"],{"type":"regex","regex":"Minecraft|RimWorld"}],[["Media","Video"],{"type":"regex","regex":"YouTube|Plex|VLC"}],[["Media","Social Media"],{"type":"regex","regex":"reddit|Facebook|Twitter|Instagram|devRant","ignore_case":true}],[["Media","Music"],{"type":"regex","regex":"Spotify|Deezer","ignore_case":true}],[["Comms","IM"],{"type":"regex","regex":"Messenger|Telegram|Signal|WhatsApp|Rambox|Slack|Riot|Discord|Nheko|Teams|Skype","ignore_case":true}],[["Comms","Email"],{"type":"regex","regex":"Gmail|Thunderbird|mutt|alpine"}]]);',
        'title_events = sort_by_duration(merge_events_by_keys(events, ["app", "title"]));',
        'app_events   = sort_by_duration(merge_events_by_keys(title_events, ["app"]));',
        'cat_events   = sort_by_duration(merge_events_by_keys(events, ["$category"]));',
        'app_events  = limit_events(app_events, 100);',
        'title_events  = limit_events(title_events, 100);',
        'duration = sum_durations(events);',
        'browser_events = split_url_events(browser_events);',
        'browser_urls = merge_events_by_keys(browser_events, ["url"]);',
        'browser_urls = sort_by_duration(browser_urls);',
        'browser_urls = limit_events(browser_urls, 100);',
        'browser_domains = merge_events_by_keys(browser_events, ["$domain"]);',
        'browser_domains = sort_by_duration(browser_domains);',
        'browser_domains = limit_events(browser_domains, 100);',
        'browser_duration = sum_durations(browser_events);',
        'RETURN = {\n        "window": {\n            "app_events": app_events,\n            "title_events": title_events,\n            "cat_events": cat_events,\n            "active_events": not_afk,\n            "duration": duration\n        },\n        "browser": {\n            "domains": browser_domains,\n            "urls": browser_urls,\n            "duration": browser_duration\n        }\n    };',
      ];
      const events = await awc.query(
        [{ start: startTime, end: endTime }],
        query.join()
      );

      const spent_time = events.window.duration;

      const Embed = new MessageEmbed()
        .setTitle(`Số giờ sử dụng tracker của ${user.email} hôm nay`)
        .setColor('RED')
        .setDescription(`${spent_time / HOURS_IN_SECONDS} giờ`);
      return message.reply({ embeds: [Embed] }).catch(console.error);
    } catch (error) {
      const Embed = new MessageEmbed()
        .setTitle(`Số giờ sử dụng tracker của ${user.email} hôm nay`)
        .setColor('RED')
        .setDescription(messHelpTime);
      return message.reply({ embeds: [Embed] }).catch(console.error);
    }
  }
  if (args[1] !== 'daily' && args[1] !== 'weekly') {
    if (
      !/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/.test(
        args[1]
      )
    ) {
      return message.reply({ content: messTrackerHelp, ephemeral: true });
    }
    const day = args[1].slice(0, 2);
    const month = args[1].slice(3, 5);
    const year = args[1].slice(6);
    const fomat = `${month}/${day}/${year}`;
    if (args[2]) {
      const tracker = await trackerSpentTimeData.aggregate([
        {
          $match: {
            email: args[2],
            date: fomat,
          },
        },
        {
          $group: {
            _id: '$email',
            spent_time: { $last: '$spent_time' },
          },
        },
        {
          $project: {
            _id: 0,
            email: '$_id',
            spent_time: 1,
            call_time: 1,
          },
        },
      ]);
      if (tracker.length === 0)
        return message.reply({ content: messHelpDate, ephemeral: true });

      let userTracker = [];
      await Promise.all(
        tracker.map(async (item) => {
          const findUser = await userData
            .find({
              email: item.email,
              deactive: { $ne: true },
            })
            .select('id email -_id');

          findUser.map((user) => {
            if (user.email === item.email)
              userTracker.push({
                id: user.id,
                email: user.email,
                spent_time: item.spent_time / HOURS_IN_SECONDS,
                call_time: (item.call_time ?? 0) / HOURS_IN_SECONDS,
              });
          });
        })
      );

      userTracker.sort(
        (a, b) => parseFloat(a.spent_time) - parseFloat(b.spent_time)
      );

      let mess;
      if (!userTracker) {
        return;
      } else if (Array.isArray(userTracker) && userTracker.length === 0) {
        mess = '```' + `Không có bản ghi nào cho ngày ${args[1]}` + '```';
        return message.reply(mess).catch(console.error);
      } else {
        for (let i = 0; i <= Math.ceil(userTracker.length / 50); i += 1) {
          if (userTracker.slice(i * 50, (i + 1) * 50).length === 0) break;
          mess = userTracker
            .slice(i * 50, (i + 1) * 50)
            .map(
              (check) =>
                `${check.email} ${check.spent_time.toFixed(
                  2
                )} giờ, call time: ${check.call_time.toFixed(2)} giờ`
            )
            .join('\n');
          const Embed = new MessageEmbed()
            .setTitle(`Thời gian sử dụng tracker của bạn trong ngày ${args[1]}`)
            .setColor('RED')
            .setDescription(`${mess}`);
          await message.reply({ embeds: [Embed] }).catch(console.error);
        }
      }
    } else {
      const tracker = await trackerSpentTimeData.aggregate([
        {
          $match: {
            spent_time: { $lt: hours },
            date: fomat,
            wfh: true,
          },
        },
        {
          $group: {
            _id: '$email',
            spent_time: { $last: '$spent_time' },
          },
        },
        {
          $project: {
            _id: 0,
            email: '$_id',
            spent_time: 1,
            call_time: 1,
          },
        },
      ]);

      let userTracker = [];
      await Promise.all(
        tracker.map(async (item) => {
          const findUser = await userData
            .find({
              email: item.email,
              deactive: { $ne: true },
            })
            .select('id email -_id');

          findUser.map((user) => {
            if (user.email === item.email)
              userTracker.push({
                id: user.id,
                email: user.email,
                spent_time: item.spent_time / HOURS_IN_SECONDS,
                call_time: (item.call_time ?? 0) / HOURS_IN_SECONDS,
              });
          });
        })
      );

      userTracker.sort(
        (a, b) => parseFloat(a.spent_time) - parseFloat(b.spent_time)
      );

      let mess;
      if (!userTracker) {
        return;
      } else if (Array.isArray(userTracker) && userTracker.length === 0) {
        mess = '```' + `Không có ai vi phạm trong ngày ${args[1]}` + '```';
        return message.reply(mess).catch(console.error);
      } else {
        for (let i = 0; i <= Math.ceil(userTracker.length / 50); i += 1) {
          if (userTracker.slice(i * 50, (i + 1) * 50).length === 0) break;
          mess = userTracker
            .slice(i * 50, (i + 1) * 50)
            .map(
              (check) =>
                `${check.email} ${check.spent_time.toFixed(
                  2
                )} giờ, call time: ${check.call_time.toFixed(2)} giờ`
            )
            .join('\n');
          const Embed = new MessageEmbed()
            .setTitle(
              `Những người không bật đủ thời gian tracker trong ngày ${args[1]}`
            )
            .setColor('RED')
            .setDescription(`${mess}`);
          await message.reply({ embeds: [Embed] }).catch(console.error);
        }
      }
    }
  }
}

module.exports = { reportTracker };
