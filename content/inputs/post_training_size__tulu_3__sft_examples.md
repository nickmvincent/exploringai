---
title: Post-training SFT examples (Tulu 3)
value: 939344
scale: 1
display_units: examples
variable_name: post_training_size__tulu_3__sft_examples
variable_type: post_training_size
entity: tulu_3
units: examples
source_url: 'https://huggingface.co/datasets/allenai/tulu-3-sft-mixture'
summary: "Number of supervised fine-tuning examples in the public Tulu 3 SFT mixture."
importanceRank: 24
importanceReason: "A public supervised fine-tuning benchmark helps make post-training scale less mysterious."
sourceName: "Tulu 3 SFT mixture card"
sourceNote: "The released Tulu 3 SFT mixture contains 939,344 examples."
sourceLocator: "Dataset card mixture summary table"
sourceLocatorUrl: 'https://huggingface.co/datasets/allenai/tulu-3-sft-mixture'
sourceExcerpt: "The Tulu 3 SFT mixture card reports 939,344 supervised fine-tuning samples."
sourceQuality: "official"
confidence: 0.95
lastReviewed: "2026-03-10"
featured: false
min: 0
step: 100
referenceCharts:
  - title: "What does 939k SFT examples feel like?"
    description: "Post-training datasets jump in size quickly, so these references give a rough sense for the orders of magnitude involved."
    scale: log
    bars:
      - label: "Starter SFT run"
        value: 500
        displayValue: "500 examples"
        note: "A tiny but usable supervised fine-tune."
      - label: "Strong small dataset"
        value: 10000
        displayValue: "10k examples"
        note: "Enough to feel substantial in many internal workflows."
      - label: "Tulu 3 SFT mixture"
        value: 939344
        displayValue: "939,344 examples"
        note: "The current input."
        highlight: true
date_added: '2026-03-10T00:00:00.000Z'
tags:
  - variable-type:post-training-size
  - entity:tulu-3
  - unit:examples
visibility: public
type: InputVariable
---

# Post-training SFT examples (Tulu 3)

**Value:** 939,344 examples

## Description

Number of supervised fine-tuning examples in the public Tulu 3 SFT mixture.

## Key Assumption

Uses the released Tulu 3 SFT mixture as a public benchmark for post-training data scale.

## Source

- [https://huggingface.co/datasets/allenai/tulu-3-sft-mixture](https://huggingface.co/datasets/allenai/tulu-3-sft-mixture)
- The dataset card reports 939,344 supervised fine-tuning samples.
