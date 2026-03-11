# Exploring AI: Data Napkin Math - Astro Site

An Astro + Vue site for interactive "napkin math" calculations about training data value.

## Content Source

This site loads content directly from:
```
../content/
├── inputs/      # Input variable definitions (26 files)
└── scenarios/   # Calculation scenarios (4 files)
```

## Project Structure

```
├── src/
│   ├── components/
│   │   └── NapkinApp.vue      # Main interactive Vue component
│   ├── layouts/
│   │   └── Layout.astro       # Base HTML layout
│   ├── lib/
│   │   └── calculations.ts    # Calculation logic & formatters
│   ├── pages/
│   │   └── index.astro        # Main page (loads content collections)
│   ├── styles/
│   │   └── global.css         # All styles
│   └── content.config.ts      # Astro content collection schemas
├── astro.config.mjs
└── package.json
```

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start dev server at `localhost:4321`        |
| `npm run build`   | Build production site to `./dist/`          |
| `npm run build:stable` | Build the stable GitHub Pages version      |
| `SITE_URL=https://dev.exploringai.org npm run build:dev` | Build the Cloudflare dev version |
| `npm run preview` | Preview production build locally            |
| `npm run cf:dev`  | Serve the built site through Cloudflare Pages locally |
| `npm run cf:deploy` | Deploy `./dist/` to Cloudflare Pages with Wrangler |

## How It Works

1. **Astro Content Collections** read the markdown files at build time
2. **Frontmatter** in each markdown file defines the data (values, units, formulas)
3. **Vue component** (`NapkinApp.vue`) handles all client-side interactivity
4. The page is statically generated but hydrates Vue for interactive calculations

## Editing Content

To add/edit inputs or scenarios, modify the markdown files in:
```
../content/inputs/
../content/scenarios/
```

See existing files for the expected frontmatter format.

## Deploy Targets

- GitHub Pages stable builds use `SITE_URL=https://exploringai.org`
- Cloudflare dev builds should set `SITE_URL` to the dev domain and `PUBLIC_ALLOW_INDEXING=false`
- Manual Cloudflare deploys use the Pages project configured in `wrangler.jsonc` (`exploringai-dev`)
- Run `npm exec wrangler login` once before using Wrangler locally

The repository root README documents the GitHub Pages promotion workflow and the manual Cloudflare deploy flow.
