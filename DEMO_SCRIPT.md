# 5-Minute SIH Presentation Demo Script

### Project: MPLAD AI Risk & Anomaly Intelligence System (SIH26102 - MoSPI)

---

## ⏱️ Minute 0:00 – 0:45 | The Problem & Our Core Philosophy

**Presenter**:
> *"Good morning, respected judges. Under the MPLAD Scheme, over 83,000 works are recommended across 774 Members of Parliament with an allocation exceeding ₹1,16,000 Crores. For central and state officers, it is humanly impossible to inspect every single project.
>
> Today, we present the **MPLAD AI Risk & Anomaly Intelligence System**.
>
> Our core philosophy: **We do NOT claim AI detects corruption or misconduct. Instead, our explainable AI identifies unusual project and expenditure patterns and prioritizes where human investigation should happen.**"*

---

## ⏱️ Minute 0:45 – 1:30 | National Executive Dashboard (Demo Step 1)

**Action**: Open `http://127.0.0.1:5173/` on the main screen.

**Presenter**:
> *"Here on our Executive Overview Dashboard, all metrics are computed dynamically from real MoSPI datasets.
> - We track **774 MPs**, **₹1,16,767 Cr** in total allocation, and a **33.9% national utilization rate**.
> - Out of **126,582 monitored works**, our explainable risk engine has identified **8 High/Critical Risk projects** requiring immediate prioritization.
> - Notice our proportional risk bar: the vast majority of works align within standard operating bounds, allowing officers to focus attention only on meaningful outliers."*

---

## ⏱️ Minute 1:30 – 2:30 | High-Risk Works & Project Diagnostic (Demo Steps 2, 3, 4)

**Action**: Click **"High-Risk Works"** in navbar, search or click **Project #80673** to open its detail page.

**Presenter**:
> *"Let's inspect **Project #80673** in Punjab:
> 1. **Financial Anomaly**: Recommended sanction was **₹5,00,000**, but final certified expenditure escalated to **₹10,00,000** (+100.0% cost deviation).
> 2. **Explainable AI Scorecard**: The project received a **98/100 (CRITICAL)** risk score. Crucially, we never give a black-box score. The system provides the exact point contributions:
>    - Cost Deviation: +30 pts
>    - Sector Similarity Outlier: +10 pts
>    - Completion Verification: +18 pts
>    - Isolation Forest ML Multi-Dimensional Outlier: +8 pts
> 3. **Actionable Recommendations**: Below, the system produces a prioritized checklist for the inspecting officer: 'Review detailed measurement book (MB) and verify asset commissioning certificate.'"*

---

## ⏱️ Minute 2:30 – 3:30 | Peer Benchmark & Duplicate Transactions (Demo Steps 5 & 6)

**Action**: Scroll down to **"Comparable Project Benchmark Analysis"** on Project 80673, then navigate to **"Anomaly Center"**.

**Presenter**:
> *"How do we know if ₹10 Lakhs is unusual?
> - Our **Similarity Engine** compares this work against similar projects in the same sector. The peer category median is **₹5,00,000**; this work is **+100% higher than its peer cohort**.
> - Next, let's open our **Anomaly Center**. In the expenditure transactions dataset, our signature matching engine detected **38,866 exact duplicate transaction rows** and repeated vendor payments on successive dates, flagged neutrally as 'Potential Duplicate — Review Required' for financial audit."*

---

## ⏱️ Minute 3:30 – 4:15 | Grounded AI Assistant (Demo Step 9)

**Action**: Click **"Ask AI Assistant"** button in top right. Click the sample prompt: *"Show me the 10 highest-risk projects."*

**Presenter**:
> *"We have equipped inspecting officers with a **Grounded AI Decision-Support Assistant**.
> Unlike generic chatbots that hallucinate, this assistant translates questions directly into deterministic queries on our indexed database, citing exact Project IDs and sanction numbers with zero fabricated data."*

---

## ⏱️ Minute 4:15 – 5:00 | Transparency, Live Validation & Conclusion (Demo Step 10)

**Action**: Click **"Data & Methodology"** in navbar. Show the 100% verification badge.

**Presenter**:
> *"Finally, on our **Data & Methodology** page:
> - We maintain an open audit log of all transformations.
> - Our automated startup validation confirms a **100% match** against official MoSPI reference baselines down to the exact rupee.
> - In conclusion: our system delivers **Explainability, Hybrid ML + Heuristics, Dynamic Peer Benchmarking, and Grounded Decision Support**, enabling MoSPI to transform scheme oversight.
>
> Thank you! We welcome your questions."*
