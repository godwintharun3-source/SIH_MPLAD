import sqlite3, json
import numpy as np

conn = sqlite3.connect('data/processed/mplads_intelligence.db')
cursor = conn.cursor()

# Sector Classifier & Benchmark Dictionary
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

# Precompute benchmark stats for each sector
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

print("Computed Sector Benchmarks:")
for k, v in sector_benchmarks.items():
    print(f" - {k}: {v['count']:,} peers | Median: Rs {v['median']:,.0f} | IQR: [Rs {v['q25']:,.0f} - Rs {v['q75']:,.0f}]")

conn.close()
