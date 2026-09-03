"""
FastAPI REST API Endpoints for MPLAD Scheme Monitoring & Anomaly Intelligence
"""

import json
import sqlite3
import pandas as pd
import numpy as np
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Body

from backend.app.database import DB_PATH
from backend.app.schemas.api_schemas import (
    ProjectSummary, ProjectDetail, ProjectListResponse,
    TransactionItem, DashboardSummary, AIQueryRequest,
    AIQueryResponse, RiskWeightsRequest
)
from backend.app.services.similarity_service import find_similar_projects
from backend.app.services.ai_assistant import answer_officer_query
from backend.app.services.risk_scoring import compute_project_risk

router = APIRouter(prefix="/api")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# In-memory cached summary for fast dashboard rendering
_cached_summary = None

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MPLAD AI Risk & Anomaly Intelligence System",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    global _cached_summary
    if _cached_summary is not None:
        return _cached_summary
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # MP Summary totals
    mp_tot = cursor.execute("SELECT sum(allocated_amount) as alloc, sum(total_expenditure) as exp, count(*) as mps FROM mp_summaries").fetchone()
    tot_alloc = float(mp_tot["alloc"] or 0.0)
    tot_exp = float(mp_tot["exp"] or 0.0)
    tot_mps = int(mp_tot["mps"] or 0)
    util_pct = round((tot_exp / tot_alloc * 100.0), 4) if tot_alloc > 0 else 0.0
    
    # Project totals
    p_tot = cursor.execute("SELECT count(*) as total_p, sum(case when completion_status = 'COMPLETED' then 1 else 0 end) as comp_p, sum(case when completion_status = 'COMPLETION_VERIFICATION_REQUIRED' then 1 else 0 end) as unverified_p FROM projects").fetchone()
    tot_proj = int(p_tot["total_p"] or 0)
    comp_proj = int(p_tot["comp_p"] or 0)
    unver_proj = int(p_tot["unverified_p"] or 0)
    comp_rate = round((comp_proj / tot_proj * 100.0), 4) if tot_proj > 0 else 0.0
    
    # Transactions total
    tot_tx = cursor.execute("SELECT count(*) as cnt FROM expenditures").fetchone()["cnt"]
    
    # Risk Distribution
    risk_rows = cursor.execute("SELECT risk_level, count(*) as cnt FROM projects GROUP BY risk_level").fetchall()
    risk_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for r in risk_rows:
        risk_dist[r["risk_level"]] = int(r["cnt"])
        
    # Top States by Expenditure
    state_rows = cursor.execute(
        "SELECT state, count(*) as total_projects, sum(recommended_amount) as total_budget, sum(case when completion_status = 'COMPLETED' then 1 else 0 end) as completed_projects, sum(case when risk_level in ('HIGH', 'CRITICAL') then 1 else 0 end) as high_risk_count FROM projects WHERE state IS NOT NULL AND state != '' GROUP BY state ORDER BY total_budget DESC LIMIT 8"
    ).fetchall()
    top_states = [dict(r) for r in state_rows]
    
    # Top Categories by Budget
    cat_rows = cursor.execute(
        "SELECT coalesce(category, 'Normal/Others') as category, count(*) as project_count, sum(recommended_amount) as total_budget FROM projects WHERE category IS NOT NULL AND category != '' GROUP BY category ORDER BY total_budget DESC LIMIT 6"
    ).fetchall()
    top_cats = [dict(r) for r in cat_rows]
    
    # Top High Risk Constituencies
    const_rows = cursor.execute(
        "SELECT constituency, state, count(*) as total_projects, sum(case when risk_level in ('HIGH', 'CRITICAL') then 1 else 0 end) as high_risk_count, round(avg(risk_score), 1) as avg_risk_score FROM projects WHERE constituency IS NOT NULL AND constituency != '' GROUP BY constituency, state ORDER BY high_risk_count DESC, avg_risk_score DESC LIMIT 6"
    ).fetchall()
    top_const = [dict(r) for r in const_rows]
    
    conn.close()
    
    summary = DashboardSummary(
        total_allocated=tot_alloc,
        total_expenditure=tot_exp,
        utilization_percentage=util_pct,
        total_mps=tot_mps,
        total_projects=tot_proj,
        completed_projects=comp_proj,
        projects_requiring_verification=unver_proj,
        completion_rate_percentage=comp_rate,
        total_transactions=tot_tx,
        risk_distribution=risk_dist,
        top_states_by_expenditure=top_states,
        top_categories_by_budget=top_cats,
        top_high_risk_constituencies=top_const,
        data_timestamp="2026-08-28"
    )
    _cached_summary = summary
    return summary

def get_category_filter(cat: str):
    cat_lower = cat.lower().strip()
    sector_keywords = {
        "community": ["%community center%", "%community hall%", "%bhavan%", "%auditorium%", "%mandapam%", "%community%"],
        "road": ["%road%", "%bridge%", "%culvert%", "%pathway%", "%cc road%"],
        "water": ["%water%", "%hand pump%", "%borewell%", "%tubewell%", "%pipeline%", "%tank%"],
        "education": ["%school%", "%college%", "%library%", "%education%", "%classroom%"],
        "health": ["%hospital%", "%health%", "%dispensary%", "%ambulance%", "%clinic%"],
        "electric": ["%electric%", "%light%", "%solar%", "%transformer%", "%high mast%"],
        "light": ["%electric%", "%light%", "%solar%", "%transformer%", "%high mast%"],
        "sanitation": ["%toilet%", "%drain%", "%sanitation%", "%sewer%", "%nalah%", "%nali%"],
        "drain": ["%toilet%", "%drain%", "%sanitation%", "%sewer%", "%nalah%", "%nali%"],
        "irrigation": ["%irrigation%", "%canal%", "%dam%", "%pond%", "%check dam%"],
        "sport": ["%stadium%", "%playground%", "%gym%", "%sports%", "%park%"],
        "stadium": ["%stadium%", "%playground%", "%gym%", "%sports%", "%park%"],
        "repair": ["%repair%", "%renovation%"],
        "trust": ["%trust%", "%society%"],
    }
    matched_kws = None
    for key, kws in sector_keywords.items():
        if key in cat_lower:
            matched_kws = kws
            break
            
    if matched_kws:
        sub_clauses = ["category = ?"] + ["work_description LIKE ?" for _ in matched_kws]
        sub_params = [cat] + matched_kws
        return f"({' OR '.join(sub_clauses)})", sub_params
    else:
        pat = f"%{cat}%"
        return "(category = ? OR category LIKE ? OR work_description LIKE ?)", [cat, pat, pat]

@router.get("/projects", response_model=ProjectListResponse)
def get_projects(
    page: int = 1,
    page_size: int = 20,
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    completion_status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "risk_score",
    sort_dir: str = "desc"
):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20
        
    allowed_sort = ["risk_score", "cost_deviation_pct", "recommended_amount", "final_amount", "recommendation_date", "project_id"]
    if sort_by not in allowed_sort:
        sort_by = "risk_score"
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clauses = []
    params = []
    
    if state and state != "All":
        where_clauses.append("state = ?")
        params.append(state)
    if district and district != "All":
        where_clauses.append("district = ?")
        params.append(district)
    if constituency and constituency != "All":
        where_clauses.append("constituency = ?")
        params.append(constituency)
    if category and category != "All":
        cat_clause, cat_params = get_category_filter(category)
        where_clauses.append(cat_clause)
        params.extend(cat_params)
    if risk_level and risk_level != "All":
        where_clauses.append("risk_level = ?")
        params.append(risk_level)
    if completion_status and completion_status != "All":
        where_clauses.append("completion_status = ?")
        params.append(completion_status)
    if search:
        where_clauses.append("(project_id LIKE ? OR work_description LIKE ? OR mp_name LIKE ? OR ida LIKE ?)")
        s_pat = f"%{search}%"
        params.extend([s_pat, s_pat, s_pat, s_pat])
        
    where_sql = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    
    # Count total
    count_sql = f"SELECT count(*) as total FROM projects{where_sql}"
    total = cursor.execute(count_sql, tuple(params)).fetchone()["total"]
    
    # Fetch paginated items
    offset = (page - 1) * page_size
    query_sql = f"SELECT * FROM projects{where_sql} ORDER BY {sort_by} {sort_dir.upper()} LIMIT ? OFFSET ?"
    params_with_paging = params + [page_size, offset]
    
    rows = cursor.execute(query_sql, tuple(params_with_paging)).fetchall()
    conn.close()
    
    items = []
    for r in rows:
        items.append(ProjectSummary(
            project_id=str(r["project_id"]),
            work_id=r["work_id"],
            work_description=r["work_description"],
            category=r["category"],
            mp_name=r["mp_name"],
            constituency=r["constituency"],
            state=r["state"],
            district=r["district"],
            house=r["house"],
            recommended_amount=float(r["recommended_amount"] or 0.0),
            final_amount=float(r["final_amount"] or 0.0),
            recommendation_date=r["recommendation_date"],
            completed_date=r["completed_date"],
            completion_status=r["completion_status"],
            cost_deviation_pct=float(r["cost_deviation_pct"] or 0.0),
            risk_score=int(r["risk_score"] or 0),
            risk_level=r["risk_level"],
            primary_reason=r["primary_reason"],
            has_images=bool(r["has_images"]),
            match_method=r["match_method"]
        ))
        
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return ProjectListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )

@router.get("/projects/high-risk", response_model=List[ProjectSummary])
def get_high_risk_projects(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT * FROM projects WHERE risk_level IN ('HIGH', 'CRITICAL') OR risk_score >= 50 ORDER BY risk_score DESC, cost_deviation_pct DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    
    return [
        ProjectSummary(
            project_id=str(r["project_id"]),
            work_id=r["work_id"],
            work_description=r["work_description"],
            category=r["category"],
            mp_name=r["mp_name"],
            constituency=r["constituency"],
            state=r["state"],
            district=r["district"],
            house=r["house"],
            recommended_amount=float(r["recommended_amount"] or 0.0),
            final_amount=float(r["final_amount"] or 0.0),
            recommendation_date=r["recommendation_date"],
            completed_date=r["completed_date"],
            completion_status=r["completion_status"],
            cost_deviation_pct=float(r["cost_deviation_pct"] or 0.0),
            risk_score=int(r["risk_score"] or 0),
            risk_level=r["risk_level"],
            primary_reason=r["primary_reason"],
            has_images=bool(r["has_images"]),
            match_method=r["match_method"]
        ) for r in rows
    ]

@router.get("/projects/{project_id}", response_model=ProjectDetail)
def get_project_detail(project_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    r = cursor.execute("SELECT * FROM projects WHERE project_id = ? OR work_id = ?", (project_id, project_id)).fetchone()
    conn.close()
    
    if not r:
        raise HTTPException(status_code=404, detail="Project not found")
        
    reasons = json.loads(r["reasons_json"]) if r["reasons_json"] else [r["primary_reason"]]
    breakdown = json.loads(r["point_breakdown_json"]) if r["point_breakdown_json"] else {}
    advisories = json.loads(r["advisory_actions_json"]) if r["advisory_actions_json"] else []
    
    return ProjectDetail(
        project_id=str(r["project_id"]),
        work_id=r["work_id"],
        work_description=r["work_description"],
        category=r["category"],
        mp_name=r["mp_name"],
        constituency=r["constituency"],
        state=r["state"],
        district=r["district"],
        house=r["house"],
        ida=r["ida"],
        recommended_amount=float(r["recommended_amount"] or 0.0),
        final_amount=float(r["final_amount"] or 0.0),
        recommendation_date=r["recommendation_date"],
        completed_date=r["completed_date"],
        average_rating=r["average_rating"],
        completion_status=r["completion_status"],
        match_method=r["match_method"],
        match_confidence=float(r["match_confidence"] or 0.0),
        record_source=r["record_source"],
        tx_count=int(r["tx_count"] or 0),
        tx_total_amount=float(r["tx_total_amount"] or 0.0),
        tx_max_single_amount=float(r["tx_max_single_amount"] or 0.0),
        tx_exact_duplicate_count=int(r["tx_exact_duplicate_count"] or 0),
        tx_repeated_signature_count=int(r["tx_repeated_signature_count"] or 0),
        cost_deviation_amount=float(r["cost_deviation_amount"] or 0.0),
        cost_deviation_pct=float(r["cost_deviation_pct"] or 0.0),
        category_median_amount=float(r["category_median_amount"] or 0.0),
        category_cost_deviation_pct=float(r["category_cost_deviation_pct"] or 0.0),
        project_duration_days=int(r["project_duration_days"] or 0),
        delay_status=r["delay_status"],
        ml_anomaly_score=float(r["ml_anomaly_score"] or 0.0),
        is_ml_anomaly=bool(r["is_ml_anomaly"]),
        risk_score=int(r["risk_score"] or 0),
        risk_level=r["risk_level"],
        primary_reason=r["primary_reason"],
        has_images=bool(r["has_images"]),
        reasons=reasons,
        point_breakdown=breakdown,
        advisory_actions=advisories
    )

@router.get("/projects/{project_id}/similar")
def get_similar_projects(project_id: str, limit: int = 5):
    res = find_similar_projects(project_id, limit)
    if not res.get("current_project"):
        raise HTTPException(status_code=404, detail="Project not found for similarity analysis")
    return res

@router.get("/projects/{project_id}/transactions", response_model=List[TransactionItem])
def get_project_transactions(project_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Match by matched_project_id
    rows = cursor.execute(
        "SELECT * FROM expenditures WHERE matched_project_id = ? ORDER BY expenditure_date DESC",
        (project_id,)
    ).fetchall()
    
    if len(rows) == 0:
        # Fallback: find transactions matching MP and Constituency
        p = cursor.execute("SELECT mp_name, constituency, work_description FROM projects WHERE project_id = ?", (project_id,)).fetchone()
        if p:
            rows = cursor.execute(
                "SELECT * FROM expenditures WHERE mp_name = ? AND constituency = ? ORDER BY expenditure_date DESC LIMIT 15",
                (p["mp_name"], p["constituency"])
            ).fetchall()
            
    conn.close()
    
    return [
        TransactionItem(
            transaction_id=r["transaction_id"],
            mp_name=r["mp_name"],
            constituency=r["constituency"],
            state=r["state"],
            work_description=r["work_description"],
            vendor=r["vendor"],
            ida=r["ida"],
            expenditure_amount=float(r["expenditure_amount"] or 0.0),
            expenditure_date=r["expenditure_date"],
            payment_status=r["payment_status"],
            is_exact_duplicate=bool(r["is_exact_duplicate"]),
            is_repeated_signature=bool(r["is_repeated_signature"]),
            sig_repeat_count=int(r["sig_repeat_count"] or 1),
            matched_project_id=str(int(float(r["matched_project_id"]))) if (r["matched_project_id"] is not None and str(r["matched_project_id"]).replace(".0","").isdigit()) else (str(r["matched_project_id"]) if r["matched_project_id"] is not None else None)
        ) for r in rows
    ]

@router.get("/anomalies/cost")
def get_cost_anomalies(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT project_id, work_description, constituency, state, recommended_amount, final_amount, cost_deviation_pct, risk_score, risk_level, primary_reason "
        "FROM projects WHERE cost_deviation_pct > 25.0 AND final_amount > 0 ORDER BY cost_deviation_pct DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/anomalies/completion")
def get_completion_anomalies(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute("""
        SELECT 
            project_id, work_id, work_description, category, mp_name, constituency, state, district,
            recommended_amount, final_amount, recommendation_date, completed_date, 
            completion_status, match_method, delay_status, project_duration_days,
            risk_score, risk_level, primary_reason
        FROM projects 
        WHERE completion_status = 'COMPLETION_VERIFICATION_REQUIRED'
        ORDER BY recommended_amount DESC, risk_score DESC
        LIMIT ?
    """, (limit,)).fetchall()
    
    results = []
    for r in rows:
        d = dict(r)
        rec_amt = float(d.get("recommended_amount") or 0.0)
        rec_date = d.get("recommendation_date") or "Approved"
        loc = d.get("district") or d.get("constituency") or "District Implementing Authority"
        
        d["linkage_status"] = d.get("match_method") or "UNMATCHED"
        d["matching_fields_used"] = ["work_id", "mp_name", "constituency_code", "sanction_amount", "financial_year"]
        d["reason"] = f"Work sanctioned on {rec_date} for ₹{rec_amt:,.0f}. No corresponding certified physical completion certificate or final completion record is present in the published central registry."
        d["review_action"] = f"Issue formal communication to District Authority ({loc}) to confirm physical milestone delivery, asset geo-tagging, and completion certificate issuance."
        results.append(d)
        
    conn.close()
    return results

@router.get("/anomalies/sector")
def get_sector_anomalies(limit: int = 50):
    import numpy as np
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sector_taxonomy = [
        ('Sports & Stadiums', ['%stadium%', '%sports%', '%playground%', '%gym%', '%badminton%', '%court%', '%cricket%']),
        ('Community Infrastructure', ['%community center%', '%community hall%', '%bhavan%', '%auditorium%', '%mandapam%', '%kalyana%']),
        ('Health & Medical Facilities', ['%hospital%', '%health%', '%medical%', '%dispensary%', '%ambulance%', '%clinic%']),
        ('Public Lighting & Solar Energy', ['%light%', '%solar%', '%electric%', '%high mast%', '%led%']),
        ('Roads, Bridges & Culverts', ['%road%', '%bridge%', '%culvert%', '%pathway%', '%cc road%', '%paving%']),
        ('Drinking Water & Sanitation', ['%water%', '%hand pump%', '%borewell%', '%tanker%', '%pipeline%', '%toilet%', '%drain%']),
        ('Education & Public Libraries', ['%school%', '%college%', '%library%', '%education%', '%classroom%', '%books%']),
        ('Irrigation & Water Conservation', ['%irrigation%', '%canal%', '%dam%', '%pond%', '%check dam%']),
        ('Plantation & Environment', ['%plantation%', '%tree%', '%forest%', '%park%', '%nursery%']),
        ('Public Passenger Amenities', ['%bus stand%', '%passenger shed%', '%waiting hall%', '%shelter%'])
    ]
    
    sector_benchmarks = {}
    for sector_name, kws in sector_taxonomy:
        clauses = ' OR '.join([f"work_description LIKE '{kw}'" for kw in kws])
        rows = cursor.execute(f"SELECT recommended_amount FROM projects WHERE ({clauses}) AND recommended_amount > 0").fetchall()
        amounts = [r["recommended_amount"] for r in rows]
        if len(amounts) > 0:
            sector_benchmarks[sector_name] = {
                'keywords': kws,
                'count': len(amounts),
                'median': float(np.median(amounts)),
                'q25': float(np.percentile(amounts, 25)),
                'q75': float(np.percentile(amounts, 75)),
                'min': float(np.min(amounts)),
                'max': float(np.max(amounts))
            }
            
    candidates = []
    for sector_name, meta in sector_benchmarks.items():
        clauses = ' OR '.join([f"work_description LIKE '{kw}'" for kw in meta['keywords']])
        query = f"""
            SELECT 
                project_id, work_id, work_description, category, mp_name, constituency, state, district,
                recommended_amount, final_amount, recommendation_date,
                risk_score, risk_level, primary_reason
            FROM projects
            WHERE ({clauses}) AND recommended_amount > {meta['median'] * 2.0}
            ORDER BY recommended_amount DESC
            LIMIT 15
        """
        rows = cursor.execute(query).fetchall()
        for r in rows:
            rec_amt = float(r["recommended_amount"] or 0.0)
            med_amt = meta['median']
            dev_pct = round(((rec_amt - med_amt) / med_amt) * 100.0, 1)
            ratio = round(rec_amt / med_amt, 1)
            candidates.append({
                'project_id': r["project_id"],
                'work_id': r["work_id"],
                'work_description': r["work_description"],
                'category': sector_name,
                'sector': sector_name,
                'mp_name': r["mp_name"],
                'constituency': r["constituency"],
                'state': r["state"],
                'district': r["district"],
                'recommended_amount': rec_amt,
                'final_amount': float(r["final_amount"] or 0.0),
                'peer_median_amount': med_amt,
                'category_median_amount': med_amt,
                'peer_q25_amount': meta['q25'],
                'peer_q75_amount': meta['q75'],
                'peer_min_amount': meta['min'],
                'peer_max_amount': meta['max'],
                'comparable_works_count': meta['count'],
                'sector_deviation_pct': dev_pct,
                'category_cost_deviation_pct': dev_pct,
                'deviation_pct': dev_pct,
                'deviation_ratio': ratio,
                'risk_score': r["risk_score"],
                'risk_level': r["risk_level"],
                'matching_criteria': "Standardized Development Sector Keyword Clustering",
                'reason': f"Sanction of ₹{rec_amt:,.0f} is +{dev_pct:,.1f}% above the {sector_name} peer median of ₹{med_amt:,.0f} ({ratio}x peer median across {meta['count']:,} comparable works; peer IQR: ₹{meta['q25']:,.0f} – ₹{meta['q75']:,.0f}).",
                'review_action': "Conduct technical bill-of-quantities (BOQ) review to verify multi-crore specialized civil works justification."
            })
            
    candidates.sort(key=lambda x: x['sector_deviation_pct'], reverse=True)
    conn.close()
    return candidates[:limit]

@router.get("/anomalies/duplicate")
def get_duplicate_anomalies(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT min(transaction_id) as transaction_id, min(matched_project_id) as matched_project_id, vendor, constituency, state, mp_name, work_description, expenditure_amount, expenditure_date, count(*) as repeat_count, count(*) as sig_repeat_count, sum(expenditure_amount) as total_amount "
        "FROM expenditures WHERE is_exact_duplicate = 1 "
        "GROUP BY vendor, constituency, expenditure_amount, expenditure_date "
        "HAVING repeat_count > 1 ORDER BY repeat_count DESC, total_amount DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    
    result = []
    for r in rows:
        d = dict(r)
        mp_id = d.get("matched_project_id")
        if mp_id is not None:
            mp_str = str(mp_id).replace(".0", "")
            d["matched_project_id"] = mp_str if mp_str.isdigit() else str(mp_id)
        result.append(d)
    return result

@router.get("/anomalies/payment")
def get_payment_anomalies(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        SELECT 
            e.vendor,
            e.mp_name,
            e.constituency,
            e.state,
            e.work_description,
            min(e.matched_project_id) as matched_project_id,
            count(e.transaction_id) as voucher_count,
            sum(e.expenditure_amount) as total_cluster_amount,
            min(e.expenditure_amount) as min_voucher_amount,
            max(e.expenditure_amount) as max_voucher_amount,
            min(e.expenditure_date) as start_date,
            max(e.expenditure_date) as end_date,
            max(1, round(julianday(max(e.expenditure_date)) - julianday(min(e.expenditure_date)) + 1)) as span_days
        FROM expenditures e
        WHERE e.expenditure_date IS NOT NULL 
          AND e.expenditure_amount > 0 
          AND e.vendor IS NOT NULL 
          AND trim(e.vendor) != ''
        GROUP BY e.vendor, e.mp_name, e.constituency, substr(e.expenditure_date, 1, 7)
        HAVING voucher_count >= 4 AND span_days <= 15
        ORDER BY (voucher_count / span_days) DESC, total_cluster_amount DESC
        LIMIT ?
    """
    rows = cursor.execute(query, (limit,)).fetchall()
    
    results = []
    for idx, r in enumerate(rows):
        v_cnt = int(r["voucher_count"] or 0)
        tot_amt = float(r["total_cluster_amount"] or 0.0)
        span = int(r["span_days"] or 1)
        daily_rate = round(v_cnt / span, 1)
        density_ratio = round(daily_rate / 0.1, 1)
        
        # Fetch sample vouchers for this cluster
        v_rows = cursor.execute("""
            SELECT transaction_id, expenditure_amount, expenditure_date, payment_status, work_description
            FROM expenditures
            WHERE vendor = ? AND mp_name = ? AND constituency = ? AND expenditure_date BETWEEN ? AND ?
            ORDER BY expenditure_date, expenditure_amount DESC
            LIMIT 10
        """, (r["vendor"], r["mp_name"], r["constituency"], r["start_date"], r["end_date"])).fetchall()
        
        vouchers = [
            {
                "transaction_id": vr["transaction_id"],
                "expenditure_amount": float(vr["expenditure_amount"] or 0.0),
                "expenditure_date": vr["expenditure_date"],
                "payment_status": vr["payment_status"] or "PAID",
                "work_description": vr["work_description"]
            } for vr in v_rows
        ]
        
        mp_id = r["matched_project_id"]
        clean_mp_id = None
        if mp_id is not None:
            mp_str = str(mp_id).replace(".0", "")
            clean_mp_id = mp_str if mp_str.isdigit() else str(mp_id)
            
        results.append({
            "cluster_id": f"PDB-{idx+1:03d}",
            "vendor": r["vendor"],
            "mp_name": r["mp_name"],
            "constituency": r["constituency"],
            "state": r["state"],
            "work_description": r["work_description"] or "Public Infrastructure Works",
            "matched_project_id": clean_mp_id,
            "voucher_count": v_cnt,
            "total_cluster_amount": tot_amt,
            "avg_voucher_amount": round(tot_amt / max(1, v_cnt), 2),
            "min_voucher_amount": float(r["min_voucher_amount"] or 0.0),
            "max_voucher_amount": float(r["max_voucher_amount"] or 0.0),
            "start_date": r["start_date"],
            "end_date": r["end_date"],
            "span_days": span,
            "daily_rate": daily_rate,
            "peer_median_daily_rate": 0.1,
            "density_ratio": density_ratio,
            "pattern_indicator": "High Payment Burst Density",
            "reason": f"{v_cnt} vouchers totaling INR {tot_amt:,.0f} disbursed within a {span}-day period ({density_ratio}x peer median daily frequency)",
            "sample_vouchers": vouchers
        })
        
    conn.close()
    return results

@router.get("/mps")
def get_mps_list(search: Optional[str] = None, limit: int = 100):
    conn = get_db_connection()
    cursor = conn.cursor()
    if search:
        s_pat = f"%{search}%"
        rows = cursor.execute(
            "SELECT * FROM mp_summaries WHERE mp_name LIKE ? OR constituency LIKE ? OR state LIKE ? ORDER BY total_expenditure DESC LIMIT ?",
            (s_pat, s_pat, s_pat, limit)
        ).fetchall()
    else:
        rows = cursor.execute(
            "SELECT * FROM mp_summaries ORDER BY total_expenditure DESC LIMIT ?",
            (limit,)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/mps/{mp_name}")
def get_mp_detail(mp_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    mp_row = cursor.execute("SELECT * FROM mp_summaries WHERE mp_name = ? OR mp_name LIKE ?", (mp_name, f"%{mp_name}%")).fetchone()
    if not mp_row:
        conn.close()
        raise HTTPException(status_code=404, detail="MP profile not found")
        
    actual_name = mp_row["mp_name"]
    projects = cursor.execute("SELECT project_id, work_description, category, recommended_amount, final_amount, completion_status, risk_score, risk_level, cost_deviation_pct FROM projects WHERE mp_name = ? ORDER BY risk_score DESC LIMIT 50", (actual_name,)).fetchall()
    
    risk_breakdown = cursor.execute("SELECT risk_level, count(*) as cnt FROM projects WHERE mp_name = ? GROUP BY risk_level", (actual_name,)).fetchall()
    risk_map = {r["risk_level"]: int(r["cnt"]) for r in risk_breakdown}
    
    conn.close()
    return {
        "mp_profile": dict(mp_row),
        "risk_distribution": risk_map,
        "projects": [dict(p) for p in projects]
    }

@router.get("/constituencies")
def get_constituencies(limit: int = 100):
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT constituency, state, count(*) as total_projects, sum(recommended_amount) as total_recommended, sum(final_amount) as total_final, "
        "sum(case when completion_status = 'COMPLETED' then 1 else 0 end) as completed_count, "
        "sum(case when risk_level in ('HIGH', 'CRITICAL') then 1 else 0 end) as high_risk_count, "
        "round(avg(risk_score), 1) as avg_risk_score "
        "FROM projects GROUP BY constituency, state ORDER BY total_recommended DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/analytics/states")
def get_state_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT state, count(*) as total_projects, sum(recommended_amount) as total_recommended, sum(final_amount) as total_final, "
        "sum(case when completion_status = 'COMPLETED' then 1 else 0 end) as completed_count, "
        "sum(case when completion_status = 'COMPLETION_VERIFICATION_REQUIRED' then 1 else 0 end) as unverified_count, "
        "sum(case when risk_level in ('HIGH', 'CRITICAL') then 1 else 0 end) as high_risk_count, "
        "round(avg(risk_score), 1) as avg_risk_score "
        "FROM projects GROUP BY state ORDER BY total_recommended DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/ai/query", response_model=AIQueryResponse)
def handle_ai_query(payload: AIQueryRequest):
    return answer_officer_query(payload.query, payload.context_project_id)

@router.get("/reports/project/{project_id}")
def generate_project_report(project_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    r = cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,)).fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
        
    p_dict = dict(r)
    p_dict["reasons"] = json.loads(r["reasons_json"]) if r["reasons_json"] else [r["primary_reason"]]
    p_dict["point_breakdown"] = json.loads(r["point_breakdown_json"]) if r["point_breakdown_json"] else {}
    p_dict["advisory_actions"] = json.loads(r["advisory_actions_json"]) if r["advisory_actions_json"] else []
    
    similar = find_similar_projects(project_id, limit=4)
    transactions = cursor.execute("SELECT * FROM expenditures WHERE matched_project_id = ? LIMIT 10", (project_id,)).fetchall()
    
    conn.close()
    
    return {
        "report_id": f"REP-MPLAD-{project_id}",
        "generated_at": datetime.now().isoformat(),
        "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "project": p_dict,
        "similar_cohort": similar,
        "linked_transactions": [dict(t) for t in transactions],
        "disclaimer": "This intelligence dossier is generated by the MPLAD AI Risk & Anomaly Intelligence System for authorized inspection prioritization. Anomaly indicators reflect statistical variations and do not constitute legal determinations of misconduct."
    }

@router.post("/analyze/recalculate")
def recalculate_project_risk(
    project_id: str = Query(...),
    weights: RiskWeightsRequest = Body(...)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    r = cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,)).fetchone()
    conn.close()
    
    if not r:
        raise HTTPException(status_code=404, detail="Project not found")
        
    custom_w = {
        "cost_anomaly_max": weights.cost_anomaly_max or 30,
        "completion_concern_max": weights.completion_concern_max or 25,
        "payment_anomaly_max": weights.payment_anomaly_max or 20,
        "duplicate_concern_max": weights.duplicate_concern_max or 15,
        "similarity_anomaly_max": weights.similarity_anomaly_max or 10
    }
    
    res = compute_project_risk(
        row=dict(r),
        weights=custom_w,
        ml_anomaly_score=float(r["ml_anomaly_score"] or 0.0),
        is_ml_anomaly=bool(r["is_ml_anomaly"])
    )
    return res
