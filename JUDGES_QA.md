# SIH Jury & Technical Panel Q&A Guide

### Project: MPLAD AI Risk & Anomaly Intelligence System (SIH26102 - MoSPI)

---

### Q1: Why did you choose a Hybrid approach (Rules + ML) instead of a purely Deep Learning / ML model?
**Answer**:
> *"In government decision support and audit environments, **explainability and legal defensibility are paramount**. 
> - A pure black-box neural network cannot explain why a project received a specific risk score to an inspecting officer.
> - Furthermore, supervised labels for 'corrupt' or 'anomalous' works do not exist in administrative databases, making supervised ML prone to label leakage and bias.
> - Our hybrid architecture combines **transparent, policy-aligned rule heuristics** with an **unsupervised Isolation Forest** algorithm. The rule engine guarantees explainable point contributions (e.g. +30 pts for >100% cost deviation), while the Isolation Forest detects non-obvious multi-dimensional outliers across budget, duration, and transaction frequency vectors."*

---

### Q2: How do you handle data limitations, such as the absence of Work ID in the expenditure dataset?
**Answer**:
> *"We explicitly documented this key real-world limitation during our Phase 1 profiling. The raw expenditure dataset does not have a foreign key to Recommended Works.
> - Rather than forcing inaccurate joins, our pipeline implements a **Deterministic Multi-Tier Matching Engine**:
>   - **Tier 1**: Exact Work ID matching where available (Confidence: 1.0).
>   - **Tier 2**: Composite hashing on `MP Name + Constituency + Normalized Work Description + IDA` (Confidence: 0.90).
>   - **Unlinked Transactions**: Preserved at the constituency/MP aggregation level.
> - Recommended projects without matching completed records are classified as **'Completion Status Requires Verification'** rather than incorrectly marked as delayed or failed."*

---

### Q3: Why is non-accusatory language so critical in this system?
**Answer**:
> *"Government audit guidelines strictly distinguish between a **statistical anomaly** and an **administrative violation**. 
> - A project with +100% cost deviation could be due to an authorized scope expansion (e.g. adding a second floor or extending a pipeline) rather than financial mismanagement.
> - Therefore, our system neutrally flags works as 'Potential Cost Deviation — Review Required' or 'Completion Status Requires Verification'. The AI serves as an intelligence filter to prioritize human inspection, leaving final determinations to authorized statutory authorities."*

---

### Q4: How does your Project Similarity and Peer Benchmarking work?
**Answer**:
> *"When inspecting a project costing ₹80 Lakhs, an officer needs to know if that cost is reasonable for that type of work in that region.
> - Our **Similarity Engine** filters comparable projects in the same sector (e.g. 'Drinking Water Facility') and same state.
> - It calculates the peer median, mean, min, and max.
> - If a project deviates by +220% from its sector peer median, that deviation is flagged as a contributing factor (+10 pts) in the explainable risk scorecard."*

---

### Q5: How do you prevent data leakage in your ML pipeline?
**Answer**:
> *"Our Isolation Forest model is trained strictly on **raw numerical and engineered operational features** (recommended amount, final amount, cost deviation percentage, project duration days, transaction counts, duplicate counts, category deviation) **before** risk scores are calculated.
> - The model is **never trained on the rule-based risk labels or risk scores**, completely eliminating target leakage. The ML anomaly score is then fed into the explainable risk aggregator as an independent confirmation signal (+8 pts boost)."*

---

### Q6: How does the AI Decision-Support Assistant prevent hallucinations?
**Answer**:
> *"Unlike open-ended generative chatbots that invent numbers, our **MoSPI AI Assistant is strictly grounded**:
> - It translates the officer's query into deterministic parameterized SQL queries against our SQLite database.
> - It formats the actual database response and provides clickable citations linking directly to the underlying Project IDs.
> - If information is unavailable, it strictly responds: 'I don't have sufficient data to answer that query', ensuring zero fabrication of government data."*

---

### Q7: How does the system scale to handle national volumes (millions of records over years)?
**Answer**:
> *"1. **Optimized ETL Pipeline**: Vectorized Pandas processing completes normalization and matching of 250,000+ records in under 30 seconds.
> 2. **B-Tree Database Indexing**: Multi-column indices on `(state, risk_level)`, `(constituency, risk_level)`, and `risk_score DESC` enable sub-millisecond API response times.
> 3. **Stateless FastAPI Architecture**: Can be deployed with PostgreSQL and Redis caching for enterprise national deployment across all central and state ministries."*
