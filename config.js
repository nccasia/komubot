module.exports = {
  prefix: '*',
  // Your ID
  // Your name/tag
  owners: ['KOMU#0139'],
  //The footer of the embeds that the bot will send
  footer: 'KOMU ',
  // The id of the support
  supportID: '729774155037278268',
  // The status of your bot
  game: 'KOMU ',
  //the color of the embeds
  color: '#3A871F',
  // OPTIONAL: Your top.gg token.
  topgg: 'TOPGG_TOKEN',
  // OPTIONAL: The link of your bot's top.gg page.
  topgg_url: 'https://top.gg/bot/783708073390112830',
  //the default bot language. fr or en
  defaultLanguage: 'en',
  // If dev mod is enabled
  devMode: false,
  // The server where you test the commands
  devServer: '782661233622515772',
  // If you want to log every command,event etc. Usefull for debuging
  logAll: false,
  // If you want to test your configuration before starting the bot
  checkConfig: null,
  //The number of shards. Leave blank for auto
  shards: 1,
  // The categories. Put null to enabled to disable a category
  categories: {
    configuration: {
      enabled: true,
      name: 'Configuration',
      desc: 'Setup the bot with the configuration commands',
    },
    utilities: {
      enabled: true,
      name: 'Utilities',
      desc: 'Some usefull commands',
      aliases: ['general'],
    },
    music: { enabled: true, name: 'Music', desc: 'Listen music with KOMU' },
    komu: { enabled: true, name: 'Task', desc: 'KOMU task manager' },
    slash: { enabled: true, name: 'Poll', desc: 'KOMU poll manager' },
    owner: {
      hide: true,
      enabled: true,
      name: 'Owner',
      desc: 'Manage your bot with the owner commands',
    },
  },
  //Database
  database: {
    // The url of your mongodb database. Check mongodb.org
    MongoURL: `${process.env.MONGOURL}`,
    // If you want to cache the database. For big bots
    cached: true,
    delay: 300000 * 4,
    Options: { autoIndex: false, useFindAndModify: false },
  },
  wfh: {
    api_url: `${process.env.TIMESHEET_API}Public/GetUserWorkFromHome`,
  },
  ticket: {
    api_url_create: `${process.env.TIMESHEET_API}KomuJobService/CreateJob`,
    api_url_get: `${process.env.INFO_API}KomuJobService/GetJobs`,
  },
  role: {
    api_url_getRole: `${process.env.PROJECT_API}User/GetEmployeeInformation`,
  },
  user_status: {
    api_url_userstatus: `${process.env.TIMESHEET_API}Public/GetWorkingStatusByUser`,
  },
  submitTimesheet: {
    api_url_getListUserLogTimesheet: `${process.env.TIMESHEET_API}Public/GetListUserLogTimesheetThisWeekNotOk`,
    api_url_logTimesheetByKomu: `${process.env.TIMESHEET_API}MyTimesheets/CreateByKomu`,
  },
  wiki: {
    api_url: `${process.env.PROJECT_API}User/GetEmployeeInformation?email=`,
    options: [
      'all',
      'note',
      'link',
      'code',
      'file',
      'image',
      'cmd',
      'event',
      'pm',
      'hr',
      'komu',
      'policy',
      'office',
      'project',
      'ot',
      'checkpoint',
      'timesheet',
      'tx8',
      'fun',
      'help',
    ],
  },
  gem: {
    api_url_getMyRank: `${process.env.GEMSOFGOD_API}komu/get-my-ranking/`,
    api_url_getTopRank: `${process.env.GEMSOFGOD_API}komu/get-top-ranking`,
  },
  noti: {
    api_url_quickNews: `${process.env.IMS_API}services/app/QuickNews/Create`,
  },
};
