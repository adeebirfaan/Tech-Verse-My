# Tech Verse My

A curated showcase platform for local Malaysian-made apps and websites. Built with Next.js (App Router), Tailwind CSS v4, and Framer Motion. This project is configured to statically export, making it perfect for rapid deployment to Cloudflare Pages.

## Core Stack

- **Next.js (App Router, Static Export)**
- **Tailwind CSS v4** (using `@theme`)
- **Framer Motion** for smooth, futuristic micro-interactions
- **Lucide React** for dynamic icons
- **next-themes** for persistent dark/light modes

## Run Locally

Make sure you have Node installed, then:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` to see the site.

## How to Edit Product Data

All products are statically sourced from `src/data/products.ts`.
You can easily add, update, or remove entries there.

- Use local image paths (e.g., `/logos/image.png`) in the `logo` field.
- If a logo is empty string (`""`), the application gracefully falls back to showing a nice badge with the product's initials.
- Ensure type is set to either `'App'` or `'Website'`.
- You can add anything to the `category` property - the filter buttons on the home page will automatically generate unique chips based on these values.

## Where to Place Logos

Place all your `.png`, `.jpg`, `.svg` logos in the `public/logos/` directory.

## How to Build

To verify everything compiles properly:
```bash
npm run build
```
This command will create an `out/` directory with pure statically rendered HTML/CSS/JS.

## Deploying to Cloudflare Pages

This application is deployment-ready for Cloudflare Pages. 

### Method 1: Using the Cloudflare Dashboard (Recommended)
1. Push this repository to GitHub/GitLab.
2. Go to your Cloudflare Dashboard -> Pages -> "Connect to Git".
3. Select this repository.
4. Set Build Settings:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `npx @cloudflare/next-on-pages@1` OR `npm run build` (if purely static, stick to `npm run build`)
   - Build output directory: `out`
5. Click "Save and Deploy".

### Method 2: Wrangler CLI
If you prefer CLI deployments without Git connections:
```bash
npx wrangler pages deploy out
```
