import { Hono } from "hono";
import { Env } from './core-utils';
const OSRS_BASE_URL = "https://secure.runescape.com/m=itemdb_oldschool/api";
const OSRS_WIKI_PRICES_URL = "https://prices.runescape.wiki/api/v1/osrs";
const WEIRD_GLOOP_LATEST_URL = `${OSRS_WIKI_PRICES_URL}/latest`;
async function fetchWithRetries(url: string, headers: HeadersInit) {
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
        response = await fetch(url, { headers });
        if (response.ok) return response;
        if (response.status !== 403) break; // Don't retry on non-403 errors
        await new Promise(r => setTimeout(r, 300)); // Wait before retrying
    }
    if (!response || !response.ok) {
        throw new Error(`Failed to fetch from Weird Gloop API after retries: ${response?.statusText}`);
    }
    return response;
}
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
                if (latestInfo && latestInfo.high && latestInfo.low && parseInt(item.limit?.toString() || '0') >= 100) {
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
                            volume_24h: parseInt(item.limit?.toString() || '0') * 10,
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
            const idString = Array.from(allIds).sort((a, b) => a - b).join(',');
            const headers = { 'User-Agent': 'GrandExchangeNexus/1.0' };
            const pricesRes = await fetchWithRetries(`${WEIRD_GLOOP_LATEST_URL}?id=${idString}`, headers);
            const latestData: { data: Record<string, { high: number; low: number } | undefined> } = await pricesRes.json();
            const getPrice = (id: number): number => Number(latestData.data[id.toString()]?.high ?? 0);
            const vial_price = getPrice(VIAL_ID);
            if (vial_price === 0) {
                throw new Error("Could not determine the price for a Vial of water.");
            }
            const profits = [];
            for (const herb of HERB_DATA) {
                const grimy_price = getPrice(herb.grimy_id);
                const unf_price = getPrice(herb.unf_id);
                if (grimy_price && unf_price) {
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
    const createSkillProfitRoute = (path: string, recipes: any[]) => {
        app.get(path, async (c) => {
            try {
                const allIds = new Set(recipes.flatMap(r => [...r.materials.map((m: any) => m.id), r.productId]));
                const idString = Array.from(allIds).join(',');
                const headers = { 'User-Agent': 'GrandExchangeNexus/1.0' };
                const pricesRes = await fetchWithRetries(`${WEIRD_GLOOP_LATEST_URL}?id=${idString}`, headers);
                const latestData: { data: Record<string, { high: number; low: number } | undefined> } = await pricesRes.json();
                const getLow = (id: number): number => Number(latestData.data[id.toString()]?.low ?? 0);
                const getHigh = (id: number): number => Number(latestData.data[id.toString()]?.high ?? 0);
                const profits = recipes.map(recipe => {
                    const costPer = recipe.materials.reduce((acc: number, mat: any) => acc + (getLow(mat.id) * mat.qty), 0);
                    const revenuePer = getHigh(recipe.productId) * 0.99; // 1% GE tax
                    const profitPer = Math.floor(revenuePer - costPer);
                    const gpPerHr = Math.round(profitPer * recipe.actionsPerHr);
                    return {
                        name: recipe.name,
                        profitPer,
                        gpPerHr,
                        costPer,
                        revenuePer,
                        productId: recipe.productId,
                        limit: recipe.limit,
                        notes: recipe.notes,
                    };
                }).filter(p => p.costPer > 0 && p.revenuePer > 0);
                const sortedProfits = profits.sort((a, b) => b.profitPer - a.profitPer);
                return c.json({ success: true, data: sortedProfits });
            } catch (error) {
                console.error(`[WORKER ERROR] ${path}:`, error);
                return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
            }
        });
    };
    // Smithing
    createSkillProfitRoute('/api/smithing/profits', [
        { name: "Iron Bar (BF)", materials: [{ id: 440, qty: 1 }, { id: 453, qty: 1 }], productId: 2351, actionsPerHr: 4000, limit: 10000, notes: "Blast Furnace, Lvl 15" },
        { name: "Steel Bar (BF)", materials: [{ id: 440, qty: 1 }, { id: 453, qty: 2 }], productId: 2353, actionsPerHr: 2500, limit: 10000, notes: "Blast Furnace, Lvl 30" },
        { name: "Mithril Bar (BF)", materials: [{ id: 447, qty: 1 }, { id: 453, qty: 4 }], productId: 2359, actionsPerHr: 2500, limit: 10000, notes: "Blast Furnace, Lvl 50" },
        { name: "Adamantite Bar (BF)", materials: [{ id: 449, qty: 1 }, { id: 453, qty: 6 }], productId: 2361, actionsPerHr: 2500, limit: 10000, notes: "Blast Furnace, Lvl 70" },
        { name: "Runite Bar (BF)", materials: [{ id: 451, qty: 1 }, { id: 453, qty: 8 }], productId: 2363, actionsPerHr: 2500, limit: 10000, notes: "Blast Furnace, Lvl 85" },
    ]);
    // Fletching
    createSkillProfitRoute('/api/fletching/profits', [
        { name: "Maple Longbow (u)", materials: [{ id: 1517, qty: 1 }], productId: 56, actionsPerHr: 1500, limit: 10000, notes: "Lvl 55 Fletching" },
        { name: "Yew Longbow (u)", materials: [{ id: 1515, qty: 1 }], productId: 58, actionsPerHr: 1500, limit: 10000, notes: "Lvl 70 Fletching" },
        { name: "Magic Longbow (u)", materials: [{ id: 1513, qty: 1 }], productId: 60, actionsPerHr: 1500, limit: 10000, notes: "Lvl 85 Fletching" },
        { name: "Mithril Dart", materials: [{ id: 819, qty: 1 }, { id: 314, qty: 1 }], productId: 810, actionsPerHr: 18000, limit: 20000, notes: "Lvl 52 Fletching, makes 10" },
        { name: "Adamant Dart", materials: [{ id: 820, qty: 1 }, { id: 314, qty: 1 }], productId: 811, actionsPerHr: 18000, limit: 20000, notes: "Lvl 67 Fletching, makes 10" },
    ]);
    // Runecrafting
    createSkillProfitRoute('/api/runecrafting/profits', [
        { name: "Cosmic Rune", materials: [{ id: 1436, qty: 1 }], productId: 564, actionsPerHr: 1200, limit: 20000, notes: "Abyss, Lvl 27" },
        { name: "Nature Rune", materials: [{ id: 1436, qty: 1 }], productId: 561, actionsPerHr: 1200, limit: 20000, notes: "Abyss, Lvl 44" },
        { name: "Law Rune", materials: [{ id: 1436, qty: 1 }], productId: 563, actionsPerHr: 1200, limit: 20000, notes: "Abyss, Lvl 54" },
        { name: "Death Rune", materials: [{ id: 1436, qty: 1 }], productId: 560, actionsPerHr: 1200, limit: 20000, notes: "Abyss, Lvl 65" },
        { name: "Blood Rune", materials: [{ id: 7936, qty: 1 }], productId: 565, actionsPerHr: 1800, limit: 20000, notes: "Zeah, Lvl 77" },
    ]);
    // Cooking
    createSkillProfitRoute('/api/cooking/profits', [
        { name: "Cooked Karambwan", materials: [{ id: 3142, qty: 1 }], productId: 3144, actionsPerHr: 1400, limit: 15000, notes: "Lvl 30 Cooking, Hosidius Range" },
        { name: "Cooked Shark", materials: [{ id: 383, qty: 1 }], productId: 385, actionsPerHr: 1200, limit: 15000, notes: "Lvl 80 Cooking, Hosidius Range" },
        { name: "Cooked Anglerfish", materials: [{ id: 13439, qty: 1 }], productId: 13441, actionsPerHr: 1200, limit: 15000, notes: "Lvl 84 Cooking, Hosidius Range" },
        { name: "Cooked Dark Crab", materials: [{ id: 11934, qty: 1 }], productId: 11936, actionsPerHr: 1200, limit: 15000, notes: "Lvl 90 Cooking, Hosidius Range" },
        { name: "Wine of Zamorak", materials: [{ id: 245, qty: 1 }, { id: 1987, qty: 1 }], productId: 247, actionsPerHr: 1800, limit: 10000, notes: "Lvl 65 Cooking" },
    ]);
    // Crafting
    createSkillProfitRoute('/api/crafting/profits', [
        { name: "Unpowered Orb", materials: [{ id: 1775, qty: 1 }], productId: 567, actionsPerHr: 1800, limit: 10000, notes: "Lvl 46 Crafting" },
        { name: "Amethyst Bolt Tips", materials: [{ id: 21347, qty: 1 }], productId: 21338, actionsPerHr: 1500, limit: 20000, notes: "Lvl 83 Crafting, makes 15" },
        { name: "Gold Amulet (u)", materials: [{ id: 2357, qty: 1 }, { id: 1692, qty: 1 }], productId: 1673, actionsPerHr: 1500, limit: 10000, notes: "Lvl 8 Crafting" },
        { name: "Sapphire Ring", materials: [{ id: 2357, qty: 1 }, { id: 1607, qty: 1 }], productId: 1637, actionsPerHr: 1500, limit: 10000, notes: "Lvl 20 Crafting" },
        { name: "Diamond Amulet (u)", materials: [{ id: 2357, qty: 1 }, { id: 1698, qty: 1 }], productId: 1681, actionsPerHr: 1500, limit: 10000, notes: "Lvl 70 Crafting" },
    ]);
}