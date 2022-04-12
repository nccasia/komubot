const path = require('path');
const env = require('../env');

const vars = env.config({ path: path.resolve(__dirname, '..', '.env') });

console.log(vars);
