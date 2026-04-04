---
title: Total pretraining tokens (OLMo 3 7B)
value: 5930000000000
scale: 1000000000
display_units: billions of tokens
variable_name: dataset_size__olmo3__tokens
variable_type: dataset_size
entity: olmo3
units: tokens
source_url: 'https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025-7B'
summary: "Approximate number of tokens used in the released OLMo 3 7B pretraining mix."
sourceName: "AllenAI Dolma 3 mix card"
sourceNote: "AllenAI reports a 5.93T-token mix for the released OLMo 3 7B recipe."
sourceLocator: "Dataset card summary for the released OLMo 3 7B mix"
sourceLocatorUrl: 'https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025-7B'
sourceExcerpt: "The Dolma 3 mix card reports a 5.93T-token recipe for the released OLMo 3 7B model."
sourceQuality: "first-party-report"
lastReviewed: "2026-03-10"
mainExampleForCategory: true
min: 0
step: 10
referenceCharts:
  - title: "From a home shelf to frontier pretraining"
    description: "Approximate token volume, using 80k words per book and 0.75 words per token for the book-based reference points."
    scale: log
    bars:
      - label: "20-book personal library"
        value: 2133333
        displayValue: "~2.1M tokens"
        note: "About 20 average books."
      - label: "Books3 at average-book length"
        value: 20974933333
        displayValue: "~21B tokens"
        note: "196,640 books converted with the site's book-length assumptions."
      - label: "OLMo 3 7B pretraining mix"
        value: 5930000000000
        displayValue: "5.93T tokens"
        note: "The current input."
        highlight: true
      - label: "Llama 3 pretraining corpus"
        value: 15000000000000
        displayValue: "15T tokens"
        note: "A larger public frontier benchmark."
date_added: '2026-03-10T00:00:00.000Z'
tags:
  - variable-type:dataset-size
  - entity:olmo3
  - unit:tokens
visibility: public
type: InputVariable
---

# Total pretraining tokens (OLMo 3 7B)

**Value:** 5,930 billions of tokens

## Description

Approximate number of tokens used in the released OLMo 3 7B pretraining mix.

## Key Assumption

Uses the published 5.93T-token Dolma 3 mix as the best public proxy for OLMo 3's pretraining corpus.

## Source

- [https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025-7B](https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025-7B)
- The Dolma 3 7B training mix card reports a total of 5.93 trillion tokens.
