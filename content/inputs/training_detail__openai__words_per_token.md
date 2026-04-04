---
title: Average words per token
value: 0.75
scale: 1
display_units: words per token
variable_name: training_detail__openai__words_per_token
variable_type: training_detail
entity: openai
units: words_per_token
source_url: 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-do-i-count-them'
summary: "A rule-of-thumb conversion between English words and tokens."
sourceName: "OpenAI Help Center"
sourceNote: "OpenAI's English rule of thumb is that one token is about three-quarters of a word."
sourceLocator: "Help Center explanation of token-to-word conversion"
sourceLocatorUrl: 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-do-i-count-them'
sourceExcerpt: "OpenAI says one token corresponds to roughly three-quarters of a word in English."
sourceQuality: "first-party-report"
lastReviewed: "2026-03-10"
mainExampleForCategory: true
min: 0
step: 0.001
date_added: '2025-03-19T00:00:00.000Z'
tags:
  - variable-type:training-detail
  - entity:openai
  - unit:words-per-token
visibility: public
type: InputVariable
---

# Average words per token

**Value:** 0.75 words per token

## Description

A rule-of-thumb conversion between English words and tokens.

## Key Assumption

This benchmark is language-dependent and is most appropriate for English text.

## Source

- [https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-do-i-count-them](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-do-i-count-them)
- OpenAI explains that one token is commonly about three-quarters of an English word.
