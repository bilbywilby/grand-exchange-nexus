import { Hono } from "hono";
import { Env } from './core-utils';
const OSRS_BASE_URL = "https://secure.runescape.com/m=itemdb_oldschool/api";
const OSRS_WIKI_PRICES_URL = "https://prices.runescape.wiki/api/v1/osrs";
const WEIRD_GLOOP_LATEST_URL = "https://api.weirdgloop.org/exchange/history/osrs/latest";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/ge/category', async (c) => {
        const categoryId = c.req.query('id');
        if (!categoryId) {
            return c.json({ success: false, error: 'Category ID is required' }, 400);
        }
        try {
            const response = await fetch(`${OSRS_BASE_URL}/catalogue/category.json?category=${categoryId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch category data: ${response.statusText}`);
            }
            const data = await response.json();
            return c.json({ success: true, data });
        } catch (error) {
            console.error('[WORKER ERROR] /api/ge/category:', error);
            return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
        }
    });
    app.get('/api/ge/items', async (c) => {
        const categoryId = c.req.query('id');
        const alpha = c.req.query('alpha');
        const page = c.req.query('page') || '1';
        if (!categoryId || !alpha) {
            return c.json({ success: false, error: 'Category ID and alpha are required' }, 400);
        }
        const encodedAlpha = alpha === '#' ? '%23' : alpha;
        try {
            const url = `${OSRS_BASE_URL}/catalogue/items.json?category=${categoryId}&alpha=${encodedAlpha}&page=${page}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch items data: ${response.statusText}`);
            }
            const data = await response.json();
            return c.json({ success: true, data });
        } catch (error)
        {
            console.error('[WORKER ERROR] /api/ge/items:', error);
            return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
        }
    });
    app.get('/api/ge/detail', async (c) => {
        const itemId = c.req.query('id');
        if (!itemId) {
            return c.json({ success: false, error: 'Item ID is required' }, 400);
        }
        try {
            const response = await fetch(`${OSRS_BASE_URL}/catalogue/detail.json?item=${itemId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch item detail: ${response.statusText}`);
            }
            const data = await response.json();
            return c.json({ success: true, data });
        } catch (error) {
            console.error('[WORKER ERROR] /api/ge/detail:', error);
            return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
        }
    });
    app.get('/api/ge/graph', async (c) => {
        const itemId = c.req.query('id');
        if (!itemId) {
            return c.json({ success: false, error: 'Item ID is required' }, 400);
        }
        try {
            const response = await fetch(`${OSRS_BASE_URL}/graph/${itemId}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch graph data: ${response.statusText}`);
            }
            const data = await response.json();
            return c.json({ success: true, data });
        } catch (error) {
            console.error('[WORKER ERROR] /api/ge/graph:', error);
            return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
        }
    });
    // Flipper Route
    app.get('/api/flip/opportunities', async (c) => {
        const minVolume = parseInt(c.req.query('minVolume') || '100000', 10);
        const taxRate = parseFloat(c.req.query('taxRate') || '0.01'); // 1% default tax
        const topN = parseInt(c.req.query('topN') || '100', 10);
        try {
            const [mappingRes, latestRes] = await Promise.all([
                fetch(`${OSRS_WIKI_PRICES_URL}/mapping`),
                fetch(`${OSRS_WIKI_PRICES_URL}/latest`)
            ]);
            if (!mappingRes.ok) throw new Error(`Failed to fetch mapping data: ${mappingRes.statusText}`);
            if (!latestRes.ok) throw new Error(`Failed to fetch latest prices: ${latestRes.statusText}`);
            const mappingData: any[] = await mappingRes.json();
            const latestRaw: { data: Record<string, any> } = await latestRes.json();
            const latestData = latestRaw.data;
            const opportunities = [];
            for (const item of mappingData) {
                const id = item.id.toString();
                const latestInfo = latestData[id];
                if (latestInfo && latestInfo.high && latestInfo.low && latestInfo.highPriceVolume >= minVolume) {
                    const buy_price = latestInfo.low;
                    const sell_price = latestInfo.high;
                    const net_sell = sell_price * (1 - taxRate);
                    const profit_per = Math.floor(net_sell - buy_price);
                    if (profit_per > 0) {
                        const limit = item.limit || 0;
                        const total_profit = profit_per * limit;
                        opportunities.push({
                            id: item.id,
                            name: item.name,
                            buy_price,
                            sell_price,
                            profit_per_item_gp: profit_per,
                            buy_limit: limit,
                            volume_24h: latestInfo.highPriceVolume,
                            total_potential_profit_gp: total_profit,
                        });
                    }
                }
            }
            const sortedOpportunities = opportunities
                .sort((a, b) => b.total_potential_profit_gp - a.total_potential_profit_gp)
                .slice(0, topN);
            return c.json({ success: true, data: sortedOpportunities });
        } catch (error) {
            console.error('[WORKER ERROR] /api/flip/opportunities:', error);
            return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
        }
    });
    // Herblore Profits Route
    app.get('/api/herblore/profits', async (c) => {
        const HERB_DATA = [
            { name: "Grimy guam leaf", grimy_id: 199, unf_id: 91 },
            { name: "Grimy marrentill", grimy_id: 201, unf_id: 93 },
            { name: "Grimy tarromin", grimy_id: 203, unf_id: 95 },
            { name: "Grimy harralander", grimy_id: 205, unf_id: 97 },
            { name: "Grimy ranarr weed", grimy_id: 207, unf_id: 99 },
            { name: "Grimy toadflax", grimy_id: 3049, unf_id: 2998 },
            { name: "Grimy irit leaf", grimy_id: 209, unf_id: 101 },
            { name: "Grimy avantoe", grimy_id: 211, unf_id: 103 },
            { name: "Grimy kwuarm", grimy_id: 213, unf_id: 105 },
            { name: "Grimy snapdragon", grimy_id: 3051, unf_id: 3000 },
            { name: "Grimy cadantine", grimy_id: 215, unf_id: 107 },
            { name: "Grimy dwarf weed", grimy_id: 217, unf_id: 109 },
        ];
        const VIAL_ID = 227; // Vial of water
        const ZAHUR_FEE = 200;
        try {
            const allIds = new Set(HERB_DATA.flatMap(h => [h.grimy_id, h.unf_id]));
            allIds.add(VIAL_ID);
            const idString = Array.from(allIds).join(',');
            const pricesRes = await fetch(`${WEIRD_GLOOP_LATEST_URL}?id=${idString}`);
            if (!pricesRes.ok) {
                throw new Error(`Failed to fetch prices from Weird Gloop API: ${pricesRes.statusText}`);
            }
            const prices: Record<string, { price: number }> = await pricesRes.json();
            const vial_price = prices[VIAL_ID]?.price;
            if (vial_price === undefined) {
                throw new Error("Could not determine the price for a Vial of water.");
            }
            const profits = [];
            for (const herb of HERB_DATA) {
                const grimy_price = prices[herb.grimy_id]?.price;
                const unf_price = prices[herb.unf_id]?.price;
                if (grimy_price !== undefined && unf_price !== undefined) {
                    const cost_per = grimy_price + vial_price + ZAHUR_FEE;
                    const profit_per = unf_price - cost_per;
                    profits.push({
                        name: herb.name.replace("Grimy ", ""),
                        profit_per_potion: profit_per,
                        cost_per_potion: cost_per,
                        sell_price_unf: unf_price,
                        grimy_id: herb.grimy_id,
                        unf_id: herb.unf_id,
                    });
                }
            }
            const sortedProfits = profits.sort((a, b) => b.profit_per_potion - a.profit_per_potion);
            return c.json({ success: true, data: sortedProfits });
        } catch (error) {
            console.error('[WORKER ERROR] /api/herblore/profits:', error);
            return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
        }
    });
}