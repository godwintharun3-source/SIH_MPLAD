"""
Grounded MoSPI AI Intelligence Assistant Service
Interprets officer natural language queries, executes database queries against real tables,
and generates structured, factual answers strictly citing genuine records without hallucination.
"""

import re
import json
import sqlite3
from typing import Dict, Any, List
from datetime import datetime
from backend.app.database import DB_PATH

STOP_WORDS = {
    "show", "list", "tell", "what", "where", "how", "many", "project", "projects", "works",
    "the", "is", "are", "was", "were", "and", "or", "in", "on", "at", "to", "for", "with",
    "about", "give", "me", "any", "some", "weather", "mars", "who", "when", "can", "you",
    "please", "details", "info", "information"
}

def execute_sql(query: str, params: tuple = ()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def answer_officer_query(query_text: str, context_project_id: str = None) -> Dict[str, Any]:
    q = query_text.strip().lower()
    timestamp = datetime.now().isoformat()
    
    # 1. Project Specific "Why was Project X flagged?"
    proj_id_match = re.search(r"(?:project|work)\s*(?:id|#)?\s*([a-zA-Z0-9_-]+)", q)
    target_id = proj_id_match.group(1) if proj_id_match else context_project_id
    
    if target_id and ("why" in q or "flagged" in q or "risk" in q or "details" in q or "explain" in q):
        rows = execute_sql("SELECT * FROM projects WHERE project_id = ? OR work_id = ?", (target_id, target_id))
        if rows:
            p = rows[0]
            reasons = json.loads(p["reasons_json"]) if p.get("reasons_json") else [p.get("primary_reason", "")]
            breakdown = json.loads(p["point_breakdown_json"]) if p.get("point_breakdown_json") else {}
            advisories = json.loads(p["advisory_actions_json"]) if p.get("advisory_actions_json") else []
            
            reasons_formatted = "\n".join([f"{i+1}. {r}" for i, r in enumerate(reasons)])
            actions_formatted = "\n".join([f"• {a}" for a in advisories])
            
            answer = (
                f"### AI Risk Diagnostic for Project #{p['project_id']}\n\n"
                f"**Work Description**: {p['work_description']}\n"
                f"**Location**: {p['constituency']}, {p['state']} (MP: {p['mp_name']})\n"
                f"**Risk Classification**: **{p['risk_level']}** ({p['risk_score']}/100 points)\n\n"
                f"**Key Identified Risk Factors**:\n{reasons_formatted}\n\n"
                f"**Point Contribution Breakdown**:\n"
                f"- Cost Deviation Points: +{breakdown.get('cost_anomaly', 0)} pts\n"
                f"- Completion / Delay Points: +{breakdown.get('completion_concern', 0)} pts\n"
                f"- Payment Pattern Points: +{breakdown.get('payment_anomaly', 0)} pts\n"
                f"- Duplicate Risk Points: +{breakdown.get('duplicate_concern', 0)} pts\n"
                f"- Sector Similarity Outlier: +{breakdown.get('similarity_anomaly', 0)} pts\n\n"
                f"**Recommended Advisory Actions**:\n{actions_formatted}\n\n"
                f"*(Note: Anomaly indicators prioritize human verification and do not imply wrongdoing.)*"
            )
            return {
                "query": query_text,
                "answer": answer,
                "grounding_data": [p],
                "cited_project_ids": [str(p["project_id"])],
                "timestamp": timestamp
            }
            
    # 2. "Show me the 10 highest-risk projects" / Top risk works
    if ("high" in q and ("risk" in q or "flagged" in q or "critical" in q)) or "highest" in q or "top 10" in q or "top projects" in q:
        rows = execute_sql(
            "SELECT project_id, work_description, constituency, state, recommended_amount, final_amount, risk_score, risk_level, primary_reason "
            "FROM projects WHERE risk_score > 30 ORDER BY risk_score DESC, cost_deviation_pct DESC LIMIT 10"
        )
        if rows:
            lines = [f"Found **{len(rows)}** prioritized projects requiring officer review:\n"]
            for idx, r in enumerate(rows):
                rec_fmt = f"₹{r['recommended_amount']:,.0f}"
                fin_fmt = f"₹{r['final_amount']:,.0f}" if r['final_amount'] > 0 else "Pending"
                lines.append(f"{idx+1}. **Project #{r['project_id']}** ({r['risk_level']} - Score: **{r['risk_score']}/100**)\n"
                             f"   - **Description**: {r['work_description']}\n"
                             f"   - **Location**: {r['constituency']}, {r['state']}\n"
                             f"   - **Sanction**: Recommended: {rec_fmt} | Final: {fin_fmt}\n"
                             f"   - **Primary Flag**: {r['primary_reason']}")
            
            cited = [str(r["project_id"]) for r in rows]
            return {
                "query": query_text,
                "answer": "\n".join(lines),
                "grounding_data": rows,
                "cited_project_ids": cited,
                "timestamp": timestamp
            }

    # 3. "Show projects with high cost deviation"
    if "cost" in q and ("deviation" in q or "escalation" in q or "increase" in q or "overrun" in q):
        rows = execute_sql(
            "SELECT project_id, work_description, constituency, state, recommended_amount, final_amount, cost_deviation_pct, risk_score, risk_level "
            "FROM projects WHERE cost_deviation_pct > 25.0 AND final_amount > 0 ORDER BY cost_deviation_pct DESC LIMIT 10"
        )
        if rows:
            lines = ["### Projects with Highest Cost Deviation vs Sanction:\n"]
            for idx, r in enumerate(rows):
                lines.append(
                    f"{idx+1}. **Project #{r['project_id']}** (+{r['cost_deviation_pct']:.1f}% Deviation)\n"
                    f"   - **Work**: {r['work_description']}\n"
                    f"   - **Location**: {r['constituency']}, {r['state']}\n"
                    f"   - **Financials**: Recommended ₹{r['recommended_amount']:,.0f} ➔ Final ₹{r['final_amount']:,.0f}\n"
                    f"   - **Risk Level**: {r['risk_level']} (Score: {r['risk_score']}/100)"
                )
            return {
                "query": query_text,
                "answer": "\n".join(lines),
                "grounding_data": rows,
                "cited_project_ids": [str(r["project_id"]) for r in rows],
                "timestamp": timestamp
            }

    # 4. "How many projects require completion verification?" / Status inquiries
    if "verification" in q or ("completion" in q and ("how many" in q or "pending" in q or "status" in q or "unverified" in q)):
        rows = execute_sql(
            "SELECT count(*) as total_unverified, sum(recommended_amount) as total_unverified_budget FROM projects WHERE completion_status = 'COMPLETION_VERIFICATION_REQUIRED'"
        )
        total_comp = execute_sql("SELECT count(*) as total_comp FROM projects WHERE completion_status = 'COMPLETED'")[0]["total_comp"]
        
        stat = rows[0]
        count = stat["total_unverified"]
        budget = stat["total_unverified_budget"] or 0.0
        
        answer = (
            f"### Project Completion Verification Summary\n\n"
            f"- **Projects Requiring Verification**: **{count:,}** works\n"
            f"- **Verified Completed Projects**: **{total_comp:,}** works\n"
            f"- **Recommended Budget under Verification**: **₹{budget:,.2f}**\n\n"
            f"**Note on Methodology**: In accordance with MoSPI guidelines, recommended works without matching completion records in the published completion registry are designated *'Completion Status Requires Verification'* rather than assumed delayed or failed, pending district ground reports."
        )
        return {
            "query": query_text,
            "answer": answer,
            "grounding_data": [stat],
            "cited_project_ids": [],
            "timestamp": timestamp
        }

    # 5. "Which constituencies have the highest concentration of risk indicators?"
    if "constituenc" in q or "district" in q:
        rows = execute_sql(
            "SELECT constituency, state, count(*) as total_projects, "
            "sum(case when risk_level in ('HIGH', 'CRITICAL') then 1 else 0 end) as high_risk_count, "
            "round(avg(risk_score), 1) as avg_risk "
            "FROM projects GROUP BY constituency, state "
            "HAVING total_projects >= 5 "
            "ORDER BY high_risk_count DESC, avg_risk DESC LIMIT 10"
        )
        lines = ["### Constituencies with Highest Concentration of Risk Indicators:\n"]
        for idx, r in enumerate(rows):
            lines.append(
                f"{idx+1}. **{r['constituency']}** ({r['state']})\n"
                f"   - High/Critical Risk Projects: **{r['high_risk_count']}**\n"
                f"   - Average Risk Score: **{r['avg_risk']}/100**\n"
                f"   - Total Monitored Projects: {r['total_projects']}"
            )
        return {
            "query": query_text,
            "answer": "\n".join(lines),
            "grounding_data": rows,
            "cited_project_ids": [],
            "timestamp": timestamp
        }

    # 6. Duplicate transaction questions
    if "duplicate" in q or "repeat" in q:
        rows = execute_sql(
            "SELECT vendor, constituency, state, count(*) as duplicate_instances, sum(expenditure_amount) as total_dup_amount "
            "FROM expenditures WHERE is_exact_duplicate = 1 "
            "GROUP BY vendor, constituency, state ORDER BY duplicate_instances DESC LIMIT 8"
        )
        total_dup = execute_sql("SELECT count(*) as total_dup, sum(expenditure_amount) as total_amt FROM expenditures WHERE is_exact_duplicate = 1")[0]
        
        lines = [
            f"### Duplicate Transaction Analysis\n\n"
            f"- Total Exact Duplicate Transaction Records: **{total_dup['total_dup']:,}**\n"
            f"- Aggregate Disbursed Amount in Flagged Records: **₹{total_dup['total_amt']:,.2f}**\n\n"
            f"**Top Vendor & Constituency Signatures with Repeated Payment Records**:\n"
        ]
        for idx, r in enumerate(rows):
            lines.append(
                f"{idx+1}. **{r['vendor']}** ({r['constituency']}, {r['state']})\n"
                f"   - Duplicate Vouchers: **{r['duplicate_instances']}** entries | Amount: ₹{r['total_dup_amount']:,.0f}"
            )
        return {
            "query": query_text,
            "answer": "\n".join(lines),
            "grounding_data": rows,
            "cited_project_ids": [],
            "timestamp": timestamp
        }

    # 7. Grounded Keyword Search (filtered against stopwords)
    words = [w for w in re.findall(r"\b[a-zA-Z0-9_-]{3,}\b", q) if w not in STOP_WORDS]
    if words:
        keyword = words[0]
        search_pattern = f"%{keyword}%"
        rows = execute_sql(
            "SELECT project_id, work_description, constituency, state, mp_name, recommended_amount, final_amount, risk_score, risk_level "
            "FROM projects WHERE (work_description LIKE ? OR constituency LIKE ? OR state LIKE ? OR mp_name LIKE ? OR category LIKE ?) "
            "ORDER BY risk_score DESC LIMIT 5",
            (search_pattern, search_pattern, search_pattern, search_pattern, search_pattern)
        )
        if rows:
            lines = [f"### Records matching '{keyword}':\n"]
            for idx, r in enumerate(rows):
                lines.append(
                    f"{idx+1}. **Project #{r['project_id']}** ({r['risk_level']} - Score: {r['risk_score']}/100)\n"
                    f"   - **Work**: {r['work_description']}\n"
                    f"   - **Location**: {r['constituency']}, {r['state']} (MP: {r['mp_name']})\n"
                    f"   - **Budget**: Recommended ₹{r['recommended_amount']:,.0f}"
                )
            return {
                "query": query_text,
                "answer": "\n".join(lines),
                "grounding_data": rows,
                "cited_project_ids": [str(r["project_id"]) for r in rows],
                "timestamp": timestamp
            }

    # Unrecognized / No data fallback (strictly obeying requirement #18)
    return {
        "query": query_text,
        "answer": "I don't have sufficient data to answer that specific query. Please provide a valid Project ID, Constituency, State, or ask regarding Cost Deviations, Completion Verification, or Duplicate Transactions.",
        "grounding_data": [],
        "cited_project_ids": [],
        "timestamp": timestamp
    }
