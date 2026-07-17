---
title: Total pre-training tokens (Llama 3)
value: 15000000000000
scale: 1000000000
display_units: billions of tokens
variable_name: dataset_size__llama3__tokens
variable_type: dataset_size
entity: llama3
units: tokens
source_url: 'https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md'
summary: "Conservative lower-bound benchmark from Meta's disclosure that Llama 3 was pretrained on more than 15 trillion tokens."
sourceName: "Meta Llama 3 model card"
sourceNote: "Meta reports that Llama 3 was pretrained on more than 15 trillion tokens; this input stores 15T as a conservative floor."
sourceLocator: "Model card training-data overview"
sourceLocatorUrl: 'https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md'
sourceExcerpt: "The Llama 3 model card says the model was pretrained on over 15T tokens."
sourceQuality: "first-party-report"
lastReviewed: "2026-07-09"
mainExampleForCategory: true
min: 0
step: 100
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
        note: "A recent open-model reference point."
      - label: "Llama 3 pretraining corpus"
        value: 15000000000000
        displayValue: "15T tokens"
        note: "The current input."
        highlight: true
date_added: '2025-03-19T00:00:00.000Z'
tags:
  - variable-type:dataset-size
  - entity:llama3
  - unit:tokens
visibility: public
type: InputVariable
---

# Total pre-training tokens (Llama 3)

**Value:** 15,000 billions of tokens

## Description

Conservative lower-bound benchmark from Meta's Llama 3 disclosure.

## Key Assumption

Meta says Llama 3 was pretrained on more than 15 trillion tokens. This stores 15T as a conservative floor and does not assume that other model families use the same tokenizer, modalities, languages, or training scale.

## Source

- [https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md](https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md)
- Source is the Llama 3 model card. It describes total number of tokens for pre-training. It is useful.
