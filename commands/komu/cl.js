const checkList = require('../../util/checklist');

module.exports = {
  name: 'cl',
  description: 'checklist',
  cat: 'komu',
  async execute(message, args) {
    try {
      checkList(message, args);
    } catch (error) {
      console.log(error);
    }
  },
};
