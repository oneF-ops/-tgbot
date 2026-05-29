export function parseBetText(text) {

    const lines = text.split('\n');

    const bets = [];

    let currentUser = null;

    for (const line of lines) {

        const idMatch = line.match(/【(\d+)】/);

        if (idMatch) {

            currentUser = {
                telegram_id: idMatch[1],
                nickname: line
            };

            continue;
        }

        if (!currentUser) continue;

        const amountMatch = line.match(/(\d+(?:.\d+)?)/g);

        if (!amountMatch) continue;

        const amount = parseFloat(
            amountMatch[amountMatch.length - 1]
        );

        let currency = 'K';

        if (line.includes('USDT')) currency = 'USDT';
        if (line.includes('¥')) currency = 'CNY';

        bets.push({

            telegram_id: currentUser.telegram_id,

            nickname: currentUser.nickname,

            amount,

            currency,

            raw: line
        });
    }

    return bets;
}

export function parseResultText(text) {

    const lines = text.split('\n');

    const results = [];

    for (const line of lines) {

        const amountMatch = line.match(/(\d+(?:.\d+)?)/g);

        if (!amountMatch) continue;

        const amount = parseFloat(
            amountMatch[amountMatch.length - 1]
        );

        results.push({
            amount,
            raw: line
        });
    }

    return results;
}