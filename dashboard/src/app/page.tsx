"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { SidebarNav } from "@/components/sidebar-nav";
import { OverviewCards } from "@/components/overview-cards";
import { TargetDistribution } from "@/components/target-distribution";
import { DemographicCharts } from "@/components/demographic-charts";
import { SleepStressCharts } from "@/components/sleep-stress-charts";
import { LifestyleCharts } from "@/components/lifestyle-charts";
import { EyeSymptomsCharts } from "@/components/eye-symptoms-charts";
import { CorrelationHeatmap } from "@/components/correlation-heatmap";
import { FeatureImportance } from "@/components/feature-importance";
import { MLComparison } from "@/components/ml-comparison";
import { HealthMetrics } from "@/components/health-metrics";
import { DataOverview } from "@/components/data-overview";
import { ColumnExplorer } from "@/components/column-explorer";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ── Section metadata ─────────────────────────────────────────────────── */
const SECTION_META: Record<string, { title: string; subtitle: string }> = {
  target: {
    title: "Target Variable — Dry Eye Disease",
    subtitle: "Binary classification target showing class imbalance (65:35 ratio)",
  },
  columns: {
    title: "Column Explorer",
    subtitle: "Deep-dive EDA on any individual attribute — distribution, stats, dry eye breakdown, and auto-insights",
  },
  demographics: {
    title: "Demographic Analysis",
    subtitle: "Age and gender distributions with dry eye prevalence breakdown",
  },
  sleep: {
    title: "Sleep & Stress Analysis",
    subtitle: "Sleep patterns, stress levels, and their association with dry eye disease",
  },
  lifestyle: {
    title: "Lifestyle & Habits",
    subtitle: "Binary lifestyle factors and their impact on dry eye prevalence",
  },
  health: {
    title: "Health Metrics",
    subtitle: "BMI, blood pressure, heart rate, daily steps, physical activity, and multi-symptom co-occurrence",
  },
  eyes: {
    title: "Screen Time & Eye Symptoms",
    subtitle: "Digital habits, blue-light filter usage, and ocular symptom analysis",
  },
  overview: {
    title: "Data Summary & Distribution Comparison",
    subtitle: "Summary statistics, overlaid class histograms, and box plot quartiles",
  },
  correlations: {
    title: "Feature Correlations",
    subtitle: "Pearson correlation matrix between key numeric and binary features",
  },
  importance: {
    title: "Feature Importance",
    subtitle: "Statistical association strength (Chi-square / Point-Biserial)",
  },
  ml: {
    title: "Machine Learning Model Comparison",
    subtitle: "6 classifiers trained on 80/20 stratified split — accuracy, precision, recall, F1, AUC-ROC",
  },
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [mlData, setMlData] = useState<any>(null);
  const [extraData, setExtraData] = useState<any>(null);
  const [columnData, setColumnData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("target");

  useEffect(() => {
    Promise.all([
      fetch("/data/eda_results.json").then((r) => r.json()),
      fetch("/data/ml_results.json").then((r) => r.json()),
      fetch("/data/extra_analysis.json").then((r) => r.json()),
      fetch("/data/column_profiles.json").then((r) => r.json()),
    ])
      .then(([eda, ml, extra, cols]) => {
        setData(eda);
        setMlData(ml);
        setExtraData(extra);
        setColumnData(cols);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            Loading analysis data…
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load EDA data.</p>
      </div>
    );
  }

  const meta = SECTION_META[activeSection];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <SidebarNav activeSection={activeSection} onSectionChange={handleSectionChange} />

      {/* ── Main content area (offset by sidebar width) ──── */}
      <div className="ml-[220px] transition-all duration-300">
        {/* ── Top Bar ──────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-border/20 bg-white/60 backdrop-blur-xl">
          <div className="px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Breadcrumb-style context */}
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                <span className="font-medium">EDA</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span className="font-semibold text-foreground/70">
                  {meta.title.split("—")[0].trim()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="bg-blue-50/80 text-blue-600 border-blue-100 text-[9px] px-2 py-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 pulse-glow" />
                20K Records
              </Badge>
              <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 text-[9px] px-2 py-0.5">
                26 Features
              </Badge>
            </div>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────── */}
        <main className="px-8 py-6 max-w-[1280px]">
          {/* ── KPI Cards (always visible) ────────────────── */}
          <section className="mb-6 animate-section">
            <OverviewCards data={data.summary} />
          </section>

          {/* ── Section Header ────────────────────────────── */}
          <div className="mb-6 animate-tab-content" key={activeSection}>
            <h2 className="section-heading">{meta.title}</h2>
            <p className="text-xs text-muted-foreground/60 mt-1 ml-3">
              {meta.subtitle}
            </p>
          </div>

          {/* ── Section Content ───────────────────────────── */}
          <div className="animate-tab-content" key={`content-${activeSection}`}>
            {activeSection === "target" && (
              <TargetDistribution data={data.target_distribution} />
            )}

            {activeSection === "columns" && columnData && (
              <ColumnExplorer data={columnData} />
            )}

            {activeSection === "demographics" && (
              <DemographicCharts
                ageDistribution={data.age_distribution}
                genderDistribution={data.gender_distribution}
                dryEyeByGender={data.dry_eye_by_gender}
                dryEyeByAgeGroup={data.dry_eye_by_age_group}
              />
            )}

            {activeSection === "sleep" && (
              <SleepStressCharts
                sleepDurationDistribution={data.sleep_duration_distribution}
                sleepQualityDistribution={data.sleep_quality_distribution}
                stressLevelDistribution={data.stress_level_distribution}
                dryEyeBySleepQuality={data.dry_eye_by_sleep_quality}
                dryEyeByStressLevel={data.dry_eye_by_stress_level}
              />
            )}

            {activeSection === "lifestyle" && (
              <LifestyleCharts
                lifestyleDistribution={data.lifestyle_distribution}
                dryEyeByLifestyle={data.dry_eye_by_lifestyle}
              />
            )}

            {activeSection === "health" && extraData && (
              <HealthMetrics data={extraData} />
            )}

            {activeSection === "eyes" && (
              <EyeSymptomsCharts
                screenTimeDistribution={data.screen_time_distribution}
                blueLightImpact={data.blue_light_impact}
                eyeSymptomsDistribution={data.eye_symptoms_distribution}
                dryEyeByEyeSymptom={data.dry_eye_by_eye_symptom}
              />
            )}

            {activeSection === "overview" && extraData && (
              <DataOverview
                summaryTable={extraData.summary_table}
                distributionComparison={extraData.distribution_comparison}
                boxPlots={extraData.box_plots}
              />
            )}

            {activeSection === "correlations" && (
              <CorrelationHeatmap data={data.correlation_matrix} />
            )}

            {activeSection === "importance" && (
              <FeatureImportance data={data.feature_importance} />
            )}

            {activeSection === "ml" && mlData && (
              <MLComparison data={mlData} />
            )}
          </div>

          {/* ── Footer ────────────────────────────────────── */}
          <footer className="border-t border-border/20 mt-12 pt-6 pb-8">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/40">
              <p>Dry Eye Disease — EDA Dashboard • Next.js • ShadCN • Recharts</p>
              <p>20,000 records × 26 features</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
