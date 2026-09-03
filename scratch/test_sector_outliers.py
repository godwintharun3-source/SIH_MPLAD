import sqlite3, json
import numpy as np

conn = sqlite3.connect('data/processed/mplads_intelligence.db')
cursor = conn.cursor()

SECTOR_TAXONOMY = [
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
for sector_name, kws in SECTOR_TAXONOMY:
    clauses = ' OR '.join([f"work_description LIKE '{kw}'" for kw in kws])
    rows = cursor.execute(f"SELECT recommended_amount FROM projects WHERE ({clauses}) AND recommended_amount > 0").fetchall()
    amounts = [r[0] for r in rows]
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

# Query projects across sectors
candidates = []
for sector_name, meta in sector_benchmarks.items():
    clauses = ' OR '.join([f"work_description LIKE '{kw}'" for kw in meta['keywords']])
    query = f"""
        SELECT 
            project_id, work_description, mp_name, constituency, state, district,
            recommended_amount, final_amount, recommendation_date,
            risk_score, risk_level, primary_reason
        FROM projects
        WHERE ({clauses}) AND recommended_amount > {meta['median'] * 2.0}
        ORDER BY recommended_amount DESC
        LIMIT 10
    """
    rows = cursor.execute(query).fetchall()
    for r in rows:
        rec_amt = float(r[6] or 0.0)
        med_amt = meta['median']
        dev_pct = round(((rec_amt - med_amt) / med_amt) * 100.0, 1)
        ratio = round(rec_amt / med_amt, 1)
        candidates.append({
            'project_id': r[0],
            'work_description': r[1],
            'sector': sector_name,
            'mp_name': r[2],
            'constituency': r[3],
            'state': r[4],
            'district': r[5],
            'recommended_amount': rec_amt,
            'final_amount': float(r[7] or 0.0),
            'peer_median_amount': med_amt,
            'peer_q25_amount': meta['q25'],
            'peer_q75_amount': meta['q75'],
            'peer_min_amount': meta['min'],
            'peer_max_amount': meta['max'],
            'comparable_works_count': meta['count'],
            'sector_deviation_pct': dev_pct,
            'deviation_ratio': ratio,
            'risk_score': r[9],
            'risk_level': r[10],
            'reason': f"Sanctioned cost of INR {rec_amt:,.0f} is +{dev_pct:,.1f}% above the {sector_name} peer median of INR {med_amt:,.0f} ({ratio}x sector baseline across {meta['count']:,} comparable works).",
            'review_action': "Request detailed bill of quantities (BOQ) and rate analysis justifying multi-crore deviation from sector norm."
        })

# Sort all candidates by sector deviation ratio descending
candidates.sort(key=lambda x: x['sector_deviation_pct'], reverse=True)
print(f"Total sector outliers identified: {len(candidates)}")
print("\nTop 5 Sector Deviation Outliers:")
for i, c in enumerate(candidates[:5]):
    print(f"{i+1}. #{c['project_id']} | Sector: {c['sector']} | Cost: INR {c['recommended_amount']:,.0f} | Median: INR {c['peer_median_amount']:,.0f} | Dev: +{c['sector_deviation_pct']:,.1f}% ({c['deviation_ratio']}x) | Peers: {c['comparable_works_count']:,}")

conn.close()
