#!/usr/bin/env python3
"""
Dry Eye Disease — ML Model Training & Comparison Script
Trains 6 classifiers and outputs comprehensive comparison JSON.
"""

import json
import os
import numpy as np
import pandas as pd
from scipy import stats

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, confusion_matrix, classification_report
)
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from xgboost import XGBClassifier

import warnings
warnings.filterwarnings("ignore")

# ── Paths ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
CSV_PATH = os.path.join(PROJECT_DIR, "Dry_Eye_Dataset.csv")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "dashboard", "public", "data")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "ml_results.json")

# ── Load & prepare data ────────────────────────────────────────────────────
print("Loading dataset...")
df = pd.read_csv(CSV_PATH)

# Parse blood pressure
df[["BP_Systolic", "BP_Diastolic"]] = df["Blood pressure"].str.split("/", expand=True).astype(int)

# Encode binary Y/N columns
binary_cols = [
    "Sleep disorder", "Wake up during night", "Feel sleepy during day",
    "Caffeine consumption", "Alcohol consumption", "Smoking",
    "Medical issue", "Ongoing medication", "Smart device before bed",
    "Blue-light filter", "Discomfort Eye-strain", "Redness in eye",
    "Itchiness/Irritation in eye",
]

for col in binary_cols:
    df[col] = (df[col] == "Y").astype(int)

df["Gender"] = (df["Gender"] == "M").astype(int)
df["Dry Eye Disease"] = (df["Dry Eye Disease"] == "Y").astype(int)

# Feature matrix
feature_cols = [
    "Gender", "Age", "Sleep duration", "Sleep quality", "Stress level",
    "Heart rate", "Daily steps", "Physical activity", "Height", "Weight",
    "BP_Systolic", "BP_Diastolic", "Average screen time",
] + binary_cols

X = df[feature_cols].values
y = df["Dry Eye Disease"].values

print(f"Features: {len(feature_cols)}, Samples: {len(X)}")
print(f"Class distribution: {np.bincount(y)}")

# ── Train/Test Split ───────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"Train: {len(X_train)}, Test: {len(X_test)}")

# ── Define Models ──────────────────────────────────────────────────────────
models = {
    "Logistic Regression": {
        "model": LogisticRegression(max_iter=1000, random_state=42),
        "needs_scaling": True,
        "color": "#3b82f6",
        "icon": "trending-up",
        "description": "Linear model that estimates probability using a logistic function. Best for linearly separable data.",
        "category": "Linear",
    },
    "Decision Tree": {
        "model": DecisionTreeClassifier(max_depth=10, random_state=42),
        "needs_scaling": False,
        "color": "#22c55e",
        "icon": "git-branch",
        "description": "Tree-based model that splits data by feature thresholds. Highly interpretable but prone to overfitting.",
        "category": "Tree-Based",
    },
    "Random Forest": {
        "model": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        "needs_scaling": False,
        "color": "#10b981",
        "icon": "trees",
        "description": "Ensemble of decision trees using bagging. Reduces overfitting through averaging.",
        "category": "Ensemble",
    },
    "Gradient Boosting": {
        "model": GradientBoostingClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42),
        "needs_scaling": False,
        "color": "#f59e0b",
        "icon": "flame",
        "description": "Sequentially builds trees, each correcting the previous one's errors. Strong performance on tabular data.",
        "category": "Ensemble",
    },
    "XGBoost": {
        "model": XGBClassifier(
            n_estimators=100, max_depth=6, learning_rate=0.1,
            random_state=42, use_label_encoder=False, eval_metric="logloss",
            verbosity=0
        ),
        "needs_scaling": False,
        "color": "#ef4444",
        "icon": "zap",
        "description": "Optimized gradient boosting with regularization. State-of-the-art for structured/tabular data.",
        "category": "Ensemble",
    },
    "K-Nearest Neighbors": {
        "model": KNeighborsClassifier(n_neighbors=7, n_jobs=-1),
        "needs_scaling": True,
        "color": "#8b5cf6",
        "icon": "users",
        "description": "Instance-based learner that classifies by majority vote of k closest neighbors.",
        "category": "Instance-Based",
    },
}

# ── Train & Evaluate ───────────────────────────────────────────────────────
results = []
roc_curves = []

for name, config in models.items():
    print(f"\nTraining {name}...")
    model = config["model"]
    X_tr = X_train_scaled if config["needs_scaling"] else X_train
    X_te = X_test_scaled if config["needs_scaling"] else X_test

    # Train
    model.fit(X_tr, y_train)

    # Predict
    y_pred = model.predict(X_te)
    y_proba = model.predict_proba(X_te)[:, 1]

    # Metrics
    acc = round(float(accuracy_score(y_test, y_pred)) * 100, 2)
    prec = round(float(precision_score(y_test, y_pred)) * 100, 2)
    rec = round(float(recall_score(y_test, y_pred)) * 100, 2)
    f1 = round(float(f1_score(y_test, y_pred)) * 100, 2)
    auc = round(float(roc_auc_score(y_test, y_proba)) * 100, 2)

    # Cross-validation (5-fold)
    X_cv = X_train_scaled if config["needs_scaling"] else X_train
    cv_scores = cross_val_score(config["model"].__class__(**config["model"].get_params()), X_cv, y_train, cv=5, scoring="accuracy")
    cv_mean = round(float(cv_scores.mean()) * 100, 2)
    cv_std = round(float(cv_scores.std()) * 100, 2)

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)

    # ROC curve
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    # Downsample for JSON size
    indices = np.linspace(0, len(fpr) - 1, min(100, len(fpr)), dtype=int)
    roc_curves.append({
        "name": name,
        "color": config["color"],
        "auc": auc,
        "fpr": [round(float(fpr[i]), 4) for i in indices],
        "tpr": [round(float(tpr[i]), 4) for i in indices],
    })

    # Feature importance (if available)
    feat_importance = None
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        feat_importance = [
            {"name": feature_cols[i], "importance": round(float(importances[i]), 4)}
            for i in np.argsort(importances)[::-1][:10]
        ]
    elif hasattr(model, "coef_"):
        coefs = np.abs(model.coef_[0])
        feat_importance = [
            {"name": feature_cols[i], "importance": round(float(coefs[i]), 4)}
            for i in np.argsort(coefs)[::-1][:10]
        ]

    result = {
        "name": name,
        "color": config["color"],
        "icon": config["icon"],
        "description": config["description"],
        "category": config["category"],
        "metrics": {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "auc_roc": auc,
            "cv_accuracy": cv_mean,
            "cv_std": cv_std,
        },
        "confusion_matrix": {
            "tn": int(cm[0][0]),
            "fp": int(cm[0][1]),
            "fn": int(cm[1][0]),
            "tp": int(cm[1][1]),
        },
        "feature_importance": feat_importance,
    }
    results.append(result)
    print(f"  Accuracy: {acc}%, F1: {f1}%, AUC: {auc}%, CV: {cv_mean}±{cv_std}%")

# ── Sort by F1 score (best metric for imbalanced data) ─────────────────────
results.sort(key=lambda x: x["metrics"]["f1_score"], reverse=True)

# ── Determine best model ──────────────────────────────────────────────────
best = results[0]
print(f"\n🏆 Best Model: {best['name']} (F1: {best['metrics']['f1_score']}%)")

# ── Build comparison data ─────────────────────────────────────────────────
comparison_metrics = ["accuracy", "precision", "recall", "f1_score", "auc_roc"]
radar_data = []
for metric in comparison_metrics:
    point = {"metric": metric.replace("_", " ").title()}
    for r in results:
        point[r["name"]] = r["metrics"][metric]
    radar_data.append(point)

# ── Output ────────────────────────────────────────────────────────────────
output = {
    "models": results,
    "roc_curves": roc_curves,
    "radar_data": radar_data,
    "best_model": best["name"],
    "feature_names": feature_cols,
    "split_info": {
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "test_ratio": 0.2,
        "random_state": 42,
        "stratified": True,
    },
    "comparison_metrics": comparison_metrics,
}

os.makedirs(OUTPUT_DIR, exist_ok=True)
with open(OUTPUT_PATH, "w") as f:
    json.dump(output, f, indent=2)

print(f"\n✅ ML results saved to {OUTPUT_PATH}")
print(f"   File size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")
