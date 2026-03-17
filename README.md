# Exploring AI: Data Napkin Math

Standalone home for the Exploring AI: Data Napkin Math content and website.

This repository is the source of truth for both the markdown content and the Astro site. You can edit, run, and build the project directly from this repo without using Extenote.

## Repository Structure

- `content/` markdown content database for inputs, scenarios, blogs, key papers, and asks
- `website/` Astro app that loads content from `../content` at dev/build time
- `helpers/` shared helper utilities and components

## Build and Run Locally

Prerequisite: a working `node` + `npm` installation.

From the repository root:

```bash
npm --prefix website install
npm --prefix website run dev
```

The local dev server will start on `http://localhost:4321`.

To create a production build:

```bash
npm --prefix website run build
```

The build now runs the strict citation checker before Astro compiles. The built site is written to `website/dist/`.

If you want to run the citation check on its own:

```bash
npm --prefix website run verify:citations -- --strict
```

To preview the production build locally:

```bash
npm --prefix website run preview
```

If you prefer, you can also `cd website` and run the same `npm` commands there.

## Editing Content

- Update `content/inputs/` for input definitions.
- Update `content/scenarios/` for scenario pages and calculations.
- Update `content/blogs/` for short essays and working notes.
- Update `content/key-papers/` for important papers, trackers, and primary-source legal filings.
- Update `content/asks/` for concrete disclosure or policy asks.
- Update `website/src/` for site UI or rendering changes.
- Run `npm --prefix website run content:check` to validate ids, formulas, categories, units, and cross-references.

### Contributor Helpers

To scaffold new content instead of copying an existing file by hand:

```bash
npm --prefix website run new:input
npm --prefix website run new:scenario
```

The input helper derives the file id from `variable_type + entity + units`, so new inputs do not need a repeated `variable_name` unless you want to keep it explicit.

Scenarios now use a single `formula` field with `{input_tokens}` instead of duplicated `input_variables` and JSON `operations`. Example:

```yaml
formula: >-
  {yearly_revenue__openai__dollars} / {group_size__world__people}
```

You can also draft a scenario in the app itself: start the dev server, scroll to the open-ended scenario builder on the Scenarios page, fill in the title/description/category/formula fields, and use `Copy Scenario Markdown` to generate a file you can save under `content/scenarios/<slug>.md`.

`npm --prefix website run build` now runs `content:check` automatically before the Astro build, so the normal build path also validates content.

Because the Astro site reads directly from `content/`, changes made in this repo show up in local development and production builds without any separate sync step.

## Contributing

Contributions are welcome through GitHub issues and pull requests.

### Opening an Issue

Open an issue for bugs, content corrections, feature ideas, or questions about calculations. Helpful issues usually include:

- a short summary of the problem or proposal
- links to the relevant page, scenario, or content file
- expected behavior and what you saw instead
- screenshots or examples when the change affects the site UI

### Opening a Pull Request

For code or content changes:

1. Create a branch from the latest default branch.
2. Make your changes in `content/`, `website/`, or both.
3. Run `npm --prefix website run content:check` or `npm --prefix website run build`. The normal build now runs citation checks, content validation, and the Astro build in one step.
4. Run `npm --prefix website run build` if you did not already do so in step 3.
5. Open a pull request with a clear summary of what changed and why.

If your PR addresses an existing issue, link it in the pull request description.

## Deployments

This repo uses two deployment paths:

- GitHub Pages for the stable site at `https://exploringai.org`
- manual Cloudflare Pages deploys for the dev site via Wrangler

### GitHub Pages Promotion

GitHub Pages stays stable until you explicitly promote a ref with the `Promote GitHub Pages` workflow in GitHub Actions.

- Open the workflow named `Promote GitHub Pages`
- Enter the ref you want to publish, such as `main` or a specific commit SHA
- Run the workflow

The workflow builds `website/dist/` and updates the existing `gh-pages` branch with that output.

In GitHub repository settings, keep Pages configured to deploy from the `gh-pages` branch at the repository root.

### Manual Cloudflare Pages Deploys

Cloudflare deploys are manual and use Wrangler from the `website/` directory.

1. Authenticate once if needed:
   `npm --prefix website exec wrangler login`
2. Build the dev site with the dev URL:
   `SITE_URL=https://dev.exploringai.org npm --prefix website run build:dev`
3. Deploy the generated `website/dist/` output:
   `npm --prefix website run cf:deploy`

The Cloudflare Pages project name comes from [website/wrangler.jsonc](/Users/nmvg/projects/exploringai/website/wrangler.jsonc), which is currently set to `exploringai-dev`.
