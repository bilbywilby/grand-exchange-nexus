# Grand Exchange Nexus

[![Deploy to Cloudflare][cloudflarebutton]]

A premium, visually immersive interface for the Old School RuneScape (OSRS) Grand Exchange. This application provides a comprehensive item database and price analytics tool, leveraging the official OSRS Grand Exchange API. Transform raw JSON data into an immersive, game-authentic yet modern UI with a 'Dark Fantasy' aesthetic—deep slate backgrounds, rune-gold accents, glassmorphism panels, and crisp typography.

## Features

- **Market Dashboard**: Visually rich grid of major item categories (0-43), global status indicator, and quick access to popular segments.
- **Catalogue Browser**: Split-view for drilling down by category ID, alpha index (A-Z, #), and paginated item grids with current price snapshots.
- **Item Analytics Suite**: High-res item images, metadata (members status, examine text), 30/90/180-day trends, and interactive 180-day price charts powered by Recharts.
- **Responsive Design**: Sidebar + Content layout on desktop; Drawer + Stack on mobile. Flawless across all devices.
- **API Proxy**: Cloudflare Workers handle CORS, normalize responses, and cache data via TanStack Query.
- **Visual Excellence**: Hover glows, smooth animations (Framer Motion), skeleton loaders, and OSRS-inspired dark theme.
- **Offline Support**: Local favorites via storage, intelligent caching, graceful empty/error states.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React icons
- **State & Data**: Zustand, TanStack React Query, React Router
- **UI/Animations**: Framer Motion, Recharts (charts), clsx, tailwind-merge
- **Backend/Proxy**: Cloudflare Workers, Hono
- **Utils**: Zod (validation), Sonner (toasts), Immer

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for deployment)

### Installation

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd grand_exchange_nexus
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Run development server:
   ```
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) (or configured port).

## Development

- **Hot Reload**: Changes auto-reload in browser.
- **Linting**: `bun lint`
- **Type Check**: `bun tsc --noEmit`
- **Preview Build**: `bun preview`
- **API Routes**: Add to `worker/userRoutes.ts` for custom endpoints (proxies OSRS API).

**OSRS API Endpoints** (proxied via `/api/ge/*`):
- `/api/ge/info.json` → Database update info
- `/api/ge/catalogue/category.json?category=X` → Alpha counts
- `/api/ge/catalogue/items.json?category=X&alpha=Y&page=Z` → Item list
- `/api/ge/catalogue/detail.json?item=ID` → Item details
- `/api/ge/graph/ID.json` → 180-day price graph

Example: Fetch Death Runes (`alpha=d`, `category=32` for Runes).

## Usage

- **Browse Categories**: Dashboard → Select category (e.g., Weapons: 22-24).
- **Filter & Paginate**: Alpha strip + page controls → Item cards.
- **View Details**: Click item → Analytics with graph, trends, copy price.
- **Favorites**: Add items (local storage, Phase 2).
- **Mobile**: Drawer navigation, touch-optimized.

All data fetched via proxy to bypass CORS.

## Deployment

Deploy to Cloudflare Workers/Pages in one command:

```
bun run deploy
```

Or manually:

1. Build: `bun run build`
2. Deploy: `wrangler deploy`

[![Deploy to Cloudflare][cloudflarebutton]]

**Custom Domain**: Update `wrangler.jsonc` or Wrangler CLI flags.

**Environment Vars**: Set via Wrangler dashboard or `wrangler.toml`.

## API Proxy Details

Cloudflare Worker proxies requests to `https://secure.runescape.com/m=itemdb_oldschool/`:
- Replaces `m=itemdb_rs` → `m=itemdb_oldschool` for OSRS.
- Handles CORS, rate limits, HTTPS image fixes.
- Extend in `worker/userRoutes.ts`.

## Contributing

1. Fork & clone.
2. Create feature branch: `git checkout -b feature/AmazingFeature`.
3. Commit: `git commit -m "feat: add amazing feature"`.
4. Push & PR.

Follow existing code style (ESLint, Prettier via shadcn).

## License

MIT License. See [LICENSE](LICENSE) for details.