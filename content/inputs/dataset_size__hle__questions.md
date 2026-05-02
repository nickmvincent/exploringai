---
title: Total public questions (Humanity's Last Exam)
value: 2500
scale: 1
display_units: questions
variable_name: dataset_size__hle__questions
variable_type: dataset_size
entity: hle
units: questions
source_url: 'https://scale.com/leaderboard/humanitys_last_exam'
summary: "The number of public benchmark questions in Humanity's Last Exam."
sourceName: "Scale AI Humanity's Last Exam leaderboard"
sourceNote: "Scale's April 3, 2025 update says HLE was finalized to 2,500 questions."
sourceLocator: "April 3, 2025 update and Dataset Design section"
sourceLocatorUrl: 'https://scale.com/leaderboard/humanitys_last_exam'
sourceExcerpt: "Scale says HLE was finalized to 2,500 questions."
sourceQuality: "first-party-report"
lastReviewed: "2026-05-02"
mainExampleForCategory: false
min: 0
step: 10
referenceCharts:
  - title: "How big is a 2,500-question benchmark?"
    description: "One way to picture this scale is to imagine how many carefully written questions a team of experts would need to contribute."
    scale: log
    bars:
      - label: "One expert"
        value: 25
        displayValue: "25 questions"
        note: "If one contributor writes about 25 strong questions."
      - label: "Small expert cohort"
        value: 250
        displayValue: "250 questions"
        note: "Roughly 10 experts at 25 questions each."
      - label: "HLE public benchmark"
        value: 2500
        displayValue: "2,500 questions"
        note: "Roughly 100 experts at 25 questions each."
        highlight: true
source_key_papers:
  - humanitys-last-exam
date_added: '2025-03-19T00:00:00.000Z'
tags:
  - variable-type:dataset-size
  - entity:hle
  - unit:questions
visibility: public
type: InputVariable
---

# Total public questions (Humanity's Last Exam)

**Value:** 2,500 questions

## Description

The number of public benchmark questions in Humanity's Last Exam.

## Key Assumption

This uses the finalized public benchmark size rather than including private holdout questions.

## Source

- [https://scale.com/leaderboard/humanitys_last_exam](https://scale.com/leaderboard/humanitys_last_exam)
- Scale's April 3, 2025 update says HLE was finalized to 2,500 questions.
