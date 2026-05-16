#!/usr/bin/env python3
"""Generate chart images for the presentation."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(SCRIPT_DIR, "chart_images")
os.makedirs(OUT_DIR, exist_ok=True)

# ── Theme ────────────────────────────────────────────────────────────────
BG = "#09090B"
SURFACE = "#18181B"
BORDER = "#27272A"
WHITE = "#FAFAFA"
MUTED = "#A1A1AA"
DIM = "#71717A"
ACCENT = "#38BDF8"
TEAL = "#2DD4BF"
AMBER = "#FBBF24"
ROSE = "#FB7185"
VIOLET = "#A78BFA"
GREEN = "#4ADE80"

plt.rcParams.update({
    "figure.facecolor": BG, "axes.facecolor": BG,
    "text.color": WHITE, "axes.labelcolor": MUTED,
    "xtick.color": DIM, "ytick.color": DIM,
    "font.family": "sans-serif", "font.size": 12,
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.spines.left": False, "axes.spines.bottom": False,
})


def save(fig, name):
    path = os.path.join(OUT_DIR, f"{name}.png")
    fig.savefig(path, dpi=200, bbox_inches="tight", pad_inches=0.3)
    plt.close(fig)
    print(f"  ✓ {name}.png")


# ═══════════════════════════════════════════════════════════════════════
# 1. CLASS DISTRIBUTION — Donut chart
# ═══════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(5, 5))
sizes = [65, 35]
colors = [ACCENT, ROSE]
wedges, _ = ax.pie(sizes, colors=colors, startangle=90,
                   wedgeprops=dict(width=0.35, edgecolor=BG, linewidth=3))
ax.text(0, 0.08, "65:35", ha="center", va="center", fontsize=28, fontweight="bold", color=WHITE)
ax.text(0, -0.18, "class split", ha="center", va="center", fontsize=11, color=MUTED)
ax.legend(["Dry Eye (Yes)", "No Dry Eye"], loc="lower center", bbox_to_anchor=(0.5, -0.08),
          frameon=False, ncol=2, fontsize=10, labelcolor=MUTED)
save(fig, "donut_class")


# ═══════════════════════════════════════════════════════════════════════
# 2. TOP RISK FACTORS — Horizontal bar chart
# ═══════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(7, 4.5))
factors = ["Itchiness/Irritation", "Eye-strain", "Redness", "Screen Time",
           "Sleep Quality", "Blue-light Filter", "Stress Level", "Sleep Disorder"]
scores = [0.42, 0.38, 0.35, 0.28, 0.22, 0.19, 0.17, 0.15]
colors_bar = [ROSE, ROSE, ROSE, ACCENT, VIOLET, TEAL, AMBER, VIOLET]
y = np.arange(len(factors))
bars = ax.barh(y, scores, height=0.55, color=colors_bar, edgecolor="none", zorder=3)
ax.set_yticks(y)
ax.set_yticklabels(factors, fontsize=11)
ax.invert_yaxis()
ax.set_xlim(0, 0.5)
ax.set_xlabel("Association Strength", fontsize=10, color=DIM)
for bar, s in zip(bars, scores):
    ax.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height()/2,
            f"{s:.2f}", va="center", fontsize=10, color=MUTED)
ax.grid(axis="x", color=BORDER, linewidth=0.5, zorder=0)
ax.tick_params(axis="y", length=0)
ax.tick_params(axis="x", length=0)
save(fig, "risk_factors")


# ═══════════════════════════════════════════════════════════════════════
# 3. MODEL COMPARISON — Grouped bar chart
# ═══════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 4.5))
models = ["Logistic\nRegression", "Decision\nTree", "Random\nForest",
          "Gradient\nBoosting", "XGBoost", "KNN"]
accuracy = [72, 78, 82, 84, 85, 74]
f1 =       [68, 75, 80, 82, 83, 70]
x = np.arange(len(models))
w = 0.32
ax.bar(x - w/2, accuracy, w, color=ACCENT, label="Accuracy %", edgecolor="none", zorder=3)
ax.bar(x + w/2, f1, w, color=TEAL, label="F1-Score %", edgecolor="none", zorder=3)
ax.set_xticks(x)
ax.set_xticklabels(models, fontsize=9)
ax.set_ylim(50, 95)
ax.legend(frameon=False, fontsize=10, labelcolor=MUTED, loc="upper left")
ax.grid(axis="y", color=BORDER, linewidth=0.5, zorder=0)
ax.tick_params(length=0)
# highlight best
ax.annotate("Best", xy=(4, 85), xytext=(4, 90), ha="center", fontsize=9,
            color=AMBER, fontweight="bold",
            arrowprops=dict(arrowstyle="->", color=AMBER, lw=1.5))
save(fig, "model_comparison")


# ═══════════════════════════════════════════════════════════════════════
# 4. METHODOLOGY FLOW — Visual pipeline
# ═══════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 2.5))
ax.set_xlim(0, 10)
ax.set_ylim(0, 2)
ax.axis("off")

steps = [
    ("Data\nCleaning", ACCENT),
    ("EDA", VIOLET),
    ("Feature\nEngineering", TEAL),
    ("Model\nTraining", AMBER),
    ("Evaluation", ROSE),
    ("Deployment", GREEN),
]
n = len(steps)
box_w, box_h = 1.25, 1.2
gap = (10 - n * box_w) / (n + 1)

for i, (label, clr) in enumerate(steps):
    cx = gap + i * (box_w + gap) + box_w / 2
    cy = 1.0
    rect = mpatches.FancyBboxPatch(
        (cx - box_w/2, cy - box_h/2), box_w, box_h,
        boxstyle="round,pad=0.12", facecolor=SURFACE, edgecolor=clr, linewidth=1.5)
    ax.add_patch(rect)
    ax.text(cx, cy + 0.05, label, ha="center", va="center", fontsize=9,
            fontweight="bold", color=WHITE, linespacing=1.4)
    ax.text(cx, cy - box_h/2 + 0.18, f"0{i+1}", ha="center", va="center",
            fontsize=7, color=clr, fontweight="bold")
    # arrow
    if i < n - 1:
        ax.annotate("", xy=(cx + box_w/2 + gap*0.8, cy),
                    xytext=(cx + box_w/2 + gap*0.15, cy),
                    arrowprops=dict(arrowstyle="->", color=DIM, lw=1.2))

save(fig, "methodology_flow")


# ═══════════════════════════════════════════════════════════════════════
# 5. DRY EYE BY AGE GROUP — Bar chart
# ═══════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(5, 4))
groups = ["18-25", "26-35", "36-45"]
rates = [32, 38, 34]
bars = ax.bar(groups, rates, color=[ACCENT, ROSE, TEAL], width=0.5, edgecolor="none", zorder=3)
ax.set_ylabel("DED Prevalence %", fontsize=10, color=DIM)
ax.set_ylim(0, 50)
ax.grid(axis="y", color=BORDER, linewidth=0.5, zorder=0)
ax.tick_params(length=0)
for bar, r in zip(bars, rates):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
            f"{r}%", ha="center", fontsize=12, fontweight="bold", color=WHITE)
save(fig, "age_prevalence")


# ═══════════════════════════════════════════════════════════════════════
# 6. SYMPTOM CO-OCCURRENCE — Venn-like diagram
# ═══════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(5, 4.5))
ax.set_xlim(-3, 3)
ax.set_ylim(-2.5, 2.5)
ax.axis("off")

circles = [
    ((-0.8, 0.5), 1.5, ROSE + "40", "Eye-strain\n52%", ROSE),
    ((0.8, 0.5),  1.5, ACCENT + "40", "Redness\n48%", ACCENT),
    ((0, -0.6),   1.5, TEAL + "40", "Itchiness\n45%", TEAL),
]
for (cx, cy), r, fc, label, tc in circles:
    c = plt.Circle((cx, cy), r, facecolor=fc, edgecolor=tc, linewidth=1.5, alpha=0.5)
    ax.add_patch(c)
    ax.text(cx, cy, label, ha="center", va="center", fontsize=10, fontweight="bold", color=WHITE)

ax.text(0, 0.15, "28%", ha="center", va="center", fontsize=14, fontweight="bold", color=AMBER)
ax.text(0, -1.9, "Co-occurrence rate among DED patients", ha="center", fontsize=9, color=DIM)
save(fig, "symptom_overlap")


# ═══════════════════════════════════════════════════════════════════════
# 7. COST COMPARISON — Simple visual
# ═══════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(6, 3))
ax.set_xlim(0, 10)
ax.set_ylim(0, 3)
ax.axis("off")

# Preventive
rect1 = mpatches.FancyBboxPatch((0.5, 1.5), 2, 1, boxstyle="round,pad=0.1",
                                 facecolor=GREEN+"30", edgecolor=GREEN, linewidth=1.5)
ax.add_patch(rect1)
ax.text(1.5, 2.2, "$200", ha="center", fontsize=22, fontweight="bold", color=GREEN)
ax.text(1.5, 1.8, "/year", ha="center", fontsize=10, color=MUTED)
ax.text(1.5, 1.2, "Preventive", ha="center", fontsize=10, fontweight="bold", color=GREEN)

# Arrow
ax.annotate("", xy=(4.8, 2), xytext=(3.2, 2),
            arrowprops=dict(arrowstyle="->", color=DIM, lw=2))
ax.text(4.0, 2.3, "vs", ha="center", fontsize=11, color=DIM)

# Late-stage
rect2 = mpatches.FancyBboxPatch((5.5, 0.8), 4, 1.8, boxstyle="round,pad=0.1",
                                 facecolor=ROSE+"20", edgecolor=ROSE, linewidth=1.5)
ax.add_patch(rect2)
ax.text(7.5, 2.1, "$2,000+", ha="center", fontsize=26, fontweight="bold", color=ROSE)
ax.text(7.5, 1.5, "/year", ha="center", fontsize=10, color=MUTED)
ax.text(7.5, 1.0, "Late-stage Treatment", ha="center", fontsize=10, fontweight="bold", color=ROSE)

ax.text(5.0, 0.3, "10× cost reduction with early detection", ha="center", fontsize=11,
        fontweight="bold", color=AMBER)
save(fig, "cost_comparison")


print(f"\n✅ All charts saved to {OUT_DIR}/")
