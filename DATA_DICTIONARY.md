# MPLAD AI Risk & Anomaly Intelligence System - Data Dictionary

**Profiling Date**: 2026-08-29T00:21:56.589642

This document describes the schema, descriptions, data types, null counts, and integrity characteristics of all raw datasets provided for the MPLADS Scheme Monitoring & Anomaly Intelligence Platform.

---

## Dataset: `mplads_mp_summary_2026-08-28.csv` (mp_summary)
- **Total Rows**: 774
- **Total Columns**: 15
- **Exact Duplicate Rows**: 0

| Column Name | Type | Non-Null Count | Null % | Unique Count | Sample Values |
|---|---|---|---|---|---|
| `MP Name` | `object` | 774 | 0.0% | 774 | Smt. S. Phangnon Konyak (2022-, Shri Arun Kumar Sagar , S SUPONGMEREN JAMIR |
| `Constituency` | `object` | 774 | 0.0% | 541 | Sitting Rajya Sabha, SHAHJAHANPUR, NAGALAND |
| `State` | `object` | 774 | 0.0% | 36 | Nagaland, Uttar Pradesh, Nagaland |
| `House` | `object` | 774 | 0.0% | 2 | Rajya Sabha, Lok Sabha, Lok Sabha |
| `Allocated Amount (₹)` | `float64` | 774 | 0.0% | 219 | 206563957.11, 147000000.0, 147000000.0 |
| `Total Expenditure (₹)` | `float64` | 774 | 0.0% | 700 | 196106200.0, 138723000.0, 138150000.0 |
| `Utilization %` | `float64` | 774 | 0.0% | 657 | 94.94, 94.37, 93.98 |
| `Completed Works` | `int64` | 774 | 0.0% | 194 | 57, 4, 38 |
| `Recommended Works` | `int64` | 774 | 0.0% | 271 | 20, 3, 18 |
| `Completion Rate %` | `float64` | 774 | 0.0% | 585 | 74.03, 57.14, 67.86 |
| `Unspent Amount (₹)` | `float64` | 774 | 0.0% | 713 | 10457757.110000014, 8277000.0, 8850000.0 |
| `Transaction Count` | `int64` | 774 | 0.0% | 320 | 123, 45, 81 |
| `Successful Payments` | `int64` | 774 | 0.0% | 305 | 123, 45, 81 |
| `Pending Payments` | `int64` | 774 | 0.0% | 44 | 0, 0, 0 |
| `Average Rating` | `float64` | 4 | 99.48% | 2 | 1.0, 5.0, 1.0 |

---

## Dataset: `mplads_expenditures_2026-08-28.csv` (expenditures)
- **Total Rows**: 107,551
- **Total Columns**: 10
- **Exact Duplicate Rows**: 32,184

| Column Name | Type | Non-Null Count | Null % | Unique Count | Sample Values |
|---|---|---|---|---|---|
| `MP Name` | `object` | 107,551 | 0.0% | 699 | ZIA UR REHMAN, ZIA UR REHMAN, ZIA UR REHMAN |
| `Constituency` | `object` | 107,551 | 0.0% | 530 | SAMBHAL, SAMBHAL, SAMBHAL |
| `State` | `object` | 107,551 | 0.0% | 35 | Uttar Pradesh, Uttar Pradesh, Uttar Pradesh |
| `House` | `object` | 107,551 | 0.0% | 2 | Lok Sabha, Lok Sabha, Lok Sabha |
| `Work Description` | `object` | 107,551 | 0.0% | 112 | Lighting of public spaces, Lighting of public spaces, Lighting of public spaces |
| `Vendor` | `object` | 107,551 | 0.0% | 27,871 | R G SUPLLIER, R G SUPLLIER, R G SUPLLIER |
| `IDA` | `object` | 107,551 | 0.0% | 763 | SAMBHAL(DISTRICT MAGISTRAE BHI, SAMBHAL(DISTRICT MAGISTRAE BHI, SAMBHAL(DISTRICT MAGISTRAE BHI |
| `Expenditure Amount (₹)` | `float64` | 107,551 | 0.0% | 39,246 | 36159.0, 36159.0, 36159.0 |
| `Expenditure Date` | `object` | 107,551 | 0.0% | 979 | 2026-08-20T00:00:00.000Z, 2026-08-20T00:00:00.000Z, 2026-08-20T00:00:00.000Z |
| `Payment Status` | `object` | 107,551 | 0.0% | 2 | Payment In-Progress, Payment In-Progress, Payment In-Progress |

---

## Dataset: `mplads_recommended_works_2026-08-28.csv` (recommended_works)
- **Total Rows**: 83,797
- **Total Columns**: 11
- **Exact Duplicate Rows**: 0

| Column Name | Type | Non-Null Count | Null % | Unique Count | Sample Values |
|---|---|---|---|---|---|
| `Work ID` | `int64` | 83,797 | 0.0% | 83,782 | 175556, 175559, 175561 |
| `Work Description` | `object` | 83,747 | 0.06% | 77,331 | Repair and renovation of road , Extension of Multipurpse Hall , Construction of CC Motorable r |
| `Category` | `object` | 83,792 | 0.01% | 4 | Repair and Renovation, Normal/Others, Normal/Others |
| `MP Name` | `object` | 83,797 | 0.0% | 727 | BISHNU PADA RAY, BISHNU PADA RAY, BISHNU PADA RAY |
| `Constituency` | `object` | 83,797 | 0.0% | 537 | ANDAMAN AND NICOBAR ISLANDS, ANDAMAN AND NICOBAR ISLANDS, ANDAMAN AND NICOBAR ISLANDS |
| `State` | `object` | 83,797 | 0.0% | 36 | Andaman And Nicobar Islands, Andaman And Nicobar Islands, Andaman And Nicobar Islands |
| `House` | `object` | 83,797 | 0.0% | 2 | Lok Sabha, Lok Sabha, Lok Sabha |
| `Recommended Amount (₹)` | `float64` | 83,797 | 0.0% | 6,255 | 4947034.0, 976436.0, 1498887.0 |
| `Recommendation Date` | `object` | 83,797 | 0.0% | 918 | 2025-02-14T00:00:00.000Z, 2025-02-14T00:00:00.000Z, 2025-02-14T00:00:00.000Z |
| `Has Images` | `bool` | 83,797 | 0.0% | 2 | False, False, False |
| `IDA` | `object` | 83,797 | 0.0% | 757 | SOUTH ANDAMANS(Implementing Di, SOUTH ANDAMANS(Implementing Di, SOUTH ANDAMANS(Implementing Di |

---

## Dataset: `mplads_completed_works_2026-08-28.csv` (completed_works)
- **Total Rows**: 43,667
- **Total Columns**: 12
- **Exact Duplicate Rows**: 0

| Column Name | Type | Non-Null Count | Null % | Unique Count | Sample Values |
|---|---|---|---|---|---|
| `Work ID` | `int64` | 43,667 | 0.0% | 43,667 | 134703, 135593, 135595 |
| `Work Description` | `object` | 43,582 | 0.19% | 38,346 | Upgradation of Road from Madha, Construction of CC Road from A, Construction of CC road from A |
| `Category` | `object` | 43,662 | 0.01% | 4 | Normal/Others, Normal/Others, Normal/Others |
| `MP Name` | `object` | 43,667 | 0.0% | 656 | DAGGUMALLA PRASADA RAO, DAGGUMALLA PRASADA RAO, DAGGUMALLA PRASADA RAO |
| `Constituency` | `object` | 43,667 | 0.0% | 500 | CHITTOOR, CHITTOOR, CHITTOOR |
| `State` | `object` | 43,667 | 0.0% | 33 | Andhra Pradesh, Andhra Pradesh, Andhra Pradesh |
| `House` | `object` | 43,667 | 0.0% | 2 | Lok Sabha, Lok Sabha, Lok Sabha |
| `Final Amount (₹)` | `float64` | 43,667 | 0.0% | 16,462 | 499993.0, 448722.0, 448970.0 |
| `Completed Date` | `object` | 43,667 | 0.0% | 797 | 2025-01-31T00:00:00.000Z, 2024-12-05T00:00:00.000Z, 2024-12-05T00:00:00.000Z |
| `Has Images` | `bool` | 43,667 | 0.0% | 2 | True, True, True |
| `Average Rating` | `float64` | 4 | 99.99% | 2 | 5.0, 1.0, 1.0 |
| `IDA` | `object` | 43,667 | 0.0% | 702 | CHITTOOR(DISTRICT COLLECTOR CH, CHITTOOR(DISTRICT COLLECTOR CH, CHITTOOR(DISTRICT COLLECTOR CH |

---

## Key Join & Relational Strategy

### 1. Recommended Works vs Completed Works
- Primary Key: `Work ID` (numeric integer ID)
- Recommended Works Total Unique IDs: 83,782
- Completed Works Total Unique IDs: 43,667
- Matched Unique IDs: 392
- Recommended Not In Completed (Pending/Unverified): 83,390
- Completed Not In Recommended (Late entries / Direct completions): 43,275

### 2. Expenditures vs Projects
- **Critical Note**: The `mplads_expenditures_2026-08-28.csv` does **not** contain a `Work ID` column.
- Expenditure links to projects via composite contextual keys: `MP Name` + `Constituency` + `State` + `Work Description` + `IDA`.
- Match confidence is explicitly computed and stored (Exact Composite Match, Fuzzy Description Match, or Aggregate Constituency Allocation).

### 3. Duplicate Transaction Signature
- Combinations of `MP Name`, `Constituency`, `Work Description`, `Vendor`, `IDA`, `Expenditure Amount (₹)`, `Expenditure Date` identify repeated transaction groups and potential duplicate claims.
