const wolCommmand = require('../commands/utilities/wol')

wolCommmand.execute(
  {
    reply: console.log,
  },
  ['2C-F0-5D-EA-14-68', '10.10.40.255'],
)

wolCommmand.execute(
  {
    reply: console.log,
  },
  ['2C-F0-5D-EA-14-68'],
)
