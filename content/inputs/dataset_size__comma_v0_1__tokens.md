---
title: Main-stage source-pool tokens (Comma v0.1)
value: 463600000000
scale: 1000000000
display_units: billions of raw tokens
variable_name: dataset_size__comma_v0_1__tokens
variable_type: dataset_size
entity: comma_v0_1
units: tokens
source_url: 'https://huggingface.co/datasets/common-pile/comma_v0.1_training_dataset'
summary: "Raw-token count in the Comma v0.1 main-stage source pool; the cooldown pool is a subset and is not added again."
sourceName: "Comma v0.1 training dataset card"
sourceNote: "The dataset card lists 463.6B raw tokens in the main-stage source pool. The 176.2B-token cooldown sources are a subset, so adding the two would double-count overlapping text."
sourceLocator: "Dataset card table of raw token counts by training stage"
sourceLocatorUrl: 'https://huggingface.co/datasets/common-pile/comma_v0.1_training_dataset'
sourceExcerpt: "The dataset card lists 463.6B raw tokens for the main stage and 176.2B raw tokens for the cooldown stage."
derivationNote: "This input stores the main-stage source-pool total and does not add the overlapping cooldown subset."
sourceQuality: "first-party-report"
lastReviewed: "2026-07-09"
mainExampleForCategory: false
min: 0
step: 1
date_added: '2026-03-11T19:19:59.000Z'
tags:
  - variable-type:dataset-size
  - entity:comma-v0.1
  - unit:tokens
visibility: public
type: InputVariable
---

# Main-stage source-pool tokens (Comma v0.1)

**Value:** 463.6 billions of raw tokens

## Description

Raw-token count in the published main-stage source pool.

## Key Assumption

The cooldown sources are a subset of the main-stage sources, so this stores the 463.6B-token main pool without adding the overlapping 176.2B-token cooldown pool.

## Source

- [https://huggingface.co/datasets/common-pile/comma_v0.1_training_dataset](https://huggingface.co/datasets/common-pile/comma_v0.1_training_dataset)
- The dataset card lists 463.6B raw tokens for the main stage and 176.2B raw tokens for the cooldown stage.
