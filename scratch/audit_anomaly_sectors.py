import sqlite3
import numpy as np

conn = sqlite3.connect('data/processed/mplads_intelligence.db')
cursor = conn.cursor()

sector_rules = [
    ('Sports, Stadiums & Recreation', ['%stadium%', '%sports%', '%playground%', '%gym%', '%badminton%', '%court%', '%cricket%']),
    ('Community Halls & Centers', ['%community center%', '%community hall%', '%bhavan%', '%auditorium%', '%mandapam%', '%kalyana%']),
    ('Health & Medical Facilities', ['%hospital%', '%health%', '%medical%', '%dispensary%', '%ambulance%', '%clinic%']),
    ('Public Lighting & Solar Energy', ['%light%', '%solar%', '%electric%', '%high mast%', '%led%']),
    ('Roads, Bridges & Culverts', ['%road%', '%bridge%', '%culvert%', '%pathway%', '%cc road%', '%paving%']),
    ('Drinking Water & Sanitation', ['%water%', '%hand pump%', '%borewell%', '%tanker%', '%pipeline%', '%toilet%', '%drain%']),
    ('Education & Public Libraries', ['%school%', '%college%', '%library%', '%education%', '%classroom%', '%books%']),
    ('Irrigation & Water Conservation', ['%irrigation%', '%canal%', '%dam%', '%pond%', '%check dam%']),
    ('Plantation & Environment', ['%plantation%', '%tree%', '%forest%', '%park%', '%nursery%']),
    ('Public Passenger Amenities', ['%bus stand%', '%passenger shed%', '%waiting hall%', '%shelter%'])
]

print("=== GRANULAR SECTOR BENCHMARK DISTRIBUTIONS ===")
for sector_name, kws in sector_rules:
    clauses = ' OR '.join([f"work_description LIKE '{kw}'" for kw in kws])
    rows = cursor.execute(f"SELECT recommended_amount FROM projects WHERE ({clauses}) AND recommended_amount > 0").fetchall()
    amounts = [r[0] for r in rows]
    if len(amounts) > 0:
        med = float(np.median(amounts))
        q25 = float(np.percentile(amounts, 25))
        q75 = float(np.percentile(amounts, 75))
        min_a = float(np.min(amounts))
        max_a = float(np.max(amounts))
        print(f"Sector: {sector_name:32} | Cohort: {len(amounts):6,d} | Median: Rs {med:9,.0f} | IQR: Rs {q25:7,.0f} - {q75:7,.0f} | Max: Rs {max_a:11,.0f}")

conn.close()
