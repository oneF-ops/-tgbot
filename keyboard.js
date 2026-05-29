import { Markup } from 'telegraf';

export const mainKeyboard = 
Markup.inlineKeyboard([

    [
        Markup.button.callback('📊 今日', 'today')
    ],

    [
        Markup.button.callback('📅 昨日', 'yesterday')
    ],

    [
        Markup.button.callback('📈 7天', 'week')
    ],

    [
        Markup.button.callback('🏆 盈利榜', 'top')
    ],

    [
        Markup.button.callback('😭 水鱼榜', 'lose')
    ]
]);