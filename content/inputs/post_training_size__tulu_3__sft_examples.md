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
summary: "Dataset-card total for the public Tulu 3 SFT mixture; the hosted row counter is currently one lower."
sourceName: "Tulu 3 SFT mixture card"
sourceNote: "The dataset card and listed subset counts report 939,344 samples. Hugging Face's hosted row counter currently reports 939,343, a one-row discrepancy retained here as a source caveat."
sourceLocator: "Dataset card mixture summary table"
sourceLocatorUrl: 'https://huggingface.co/datasets/allenai/tulu-3-sft-mixture'
sourceExcerpt: "The Tulu 3 SFT mixture card reports 939,344 supervised fine-tuning samples."
sourceQuality: "first-party-report"
lastReviewed: "2026-07-09"
mainExampleForCategory: false
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

Dataset-card total for the public Tulu 3 SFT mixture. The hosted row counter currently shows one fewer row.

## Key Assumption

Uses the card's stated total and records the one-row discrepancy with the hosted dataset counter.

## Source

- [https://huggingface.co/datasets/allenai/tulu-3-sft-mixture](https://huggingface.co/datasets/allenai/tulu-3-sft-mixture)
- The dataset card and listed subset counts report 939,344 supervised fine-tuning samples; the hosted row counter currently reports 939,343.
