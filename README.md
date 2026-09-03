# MPLAD AI Risk & Anomaly Intelligence System

### Smart India Hackathon (SIH26102) — Ministry of Statistics and Programme Implementation (MoSPI)

> **Core Value Proposition**: *"Instead of asking government officials to manually inspect tens of thousands of development works, our platform uses explainable AI to identify unusual project and expenditure patterns and prioritize them for human review."*

---

## 🏛️ Executive Summary

The **MPLAD AI Risk & Anomaly Intelligence System** is an AI-assisted decision-support platform designed for MoSPI to monitor Members of Parliament Local Area Development Scheme (MPLADS) projects, expenditures, and execution integrity.

The system combines **explainable rule-based heuristics** with **unsupervised machine learning (Isolation Forest)** to analyze project allocations, detect potential duplicate transactions, identify severe completion delays, calculate comparable-project cost deviations, and generate transparent risk scores (0–100) with detailed contributing factors.

### ⚖️ Legal & Ethical Compliance Standard
> **Important**: Never state or imply that an anomaly proves corruption, fraud, theft, or misconduct. The system utilizes neutral, non-accusatory terminology (*Potential anomaly, Unusual pattern, Review required, Risk indicator, Cost deviation, Completion concern*). The AI assists human officers in prioritization; it does not make accusations or statutory determinations.

---

## 🚀 Key Features

1. **Grounded Source Data Analysis**:
   - Analyzes real datasets covering **774 MPs**, **₹1,16,767.91 Cr** in allocations, **126,582 master projects**, and **107,551 expenditure transactions**.
   - Zero hardcoded numbers; 100% dynamic calculation validated against official reference baselines (`data_validation_report.json`).

2. **Deterministic Two-Tier Relational Matching Engine**:
   - Tier 1: Exact `Work ID` joins.
   - Tier 2: Composite Key hashing (`MP Name` + `Constituency` + Normalized `Work Description` + `IDA`).
   - Explicit confidence scoring (`1.0`, `0.90`, `0.0`). Unmatched works are labeled *"Completion Status Requires Verification"* rather than presumed delayed.

3. **Hybrid Explainable Risk Engine (0–100 Score)**:
   - **Cost Anomaly Points** (up to 30 pts): &gt;25%, &gt;50%, &gt;100% deviation vs sanction.
   - **Completion Concern Points** (up to 25 pts): Unverified status or &gt;1-2 year completion delay.
   - **Payment Pattern Points** (up to 20 pts): High voucher frequency or budget overruns.
   - **Duplicate Transaction Points** (up to 15 pts): Exact duplicate records or repeated vendor/amount signatures.
   - **Sector Similarity Outlier** (up to 10 pts): Significant deviation (&gt;100%) against peer category median.
   - **Isolation Forest ML Boost** (+8 pts): Multi-dimensional statistical outlier confirmation.
   - Categorized into 4 Risk Levels: `LOW` (0–30), `MEDIUM` (31–60), `HIGH` (61–80), `CRITICAL` (81–100).

4. **Project Peer Benchmark & Similarity Engine**:
   - Computes peer category median, mean, min, max, and percentage deviation against comparable works in the same state/sector.

5. **Potential Duplicate Transaction Detection**:
   - Detects 38,866 exact duplicate occurrences and 40,114 repeated signature clusters across identical vendor/amount/MP combinations.

6. **Grounded MoSPI AI Decision-Support Assistant**:
   - Natural language query assistant providing factual answers strictly backed by cited project records without hallucination.

7. **Officer Inspection Dossier & PDF Export**:
   - Structured summary, financial breakdown, timeline, risk breakdown, comparable projects table, linked transactions, and advisory review action items.

8. **Interactive Demo Mode**:
   - Built-in 10-step SIH jury presentation flow with live navigation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts, React Router v7 |
| **Backend** | Python 3.12, FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| **Machine Learning** | Scikit-learn (Isolation Forest), NumPy, Pandas, Joblib |
| **Database** | SQLite with B-Tree indices on `project_id`, `state`, `constituency`, `risk_score`, `risk_level` |
| **Testing** | Pytest, Unittest |

---

## 📂 Project Structure

```
SIH/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints
│   │   ├── database.py      # SQLite connection & session maker
│   │   ├── main.py          # FastAPI application entrypoint
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── services/        # Anomaly rules, risk scoring, similarity, AI assistant
│   └── data_pipeline/       # ETL cleaning, matching, features, batch scoring, seed
│       ├── clean.py
│       ├── matching.py
│       ├── features.py
│       ├── score_master.py
│       ├── seed_db.py
│       └── validate.py
├── frontend/                # Vite + React + Tailwind CSS application
│   ├── src/
│   │   ├── components/      # Navbar, StatCard, RiskBadge, DemoBanner, AIAssistant
│   │   ├── pages/           # Dashboard, HighRisk, Detail, MPs, States, Anomalies, Transparency
│   │   ├── services/        # API client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── raw/                 # Untouched raw CSV datasets
│   ├── processed/           # Clean, matched, enriched, and scored datasets + SQLite DB
│   └── profiling/           # Profiling report JSON
├── ml_models/               # Trained Isolation Forest model & metadata
│   ├── isolation_forest_v1.joblib
│   ├── scaler_v1.joblib
│   ├── model_metadata.json
│   ├── train_model.py
│   └── predict.py
├── docs/                    # Architecture, presentation script, QA
├── tests/                   # Automated unit & integration tests
├── DATA_DICTIONARY.md       # Schema & column documentation
├── ARCHITECTURE.md          # Architectural diagram in Mermaid
├── DEMO_SCRIPT.md           # 5-minute SIH presentation guide
├── JUDGES_QA.md             # Jury Q&A guide
└── README.md
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 2. Backend Setup
```bash
# Install Python dependencies
pip install fastapi uvicorn pandas numpy scikit-learn sqlalchemy joblib pydantic

# Run the complete data pipeline (cleaning, matching, feature engineering, ML training, DB seeding)
python backend/data_pipeline/clean.py
python backend/data_pipeline/matching.py
python backend/data_pipeline/features.py
python ml_models/train_model.py
python backend/data_pipeline/score_master.py
python backend/data_pipeline/validate.py
python backend/data_pipeline/seed_db.py

# Start the FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://127.0.0.1:5173/` in your browser.

---

## 🧪 Running Automated Tests

```bash
# Run unit & integration tests
python -m unittest discover tests
```

---

## 📊 Live API Endpoints

- `GET /api/dashboard/summary` — National metrics, risk distribution, trends
- `GET /api/projects` — Filterable & paginated project registry
- `GET /api/projects/high-risk` — Top prioritized flagged works
- `GET /api/projects/{id}` — Full project detail, breakdown, and advisory actions
- `GET /api/projects/{id}/similar` — Sector peer comparable cohort & median benchmark
- `GET /api/projects/{id}/transactions` — Linked vouchers & potential duplicates
- `GET /api/anomalies/cost` — High cost deviation works (>25%, >50%, >100%)
- `GET /api/anomalies/duplicate` — Duplicate transaction vendor clusters
- `GET /api/mps` — Member of Parliament implementation performance
- `GET /api/analytics/states` — State-level allocation & risk aggregates
- `POST /api/ai/query` — Grounded natural language query assistant
- `POST /api/analyze/recalculate` — Dynamic risk slider sensitivity recalibration

---

## 📜 Ethical Disclaimer
This prototype application is built for decision-support and human prioritization. Anomaly indicators reflect statistical variations from administrative baselines and do not establish statutory or legal conclusions. All flagged items are subject to authorized officer verification.
