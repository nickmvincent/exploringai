---
title: Share of C4 tokens covered by restrictive Terms of Service
value: 45
scale: 1
display_units: percent of C4 tokens
variable_name: dataset_attribute__c4__ai_restricted_percent
variable_type: dataset_attribute
entity: c4
units: percent
source_url: 'https://arxiv.org/abs/2407.14933'
summary: "Estimated share of C4 tokens whose source domains' Terms of Service contained at least one data-use restriction as of April 2024."
sourceName: "Consent in Crisis"
sourceNote: "Longpre et al. estimate that nearly 45% of C4 tokens come from domains whose Terms of Service contain some form of data-use restriction. This is distinct from their robots.txt estimates."
sourceLocator: "C4 Terms of Service restriction analysis"
sourceExcerpt: "The paper estimates that nearly 45% of C4 tokens carry some form of restriction in source-domain Terms of Service."
source_key_papers:
  - empirical/consent-in-crisis
sourceQuality: "third-party-report"
lastReviewed: "2026-07-09"
mainExampleForCategory: false
min: 0
max: 100
step: 1
date_added: '2026-03-11T00:00:00.000Z'
tags:
  - variable-type:dataset-attribute
  - entity:c4
  - unit:percent
visibility: public
type: InputVariable
---

# Share of C4 tokens covered by restrictive Terms of Service

**Value:** 45 percent of C4 tokens

## Description

Estimated share of C4 tokens whose source domains' Terms of Service contained at least one data-use restriction as of April 2024.

## Key Assumption

This Terms-of-Service measure is distinct from the paper's robots.txt estimates, which are roughly 5% of all C4 tokens fully restricted and more than 28% in the actively maintained head.

## Source

- [https://arxiv.org/abs/2407.14933](https://arxiv.org/abs/2407.14933)
- Consent in Crisis estimates that nearly 45% of C4 tokens come from domains with some form of data-use restriction in their Terms of Service.
