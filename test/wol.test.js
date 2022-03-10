const wolCommmand = require('../commands/utilities/wol');

wolCommmand.execute(
  {
    reply: console.log,
  },
  ['34:e8:94:93:e8:69']
);

