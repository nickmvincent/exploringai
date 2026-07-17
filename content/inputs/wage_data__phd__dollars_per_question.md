---
title: HLE prize-budget per final public question
value: 200
scale: 1
display_units: dollars per question
variable_name: wage_data__phd__dollars_per_question
variable_type: wage_data
entity: phd
units: dollars_per_question
source_url: 'https://scale.com/leaderboard/humanitys_last_exam'
summary: "Ratio of the $500,000 HLE prize pool to the 2,500-question final public benchmark; not a contributor pay rate or production-cost estimate."
sourceName: "Scale AI Humanity's Last Exam leaderboard"
sourceNote: "A $500k prize pool divided by 2,500 final public questions gives a $200 budget ratio. HLE actually offered $5,000 for each top-50 question and $500 for each next-500 question."
sourceLocator: "April 3, 2025 update and Dataset Design section"
sourceLocatorUrl: 'https://scale.com/leaderboard/humanitys_last_exam'
sourceExcerpt: "HLE offered $5,000 for each top-50 question and $500 for each next-500 question; the final public set contains 2,500 questions."
derivationNote: "This input divides the $500,000 prize pool by 2,500 retained questions to estimate dollars per question."
sourceQuality: "first-party-report"
lastReviewed: "2026-07-09"
mainExampleForCategory: false
min: 0
step: 1
source_key_papers:
  - humanitys-last-exam
date_added: '2025-03-19T00:00:00.000Z'
tags:
  - variable-type:wage-data
  - entity:phd
  - unit:dollars-per-question
visibility: public
type: InputVariable
---

# HLE prize-budget per final public question

**Value:** 200 dollars per question

## Description

A ratio of HLE's prize pool to its final public question count, not an observed contributor wage or complete production-cost estimate.

## Key Assumption

Humanity's Last Exam offered a $500,000 prize pool and produced 2,500 public questions. Dividing those totals gives $200 per final question, but actual prizes were concentrated in the top 550 questions and the ratio excludes review, rejected submissions, organizer labor, adjudication, benefits, and overhead.

## Source

- [https://scale.com/leaderboard/humanitys_last_exam](https://scale.com/leaderboard/humanitys_last_exam)
- Scale reports a $500,000 prize pool, with $5,000 for each top-50 question and $500 for each next-500 question, and a finalized 2,500-question public benchmark.
