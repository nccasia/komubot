const wolCommmand = require('../commands/utilities/wol');

wolCommmand.execute(
  {
    reply: console.log,
  },
  ['10.10.30.16']
);

wolCommmand.execute(
  {
    reply: console.log,
  },
  ['debug']
);
