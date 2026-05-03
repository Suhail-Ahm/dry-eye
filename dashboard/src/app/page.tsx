"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/dashboard-header";
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

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [mlData, setMlData] = useState<any>(null);
  const [extraData, setExtraData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/eda_results.json").then((r) => r.json()),
      fetch("/data/ml_results.json").then((r) => r.json()),
      fetch("/data/extra_analysis.json").then((r) => r.json()),
    ])
      .then(([eda, ml, extra]) => {
        setData(eda);
        setMlData(ml);
        setExtraData(extra);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DashboardHeader />

      <main className="mx-auto max-w-[1440px] px-6 py-6 space-y-8">
        {/* ── Section 1: Overview ──────────────────────────────────── */}
        <section id="overview">
          <OverviewCards data={data.summary} />
        </section>

        <Separator className="bg-border/40" />

        {/* ── Tabbed Sections ─────────────────────────────────────── */}
        <Tabs defaultValue="target" className="space-y-6">
          <TabsList className="bg-white border border-border/50 shadow-sm p-1 h-auto flex-wrap">
            <TabsTrigger
              value="target"
              className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              🎯 Target Distribution
            </TabsTrigger>
            <TabsTrigger
              value="demographics"
              className="text-xs data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              👥 Demographics
            </TabsTrigger>
            <TabsTrigger
              value="sleep"
              className="text-xs data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              😴 Sleep & Stress
            </TabsTrigger>
            <TabsTrigger
              value="lifestyle"
              className="text-xs data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              🏃 Lifestyle
            </TabsTrigger>
            <TabsTrigger
              value="health"
              className="text-xs data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              🩺 Health Metrics
            </TabsTrigger>
            <TabsTrigger
              value="eyes"
              className="text-xs data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              👁️ Screen & Eyes
            </TabsTrigger>
            <TabsTrigger
              value="correlations"
              className="text-xs data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              📊 Correlations
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="text-xs data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              📋 Data Overview
            </TabsTrigger>
            <TabsTrigger
              value="importance"
              className="text-xs data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm px-4 py-2"
            >
              ⭐ Feature Importance
            </TabsTrigger>
            <TabsTrigger
              value="ml"
              className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-violet-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm px-4 py-2 font-semibold"
            >
              🤖 ML Models
            </TabsTrigger>
          </TabsList>

          {/* ── Target Distribution ─────────────────────────────── */}
          <TabsContent value="target" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Target Variable — Dry Eye Disease
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Binary classification target showing class imbalance (65:35
                ratio)
              </p>
            </div>
            <TargetDistribution data={data.target_distribution} />
          </TabsContent>

          {/* ── Demographics ────────────────────────────────────── */}
          <TabsContent value="demographics" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Demographic Analysis
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Age and gender distributions with dry eye prevalence breakdown
              </p>
            </div>
            <DemographicCharts
              ageDistribution={data.age_distribution}
              genderDistribution={data.gender_distribution}
              dryEyeByGender={data.dry_eye_by_gender}
              dryEyeByAgeGroup={data.dry_eye_by_age_group}
            />
          </TabsContent>

          {/* ── Sleep & Stress ──────────────────────────────────── */}
          <TabsContent value="sleep" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Sleep & Stress Analysis
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sleep patterns, stress levels, and their association with dry
                eye disease
              </p>
            </div>
            <SleepStressCharts
              sleepDurationDistribution={data.sleep_duration_distribution}
              sleepQualityDistribution={data.sleep_quality_distribution}
              stressLevelDistribution={data.stress_level_distribution}
              dryEyeBySleepQuality={data.dry_eye_by_sleep_quality}
              dryEyeByStressLevel={data.dry_eye_by_stress_level}
            />
          </TabsContent>

          {/* ── Lifestyle ───────────────────────────────────────── */}
          <TabsContent value="lifestyle" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Lifestyle & Habits
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Binary lifestyle factors and their impact on dry eye prevalence
              </p>
            </div>
            <LifestyleCharts
              lifestyleDistribution={data.lifestyle_distribution}
              dryEyeByLifestyle={data.dry_eye_by_lifestyle}
            />
          </TabsContent>

          {/* ── Health Metrics ────────────────────────────────── */}
          <TabsContent value="health" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Health Metrics
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                BMI, blood pressure, heart rate, daily steps, physical activity,
                and multi-symptom co-occurrence analysis
              </p>
            </div>
            {extraData && <HealthMetrics data={extraData} />}
          </TabsContent>

          {/* ── Screen & Eyes ───────────────────────────────────── */}
          <TabsContent value="eyes" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Screen Time & Eye Symptoms
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Digital habits, blue-light filter usage, and ocular symptom
                analysis
              </p>
            </div>
            <EyeSymptomsCharts
              screenTimeDistribution={data.screen_time_distribution}
              blueLightImpact={data.blue_light_impact}
              eyeSymptomsDistribution={data.eye_symptoms_distribution}
              dryEyeByEyeSymptom={data.dry_eye_by_eye_symptom}
            />
          </TabsContent>

          {/* ── Correlations ────────────────────────────────────── */}
          <TabsContent value="correlations" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Feature Correlations
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pearson correlation matrix between key numeric and binary
                features
              </p>
            </div>
            <CorrelationHeatmap data={data.correlation_matrix} />
          </TabsContent>

          {/* ── Data Overview ────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Data Overview & Distribution Comparison
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Summary statistics table, overlaid histograms by class, and
                box plot quartiles
              </p>
            </div>
            {extraData && (
              <DataOverview
                summaryTable={extraData.summary_table}
                distributionComparison={extraData.distribution_comparison}
                boxPlots={extraData.box_plots}
              />
            )}
          </TabsContent>

          {/* ── Feature Importance ────────────────────────────── */}
          <TabsContent value="importance" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Feature Importance
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Statistical association strength between each feature and dry
                eye disease (Chi-square / Point-Biserial)
              </p>
            </div>
            <FeatureImportance data={data.feature_importance} />
          </TabsContent>

          {/* ── ML Models ──────────────────────────────────────── */}
          <TabsContent value="ml" className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Machine Learning Model Comparison
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                6 classifiers trained on 80/20 stratified split — compare accuracy,
                precision, recall, F1, and AUC-ROC
              </p>
            </div>
            {mlData ? (
              <MLComparison data={mlData} />
            ) : (
              <p className="text-sm text-muted-foreground">ML data not available.</p>
            )}
          </TabsContent>
        </Tabs>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer className="border-t border-border/40 pt-6 pb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>
              Dry Eye Disease — EDA Dashboard • Built with Next.js, ShadCN &
              Recharts
            </p>
            <p>Dataset: 20,000 records × 26 features</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
