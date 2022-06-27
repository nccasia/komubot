const antCommmand = require('../commands/utilities/ant');

antCommmand.execute(
  {
    reply: console.log,
  },
  []
);

antCommmand.execute(
  {
    reply: console.log,
  },
  ['help']
);

antCommmand.execute(
  {
    reply: console.log,
  },
  ['@thaibm']
);

antCommmand.execute(
  {
    reply: console.log,
  },
  ['rnd']
);

antCommmand.execute(
  {
    reply: console.log,
  },
  ['#ant']
);
