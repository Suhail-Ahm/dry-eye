#!/usr/bin/env python3
"""
Dry Eye Disease — Extended EDA Analysis
Generates additional JSON data for missing features and advanced visualizations.
"""

import json
import os
import numpy as np
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
CSV_PATH = os.path.join(PROJECT_DIR, "Dry_Eye_Dataset.csv")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "dashboard", "public", "data")
EDA_PATH = os.path.join(OUTPUT_DIR, "eda_results.json")
EXTRA_PATH = os.path.join(OUTPUT_DIR, "extra_analysis.json")

print("Loading dataset...")
df = pd.read_csv(CSV_PATH)

# Parse BP
df[["BP_Systolic", "BP_Diastolic"]] = df["Blood pressure"].str.split("/", expand=True).astype(int)
df["DryEye"] = (df["Dry Eye Disease"] == "Y").astype(int)

# Derived: BMI
df["BMI"] = round(df["Weight"] / ((df["Height"] / 100) ** 2), 1)

results = {}

# ═══════════════════════════════════════════════════════════════════════════
# 1. DATA SUMMARY TABLE (like df.describe())
# ═══════════════════════════════════════════════════════════════════════════
print("Computing summary statistics table...")
numeric_cols = [
    "Age", "Sleep duration", "Sleep quality", "Stress level",
    "BP_Systolic", "BP_Diastolic", "Heart rate", "Daily steps",
    "Physical activity", "Height", "Weight", "BMI", "Average screen time",
]
summary_table = []
for col in numeric_cols:
    s = df[col]
    summary_table.append({
        "feature": col,
        "count": int(s.count()),
        "mean": round(float(s.mean()), 2),
        "std": round(float(s.std()), 2),
        "min": round(float(s.min()), 2),
        "q25": round(float(s.quantile(0.25)), 2),
        "median": round(float(s.median()), 2),
        "q75": round(float(s.quantile(0.75)), 2),
        "max": round(float(s.max()), 2),
    })
results["summary_table"] = summary_table

# ═══════════════════════════════════════════════════════════════════════════
# 2. HEALTH METRICS — Distributions + Dry Eye Rates
# ═══════════════════════════════════════════════════════════════════════════
print("Computing health metrics...")

# BMI Distribution
bmi_bins = [0, 18.5, 25, 30, 35, 50]
bmi_labels = ["Underweight", "Normal", "Overweight", "Obese I", "Obese II+"]
df["BMI_Cat"] = pd.cut(df["BMI"], bins=bmi_bins, labels=bmi_labels)
bmi_dist = []
bmi_dry_eye = []
for cat in bmi_labels:
    sub = df[df["BMI_Cat"] == cat]
    bmi_dist.append({"name": cat, "count": int(len(sub))})
    bmi_dry_eye.append({"name": cat, "rate": round(float(sub["DryEye"].mean()) * 100, 1), "count": int(len(sub))})
results["bmi_distribution"] = bmi_dist
results["dry_eye_by_bmi"] = bmi_dry_eye

# BP Categories
def bp_category(sys, dia):
    if sys < 120 and dia < 80: return "Normal"
    elif sys < 130 and dia < 80: return "Elevated"
    elif sys < 140 or dia < 90: return "High Stage 1"
    else: return "High Stage 2"

df["BP_Cat"] = df.apply(lambda r: bp_category(r["BP_Systolic"], r["BP_Diastolic"]), axis=1)
bp_order = ["Normal", "Elevated", "High Stage 1", "High Stage 2"]
bp_dist = []
bp_dry_eye = []
for cat in bp_order:
    sub = df[df["BP_Cat"] == cat]
    if len(sub) == 0: continue
    bp_dist.append({"name": cat, "count": int(len(sub))})
    bp_dry_eye.append({"name": cat, "rate": round(float(sub["DryEye"].mean()) * 100, 1), "count": int(len(sub))})
results["bp_distribution"] = bp_dist
results["dry_eye_by_bp"] = bp_dry_eye

# Heart Rate Distribution
hr_bins = [55, 65, 75, 85, 95, 105]
hr_hist, hr_edges = np.histogram(df["Heart rate"], bins=hr_bins)
results["heart_rate_distribution"] = [
    {"range": f"{int(hr_edges[i])}-{int(hr_edges[i+1])}", "count": int(hr_hist[i])}
    for i in range(len(hr_hist))
]
# Dry eye by HR groups
hr_groups = pd.cut(df["Heart rate"], bins=hr_bins)
results["dry_eye_by_heart_rate"] = []
for interval in sorted(hr_groups.dropna().unique()):
    sub = df[hr_groups == interval]
    results["dry_eye_by_heart_rate"].append({
        "name": f"{int(interval.left)}-{int(interval.right)}",
        "rate": round(float(sub["DryEye"].mean()) * 100, 1),
    })

# Daily Steps Distribution
steps_bins = [0, 5000, 10000, 15000, 20001]
steps_labels = ["<5k", "5k-10k", "10k-15k", "15k-20k"]
df["Steps_Cat"] = pd.cut(df["Daily steps"], bins=steps_bins, labels=steps_labels, right=False)
results["steps_distribution"] = []
results["dry_eye_by_steps"] = []
for cat in steps_labels:
    sub = df[df["Steps_Cat"] == cat]
    results["steps_distribution"].append({"name": cat, "count": int(len(sub))})
    results["dry_eye_by_steps"].append({"name": cat, "rate": round(float(sub["DryEye"].mean()) * 100, 1)})

# Physical Activity Distribution
pa_bins = [0, 30, 60, 90, 120, 181]
pa_labels = ["0-30", "30-60", "60-90", "90-120", "120-180"]
df["PA_Cat"] = pd.cut(df["Physical activity"], bins=pa_bins, labels=pa_labels, right=False)
results["physical_activity_distribution"] = []
results["dry_eye_by_physical_activity"] = []
for cat in pa_labels:
    sub = df[df["PA_Cat"] == cat]
    results["physical_activity_distribution"].append({"name": cat + " min", "count": int(len(sub))})
    results["dry_eye_by_physical_activity"].append({"name": cat, "rate": round(float(sub["DryEye"].mean()) * 100, 1)})

# ═══════════════════════════════════════════════════════════════════════════
# 3. DISTRIBUTION COMPARISON: Numeric features by Dry Eye status
# ═══════════════════════════════════════════════════════════════════════════
print("Computing distribution comparisons (Dry Eye vs No Dry Eye)...")
comparison_features = [
    ("Age", 5, 15, 50),
    ("Sleep duration", 1, 3.5, 11),
    ("Sleep quality", 1, 0.5, 6),
    ("Stress level", 1, 0.5, 6),
    ("Average screen time", 1, 0.5, 11),
    ("Heart rate", 8, 55, 105),
    ("BMI", 3, 12, 42),
    ("BP_Systolic", 10, 100, 180),
    ("BP_Diastolic", 8, 60, 120),
    ("Daily steps", 4000, 0, 21000),
    ("Physical activity", 30, 0, 181),
    ("Height", 5, 145, 200),
    ("Weight", 10, 40, 130),
]
results["distribution_comparison"] = []
for col, bin_width, lo, hi in comparison_features:
    bins = np.arange(lo, hi, bin_width)
    yes_data = df[df["DryEye"] == 1][col]
    no_data = df[df["DryEye"] == 0][col]
    yes_hist, edges = np.histogram(yes_data, bins=bins)
    no_hist, _ = np.histogram(no_data, bins=bins)
    points = []
    for i in range(len(yes_hist)):
        points.append({
            "range": f"{edges[i]:.0f}",
            "Dry Eye": int(yes_hist[i]),
            "No Dry Eye": int(no_hist[i]),
        })
    results["distribution_comparison"].append({
        "feature": col,
        "data": points,
    })

# ═══════════════════════════════════════════════════════════════════════════
# 4. MULTI-SYMPTOM CO-OCCURRENCE
# ═══════════════════════════════════════════════════════════════════════════
print("Computing symptom co-occurrence...")
symptom_cols = ["Discomfort Eye-strain", "Redness in eye", "Itchiness/Irritation in eye"]
df["symptom_count"] = sum((df[c] == "Y").astype(int) for c in symptom_cols)

results["symptom_cooccurrence"] = []
for n in range(4):
    sub = df[df["symptom_count"] == n]
    rate = round(float(sub["DryEye"].mean()) * 100, 1) if len(sub) > 0 else 0
    results["symptom_cooccurrence"].append({
        "symptoms": f"{n} symptoms",
        "count": int(len(sub)),
        "dry_eye_rate": rate,
    })

# ═══════════════════════════════════════════════════════════════════════════
# 5. BOX PLOT DATA (quartiles for each numeric feature by dry eye status)
# ═══════════════════════════════════════════════════════════════════════════
print("Computing box plot data...")
box_features = numeric_cols  # All 13 numeric features
results["box_plots"] = []
for col in box_features:
    for label, flag in [("Dry Eye", 1), ("No Dry Eye", 0)]:
        vals = df[df["DryEye"] == flag][col]
        results["box_plots"].append({
            "feature": col,
            "group": label,
            "min": round(float(vals.min()), 2),
            "q1": round(float(vals.quantile(0.25)), 2),
            "median": round(float(vals.median()), 2),
            "q3": round(float(vals.quantile(0.75)), 2),
            "max": round(float(vals.max()), 2),
            "mean": round(float(vals.mean()), 2),
        })

# ═══════════════════════════════════════════════════════════════════════════
# 6. CATEGORICAL / BINARY SUMMARY TABLE
# ═══════════════════════════════════════════════════════════════════════════
print("Computing categorical summary...")
binary_cols = [
    "Gender", "Sleep disorder", "Wake up during night", "Feel sleepy during day",
    "Caffeine consumption", "Alcohol consumption", "Smoking", "Medical issue",
    "Ongoing medication", "Smart device before bed", "Blue-light filter",
    "Discomfort Eye-strain", "Redness in eye", "Itchiness/Irritation in eye",
    "Dry Eye Disease",
]
categorical_summary = []
for col in binary_cols:
    vc = df[col].value_counts()
    values = []
    for val, cnt in vc.items():
        sub = df[df[col] == val]
        values.append({
            "value": str(val),
            "count": int(cnt),
            "pct": round(float(cnt / len(df) * 100), 1),
            "dry_eye_rate": round(float(sub["DryEye"].mean()) * 100, 1) if col != "Dry Eye Disease" else None,
        })
    categorical_summary.append({
        "feature": col,
        "type": "binary" if len(vc) == 2 else "categorical",
        "unique": int(len(vc)),
        "mode": str(vc.index[0]),
        "mode_pct": round(float(vc.iloc[0] / len(df) * 100), 1),
        "values": values,
    })
results["categorical_summary"] = categorical_summary

# ═══════════════════════════════════════════════════════════════════════════
# SAVE
# ═══════════════════════════════════════════════════════════════════════════
os.makedirs(OUTPUT_DIR, exist_ok=True)
with open(EXTRA_PATH, "w") as f:
    json.dump(results, f, indent=2)

print(f"\n✅ Extra analysis saved to {EXTRA_PATH}")
print(f"   File size: {os.path.getsize(EXTRA_PATH) / 1024:.1f} KB")
