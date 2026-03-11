---
title: Approximate token count of Books3 plus Gutenberg
value: 30000000000
scale: 1000000000
display_units: billions of tokens
variable_name: dataset_size__books3_plus_gutenberg__tokens
variable_type: dataset_size
entity: books3_plus_gutenberg
units: tokens
source_url: 'https://storage.courtlistener.com/recap/gov.uscourts.cand.415175/gov.uscourts.cand.415175.449.4.pdf'
summary: "Internal Meta comparison point for the size of a book-heavy corpus."
importanceRank: 19
importanceReason: "Puts one prominent books corpus on the same token scale as other pretraining inputs."
sourceName: "Kadrey v. Meta Exhibit C"
sourceNote: "An unsealed February 28, 2023 Meta email says Books3 plus Gutenberg is about 30B tokens."
source_key_papers:
  - legal/kadrey-meta-exhibit-c-books-acquisition-emails
sourceQuality: "primary"
confidence: 0.88
lastReviewed: "2026-03-11"
featured: false
min: 0
step: 1
date_added: '2026-03-11T00:00:00.000Z'
tags:
  - variable-type:dataset-size
  - entity:books3-plus-gutenberg
  - unit:tokens
visibility: public
type: InputVariable
---

# Approximate token count of Books3 plus Gutenberg

**Value:** 30 billions of tokens

## Description

Internal Meta comparison point for the size of a book-heavy corpus.

## Key Assumption

This uses an internal email estimate as an approximate benchmark rather than a formally published dataset card.

## Source

- [https://storage.courtlistener.com/recap/gov.uscourts.cand.415175/gov.uscourts.cand.415175.449.4.pdf](https://storage.courtlistener.com/recap/gov.uscourts.cand.415175/gov.uscourts.cand.415175.449.4.pdf)
- The unsealed exhibit includes a Meta employee note that Books3 plus Gutenberg is about 30B tokens.
