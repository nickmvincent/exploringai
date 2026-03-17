---
visibility: public
type: readme
title: Exploring AI: Data Napkin Math
---
This readme describes the structure of data as markdown files here.

There are now five content-object subdirs: inputs, scenarios, blogs, key-papers, and asks.

These subdirs can also have subdirs for human convenience. The actual category data should still live in
markdown frontmatter because the collection loader does not infer semantics from folder names.

For `inputs`, the main citation and evidence fields now include:

- `source_url`: the main source page or document; this may be `null` only for `assumption` or `heuristic` inputs that do not claim an external source
- `sourceName`: short human-readable source label
- `sourceNote`: quick summary of the claim
- `sourceLocator`: where to look inside the source, such as a section name, table, figure, or page hint
- `sourceLocatorUrl`: optional deep link to the exact citation location
- `sourceExcerpt`: a short verification-ready excerpt or tight paraphrase of the cited claim
- `derivationNote`: optional note for values that sum, divide, or otherwise derive from source figures
- `sourceQuality`: evidence type, such as `official`, `primary`, `reported`, `industry`, `heuristic`, or `assumption`
- `confidence`: a 0-1 confidence score for the chosen value

Inputs can also optionally define a `comparisonImage` object in frontmatter when a card should render a small comparison graphic. Supported fields are `src`, `alt`, `caption`, `href`, and `label`.

Inputs can also define `referenceCharts` when an explainer would benefit from expandable bar-chart reference points. Each chart takes a `title`, optional `description`, optional `scale` (`linear` or `log`), and a `bars` array. Each bar supports `label`, `value`, and optional `displayValue`, `note`, and `highlight`.

Inputs can optionally point back to `source_key_papers` when a paper, filing, or tracker in
`content/key-papers/` is the source behind an input value.

## Inputs

Inputs live in `content/inputs/`. The filename stem is the canonical input id, so contributors can omit `variable_name` unless they want the extra explicitness. Example:

```yaml
---
title: "Average words per token"
value: 0.75
display_units: words per token
variable_type: training_detail
entity: openai
units: words_per_token
visibility: public
type: InputVariable
---
```

Example with visual reference points:

```yaml
referenceCharts:
  - title: "How this compares"
    description: "Useful order-of-magnitude reference points."
    scale: log
    bars:
      - label: "20-book personal library"
        value: 2133333
        displayValue: "~2.1M tokens"
      - label: "Llama 3 pretraining corpus"
        value: 15000000000000
        displayValue: "15T tokens"
        highlight: true
```

## Scenarios

Scenarios live in `content/scenarios/` and now use one `formula` field rather than separate `input_variables` and JSON `operations`. Input references use `{input_tokens}`. Example:

```yaml
---
title: "Distributing AI Company Revenue Broadly"
description: "If we distribute AI revenue ..."
formula: >-
  {yearly_revenue__openai__dollars} / {group_size__world__people}
result_label: Per Person Revenue
result_units: dollars
category: Distributing money
visibility: public
type: ScenarioCalculation
---
```

## Blogs

Blogs live in `content/blogs/`. Use them for short essays, working notes, and interpretive posts that tie
multiple inputs or scenarios together. The frontmatter carries the short excerpt and status that the site can
show in overview cards.

## Key Papers

Key papers live in `content/key-papers/`. This collection is broader than peer-reviewed papers: it can also
hold primary-source legal filings, trackers, and policy essays when they are important source documents for
the project. Each entry should include:

- one primary link in `source_url` or `links`
- a very short `relevance` note
- a short `key_inputs` list for the metrics, benchmarks, or disclosures the source can feed

## Asks

Asks live in `content/asks/`. Keep them short, concrete, and legible enough to render as standalone list
items on the site.

## Workflow

- `npm --prefix website run new:input` scaffolds a new input file.
- `npm --prefix website run new:scenario` scaffolds a new scenario file.
- `npm --prefix website run content:check` validates ids, formulas, units, categories, and cross-file references.
- `npm --prefix website run verify:citations -- --strict` validates citation coverage and distinguishes externally sourced inputs from documented assumptions and heuristics.
- `npm --prefix website run build` runs both the citation check and the content checks automatically before building the site.
- The in-browser open-ended scenario builder can draft a saved scenario and copy markdown for a new file in `content/scenarios/`.
