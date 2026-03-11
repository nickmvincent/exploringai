---
title: Data Napkin Math TODO
type: scratchpad
visibility: private
---

# Data Napkin Math TODO

## New Inputs to Research and Add

### Recent Data Deals (2024-2025)
- [ ] OpenAI-News Corp deal value and terms
- [ ] OpenAI-Axel Springer deal value
- [ ] Google-Reddit deal (update if newer figures available)
- [ ] Perplexity licensing deals
- [ ] Apple Intelligence data partnerships
- [ ] X/Twitter data licensing revenue
- [ ] Stack Overflow-OpenAI terms (if disclosed)

### AI Company Financials
- [ ] OpenAI 2024 revenue (update from $3.4B projection)
- [ ] Anthropic 2024 revenue estimates
- [ ] Google AI/Gemini revenue breakdown
- [ ] Microsoft Copilot revenue
- [ ] Meta AI infrastructure spending

### Dataset Metrics
- [ ] Llama 3.1 training data size
- [ ] GPT-4 estimated training tokens
- [ ] Claude training data estimates
- [ ] Common Crawl 2024 size
- [ ] The Stack v2 statistics
- [ ] FineWeb dataset size

### Labor/Compensation Benchmarks
- [ ] RLHF labeler wages (Sama, Scale AI, etc.)
- [ ] Red team contractor rates
- [ ] Academic peer review implicit value
- [ ] Professional writer per-word rates (2024)
- [ ] Freelance data annotation rates

### Platform Statistics
- [ ] Wikipedia monthly active editors (2024)
- [ ] Reddit monthly active users (update)
- [ ] Stack Overflow question/answer counts
- [ ] GitHub public repo statistics
- [ ] arXiv submission rates

## Research Pass (2026-03-11)

### Highest-priority additions
- [ ] Llama 4 Scout total training tokens (~40T) and Llama 4 Maverick total training tokens (~22T). The official model card also reports 5.0M and 2.38M H100-80GB GPU hours and says the training mix included licensed data, publicly shared Facebook and Instagram posts, and Meta AI interactions. Variable ideas: `dataset_size__llama4_scout__tokens`, `dataset_size__llama4_maverick__tokens`, `training_compute__llama4_scout__gpu_hours`, `training_compute__llama4_maverick__gpu_hours`, `training_source__llama4__meta_product_data`. Source: [Meta Llama 4 model card](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md)
- [ ] DeepSeek-V3 training tokens (14.8T) plus a public compute benchmark (2.664M H800 GPU hours for pretraining; 2.788M H800 GPU hours for full training). Variable ideas: `dataset_size__deepseek_v3__tokens`, `training_compute__deepseek_v3__gpu_hours`, `training_compute__deepseek_v3_pretraining__gpu_hours`. Source: [DeepSeek-V3 repository](https://github.com/deepseek-ai/DeepSeek-V3)
- [ ] FineWeb2 corpus scale: 20TB, more than 5B documents, more than 3T words, across 96 Common Crawl snapshots. Variable ideas: `dataset_size__fineweb2__documents`, `dataset_size__fineweb2__words`, `dataset_size__fineweb2__terabytes`. Source: [FineWeb2 dataset card](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [ ] The Stack v2 code corpus scale: about 900B tokens, 67.5TB full size, 32.1TB deduplicated, more than 3B files, and 658 programming languages. Variable ideas: `dataset_size__the_stack_v2__tokens`, `dataset_size__the_stack_v2__files`, `dataset_size__the_stack_v2__terabytes`. Source: [The Stack v2 dataset card](https://huggingface.co/datasets/bigcode/the-stack-v2)
- [ ] Common Pile / Comma v0.1 as an openly licensed baseline for public-AI scenarios. The paper reports an 8TB open corpus across 30 sources, and the training dataset card reports 463.6B main-stage raw tokens plus 176.2B cooldown raw tokens. Variable ideas: `dataset_size__common_pile__terabytes`, `group_size__common_pile__sources`, `dataset_size__comma_v0_1__tokens`. Sources: [Common Pile paper](https://huggingface.co/papers/2506.05209), [Comma v0.1 training dataset card](https://huggingface.co/datasets/common-pile/comma_v0.1_training_dataset)

### Litigation and settlement benchmarks
- [ ] Anthropic pirated-book library counts from the June 23, 2025 `Bartz v. Anthropic` fair-use order: 196,640 Books3 books, at least 5M LibGen books, at least 2M Pirate Library Mirror books, and more than 7M total copied books. Variable ideas: `total_books__books3__books`, `total_books__libgen__books`, `total_books__pirate_library_mirror__books`, `total_books__anthropic_pirated_library__books`. Source: [Order on summary judgment](https://docs.justia.com/cases/federal/district-courts/california/candce/3%3A2024cv05417/434709/231)
- [ ] Anthropic settlement benchmark from the October 17, 2025 preliminary-approval motion: about $1.5B over 482,460 identified works, or roughly $3,100 per work. This may be the cleanest public "implied compensation per book" input available. Variable ideas: `settlement_value__anthropic_books__dollars`, `settlement_group_size__anthropic_books__works`, `settlement_value__anthropic_books__dollars_per_work`. Source: [Memorandum in support of preliminary approval](https://docs.justia.com/cases/federal/district-courts/california/candce/3%3A2024cv05417/434709/437)
- [ ] Meta shadow-library scale from unsealed `Kadrey v. Meta` filings, as reported on February 7, 2025: 81.7TB total from shadow libraries, including 35.7TB from Z-Library and LibGen. This is weaker than the Anthropic items because it is still an allegation, but it is probably worth a lower-confidence `reported` input. Variable ideas: `dataset_size__meta_shadow_library__terabytes`, `dataset_size__zlibrary_libgen__terabytes`. Source: [Ars Technica summary of the unsealed filing](https://arstechnica.com/tech-policy/2025/02/meta-torrented-over-81-7tb-of-pirated-books-to-train-ai-authors-say/)

### Follow-up design note
- [ ] Consider adding a few new variable types alongside the next batch of inputs: `training_compute`, `settlement_value`, `settlement_group_size`, and `dataset_size` benchmarks expressed in terabytes, files, or documents rather than only tokens.

## New Scenarios to Create

### Value Attribution
- [ ] "What is one Wikipedia article worth to an LLM?"
- [ ] "What is one Stack Overflow answer worth?"
- [ ] "Cost to recreate Reddit's training data from scratch"
- [ ] "Implicit hourly wage for content creators whose work trains AI"

### Economic Impact
- [ ] "If AI companies paid royalties like music streaming, how much per query?"
- [ ] "Cost of opt-out infrastructure at scale"
- [ ] "Revenue per token: comparing platforms"
- [ ] "Break-even point for data licensing vs. scraping lawsuits"

### Collective Action
- [ ] "How many users need to opt out to measurably impact model quality?"
- [ ] "Value of coordinated data withdrawal by domain experts"
- [ ] "Minimum viable data cooperative size"

### Public AI Scenarios
- [ ] "Cost to build a national public training corpus"
- [ ] "Per-citizen cost of public AI infrastructure"
- [ ] "Comparison: public AI funding vs. corporate AI R&D"

## Sources to Monitor
- AI company earnings calls and SEC filings
- News Corp, NYT, and publisher financial reports
- Academic papers on data valuation
- OECD/government reports on AI economics
- Industry analyst reports (a]6z, Sequoia)

## Notes
- Prioritize inputs with public, citable sources
- Include date ranges for time-sensitive metrics
- Cross-reference with shared-references bibtex entries where possible
