import db from './database.js';

export function getRangeStats(start, 
end) {

    const turnover = db.prepare( `
        SELECT SUM(amount) as total

        FROM bets

        WHERE created_at BETWEEN ? AND ?    

` ).get(start, end);

const profit = db.prepare( `
        SELECT SUM(net_profit) as total

        FROM results
 
        WHERE created_at BETWEEN ? AND ?    

` ).get(start, end);

const active = db.prepare( `

        SELECT COUNT(DISTINCT telegram_id)

        as total 

        FROM bets

        WHERE created_at BETWEEN ? AND ?    

` ).get(start, end);

return {

        turnover: turnover.total || 0,

        profit: profit.total || 0,

        active: active.total || 0
    };
}

export function getTopPlayers(start, end) {

   return db.prepare(`

    SELECT
    telegram_id,
    nickname,
    SUM(net_profit) as total

    FROM results

    WHERE created_at BETWEEN ? AND ?

    GROUP BY telegram_id

    ORDER BY total DESC

    LIMIT 10

`).all(start, end);

}

export function getLosePlayers(start, 
end) {

return db.prepare(`

    SELECT
    telegram_id,
    nickname,
    SUM(net_profit) as total

    FROM results

    WHERE created_at BETWEEN ? AND ?

    GROUP BY telegram_id

    ORDER BY total ASC

    LIMIT 10

`).all(start, end);

}

export function getPlayerStats(
telegram_id,
start,
end
) {

const turnover = db.prepare(`

    SELECT SUM(amount) as total

    FROM bets

    WHERE telegram_id = ?

    AND created_at BETWEEN ? AND ?

`).get(
    telegram_id,
    start,
    end
);

const profit = db.prepare(`

    SELECT SUM(net_profit) as total

    FROM results

    WHERE telegram_id = ?

    AND created_at BETWEEN ? AND ?

`).get(
    telegram_id,
    start,
    end
);

return {

    turnover: turnover.total || 0,

    profit: profit.total || 0
};

}