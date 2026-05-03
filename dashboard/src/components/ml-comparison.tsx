"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TOOLTIP_STYLE = {
  borderRadius: "8px", border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)", fontSize: "12px",
};

function MetricBadge({ value, label }: { value: number; label: string }) {
  const color = value >= 75 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : value >= 65 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-500 bg-red-50 border-red-200";
  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${color}`}>
      <p className="text-lg font-bold">{value}%</p>
      <p className="text-[10px] font-medium opacity-70">{label}</p>
    </div>
  );
}

function ConfusionMatrix({ cm, name }: { cm: any; name: string }) {
  const total = cm.tp + cm.tn + cm.fp + cm.fn;
  const cells = [
    { label: "TN", value: cm.tn, pct: ((cm.tn / total) * 100).toFixed(1), bg: "bg-blue-100 text-blue-800" },
    { label: "FP", value: cm.fp, pct: ((cm.fp / total) * 100).toFixed(1), bg: "bg-red-100 text-red-700" },
    { label: "FN", value: cm.fn, pct: ((cm.fn / total) * 100).toFixed(1), bg: "bg-orange-100 text-orange-700" },
    { label: "TP", value: cm.tp, pct: ((cm.tp / total) * 100).toFixed(1), bg: "bg-emerald-100 text-emerald-800" },
  ];
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-center text-muted-foreground">{name}</p>
      <div className="grid grid-cols-2 gap-1.5 max-w-[180px] mx-auto">
        {cells.map((c) => (
          <div key={c.label} className={`${c.bg} rounded-lg p-2 text-center`}>
            <p className="text-[10px] font-medium opacity-60">{c.label}</p>
            <p className="text-sm font-bold">{c.value.toLocaleString()}</p>
            <p className="text-[9px] opacity-50">{c.pct}%</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3 text-[9px] text-muted-foreground">
        <span>Predicted →</span>
      </div>
    </div>
  );
}

interface MLComparisonProps {
  data: {
    models: any[];
    roc_curves: any[];
    radar_data: any[];
    best_model: string;
    split_info: any;
  };
}

export function MLComparison({ data }: MLComparisonProps) {
  const [selectedModel, setSelectedModel] = useState(data.best_model);
  const selected = data.models.find((m: any) => m.name === selectedModel)!;

  // Comparison bar data
  const comparisonData = [
    { metric: "Accuracy", ...Object.fromEntries(data.models.map((m: any) => [m.name, m.metrics.accuracy])) },
    { metric: "Precision", ...Object.fromEntries(data.models.map((m: any) => [m.name, m.metrics.precision])) },
    { metric: "Recall", ...Object.fromEntries(data.models.map((m: any) => [m.name, m.metrics.recall])) },
    { metric: "F1 Score", ...Object.fromEntries(data.models.map((m: any) => [m.name, m.metrics.f1_score])) },
    { metric: "AUC-ROC", ...Object.fromEntries(data.models.map((m: any) => [m.name, m.metrics.auc_roc])) },
  ];

  // ROC data merged
  const rocPoints: any[] = [];
  data.roc_curves.forEach((curve: any) => {
    curve.fpr.forEach((fpr: number, i: number) => {
      rocPoints.push({ fpr, [curve.name]: curve.tpr[i] });
    });
  });
  // Merge by fpr
  const rocMerged: Record<string, any> = {};
  data.roc_curves.forEach((curve: any) => {
    curve.fpr.forEach((fpr: number, i: number) => {
      const key = fpr.toFixed(4);
      if (!rocMerged[key]) rocMerged[key] = { fpr };
      rocMerged[key][curve.name] = curve.tpr[i];
    });
  });
  const rocData = Object.values(rocMerged).sort((a: any, b: any) => a.fpr - b.fpr);

  return (
    <div className="space-y-6">
      {/* ── Best Model CTA ────────────────────────────────────── */}
      <Card className="border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-semibold uppercase tracking-wider">
                  Best Performing Model
                </Badge>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{data.best_model}</h3>
              <p className="text-sm text-white/70 max-w-md">
                {selected.description}
              </p>
            </div>
            <div className="flex gap-3">
              {[
                { v: selected.metrics.f1_score, l: "F1 Score" },
                { v: selected.metrics.accuracy, l: "Accuracy" },
                { v: selected.metrics.auc_roc, l: "AUC-ROC" },
              ].map((m) => (
                <div key={m.l} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/20">
                  <p className="text-2xl font-bold">{m.v}%</p>
                  <p className="text-[10px] text-white/60 font-medium">{m.l}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Split Info ────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { l: "Train", v: `${data.split_info.train_size.toLocaleString()} samples` },
          { l: "Test", v: `${data.split_info.test_size.toLocaleString()} samples` },
          { l: "Split", v: `${(data.split_info.test_ratio * 100).toFixed(0)}% test` },
          { l: "Strategy", v: "Stratified" },
          { l: "Seed", v: `${data.split_info.random_state}` },
        ].map((b) => (
          <Badge key={b.l} variant="secondary" className="text-[10px] font-medium px-2.5 py-1">
            {b.l}: {b.v}
          </Badge>
        ))}
      </div>

      {/* ── Model Cards Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.models.map((m: any) => (
          <Card
            key={m.name}
            onClick={() => setSelectedModel(m.name)}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedModel === m.name
                ? "ring-2 shadow-md"
                : "border-border/50 hover:border-border"
            }`}
            style={{ ["--tw-ring-color" as string]: selectedModel === m.name ? m.color : undefined }}
          >
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                {m.name === data.best_model && <span className="text-[10px]">🏆</span>}
              </div>
              <p className="text-xs font-semibold truncate">{m.name}</p>
              <p className="text-lg font-bold" style={{ color: m.color }}>
                {m.metrics.f1_score}%
              </p>
              <p className="text-[9px] text-muted-foreground">F1 Score</p>
              <Badge variant="secondary" className="text-[9px] w-full justify-center">
                {m.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Selected Model Detail ─────────────────────────────── */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: selected.color }} />
            <CardTitle className="text-sm font-semibold">{selected.name} — Detailed Metrics</CardTitle>
            <Badge variant="secondary" className="text-[10px]">{selected.category}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{selected.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
            <MetricBadge value={selected.metrics.accuracy} label="Accuracy" />
            <MetricBadge value={selected.metrics.precision} label="Precision" />
            <MetricBadge value={selected.metrics.recall} label="Recall" />
            <MetricBadge value={selected.metrics.f1_score} label="F1 Score" />
            <MetricBadge value={selected.metrics.auc_roc} label="AUC-ROC" />
            <MetricBadge value={selected.metrics.cv_accuracy} label="CV Acc" />
            <div className="rounded-lg border px-3 py-2 text-center border-slate-200 bg-slate-50 text-slate-600">
              <p className="text-lg font-bold">±{selected.metrics.cv_std}%</p>
              <p className="text-[10px] font-medium opacity-70">CV Std</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Charts ────────────────────────────────────────────── */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="bg-white border border-border/50 shadow-sm p-1 h-auto">
          <TabsTrigger value="comparison" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 px-3 py-1.5">
            📊 Metric Comparison
          </TabsTrigger>
          <TabsTrigger value="roc" className="text-xs data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 px-3 py-1.5">
            📈 ROC Curves
          </TabsTrigger>
          <TabsTrigger value="radar" className="text-xs data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 px-3 py-1.5">
            🎯 Radar Chart
          </TabsTrigger>
          <TabsTrigger value="confusion" className="text-xs data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 px-3 py-1.5">
            🔢 Confusion Matrices
          </TabsTrigger>
          <TabsTrigger value="features" className="text-xs data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 px-3 py-1.5">
            ⭐ Feature Importance
          </TabsTrigger>
        </TabsList>

        {/* Metric Comparison */}
        <TabsContent value="comparison">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Model Performance Comparison</CardTitle>
              <p className="text-xs text-muted-foreground">All metrics side-by-side across all 6 models</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={comparisonData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, ""]} />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px" }} />
                  {data.models.map((m: any) => (
                    <Bar key={m.name} dataKey={m.name} fill={m.color} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROC Curves */}
        <TabsContent value="roc">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">ROC Curves — Overlay</CardTitle>
              <p className="text-xs text-muted-foreground">Receiver Operating Characteristic — True Positive vs False Positive rate</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={rocData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fpr" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} label={{ value: "False Positive Rate", position: "insideBottom", offset: -5, fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} label={{ value: "True Positive Rate", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: "10px" }} />
                  {/* Diagonal */}
                  <Line dataKey="fpr" name="Random (baseline)" stroke="#e2e8f0" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                  {data.roc_curves.map((curve: any) => (
                    <Line key={curve.name} dataKey={curve.name} stroke={curve.color} strokeWidth={2} dot={false} name={`${curve.name} (${curve.auc}%)`} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar */}
        <TabsContent value="radar">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Performance Radar</CardTitle>
              <p className="text-xs text-muted-foreground">Multi-metric comparison across all models</p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={450}>
                <RadarChart data={data.radar_data}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <PolarRadiusAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[40, 100]} />
                  {data.models.map((m: any) => (
                    <Radar key={m.name} name={m.name} dataKey={m.name} stroke={m.color} fill={m.color} fillOpacity={0.08} strokeWidth={2} />
                  ))}
                  <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: "10px" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, ""]} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confusion Matrices */}
        <TabsContent value="confusion">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Confusion Matrices</CardTitle>
              <p className="text-xs text-muted-foreground">True/False Positives & Negatives for each classifier</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {data.models.map((m: any) => (
                  <ConfusionMatrix key={m.name} cm={m.confusion_matrix} name={m.name} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Importance */}
        <TabsContent value="features">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Feature Importance — {selectedModel}
              </CardTitle>
              <p className="text-xs text-muted-foreground">Top 10 features by model-specific importance score (click a model card above to switch)</p>
            </CardHeader>
            <CardContent>
              {selected.feature_importance ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={selected.feature_importance} layout="vertical" barSize={16} margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#334155" }} axisLine={false} tickLine={false} width={140} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v.toFixed(4), "Importance"]} />
                    <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                      {selected.feature_importance.map((_: any, i: number) => (
                        <Cell key={i} fill={selected.color} opacity={1 - i * 0.07} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Feature importance not available for {selected.name} (KNN is instance-based).
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
