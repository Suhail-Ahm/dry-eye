"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoTip, LearnHint, METRIC_TIPS, TAB_TIPS, CM_LABELS } from "@/components/learn-tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TT = { borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.08)", fontSize: "12px", padding: "10px 14px" };

/* ── Animation Variants ──────────────────────────────────────────────── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } };
const slideRight = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } } };

/* ── Sub-tab config ──────────────────────────────────────────────────── */
const SUB_TABS = [
  { id: "comparison", icon: "📊", label: "Compare" },
  { id: "roc", icon: "📈", label: "ROC Curves" },
  { id: "radar", icon: "🎯", label: "Radar" },
  { id: "confusion", icon: "🔢", label: "Confusion" },
  { id: "features", icon: "⭐", label: "Features" },
];

/* ── Metric Badge ────────────────────────────────────────────────────── */
function MetricPill({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
  const color = value >= 75 ? "text-emerald-600 bg-emerald-50/80 border-emerald-200/60"
    : value >= 65 ? "text-amber-600 bg-amber-50/80 border-amber-200/60"
    : "text-red-500 bg-red-50/80 border-red-200/60";
  const rating = value >= 75 ? "Good" : value >= 65 ? "Fair" : "Low";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className={`rounded-xl border px-3 py-2.5 text-center ${color} backdrop-blur-sm group relative`}
    >
      <motion.p
        className="text-xl font-bold tabular-nums"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.15, duration: 0.3 }}
      >
        {value}%
      </motion.p>
      <p className="text-[9px] font-semibold opacity-60 uppercase tracking-wider mt-0.5">
        {label}
        {METRIC_TIPS[label] && <InfoTip text={METRIC_TIPS[label]} />}
      </p>
      <p className="text-[8px] opacity-40 mt-0.5">{rating}</p>
    </motion.div>
  );
}

/* ── Confusion Matrix ────────────────────────────────────────────────── */
function ConfusionMatrix({ cm, name, color }: { cm: any; name: string; color: string }) {
  const total = cm.tp + cm.tn + cm.fp + cm.fn;
  const cells = [
    { label: "TN", full: "True Neg ✓", value: cm.tn, bg: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "FP", full: "False Pos ✗", value: cm.fp, bg: "bg-red-50 text-red-600 border-red-100" },
    { label: "FN", full: "False Neg ✗", value: cm.fn, bg: "bg-orange-50 text-orange-600 border-orange-100" },
    { label: "TP", full: "True Pos ✓", value: cm.tp, bg: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  ];
  return (
    <motion.div variants={fadeUp} className="space-y-2">
      <div className="flex items-center gap-1.5 justify-center">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <p className="text-[10px] font-semibold text-muted-foreground">{name}</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5 max-w-[160px] mx-auto">
        {cells.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className={`${c.bg} rounded-lg border p-2 text-center`}
            title={CM_LABELS[c.label]}
          >
            <p className="text-[7px] font-semibold opacity-50">{c.full}</p>
            <p className="text-xs font-bold">{c.value.toLocaleString()}</p>
            <p className="text-[8px] opacity-40">{((c.value / total) * 100).toFixed(0)}%</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */
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
  const [activeTab, setActiveTab] = useState("comparison");
  const [compareMode, setCompareMode] = useState(false);
  const [compareModels, setCompareModels] = useState<string[]>([data.best_model]);

  const selected = data.models.find((m: any) => m.name === selectedModel)!;

  const toggleCompare = (name: string) => {
    setCompareModels((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // ROC data
  const rocMerged: Record<string, any> = {};
  data.roc_curves.forEach((curve: any) => {
    curve.fpr.forEach((fpr: number, i: number) => {
      const key = fpr.toFixed(4);
      if (!rocMerged[key]) rocMerged[key] = { fpr };
      rocMerged[key][curve.name] = curve.tpr[i];
    });
  });
  const rocData = Object.values(rocMerged).sort((a: any, b: any) => a.fpr - b.fpr);

  // Comparison bar data
  const comparisonData = ["accuracy", "precision", "recall", "f1_score", "auc_roc"].map((m) => ({
    metric: m.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    ...Object.fromEntries(data.models.map((model: any) => [model.name, model.metrics[m]])),
  }));

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">

      {/* ══════════════════════════════════════════════════════════════════
          CTA — Best Model Hero Card
          ══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <Card className="border-0 overflow-hidden relative group">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <motion.div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          <CardContent className="p-8 relative z-10 text-white">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <motion.div className="space-y-3" variants={slideRight}>
                <div className="flex items-center gap-2.5">
                  <motion.span
                    className="text-3xl"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                  >
                    🏆
                  </motion.span>
                  <Badge className="bg-white/15 text-white border-white/20 text-[9px] font-bold uppercase tracking-[0.15em] backdrop-blur-sm px-3 py-1">
                    Best Performing Model
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold tracking-tight">{data.best_model}</h3>
                <p className="text-sm text-white/60 max-w-md leading-relaxed">
                  {selected.description}
                </p>
                <p className="text-[10px] text-white/40 max-w-md leading-relaxed italic">
                  ☝️ Selected as best because it has the highest F1 Score — the single best metric
                  for imbalanced datasets like ours (65% positive rate).
                </p>
                <div className="flex gap-2 pt-1">
                  {[
                    { l: "Train", v: data.split_info.train_size.toLocaleString() },
                    { l: "Test", v: data.split_info.test_size.toLocaleString() },
                    { l: "Stratified", v: "Yes" },
                  ].map((b) => (
                    <span key={b.l} className="text-[9px] bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-white/60 font-medium">
                      {b.l}: {b.v}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div className="flex gap-3" variants={stagger}>
                {[
                  { v: selected.metrics.f1_score, l: "F1 Score", d: 0 },
                  { v: selected.metrics.accuracy, l: "Accuracy", d: 0.1 },
                  { v: selected.metrics.auc_roc, l: "AUC-ROC", d: 0.2 },
                ].map((m) => (
                  <motion.div
                    key={m.l}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: m.d + 0.3, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 text-center border border-white/15 min-w-[100px]"
                  >
                    <p className="text-3xl font-bold tabular-nums">{m.v}%</p>
                    <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wider mt-1">{m.l}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          Model Selector Cards
          ══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground">👇 Click any card to inspect its metrics in detail</p>
          <button
            onClick={() => { setCompareMode(!compareMode); if (!compareMode) setCompareModels([selectedModel]); }}
            className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200
              ${compareMode
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white text-muted-foreground border-border/50 hover:border-border"}`}
          >
            {compareMode ? "✓ Compare Mode" : "Compare Models"}
          </button>
        </div>

        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" variants={stagger}>
          {data.models.map((m: any, i: number) => {
            const isActive = compareMode ? compareModels.includes(m.name) : selectedModel === m.name;
            return (
              <motion.div
                key={m.name}
                variants={fadeUp}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (compareMode) toggleCompare(m.name);
                  else setSelectedModel(m.name);
                }}
                className={`cursor-pointer rounded-xl border p-3.5 space-y-2 transition-all duration-200
                  ${isActive
                    ? "border-transparent shadow-lg ring-2"
                    : "border-border/40 bg-white hover:shadow-md hover:border-border/60"}`}
                style={{
                  ["--tw-ring-color" as string]: isActive ? m.color + "40" : undefined,
                  background: isActive ? `linear-gradient(135deg, ${m.color}08, ${m.color}03)` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: m.color }} />
                  {m.name === data.best_model && (
                    <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-xs">
                      🏆
                    </motion.span>
                  )}
                  {compareMode && (
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] transition-all
                      ${isActive ? "border-blue-500 bg-blue-500 text-white" : "border-border"}`}>
                      {isActive && "✓"}
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-semibold truncate">{m.name}</p>
                <motion.p
                  className="text-xl font-bold tabular-nums"
                  style={{ color: m.color }}
                  key={m.metrics.f1_score}
                >
                  {m.metrics.f1_score}%
                </motion.p>
                <p className="text-[8px] text-muted-foreground/60 font-medium uppercase tracking-wider">F1 Score</p>
                <Badge variant="secondary" className="text-[8px] w-full justify-center py-0.5 font-medium">
                  {m.category}
                </Badge>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          Selected Model Detail Metrics
          ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedModel}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-sm border-border/30 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-slate-50/80 to-white">
              <div className="flex items-center gap-2.5">
                <motion.div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ background: selected.color }}
                  layoutId="selected-dot"
                />
                <CardTitle className="text-sm font-bold">{selected.name}</CardTitle>
                <Badge variant="secondary" className="text-[9px] font-medium">{selected.category}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-1">{selected.description}</p>
            </CardHeader>
            <CardContent className="pt-1 pb-4">
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {[
                  { v: selected.metrics.accuracy, l: "Accuracy", d: 0 },
                  { v: selected.metrics.precision, l: "Precision", d: 0.05 },
                  { v: selected.metrics.recall, l: "Recall", d: 0.1 },
                  { v: selected.metrics.f1_score, l: "F1 Score", d: 0.15 },
                  { v: selected.metrics.auc_roc, l: "AUC-ROC", d: 0.2 },
                  { v: selected.metrics.cv_accuracy, l: "CV Acc", d: 0.25 },
                ].map((m) => (
                  <MetricPill key={m.l} value={m.v} label={m.l} delay={m.d} />
                ))}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl border border-slate-200/60 bg-slate-50/80 px-3 py-2.5 text-center text-slate-600 backdrop-blur-sm"
                >
                  <p className="text-xl font-bold tabular-nums">±{selected.metrics.cv_std}%</p>
                  <p className="text-[9px] font-semibold opacity-60 uppercase tracking-wider mt-0.5">CV Std</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          Sub-Tab Navigation
          ══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex gap-1 bg-white/60 backdrop-blur-sm border border-border/30 rounded-xl p-1.5 shadow-sm">
        {SUB_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors duration-200
              ${activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="ml-active-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-border/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          Chart Content
          ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Metric Comparison */}
          {activeTab === "comparison" && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Model Performance Comparison</CardTitle>
                <p className="text-[11px] text-muted-foreground/60">All metrics side-by-side across 6 classifiers</p>
              </CardHeader>
              <CardContent className="pt-0 pb-0">
                <LearnHint text={TAB_TIPS.comparison} />
              </CardContent>
              <CardContent>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={comparisonData} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={TT} formatter={(v: number) => [`${v}%`, ""]} />
                    <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px" }} />
                    {data.models.map((m: any) => (
                      <Bar key={m.name} dataKey={m.name} fill={m.color} radius={[3, 3, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* ROC Curves */}
          {activeTab === "roc" && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">ROC Curves — Receiver Operating Characteristic</CardTitle>
                <p className="text-[11px] text-muted-foreground/60">True Positive Rate vs False Positive Rate — measures how well the model separates classes</p>
              </CardHeader>
              <CardContent className="pt-0 pb-0">
                <LearnHint text={TAB_TIPS.roc} />
              </CardContent>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart data={rocData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="fpr" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} label={{ value: "FPR", position: "insideBottom", offset: -5, fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} label={{ value: "TPR", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={TT} />
                    <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: "10px" }} />
                    <Line dataKey="fpr" name="Random" stroke="#e2e8f0" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                    {data.roc_curves.map((c: any) => (
                      <Line key={c.name} dataKey={c.name} stroke={c.color} strokeWidth={2} dot={false} name={`${c.name} (${c.auc}%)`} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Radar */}
          {activeTab === "radar" && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Performance Radar</CardTitle>
                <p className="text-[11px] text-muted-foreground/60">Multi-metric shape comparison — rounder shapes = better all-around performance</p>
              </CardHeader>
              <CardContent className="pt-0 pb-0">
                <LearnHint text={TAB_TIPS.radar} />
              </CardContent>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart data={data.radar_data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <PolarRadiusAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[40, 100]} />
                    {data.models.map((m: any) => (
                      <Radar key={m.name} name={m.name} dataKey={m.name} stroke={m.color} fill={m.color} fillOpacity={0.06} strokeWidth={2} />
                    ))}
                    <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: "10px" }} />
                    <Tooltip contentStyle={TT} formatter={(v: number) => [`${v}%`, ""]} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Confusion Matrices */}
          {activeTab === "confusion" && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Confusion Matrices</CardTitle>
                <p className="text-[11px] text-muted-foreground/60">Shows exactly where each model gets predictions right and wrong</p>
              </CardHeader>
              <CardContent className="pt-0 pb-0">
                <LearnHint text={TAB_TIPS.confusion} />
              </CardContent>
              <CardContent>
                <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" variants={stagger} initial="hidden" animate="visible">
                  {data.models.map((m: any) => (
                    <ConfusionMatrix key={m.name} cm={m.confusion_matrix} name={m.name} color={m.color} />
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          )}

          {/* Feature Importance */}
          {activeTab === "features" && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Feature Importance — {selectedModel}</CardTitle>
                <p className="text-[11px] text-muted-foreground/60">Which patient attributes does this model consider most important?</p>
              </CardHeader>
              <CardContent className="pt-0 pb-0">
                <LearnHint text={TAB_TIPS.features} />
              </CardContent>
              <CardContent>
                {selected.feature_importance ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={selected.feature_importance} layout="vertical" barSize={16} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#334155" }} axisLine={false} tickLine={false} width={140} />
                      <Tooltip contentStyle={TT} formatter={(v: number) => [v.toFixed(4), "Importance"]} />
                      <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                        {selected.feature_importance.map((_: any, i: number) => (
                          <Cell key={i} fill={selected.color} opacity={1 - i * 0.07} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16 space-y-2">
                    <p className="text-2xl">🤷</p>
                    <p className="text-sm text-muted-foreground">Not available for KNN (instance-based)</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
