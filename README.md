# exploringai

Standalone home for the ExploringAI "data napkin math" content and website.

This repository is the source of truth for both the markdown content and the Astro site. You can edit, run, and build the project directly from this repo without using Extenote.

## Repository Structure

- `content/` markdown inputs and scenarios used by the site
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

The built site is written to `website/dist/`.

To preview the production build locally:

```bash
npm --prefix website run preview
```

If you prefer, you can also `cd website` and run the same `npm` commands there.

## Editing Content

- Update `content/inputs/` for input definitions.
- Update `content/scenarios/` for scenario pages and calculations.
- Update `website/src/` for site UI or rendering changes.

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
3. Run `npm --prefix website run build` to verify the site still builds.
4. Open a pull request with a clear summary of what changed and why.

If your PR addresses an existing issue, link it in the pull request description.
