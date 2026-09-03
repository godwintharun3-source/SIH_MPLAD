"""
High-Speed Matching Engine for MPLAD Master Project & Expenditure Datasets
Uses in-memory dictionary hashing for sub-second execution across 250,000+ records.
Merges Recommended Works and Completed Works with multi-tier matching keys and match confidence scores.
Links expenditure records to projects contextually.
Generates master_projects.csv, master_expenditures.csv, and match_report.json.
"""

import os
import json
import re
import pandas as pd
import numpy as np
from datetime import datetime

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/processed"))

def clean_key_text(s):
    if not isinstance(s, str):
        return ""
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    return " ".join(s.split())

def run_matching():
    print("Starting High-Speed Project Master Matching...")
    t0 = datetime.now()
    
    rec_path = os.path.join(PROCESSED_DIR, "clean_recommended_works.csv")
    comp_path = os.path.join(PROCESSED_DIR, "clean_completed_works.csv")
    exp_path = os.path.join(PROCESSED_DIR, "clean_expenditures.csv")
    
    df_rec = pd.read_csv(rec_path, low_memory=False)
    df_comp = pd.read_csv(comp_path, low_memory=False)
    df_exp = pd.read_csv(exp_path, low_memory=False)
    
    # Clean text columns for fast hashing
    df_rec["norm_desc"] = df_rec["work_description"].astype(str).str.lower().str.replace(r"[^a-z0-9\s]", " ", regex=True).str.replace(r"\s+", " ", regex=True).str.strip()
    df_comp["norm_desc"] = df_comp["work_description"].astype(str).str.lower().str.replace(r"[^a-z0-9\s]", " ", regex=True).str.replace(r"\s+", " ", regex=True).str.strip()
    
    df_rec["composite_key"] = df_rec["mp_name"].astype(str).str.lower() + "___" + df_rec["constituency"].astype(str).str.lower() + "___" + df_rec["norm_desc"]
    df_comp["composite_key"] = df_comp["mp_name"].astype(str).str.lower() + "___" + df_comp["constituency"].astype(str).str.lower() + "___" + df_comp["norm_desc"]
    
    # Build fast dict lookups from completed works
    comp_records = df_comp.to_dict("records")
    comp_by_id = {}
    comp_by_key = {}
    
    for idx, row in enumerate(comp_records):
        wid = row.get("work_id")
        if wid is not None and not pd.isna(wid) and int(wid) > 0 and int(wid) not in comp_by_id:
            comp_by_id[int(wid)] = (idx, row)
        ckey = row.get("composite_key")
        if ckey and ckey not in comp_by_key:
            comp_by_key[ckey] = (idx, row)
            
    matched_comp_indices = set()
    master_records = []
    
    exact_id_matches = 0
    composite_matches = 0
    unmatched_rec = 0
    
    rec_records = df_rec.to_dict("records")
    for r in rec_records:
        wid = r.get("work_id")
        wid_int = int(wid) if (wid is not None and not pd.isna(wid) and int(wid) > 0) else None
        ckey = r.get("composite_key")
        
        comp_match = None
        match_method = "UNMATCHED"
        match_confidence = 0.0
        
        if wid_int is not None and wid_int in comp_by_id:
            comp_idx, comp_match = comp_by_id[wid_int]
            matched_comp_indices.add(comp_idx)
            match_method = "EXACT_WORK_ID"
            match_confidence = 1.0
            exact_id_matches += 1
        elif ckey in comp_by_key:
            comp_idx, comp_match = comp_by_key[ckey]
            matched_comp_indices.add(comp_idx)
            match_method = "COMPOSITE_KEY"
            match_confidence = 0.90
            composite_matches += 1
        else:
            unmatched_rec += 1
            
        final_amt = float(comp_match["final_amount"]) if comp_match is not None else 0.0
        completed_date = str(comp_match["completed_date"]) if (comp_match is not None and pd.notna(comp_match.get("completed_date"))) else None
        rating = float(comp_match["average_rating"]) if (comp_match is not None and pd.notna(comp_match.get("average_rating"))) else None
        status = "COMPLETED" if comp_match is not None else "COMPLETION_VERIFICATION_REQUIRED"
        
        master_records.append({
            "project_id": str(wid_int) if wid_int is not None else f"REC-{len(master_records)+1:06d}",
            "work_id": wid_int,
            "work_description": r.get("work_description", ""),
            "category": r.get("category", "Normal/Others"),
            "mp_name": r.get("mp_name", ""),
            "constituency": r.get("constituency", ""),
            "state": r.get("state", ""),
            "district": r.get("district", ""),
            "house": r.get("house", "Lok Sabha"),
            "ida": r.get("ida", ""),
            "recommended_amount": float(r.get("recommended_amount", 0.0)),
            "recommendation_date": r.get("recommendation_date"),
            "has_images": bool(r.get("has_images", False)),
            "completion_status": status,
            "final_amount": final_amt,
            "completed_date": completed_date,
            "average_rating": rating,
            "match_method": match_method,
            "match_confidence": match_confidence,
            "record_source": "RECOMMENDED_MASTER"
        })
        
    unmatched_comp_count = 0
    for idx, c in enumerate(comp_records):
        if idx not in matched_comp_indices:
            unmatched_comp_count += 1
            wid = c.get("work_id")
            wid_int = int(wid) if (wid is not None and not pd.isna(wid) and int(wid) > 0) else None
            master_records.append({
                "project_id": str(wid_int) if wid_int is not None else f"COMP-{unmatched_comp_count:06d}",
                "work_id": wid_int,
                "work_description": c.get("work_description", ""),
                "category": c.get("category", "Normal/Others"),
                "mp_name": c.get("mp_name", ""),
                "constituency": c.get("constituency", ""),
                "state": c.get("state", ""),
                "district": c.get("district", ""),
                "house": c.get("house", "Lok Sabha"),
                "ida": c.get("ida", ""),
                "recommended_amount": float(c.get("final_amount", 0.0)),
                "recommendation_date": None,
                "has_images": bool(c.get("has_images", False)),
                "completion_status": "COMPLETED",
                "final_amount": float(c.get("final_amount", 0.0)),
                "completed_date": c.get("completed_date"),
                "average_rating": float(c.get("average_rating")) if pd.notna(c.get("average_rating")) else None,
                "match_method": "DIRECT_COMPLETED_ENTRY",
                "match_confidence": 1.0,
                "record_source": "COMPLETED_SUPPLEMENT"
            })
            
    df_master = pd.DataFrame(master_records)
    out_master_path = os.path.join(PROCESSED_DIR, "master_projects.csv")
    df_master.to_csv(out_master_path, index=False)
    print(f"Master Projects Table saved: {len(df_master):,} records.")
    
    # 2. Fast Expenditure Matching
    print("Fast Matching Expenditures with Projects...")
    df_exp["norm_desc"] = df_exp["work_description"].astype(str).str.lower().str.replace(r"[^a-z0-9\s]", " ", regex=True).str.replace(r"\s+", " ", regex=True).str.strip()
    df_exp["exp_key"] = df_exp["mp_name"].astype(str).str.lower() + "___" + df_exp["constituency"].astype(str).str.lower() + "___" + df_exp["norm_desc"]
    
    proj_key_to_id = {}
    for r in master_records:
        norm_desc = clean_key_text(r["work_description"])
        pk = str(r["mp_name"]).lower() + "___" + str(r["constituency"]).lower() + "___" + norm_desc
        if pk and pk not in proj_key_to_id:
            proj_key_to_id[pk] = r["project_id"]
            
    exp_records = df_exp.to_dict("records")
    matched_proj_ids = []
    exp_match_conf = []
    
    for e in exp_records:
        ek = e.get("exp_key")
        if ek in proj_key_to_id:
            matched_proj_ids.append(proj_key_to_id[ek])
            exp_match_conf.append(0.90)
        else:
            matched_proj_ids.append(None)
            exp_match_conf.append(0.0)
            
    df_exp["matched_project_id"] = matched_proj_ids
    df_exp["match_confidence"] = exp_match_conf
    
    df_exp_out = df_exp.drop(columns=["norm_desc", "exp_key"], errors="ignore")
    out_exp_path = os.path.join(PROCESSED_DIR, "master_expenditures.csv")
    df_exp_out.to_csv(out_exp_path, index=False)
    
    matched_exp_count = int(pd.notna(df_exp["matched_project_id"]).sum())
    
    match_report = {
        "matching_timestamp": datetime.now().isoformat(),
        "total_recommended_input": len(df_rec),
        "total_completed_input": len(df_comp),
        "exact_work_id_matches": exact_id_matches,
        "composite_key_matches": composite_matches,
        "unmatched_recommended_requiring_verification": unmatched_rec,
        "completed_supplementary_entries": unmatched_comp_count,
        "total_master_projects": len(df_master),
        "total_expenditure_records": len(df_exp_out),
        "expenditures_linked_to_projects": matched_exp_count,
        "expenditures_unlinked_constituency_level": len(df_exp_out) - matched_exp_count,
        "matching_duration_seconds": round((datetime.now() - t0).total_seconds(), 2)
    }
    
    report_path = os.path.join(PROCESSED_DIR, "match_report.json")
    with open(report_path, "w", encoding="utf-8") as rf:
        json.dump(match_report, rf, indent=2)
    print(f"Matching finished in {match_report['matching_duration_seconds']}s! Report saved to {report_path}")
    return match_report

if __name__ == "__main__":
    run_matching()
