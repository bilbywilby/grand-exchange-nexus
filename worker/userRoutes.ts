import { Hono } from "hono";
import { Env } from './core-utils';
const OSRS_BASE_URL = "https://secure.runescape.com/m=itemdb_oldschool/api";
const OSRS_WIKI_PRICES_URL = "https://prices.runescape.wiki/api/v1/osrs";
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
    // New Flipper Route
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
            const mappingData = await mappingRes.json();
            const latestData = (await latestRes.json()).data;
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
}