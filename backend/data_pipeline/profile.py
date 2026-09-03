"""
Data Profiling Module for MPLAD AI Risk & Anomaly Intelligence System
Inspects raw datasets, analyzes schema, nulls, duplicates, candidate keys, distributions,
and outputs data/profiling/profiling_report.json and DATA_DICTIONARY.md.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/raw"))
PROFILING_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/profiling"))
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

os.makedirs(PROFILING_DIR, exist_ok=True)

def profile_dataset(file_path, name):
    print(f"Profiling {name} from {file_path}...")
    df = pd.read_csv(file_path, low_memory=False)
    
    total_rows = len(df)
    total_cols = len(df.columns)
    exact_duplicates = int(df.duplicated().sum())
    
    columns_profile = {}
    for col in df.columns:
        series = df[col]
        non_null = int(series.count())
        null_count = int(series.isnull().sum())
        null_pct = round(float((null_count / total_rows) * 100), 2) if total_rows > 0 else 0
        unique_count = int(series.nunique(dropna=True))
        
        col_type = str(series.dtype)
        sample_values = series.dropna().head(5).tolist()
        
        is_numeric = pd.api.types.is_numeric_dtype(series)
        num_stats = {}
        if is_numeric:
            num_stats = {
                "min": float(series.min()) if non_null > 0 else None,
                "max": float(series.max()) if non_null > 0 else None,
                "mean": round(float(series.mean()), 2) if non_null > 0 else None,
                "median": round(float(series.median()), 2) if non_null > 0 else None,
                "sum": round(float(series.sum()), 2) if non_null > 0 else None
            }
            
        columns_profile[col] = {
            "dtype": col_type,
            "non_null_count": non_null,
            "null_count": null_count,
            "null_pct": null_pct,
            "unique_count": unique_count,
            "is_unique": unique_count == total_rows,
            "is_numeric": is_numeric,
            "sample_values": sample_values,
            "numeric_stats": num_stats
        }
        
    return {
        "dataset_name": name,
        "file_name": os.path.basename(file_path),
        "total_rows": total_rows,
        "total_cols": total_cols,
        "exact_duplicates": exact_duplicates,
        "columns": columns_profile
    }

def run_profiling():
    files = {
        "mp_summary": os.path.join(RAW_DIR, "mplads_mp_summary_2026-08-28.csv"),
        "expenditures": os.path.join(RAW_DIR, "mplads_expenditures_2026-08-28.csv"),
        "recommended_works": os.path.join(RAW_DIR, "mplads_recommended_works_2026-08-28.csv"),
        "completed_works": os.path.join(RAW_DIR, "mplads_completed_works_2026-08-28.csv")
    }
    
    profiles = {}
    for key, path in files.items():
        if os.path.exists(path):
            profiles[key] = profile_dataset(path, key)
        else:
            print(f"Warning: File not found {path}")
            
    json_path = os.path.join(RAW_DIR, "json_2026-08-28.json")
    json_summary = {}
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as jf:
            json_summary = json.load(jf)
            
    rec_path = files["recommended_works"]
    comp_path = files["completed_works"]
    exp_path = files["expenditures"]
    
    join_analysis = {}
    if os.path.exists(rec_path) and os.path.exists(comp_path):
        df_rec = pd.read_csv(rec_path, low_memory=False)
        df_comp = pd.read_csv(comp_path, low_memory=False)
        
        rec_ids = set(df_rec["Work ID"].dropna().astype(str))
        comp_ids = set(df_comp["Work ID"].dropna().astype(str))
        
        matched_ids = rec_ids.intersection(comp_ids)
        comp_only_ids = comp_ids - rec_ids
        rec_only_ids = rec_ids - comp_ids
        
        join_analysis["work_id_overlap"] = {
            "recommended_unique_ids": len(rec_ids),
            "completed_unique_ids": len(comp_ids),
            "matched_unique_ids": len(matched_ids),
            "completed_not_in_recommended": len(comp_only_ids),
            "recommended_not_in_completed": len(rec_only_ids),
            "recommended_duplicate_ids": int(df_rec["Work ID"].duplicated().sum()),
            "completed_duplicate_ids": int(df_comp["Work ID"].duplicated().sum())
        }
        
    if os.path.exists(exp_path):
        df_exp = pd.read_csv(exp_path, low_memory=False)
        join_analysis["expenditure_keys"] = {
            "has_work_id": "Work ID" in df_exp.columns,
            "columns": list(df_exp.columns),
            "unique_mps": int(df_exp["MP Name"].nunique()),
            "unique_constituencies": int(df_exp["Constituency"].nunique()),
            "unique_states": int(df_exp["State"].nunique()),
            "unique_vendors": int(df_exp["Vendor"].nunique()) if "Vendor" in df_exp.columns else 0,
            "total_records": len(df_exp),
            "exact_duplicate_rows": int(df_exp.duplicated().sum())
        }

    full_report = {
        "profiling_date": datetime.now().isoformat(),
        "profiles": profiles,
        "json_reference": json_summary,
        "join_analysis": join_analysis
    }
    
    report_path = os.path.join(PROFILING_DIR, "profiling_report.json")
    with open(report_path, "w", encoding="utf-8") as rf:
        json.dump(full_report, rf, indent=2)
    print(f"Saved profiling report to {report_path}")
    
    generate_data_dictionary(full_report)
    return full_report

def generate_data_dictionary(report):
    md_lines = [
        "# MPLAD AI Risk & Anomaly Intelligence System - Data Dictionary",
        "",
        f"**Profiling Date**: {report['profiling_date']}",
        "",
        "This document describes the schema, descriptions, data types, null counts, and integrity characteristics of all raw datasets provided for the MPLADS Scheme Monitoring & Anomaly Intelligence Platform.",
        "",
        "---",
        ""
    ]
    
    for key, p in report["profiles"].items():
        md_lines.append(f"## Dataset: `{p['file_name']}` ({p['dataset_name']})")
        md_lines.append(f"- **Total Rows**: {p['total_rows']:,}")
        md_lines.append(f"- **Total Columns**: {p['total_cols']}")
        md_lines.append(f"- **Exact Duplicate Rows**: {p['exact_duplicates']:,}")
        md_lines.append("")
        md_lines.append("| Column Name | Type | Non-Null Count | Null % | Unique Count | Sample Values |")
        md_lines.append("|---|---|---|---|---|---|")
        
        for col_name, c in p["columns"].items():
            samples = ", ".join([str(v)[:30].replace("|", "/") for v in c["sample_values"][:3]])
            md_lines.append(f"| `{col_name}` | `{c['dtype']}` | {c['non_null_count']:,} | {c['null_pct']}% | {c['unique_count']:,} | {samples} |")
            
        md_lines.append("")
        md_lines.append("---")
        md_lines.append("")
        
    md_lines.extend([
        "## Key Join & Relational Strategy",
        "",
        "### 1. Recommended Works vs Completed Works",
        "- Primary Key: `Work ID` (numeric integer ID)",
        f"- Recommended Works Total Unique IDs: {report['join_analysis'].get('work_id_overlap', {}).get('recommended_unique_ids', 'N/A'):,}",
        f"- Completed Works Total Unique IDs: {report['join_analysis'].get('work_id_overlap', {}).get('completed_unique_ids', 'N/A'):,}",
        f"- Matched Unique IDs: {report['join_analysis'].get('work_id_overlap', {}).get('matched_unique_ids', 'N/A'):,}",
        f"- Recommended Not In Completed (Pending/Unverified): {report['join_analysis'].get('work_id_overlap', {}).get('recommended_not_in_completed', 'N/A'):,}",
        f"- Completed Not In Recommended (Late entries / Direct completions): {report['join_analysis'].get('work_id_overlap', {}).get('completed_not_in_recommended', 'N/A'):,}",
        "",
        "### 2. Expenditures vs Projects",
        "- **Critical Note**: The `mplads_expenditures_2026-08-28.csv` does **not** contain a `Work ID` column.",
        "- Expenditure links to projects via composite contextual keys: `MP Name` + `Constituency` + `State` + `Work Description` + `IDA`.",
        "- Match confidence is explicitly computed and stored (Exact Composite Match, Fuzzy Description Match, or Aggregate Constituency Allocation).",
        "",
        "### 3. Duplicate Transaction Signature",
        "- Combinations of `MP Name`, `Constituency`, `Work Description`, `Vendor`, `IDA`, `Expenditure Amount (₹)`, `Expenditure Date` identify repeated transaction groups and potential duplicate claims.",
        ""
    ])
    
    dict_path = os.path.join(ROOT_DIR, "DATA_DICTIONARY.md")
    with open(dict_path, "w", encoding="utf-8") as df:
        df.write("\n".join(md_lines))
    print(f"Generated {dict_path}")

if __name__ == "__main__":
    run_profiling()
