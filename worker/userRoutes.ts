import { Hono } from "hono";
import { Env } from './core-utils';
const OSRS_BASE_URL = "https://secure.runescape.com/m=itemdb_oldschool/api";
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
        } catch (error) {
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
}