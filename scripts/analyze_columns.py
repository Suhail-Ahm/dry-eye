#!/usr/bin/env python3
"""
Dry Eye Disease — Per-Column Profile Generator (v2)
Enhanced with clinical context, descriptions, normality tests,
effect size interpretations, and clinical reference ranges.
"""

import json, os
import numpy as np
import pandas as pd
from scipy import stats

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
CSV_PATH = os.path.join(PROJECT_DIR, "Dry_Eye_Dataset.csv")
OUTPUT = os.path.join(PROJECT_DIR, "dashboard", "public", "data", "column_profiles.json")

# ── Clinical metadata for each column ────────────────────────────────────
COLUMN_META = {
    "Age": {
        "description": "Patient age at the time of examination. Dry eye prevalence generally increases with age, especially after 50, due to decreased tear production.",
        "unit": "years",
        "clinical_range": "18–45 (study cohort)",
        "category": "Demographics",
        "relevance": "high",
    },
    "Gender": {
        "description": "Biological sex. Women are 2× more likely to develop dry eye due to hormonal fluctuations (menopause, pregnancy, oral contraceptives).",
        "unit": None,
        "clinical_range": None,
        "category": "Demographics",
        "relevance": "high",
    },
    "Sleep duration": {
        "description": "Total hours of sleep per night. Insufficient sleep (<6h) reduces tear film stability and increases ocular surface inflammation.",
        "unit": "hours/night",
        "clinical_range": "Recommended: 7–9h (adults)",
        "category": "Sleep",
        "relevance": "high",
    },
    "Sleep quality": {
        "description": "Self-reported sleep quality on a 1–5 scale (1=very poor, 5=excellent). Poor sleep quality correlates with increased inflammatory markers affecting the ocular surface.",
        "unit": "1–5 scale",
        "clinical_range": "≥3 considered adequate",
        "category": "Sleep",
        "relevance": "medium",
    },
    "Stress level": {
        "description": "Self-reported stress on a 1–5 scale (1=low, 5=high). Chronic stress triggers cortisol release, which disrupts meibomian gland function and tear composition.",
        "unit": "1–5 scale",
        "clinical_range": "≤3 considered manageable",
        "category": "Mental Health",
        "relevance": "medium",
    },
    "BP_Systolic": {
        "description": "Systolic blood pressure — the upper number. Hypertension can impair microvascular circulation to the lacrimal gland, reducing tear production.",
        "unit": "mmHg",
        "clinical_range": "Normal: <120 | Elevated: 120–129 | High: ≥130",
        "category": "Cardiovascular",
        "relevance": "low",
    },
    "BP_Diastolic": {
        "description": "Diastolic blood pressure — the lower number. Elevated diastolic BP reflects increased peripheral resistance, which may affect orbital blood supply.",
        "unit": "mmHg",
        "clinical_range": "Normal: <80 | Elevated: 80–89 | High: ≥90",
        "category": "Cardiovascular",
        "relevance": "low",
    },
    "Heart rate": {
        "description": "Resting heart rate. Autonomic nervous system imbalance (reflected in HR) can affect lacrimal gland secretion via parasympathetic pathways.",
        "unit": "bpm",
        "clinical_range": "Normal: 60–100 bpm",
        "category": "Cardiovascular",
        "relevance": "low",
    },
    "Daily steps": {
        "description": "Average daily step count. Physical activity improves systemic circulation and has anti-inflammatory effects that may protect the ocular surface.",
        "unit": "steps/day",
        "clinical_range": "Recommended: ≥7,500 steps/day",
        "category": "Physical Activity",
        "relevance": "low",
    },
    "Physical activity": {
        "description": "Self-rated physical activity level (1–5 scale). Regular exercise is associated with improved tear film quality through reduced systemic inflammation.",
        "unit": "1–5 scale",
        "clinical_range": "≥3 considered active",
        "category": "Physical Activity",
        "relevance": "low",
    },
    "Height": {
        "description": "Patient height in centimeters. Used to derive BMI. Not directly linked to dry eye but part of the metabolic profile.",
        "unit": "cm",
        "clinical_range": "Varies by population",
        "category": "Anthropometrics",
        "relevance": "none",
    },
    "Weight": {
        "description": "Patient weight in kilograms. Obesity (high weight) is linked to chronic low-grade inflammation that can exacerbate dry eye symptoms.",
        "unit": "kg",
        "clinical_range": "Varies by height/age",
        "category": "Anthropometrics",
        "relevance": "low",
    },
    "BMI": {
        "description": "Body Mass Index (Weight/Height²). Obese individuals (BMI ≥30) have higher rates of meibomian gland dysfunction due to metabolic syndrome-related inflammation.",
        "unit": "kg/m²",
        "clinical_range": "Underweight: <18.5 | Normal: 18.5–24.9 | Overweight: 25–29.9 | Obese: ≥30",
        "category": "Anthropometrics",
        "relevance": "medium",
    },
    "Sleep disorder": {
        "description": "Diagnosed sleep disorder (Y/N). Sleep apnea and insomnia are associated with a 2–3× increase in dry eye risk through floppy eyelid syndrome and reduced REM-phase tear film maintenance.",
        "unit": None,
        "clinical_range": None,
        "category": "Sleep",
        "relevance": "high",
    },
    "Wake up during night": {
        "description": "Frequent nighttime awakening (Y/N). Disrupted sleep architecture reduces the nocturnal tear film regeneration cycle, leaving eyes more vulnerable in the morning.",
        "unit": None,
        "clinical_range": None,
        "category": "Sleep",
        "relevance": "medium",
    },
    "Feel sleepy during day": {
        "description": "Daytime drowsiness (Y/N). A proxy for sleep insufficiency — correlates with reduced blink rate and incomplete blinks during drowsy periods.",
        "unit": None,
        "clinical_range": None,
        "category": "Sleep",
        "relevance": "medium",
    },
    "Caffeine consumption": {
        "description": "Regular caffeine intake (Y/N). Caffeine has a mild diuretic effect but studies show it may paradoxically increase tear secretion via adenosine A2 receptor stimulation.",
        "unit": None,
        "clinical_range": None,
        "category": "Lifestyle",
        "relevance": "low",
    },
    "Alcohol consumption": {
        "description": "Regular alcohol consumption (Y/N). Alcohol is a vasodilator and diuretic — chronic use can cause systemic dehydration affecting tear osmolarity and volume.",
        "unit": None,
        "clinical_range": None,
        "category": "Lifestyle",
        "relevance": "medium",
    },
    "Smoking": {
        "description": "Active smoker (Y/N). Cigarette smoke is a direct ocular surface irritant and contains >7,000 chemicals that destabilize the tear film lipid layer.",
        "unit": None,
        "clinical_range": None,
        "category": "Lifestyle",
        "relevance": "high",
    },
    "Medical issue": {
        "description": "Pre-existing medical condition (Y/N). Conditions like diabetes, rheumatoid arthritis, and thyroid disease are strongly linked to dry eye through inflammatory and autoimmune pathways.",
        "unit": None,
        "clinical_range": None,
        "category": "Medical History",
        "relevance": "high",
    },
    "Ongoing medication": {
        "description": "Currently taking medication (Y/N). Many medications (antihistamines, antidepressants, beta-blockers, diuretics) have anticholinergic effects that reduce tear secretion.",
        "unit": None,
        "clinical_range": None,
        "category": "Medical History",
        "relevance": "high",
    },
    "Smart device before bed": {
        "description": "Uses smartphone/tablet within 1 hour of sleep (Y/N). Blue light from screens suppresses melatonin production and concentrated screen fixation reduces blink rate by 60%.",
        "unit": None,
        "clinical_range": None,
        "category": "Digital Habits",
        "relevance": "medium",
    },
    "Average screen time": {
        "description": "Daily hours spent on digital screens. Prolonged screen use reduces blink rate from ~15/min to ~5/min, causing incomplete meibomian oil spread and rapid tear evaporation.",
        "unit": "hours/day",
        "clinical_range": "Low risk: <4h | Moderate: 4–8h | High risk: >8h",
        "category": "Digital Habits",
        "relevance": "high",
    },
    "Blue-light filter": {
        "description": "Uses blue-light filtering glasses or screen filter (Y/N). Reduces high-energy visible (HEV) light that can cause retinal photoxicity and ocular surface inflammation.",
        "unit": None,
        "clinical_range": None,
        "category": "Digital Habits",
        "relevance": "medium",
    },
    "Discomfort Eye-strain": {
        "description": "Experiences eye strain or discomfort (Y/N). A primary symptom of dry eye — caused by corneal nerve exposure when tear film breaks up. Often worst in the afternoon.",
        "unit": None,
        "clinical_range": None,
        "category": "Symptoms",
        "relevance": "high",
    },
    "Redness in eye": {
        "description": "Visible redness/bloodshot eyes (Y/N). Conjunctival hyperemia occurs when the tear film fails to protect the ocular surface, triggering vasodilation of conjunctival blood vessels.",
        "unit": None,
        "clinical_range": None,
        "category": "Symptoms",
        "relevance": "high",
    },
    "Itchiness/Irritation in eye": {
        "description": "Eye itchiness or irritation (Y/N). Can indicate allergic conjunctivitis co-occurring with dry eye — a common overlap. Inflammation releases histamine causing the itch reflex.",
        "unit": None,
        "clinical_range": None,
        "category": "Symptoms",
        "relevance": "high",
    },
    "Dry Eye Disease": {
        "description": "The target variable — diagnosed Dry Eye Disease (Y/N). Defined as a multifactorial disease of the ocular surface characterized by tear film instability, hyperosmolarity, and neurosensory abnormalities.",
        "unit": None,
        "clinical_range": None,
        "category": "Target",
        "relevance": "target",
    },
}

RELEVANCE_LABELS = {
    "high": "🔴 Strongly associated with dry eye in clinical literature",
    "medium": "🟡 Moderate clinical evidence",
    "low": "🟢 Weak or indirect clinical association",
    "none": "⚪ No direct clinical link — auxiliary variable",
    "target": "🎯 This is the prediction target",
}

print("Loading dataset...")
df = pd.read_csv(CSV_PATH)
df["DryEye"] = (df["Dry Eye Disease"] == "Y").astype(int)
df["BP_Systolic"] = df["Blood pressure"].str.split("/").str[0].astype(int)
df["BP_Diastolic"] = df["Blood pressure"].str.split("/").str[1].astype(int)
df["BMI"] = round(df["Weight"] / ((df["Height"] / 100) ** 2), 1)

COLUMNS = list(COLUMN_META.keys())
profiles = []

for col in COLUMNS:
    print(f"  Profiling: {col}")
    s = df[col]
    unique_vals = s.nunique()
    missing = int(s.isna().sum())
    total = len(s)
    meta = COLUMN_META[col]

    # Determine type
    if s.dtype in ["float64", "int64"] and unique_vals > 6:
        col_type = "numeric"
    elif set(s.dropna().unique()) <= {"Y", "N"}:
        col_type = "binary"
    elif s.dtype in ["float64", "int64"] and unique_vals <= 6:
        col_type = "ordinal"
    else:
        col_type = "categorical"

    profile = {
        "name": col,
        "type": col_type,
        "unique": unique_vals,
        "missing": missing,
        "total": total,
        "completeness": round((1 - missing / total) * 100, 1),
        # Clinical metadata
        "description": meta["description"],
        "unit": meta.get("unit"),
        "clinical_range": meta.get("clinical_range"),
        "clinical_category": meta["category"],
        "clinical_relevance": meta["relevance"],
        "relevance_label": RELEVANCE_LABELS[meta["relevance"]],
    }

    if col_type == "numeric":
        profile["stats"] = {
            "mean": round(float(s.mean()), 2),
            "median": round(float(s.median()), 2),
            "std": round(float(s.std()), 2),
            "min": round(float(s.min()), 2),
            "max": round(float(s.max()), 2),
            "q1": round(float(s.quantile(0.25)), 2),
            "q3": round(float(s.quantile(0.75)), 2),
            "iqr": round(float(s.quantile(0.75) - s.quantile(0.25)), 2),
            "skew": round(float(s.skew()), 3),
            "kurtosis": round(float(s.kurtosis()), 3),
        }

        # Normality test (Shapiro on sample for perf)
        sample = s.dropna().sample(min(5000, len(s)), random_state=42)
        _, norm_p = stats.shapiro(sample)
        profile["normality"] = {
            "shapiro_p": round(float(norm_p), 6),
            "is_normal": bool(norm_p > 0.05),
            "label": "Normal distribution" if norm_p > 0.05 else "Non-normal distribution",
        }

        # Outliers
        q1, q3 = s.quantile(0.25), s.quantile(0.75)
        iqr = q3 - q1
        outlier_count = int(((s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)).sum())
        profile["outliers"] = outlier_count

        # Distribution histogram
        n_bins = min(12, unique_vals)
        hist, edges = np.histogram(s.dropna(), bins=n_bins)
        profile["distribution"] = [
            {"range": f"{edges[i]:.1f}-{edges[i+1]:.1f}", "count": int(hist[i])}
            for i in range(len(hist))
        ]

        # Dry eye rate per bin
        bins_cut = pd.cut(s, bins=n_bins)
        dry_eye_by_bin = []
        for interval in sorted(bins_cut.dropna().unique()):
            sub = df[bins_cut == interval]
            if len(sub) > 0:
                dry_eye_by_bin.append({
                    "range": f"{interval.left:.1f}-{interval.right:.1f}",
                    "rate": round(float(sub["DryEye"].mean()) * 100, 1),
                    "count": int(len(sub)),
                })
        profile["dry_eye_by_value"] = dry_eye_by_bin

        # Correlation + effect size
        r, p = stats.pointbiserialr(df["DryEye"], s.fillna(s.median()))
        strength = "strong" if abs(r) > 0.3 else "moderate" if abs(r) > 0.1 else "weak"
        direction = "positive" if r > 0 else "negative"
        profile["correlation"] = {"r": round(float(r), 4), "p": round(float(p), 6)}
        profile["effect_size"] = {"type": "Point-Biserial r", "value": round(abs(float(r)), 4), "strength": strength}

        # Mann-Whitney U test (dry eye vs no dry eye)
        g1 = df[df["DryEye"] == 1][col].dropna()
        g0 = df[df["DryEye"] == 0][col].dropna()
        u_stat, u_p = stats.mannwhitneyu(g1, g0, alternative="two-sided")
        profile["group_test"] = {
            "test": "Mann-Whitney U",
            "statistic": round(float(u_stat), 1),
            "p": round(float(u_p), 6),
            "significant": bool(u_p < 0.05),
        }

        profile["insight"] = (
            f"{col} has a {strength} {direction} correlation with dry eye "
            f"(r={r:.3f}, p={'<0.001' if p < 0.001 else f'{p:.4f}'}). "
            + (f"Higher {col.lower()} is {'associated with' if r > 0 else 'protective against'} dry eye." if abs(r) > 0.05 else f"{col} shows minimal statistical association with dry eye.")
            + f" Mann-Whitney U test: {'significant' if u_p < 0.05 else 'not significant'} (p={'<0.001' if u_p < 0.001 else f'{u_p:.4f}'})."
        )

        # Box plot per group
        profile["box_plot"] = {}
        for label, flag in [("Dry Eye", 1), ("No Dry Eye", 0)]:
            vals = df[df["DryEye"] == flag][col]
            profile["box_plot"][label] = {
                "min": round(float(vals.min()), 2),
                "q1": round(float(vals.quantile(0.25)), 2),
                "median": round(float(vals.median()), 2),
                "q3": round(float(vals.quantile(0.75)), 2),
                "max": round(float(vals.max()), 2),
                "mean": round(float(vals.mean()), 2),
            }

    elif col_type in ("binary", "categorical", "ordinal"):
        vc = s.value_counts()
        profile["value_counts"] = [{"value": str(v), "count": int(c)} for v, c in vc.items()]
        profile["stats"] = {
            "mode": str(s.mode()[0]),
            "mode_freq": int(vc.iloc[0]),
            "mode_pct": round(float(vc.iloc[0] / total * 100), 1),
        }

        # Dry eye rate per category
        dry_eye_by_val = []
        for val in vc.index:
            sub = df[s == val]
            dry_eye_by_val.append({
                "value": str(val),
                "rate": round(float(sub["DryEye"].mean()) * 100, 1),
                "count": int(len(sub)),
            })
        profile["dry_eye_by_value"] = dry_eye_by_val

        if col != "Dry Eye Disease":
            contingency = pd.crosstab(s, df["DryEye"])
            chi2, p, dof, _ = stats.chi2_contingency(contingency)
            n = contingency.sum().sum()
            k = min(contingency.shape)
            cramers_v = round(float(np.sqrt(chi2 / (n * (k - 1)))), 4) if k > 1 else 0
            strength = "strong" if cramers_v > 0.3 else "moderate" if cramers_v > 0.1 else "weak"
            profile["chi_square"] = {"chi2": round(float(chi2), 2), "p": round(float(p), 6), "cramers_v": cramers_v}
            profile["effect_size"] = {"type": "Cramér's V", "value": cramers_v, "strength": strength}

            # Odds ratio for binary
            if col_type == "binary" and set(s.unique()) == {"Y", "N"}:
                a = len(df[(s == "Y") & (df["DryEye"] == 1)])
                b = len(df[(s == "Y") & (df["DryEye"] == 0)])
                c_val = len(df[(s == "N") & (df["DryEye"] == 1)])
                d_val = len(df[(s == "N") & (df["DryEye"] == 0)])
                if b > 0 and c_val > 0 and d_val > 0:
                    odds_ratio = (a * d_val) / (b * c_val)
                    profile["odds_ratio"] = round(float(odds_ratio), 3)

            insight_text = (
                f"{col} has a {strength} association with dry eye "
                f"(χ²={chi2:.1f}, Cramér's V={cramers_v:.3f}, p={'<0.001' if p < 0.001 else f'{p:.4f}'}). "
            )
            if col_type == "binary" and len(dry_eye_by_val) == 2:
                rates = {d["value"]: d["rate"] for d in dry_eye_by_val}
                if "Y" in rates and "N" in rates:
                    diff = rates["Y"] - rates["N"]
                    insight_text += (
                        f"Patients with {col.lower()} have a {'higher' if diff > 0 else 'lower'} "
                        f"dry eye rate ({rates['Y']:.1f}% vs {rates['N']:.1f}%)."
                    )
                    if "odds_ratio" in profile:
                        insight_text += f" Odds ratio: {profile['odds_ratio']:.2f}."
            profile["insight"] = insight_text
        else:
            profile["insight"] = "This is the target variable. 65.2% of patients have dry eye disease."

    profiles.append(profile)

os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, "w") as f:
    json.dump(profiles, f, indent=2)

print(f"\n✅ Column profiles saved to {OUTPUT}")
print(f"   {len(profiles)} columns profiled, {os.path.getsize(OUTPUT)/1024:.1f} KB")
