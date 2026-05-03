#!/usr/bin/env python3
"""
Dry Eye Disease Dataset — EDA Analysis Script
Processes the CSV and outputs comprehensive JSON for the dashboard.
"""

import json
import os
import sys
import numpy as np
import pandas as pd
from scipy import stats

# ── Paths ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
CSV_PATH = os.path.join(PROJECT_DIR, "Dry_Eye_Dataset.csv")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "dashboard", "public", "data")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "eda_results.json")

# ── Load data ───────────────────────────────────────────────────────────────
print(f"Reading {CSV_PATH} ...")
df = pd.read_csv(CSV_PATH)
print(f"Loaded {len(df)} rows × {len(df.columns)} columns")

# ── Parse blood pressure ────────────────────────────────────────────────────
df[["BP_Systolic", "BP_Diastolic"]] = df["Blood pressure"].str.split("/", expand=True).astype(int)

# ── Encode binary columns as 0/1 ───────────────────────────────────────────
binary_cols = [
    "Sleep disorder", "Wake up during night", "Feel sleepy during day",
    "Caffeine consumption", "Alcohol consumption", "Smoking",
    "Medical issue", "Ongoing medication", "Smart device before bed",
    "Blue-light filter", "Discomfort Eye-strain", "Redness in eye",
    "Itchiness/Irritation in eye", "Dry Eye Disease"
]
for col in binary_cols:
    df[col + "_num"] = (df[col] == "Y").astype(int)

df["Gender_num"] = (df["Gender"] == "M").astype(int)

# ── Numeric columns for analysis ───────────────────────────────────────────
numeric_features = [
    "Age", "Sleep duration", "Sleep quality", "Stress level",
    "Heart rate", "Daily steps", "Physical activity",
    "Height", "Weight", "Average screen time",
    "BP_Systolic", "BP_Diastolic"
]

results = {}

# ═══════════════════════════════════════════════════════════════════════════
# 1. DATASET SUMMARY
# ═══════════════════════════════════════════════════════════════════════════
print("Computing summary ...")
results["summary"] = {
    "total_rows": int(len(df)),
    "total_columns": int(len(df.columns) - len(binary_cols) - 3),  # exclude derived cols
    "positive_count": int(df["Dry Eye Disease_num"].sum()),
    "negative_count": int(len(df) - df["Dry Eye Disease_num"].sum()),
    "positive_rate": round(float(df["Dry Eye Disease_num"].mean()) * 100, 1),
    "avg_age": round(float(df["Age"].mean()), 1),
    "avg_screen_time": round(float(df["Average screen time"].mean()), 1),
    "avg_sleep_duration": round(float(df["Sleep duration"].mean()), 1),
    "avg_heart_rate": round(float(df["Heart rate"].mean()), 1),
    "avg_daily_steps": int(df["Daily steps"].mean()),
}

# ═══════════════════════════════════════════════════════════════════════════
# 2. TARGET DISTRIBUTION
# ═══════════════════════════════════════════════════════════════════════════
print("Computing target distribution ...")
target_counts = df["Dry Eye Disease"].value_counts()
results["target_distribution"] = [
    {"name": "Dry Eye (Yes)", "value": int(target_counts.get("Y", 0)), "fill": "#3b82f6"},
    {"name": "No Dry Eye", "value": int(target_counts.get("N", 0)), "fill": "#94a3b8"},
]

# ═══════════════════════════════════════════════════════════════════════════
# 3. DEMOGRAPHIC ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════
print("Computing demographics ...")

# Age distribution (histogram)
age_bins = list(range(15, 50, 5))
age_hist, age_edges = np.histogram(df["Age"], bins=age_bins)
results["age_distribution"] = [
    {"range": f"{int(age_edges[i])}-{int(age_edges[i+1])}", "count": int(age_hist[i])}
    for i in range(len(age_hist))
]

# Gender distribution
gender_counts = df["Gender"].value_counts()
results["gender_distribution"] = [
    {"name": "Female", "count": int(gender_counts.get("F", 0))},
    {"name": "Male", "count": int(gender_counts.get("M", 0))},
]

# Dry Eye by Gender
results["dry_eye_by_gender"] = []
for g, label in [("F", "Female"), ("M", "Male")]:
    subset = df[df["Gender"] == g]
    rate = round(float(subset["Dry Eye Disease_num"].mean()) * 100, 1)
    results["dry_eye_by_gender"].append({
        "name": label,
        "rate": rate,
        "positive": int(subset["Dry Eye Disease_num"].sum()),
        "negative": int(len(subset) - subset["Dry Eye Disease_num"].sum()),
    })

# Dry Eye by Age Group
age_groups = pd.cut(df["Age"], bins=[17, 25, 35, 45], labels=["18-25", "26-35", "36-45"])
results["dry_eye_by_age_group"] = []
for grp in ["18-25", "26-35", "36-45"]:
    subset = df[age_groups == grp]
    rate = round(float(subset["Dry Eye Disease_num"].mean()) * 100, 1)
    results["dry_eye_by_age_group"].append({
        "name": grp,
        "rate": rate,
        "positive": int(subset["Dry Eye Disease_num"].sum()),
        "total": int(len(subset)),
    })

# ═══════════════════════════════════════════════════════════════════════════
# 4. SLEEP & STRESS
# ═══════════════════════════════════════════════════════════════════════════
print("Computing sleep & stress ...")

# Sleep duration distribution
sleep_bins = np.arange(3.5, 11, 1)
sleep_hist, sleep_edges = np.histogram(df["Sleep duration"], bins=sleep_bins)
results["sleep_duration_distribution"] = [
    {"range": f"{sleep_edges[i]:.0f}-{sleep_edges[i+1]:.0f}", "count": int(sleep_hist[i])}
    for i in range(len(sleep_hist))
]

# Sleep quality distribution
results["sleep_quality_distribution"] = []
for q in range(1, 6):
    count = int((df["Sleep quality"] == q).sum())
    results["sleep_quality_distribution"].append({"quality": str(q), "count": count})

# Stress level distribution
results["stress_level_distribution"] = []
for s in range(1, 6):
    count = int((df["Stress level"] == s).sum())
    results["stress_level_distribution"].append({"level": str(s), "count": count})

# Dry Eye by Sleep Quality
results["dry_eye_by_sleep_quality"] = []
for q in range(1, 6):
    subset = df[df["Sleep quality"] == q]
    rate = round(float(subset["Dry Eye Disease_num"].mean()) * 100, 1)
    results["dry_eye_by_sleep_quality"].append({"quality": str(q), "rate": rate})

# Dry Eye by Stress Level
results["dry_eye_by_stress_level"] = []
for s in range(1, 6):
    subset = df[df["Stress level"] == s]
    rate = round(float(subset["Dry Eye Disease_num"].mean()) * 100, 1)
    results["dry_eye_by_stress_level"].append({"level": str(s), "rate": rate})

# ═══════════════════════════════════════════════════════════════════════════
# 5. LIFESTYLE & HABITS
# ═══════════════════════════════════════════════════════════════════════════
print("Computing lifestyle ...")
lifestyle_cols = [
    "Sleep disorder", "Wake up during night", "Feel sleepy during day",
    "Caffeine consumption", "Alcohol consumption", "Smoking",
    "Medical issue", "Ongoing medication", "Smart device before bed",
]
results["lifestyle_distribution"] = []
for col in lifestyle_cols:
    yes = int((df[col] == "Y").sum())
    no = int((df[col] == "N").sum())
    results["lifestyle_distribution"].append({"name": col, "yes": yes, "no": no})

# Dry Eye rate by lifestyle factor
results["dry_eye_by_lifestyle"] = []
for col in lifestyle_cols:
    yes_subset = df[df[col] == "Y"]
    no_subset = df[df[col] == "N"]
    yes_rate = round(float(yes_subset["Dry Eye Disease_num"].mean()) * 100, 1)
    no_rate = round(float(no_subset["Dry Eye Disease_num"].mean()) * 100, 1)
    results["dry_eye_by_lifestyle"].append({
        "name": col,
        "yes_rate": yes_rate,
        "no_rate": no_rate,
    })

# ═══════════════════════════════════════════════════════════════════════════
# 6. SCREEN & EYE SYMPTOMS
# ═══════════════════════════════════════════════════════════════════════════
print("Computing screen & eye symptoms ...")

# Screen time distribution
screen_bins = np.arange(0.5, 11.5, 1)
screen_hist, screen_edges = np.histogram(df["Average screen time"], bins=screen_bins)
results["screen_time_distribution"] = [
    {"range": f"{screen_edges[i]:.0f}-{screen_edges[i+1]:.0f}", "count": int(screen_hist[i])}
    for i in range(len(screen_hist))
]

# Blue-light filter impact
results["blue_light_impact"] = []
for val, label in [("Y", "Uses Filter"), ("N", "No Filter")]:
    subset = df[df["Blue-light filter"] == val]
    rate = round(float(subset["Dry Eye Disease_num"].mean()) * 100, 1)
    results["blue_light_impact"].append({"name": label, "rate": rate, "count": int(len(subset))})

# Eye symptoms
eye_cols = ["Discomfort Eye-strain", "Redness in eye", "Itchiness/Irritation in eye"]
results["eye_symptoms_distribution"] = []
for col in eye_cols:
    yes = int((df[col] == "Y").sum())
    no = int((df[col] == "N").sum())
    results["eye_symptoms_distribution"].append({"name": col, "yes": yes, "no": no})

# Dry eye by each eye symptom
results["dry_eye_by_eye_symptom"] = []
for col in eye_cols:
    yes_subset = df[df[col] == "Y"]
    no_subset = df[df[col] == "N"]
    yes_rate = round(float(yes_subset["Dry Eye Disease_num"].mean()) * 100, 1)
    no_rate = round(float(no_subset["Dry Eye Disease_num"].mean()) * 100, 1)
    results["dry_eye_by_eye_symptom"].append({
        "name": col,
        "with_symptom": yes_rate,
        "without_symptom": no_rate,
    })

# ═══════════════════════════════════════════════════════════════════════════
# 7. CORRELATION MATRIX
# ═══════════════════════════════════════════════════════════════════════════
print("Computing correlations ...")
corr_cols = numeric_features + [c + "_num" for c in binary_cols]
corr_labels = numeric_features + binary_cols
corr_matrix = df[corr_cols].corr()

# Format for heatmap
results["correlation_matrix"] = {
    "labels": corr_labels,
    "values": [[round(float(corr_matrix.iloc[i, j]), 3) for j in range(len(corr_cols))] for i in range(len(corr_cols))],
}

# Top correlations with Dry Eye Disease
target_col = "Dry Eye Disease_num"
correlations_with_target = []
for i, col in enumerate(corr_cols):
    if col == target_col:
        continue
    r = float(corr_matrix.loc[col, target_col])
    correlations_with_target.append({
        "name": corr_labels[i],
        "correlation": round(r, 4),
        "abs_correlation": round(abs(r), 4),
    })
correlations_with_target.sort(key=lambda x: x["abs_correlation"], reverse=True)
results["top_correlations"] = correlations_with_target[:15]

# ═══════════════════════════════════════════════════════════════════════════
# 8. FEATURE IMPORTANCE (Chi-square + Point-biserial)
# ═══════════════════════════════════════════════════════════════════════════
print("Computing feature importance ...")
target = df["Dry Eye Disease_num"]
importance = []

# Binary features: Chi-squared test
for col in binary_cols[:-1]:  # exclude target itself
    contingency = pd.crosstab(df[col], df["Dry Eye Disease"])
    chi2, p, dof, expected = stats.chi2_contingency(contingency)
    n = len(df)
    cramers_v = round(float(np.sqrt(chi2 / n)), 4)
    importance.append({
        "name": col,
        "type": "categorical",
        "chi2": round(float(chi2), 2),
        "p_value": float(f"{p:.6f}"),
        "cramers_v": cramers_v,
        "score": cramers_v,
    })

# Gender
contingency = pd.crosstab(df["Gender"], df["Dry Eye Disease"])
chi2, p, dof, expected = stats.chi2_contingency(contingency)
n = len(df)
cramers_v = round(float(np.sqrt(chi2 / n)), 4)
importance.append({
    "name": "Gender",
    "type": "categorical",
    "chi2": round(float(chi2), 2),
    "p_value": float(f"{p:.6f}"),
    "cramers_v": cramers_v,
    "score": cramers_v,
})

# Numeric features: point-biserial
for col in numeric_features:
    r, p = stats.pointbiserialr(target, df[col])
    importance.append({
        "name": col,
        "type": "numeric",
        "correlation": round(float(r), 4),
        "p_value": float(f"{p:.6f}"),
        "score": round(abs(float(r)), 4),
    })

importance.sort(key=lambda x: x["score"], reverse=True)
results["feature_importance"] = importance

# ═══════════════════════════════════════════════════════════════════════════
# 9. ADDITIONAL: Blood Pressure Analysis
# ═══════════════════════════════════════════════════════════════════════════
print("Computing blood pressure analysis ...")
bp_sys_bins = [80, 100, 120, 140, 160]
bp_sys_hist, bp_sys_edges = np.histogram(df["BP_Systolic"], bins=bp_sys_bins)
results["bp_systolic_distribution"] = [
    {"range": f"{int(bp_sys_edges[i])}-{int(bp_sys_edges[i+1])}", "count": int(bp_sys_hist[i])}
    for i in range(len(bp_sys_hist))
]

# ═══════════════════════════════════════════════════════════════════════════
# 10. HEART RATE & STEPS DISTRIBUTIONS
# ═══════════════════════════════════════════════════════════════════════════
hr_bins = list(range(55, 110, 10))
hr_hist, hr_edges = np.histogram(df["Heart rate"], bins=hr_bins)
results["heart_rate_distribution"] = [
    {"range": f"{int(hr_edges[i])}-{int(hr_edges[i+1])}", "count": int(hr_hist[i])}
    for i in range(len(hr_hist))
]

steps_bins = list(range(0, 25000, 5000))
steps_hist, steps_edges = np.histogram(df["Daily steps"], bins=steps_bins)
results["daily_steps_distribution"] = [
    {"range": f"{int(steps_edges[i]//1000)}k-{int(steps_edges[i+1]//1000)}k", "count": int(steps_hist[i])}
    for i in range(len(steps_hist))
]

# ═══════════════════════════════════════════════════════════════════════════
# SAVE
# ═══════════════════════════════════════════════════════════════════════════
os.makedirs(OUTPUT_DIR, exist_ok=True)
with open(OUTPUT_PATH, "w") as f:
    json.dump(results, f, indent=2)

print(f"\n✅ EDA results saved to {OUTPUT_PATH}")
print(f"   File size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")
