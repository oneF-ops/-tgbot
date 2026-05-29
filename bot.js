import { Telegraf } from 'telegraf';

import fs from 'fs';

import axios from 'axios';

import './cleanup.js';

import { BOT_TOKEN } from './config.js';

import db from './database.js';

//import { recognizeImage } from './ocr.js';

import {
parseBetText,
parseResultText
} from './parser.js';

import { mainKeyboard } from './keyboard.js';

import {
getRangeStats,
getTopPlayers,
getLosePlayers,
getPlayerStats
} from './stats.js';

const bot = new Telegraf(BOT_TOKEN);

const currentRounds = {};

function getDateRange(days = 0) {

const end = new Date();

const start = new Date();

start.setDate(start.getDate() - days);

return {
    start: start.toISOString(),
    end: end.toISOString()
};

}

bot.start(async (ctx) => {

await ctx.reply(
    '📊 快三统计机器人 V3 已启动',
    mainKeyboard
);

});

bot.action('today', async (ctx) => {

const { start, end } = getDateRange(0);

const stats = getRangeStats(start, end);

await ctx.reply(`

📊 今日数据

👥 活跃人数：${stats.active}

💰 总流水：${stats.turnover}

📈 总输赢：${stats.profit}

`);

});

bot.action('yesterday', async (ctx) => {

const end = new Date();

end.setDate(end.getDate() - 1);

const start = new Date(end);

start.setHours(0,0,0,0);

end.setHours(23,59,59,999);

const stats = getRangeStats(
    start.toISOString(),
    end.toISOString()
);

await ctx.reply(`

📅 昨日数据

👥 活跃人数：${stats.active}

💰 总流水：${stats.turnover}

📈 总输赢：${stats.profit}

`);

});

bot.action('week', async (ctx) => {

const { start, end } = getDateRange(7);

const stats = getRangeStats(start, end);

await ctx.reply(`

📈 最近7天

👥 活跃人数：${stats.active}

💰 总流水：${stats.turnover}

📈 总输赢：${stats.profit}

`);

});

bot.action('top', async (ctx) => {

const { start, end } = getDateRange(7);

const players = getTopPlayers(start, end);

let text = '🏆 7天盈利榜\n\n';

players.forEach((p, i) => {

    text += `${i + 1}. ${p.telegram_id} ${p.total}\n`;
});

await ctx.reply(text);

});

bot.action('lose', async (ctx) => {

const { start, end } = getDateRange(7);

const players = getLosePlayers(start, end);

let text = '😭 7天水鱼榜\n\n';

players.forEach((p, i) => {

    text += `${i + 1}. ${p.telegram_id} ${p.total}\n`;
});

await ctx.reply(text);

});

bot.command('玩家', async (ctx) => {

const args = ctx.message.text.split(' ');

const telegram_id = args[1];

const days = parseInt(args[2]) || 7;

const end = new Date();

const start = new Date();

start.setDate(start.getDate() - days);

const stats = getPlayerStats(
    telegram_id,
    start.toISOString(),
    end.toISOString()
);

await ctx.reply(`

👤 玩家：${telegram_id}

📅 最近${days}天

💰 总流水：${stats.turnover}

📈 净输赢：${stats.profit}

`);

});


    const imagePath = `temp/${Date.now()}.jpg`;

    const writer = fs.createWriteStream(imagePath);

    response.data.pipe(writer);

    writer.on('finish', async () => {

        const text = await recognizeImage(imagePath);

        if (
            text.includes('停止下注') ||
            text.includes('本期下注玩家')
        ) {

            const bets = parseBetText(text);

            const roundId = Date.now().toString();

            currentRounds[roundId] = bets;

            for (const bet of bets) {

                db.prepare(`

                INSERT INTO bets (

                    round_id,
                    telegram_id,
                    nickname,
                    bet_content,
                    amount,
                    currency

                )

                VALUES (?, ?, ?, ?, ?, ?)

                `).run(

                    roundId,

                    bet.telegram_id,

                    bet.nickname,

                    bet.raw,

                    bet.amount,

                    bet.currency
                );

                db.prepare(`

                INSERT OR IGNORE INTO users (

                    telegram_id,
                    nickname

                )

                VALUES (?, ?)

                `).run(

                    bet.telegram_id,

                    bet.nickname
                );
            }

            await ctx.reply(
                `✅ 已记录 ${bets.length} 条下注`
            );
        }

        else {

            const results = parseResultText(text);

            const roundIds = Object.keys(currentRounds);

            const latestRound =
                currentRounds[
                    roundIds[roundIds.length - 1]
                ];

            if (!latestRound) {

                await ctx.reply('❌ 未找到对应下注局');

                return;
            }

            const winners = [];

            for (let i = 0; i < results.length; i++) {

                const player = latestRound[i];

                if (!player) continue;

                const payout = results[i].amount;

                const netProfit =
                    payout - player.amount;

                winners.push(player.telegram_id);

                db.prepare(`

                INSERT INTO results (

                    round_id,
                    telegram_id,
                    nickname,
                    payout,
                    net_profit,
                    currency

                )

                VALUES (?, ?, ?, ?, ?, ?)

                `).run(

                    roundIds[roundIds.length - 1],

                    player.telegram_id,

                    player.nickname,

                    payout,

                    netProfit,

                    player.currency
                );
            }

            for (const player of latestRound) {

                if (
                    winners.includes(
                        player.telegram_id
                    )
                ) continue;

                db.prepare(`

                INSERT INTO results (

                    round_id,
                    telegram_id,
                    nickname,
                    payout,
                    net_profit,
                    currency

                )

                VALUES (?, ?, ?, ?, ?, ?)

                `).run(

                    roundIds[roundIds.length - 1],

                    player.telegram_id,

                    player.nickname,

                    0,

                    -player.amount,

                    player.currency
                );
            }

            await ctx.reply(
                '✅ 本局输赢统计完成'
            );
        }

        fs.unlinkSync(imagePath);
    });

} catch (err) {

    console.log(err);

    await ctx.reply(
        '❌ 图片识别失败'
    );
}

});

bot.launch();

console.log('V3机器人已启动');
