const { setDebug, debug, parseDailyMessage, parseTimeSheetSentence, parseTimeSheetTask } = require('../util/timesheet')

setDebug()
debug('[Test case 1]')
const result = parseDailyMessage(`
*daily 26/08/2022
- yesterday:  design marketplace flow
- today: update mobile version
- block: none
`);
debug(result);
debug('===========================================[Should be success]======================================')


debug('[Test case 2]')
const result2 = parseDailyMessage(`
*daily 26/08/2022
- Yesterday: Support refactor ESGTECH-6410, ESGTECH-3 customize color of font page background
- Today: ESGTECH-3 Apply corporate color for export report
- Block: no
`);
debug(result2);
debug('===========================================[Should be success]======================================')

debug('[Test case 3]')
const result3 = parseTimeSheetSentence('Support refactor ESGTECH-6410, ESGTECH-3 customize color of font page background');
debug(result3);
debug('===========================================[Should be success]======================================')


debug('[Test case 4]')
const result4 = parseTimeSheetTask('Support refactor ESGTECH-6410');
debug(result4);
debug('===========================================[Should be success]======================================')


debug('[Test case 5]')
const result5 = parseTimeSheetTask('Support refactor ESGTECH-6410; 2h, nt, coding');
debug(result5);
debug('===========================================[Should be success]======================================')


debug('[Test case 6]')
const result6 = parseDailyMessage(`
*daily 26/08/2022
- Yesterday: Support refactor ESGTECH-6410 - 2h; + ESGTECH-3 customize color of font page background
- Today: ESGTECH-3 Apply corporate color for export report - 2h
- Block: no
`);
debug(result6);
debug('===========================================[Should be success]======================================')


debug('[Test case 7]')
const result7 = parseDailyMessage(`
*daily 26/08/2022
- Yesterday: Support refactor ESGTECH-6410 - 2h; + ESGTECH-3 customize color of font page background
- Today:
    + ESGTECH-3 Apply corporate color for export report - 2h
    + ESGTECH-3 Apply corporate color for export report - 4h
- Block: no
`);
debug(result7);
debug('===========================================[Should be success]======================================')


debug('[Test case 8]')
const result8 = parseTimeSheetSentence(`
  + ESGTECH-3 Apply corporate color for export report; 2h
  + ESGTECH-3 Apply corporate color for export report; 4h
`);
debug(result8);
debug('===========================================[Should be success]======================================')


debug('[Test case 7]')
const result9 = parseDailyMessage(`
*daily 26/08/2022
- Yesterday: Support refactor ESGTECH-6410 - 2h; + ESGTECH-3 customize color of font page background
- Today:
    + ESGTECH-3 Apply corporate color for export report; 2h, nt, coding
    + ESGTECH-3 Apply corporate color for export report; 4h, ot, testing
- Block: no
`);
debug(result9);
debug('===========================================[Should be success]======================================')


debug('[Test case 10]')
const result10 = parseDailyMessage(`
*daily esg 26/08/2022
- Yesterday: Support refactor ESGTECH-6410 - 2h; + ESGTECH-3 customize color of font page background
- Today:
    + ESGTECH-3 Apply corporate color for export report; 2h, nt, coding
    + ESGTECH-3 Apply corporate color for export report; 4h, ot, testing
- Block: no
`);
debug(result10);
debug('===========================================[Should be success]======================================')
