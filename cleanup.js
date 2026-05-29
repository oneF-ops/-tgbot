import cron from 'node-cron';

import db from './database.js';

cron.schedule('0 0 * * *', () => {

db.prepare(`

    DELETE FROM bets

    WHERE created_at < datetime('now', '-31 days')

`).run();

db.prepare(`

    DELETE FROM results

    WHERE created_at < datetime('now', '-31 days')

`).run();

console.log('已自动清理31天前数据');

});