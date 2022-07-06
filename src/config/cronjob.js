const { CronJob } = require('cron');

const CronJobService = require('../api/services/cronJobServices');
// 1 0 */15 * * every 15 days on 00:01:00 GMT+0530
exports.updatePlayerSelected = new CronJob('*/20 * * * *', async function() {
    try {
        return CronJobService.updatePlayerSelected();
    } catch (e) {
        return e;
    }
});