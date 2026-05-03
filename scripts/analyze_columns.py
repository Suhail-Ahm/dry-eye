#!/usr/bin/env python3
"""
Dry Eye Disease — Per-Column Profile Generator
Generates column_profiles.json with detailed EDA for every column.
"""

import json, os
import numpy as np
import pandas as pd
from scipy import stats

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
CSV_PATH = os.path.join(PROJECT_DIR, "Dry_Eye_Dataset.csv")
OUTPUT = os.path.join(PROJECT_DIR, "dashboard", "public", "data", "column_profiles.json")

print("Loading dataset...")
df = pd.read_csv(CSV_PATH)
df["DryEye"] = (df["Dry Eye Disease"] == "Y").astype(int)

# Parse BP into components
df["BP_Systolic"] = df["Blood pressure"].str.split("/").str[0].astype(int)
df["BP_Diastolic"] = df["Blood pressure"].str.split("/").str[1].astype(int)
df["BMI"] = round(df["Weight"] / ((df["Height"] / 100) ** 2), 1)

# All columns to profile (exclude raw BP string and target encoding)
COLUMNS = [
    "Age", "Gender", "Sleep duration", "Sleep quality", "Stress level",
    "BP_Systolic", "BP_Diastolic", "Heart rate", "Daily steps",
    "Physical activity", "Height", "Weight", "BMI",
    "Sleep disorder", "Wake up during night", "Feel sleepy during day",
    "Caffeine consumption", "Alcohol consumption", "Smoking",
    "Medical issue", "Ongoing medication", "Smart device before bed",
    "Average screen time", "Blue-light filter",
    "Discomfort Eye-strain", "Redness in eye", "Itchiness/Irritation in eye",
    "Dry Eye Disease",
]

profiles = []

for col in COLUMNS:
    print(f"  Profiling: {col}")
    s = df[col]
    unique_vals = s.nunique()
    missing = int(s.isna().sum())
    total = len(s)

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
    }

    if col_type == "numeric":
        # Summary stats
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
        }

        # Outliers (IQR method)
        q1, q3 = s.quantile(0.25), s.quantile(0.75)
        iqr = q3 - q1
        outlier_count = int(((s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)).sum())
        profile["outliers"] = outlier_count

        # Distribution histogram (12 bins)
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

        # Correlation with target
        r, p = stats.pointbiserialr(df["DryEye"], s.fillna(s.median()))
        strength = "strong" if abs(r) > 0.3 else "moderate" if abs(r) > 0.1 else "weak"
        direction = "positive" if r > 0 else "negative"
        profile["correlation"] = {"r": round(float(r), 4), "p": round(float(p), 6)}
        profile["insight"] = (
            f"{col} has a {strength} {direction} correlation with dry eye "
            f"(r={r:.3f}, p={'<0.001' if p < 0.001 else f'{p:.4f}'}). "
            + (f"Higher {col.lower()} is {'associated with' if r > 0 else 'protective against'} dry eye." if abs(r) > 0.05 else f"{col} shows minimal association with dry eye.")
        )

        # Box plot data per group
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
        # Value counts
        vc = s.value_counts()
        profile["value_counts"] = [
            {"value": str(v), "count": int(c)} for v, c in vc.items()
        ]

        # Mode
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

        # Chi-square test (if not the target itself)
        if col != "Dry Eye Disease":
            contingency = pd.crosstab(s, df["DryEye"])
            chi2, p, dof, _ = stats.chi2_contingency(contingency)
            n = contingency.sum().sum()
            k = min(contingency.shape)
            cramers_v = round(float(np.sqrt(chi2 / (n * (k - 1)))), 4) if k > 1 else 0
            strength = "strong" if cramers_v > 0.3 else "moderate" if cramers_v > 0.1 else "weak"
            profile["chi_square"] = {"chi2": round(float(chi2), 2), "p": round(float(p), 6), "cramers_v": cramers_v}
            profile["insight"] = (
                f"{col} has a {strength} association with dry eye "
                f"(χ²={chi2:.1f}, Cramér's V={cramers_v:.3f}, p={'<0.001' if p < 0.001 else f'{p:.4f}'}). "
            )
            # Add specific insight for binary
            if col_type == "binary" and len(dry_eye_by_val) == 2:
                rates = {d["value"]: d["rate"] for d in dry_eye_by_val}
                if "Y" in rates and "N" in rates:
                    diff = rates["Y"] - rates["N"]
                    profile["insight"] += (
                        f"Patients with {col.lower()} have a {'higher' if diff > 0 else 'lower'} "
                        f"dry eye rate ({rates['Y']:.1f}% vs {rates['N']:.1f}%)."
                    )
        else:
            profile["insight"] = "This is the target variable. 65.2% of patients have dry eye disease."

    profiles.append(profile)

# Save
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, "w") as f:
    json.dump(profiles, f, indent=2)

print(f"\n✅ Column profiles saved to {OUTPUT}")
print(f"   {len(profiles)} columns profiled, {os.path.getsize(OUTPUT)/1024:.1f} KB")
