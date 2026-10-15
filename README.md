# BUY NEST — Phase 1 Landing Page

A Next.js App Router + TypeScript + Tailwind CSS v4 + Lucide React starter. Product records and category images are loaded from the live DummyJSON API on the server.

## Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The development server needs internet access to fetch DummyJSON products and serve remote product images.

## Files

- `app/page.tsx` — Server Component landing page (one API fetch).
- `app/loading.tsx` — loading skeleton.
- `app/error.tsx` — Client Component error boundary and retry.
- `components/Header.tsx` — responsive navigation with native mobile `<details>` menu.
- `components/Hero.tsx` — dynamic hero collage.
- `components/CategoryCard.tsx` — category links derived from the fetched products.
- `components/ProductCard.tsx` — featured product card.
- `components/Footer.tsx` — footer.
- `lib/products.ts` — fetch layer with 1-hour revalidation.
- `lib/format.ts` — currency and category label formatting.
- `types/product.ts` — TypeScript API model.
- `next.config.ts` — allows optimized images from cdn.dummyjson.com.

## Scope (intentional)

This phase only creates the landing page. Links to `/products`, `/products/[id]`, `/login`, `/register`, `/cart` and `/wishlist` point to routes that will be built in later phases. They currently show 404; this is expected.

DummyJSON reports prices in USD, so the UI displays USD; do not add a rupee sign without a conversion or deliberate mock pricing.

## Next phase

Add registration and login forms. Then create a shared `/products` listing and dynamic `/products/[id]` detail page, plus cart, wishlist, checkout and shipping.
