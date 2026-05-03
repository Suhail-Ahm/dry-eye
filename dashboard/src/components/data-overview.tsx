"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { InfoTip } from "@/components/learn-tooltip";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TT = { borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.08)", fontSize: "12px", padding: "10px 14px" };
const AX = { fontSize: 10, fill: "#64748b" };

const STAT_TIPS: Record<string, string> = {
  Count: "Total non-null values. All 20,000 records are present for every feature — no missing data.",
  Mean: "Arithmetic average. Sensitive to outliers — compare with Median to detect skew.",
  Std: "Standard deviation — measures how spread out the values are. Larger = more variation.",
  Min: "Smallest value in the dataset for this feature.",
  Q25: "25th percentile — 25% of values fall below this. Also called Q1.",
  Median: "50th percentile — the middle value. More robust than Mean for skewed data.",
  Q75: "75th percentile — 75% of values fall below this. Also called Q3.",
  Max: "Largest value in the dataset for this feature.",
};

const TABS = [
  { id: "table", icon: "📋", label: "Numeric Stats" },
  { id: "categorical", icon: "✅", label: "Categorical Stats" },
  { id: "dist", icon: "📊", label: "Distribution" },
  { id: "box", icon: "📦", label: "Box Plots" },
];

/* ── Quick Insight Pill ─────────────────────────────────────────────── */
function InsightPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border px-3 py-2 text-center"
      style={{ borderColor: `${color}30`, background: `${color}08` }}
    >
      <p className="text-lg font-bold tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[8px] text-muted-foreground/60 font-semibold uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

interface DataOverviewProps {
  summaryTable: any[];
  distributionComparison: any[];
  boxPlots: any[];
  categoricalSummary?: any[];
}

export function DataOverview({ summaryTable, distributionComparison, boxPlots, categoricalSummary }: DataOverviewProps) {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [activeTab, setActiveTab] = useState("table");
  const [highlightRow, setHighlightRow] = useState<string | null>(null);

  const current = distributionComparison[selectedFeature];
  const currentBoxData = boxPlots.filter((b: any) => b.feature === current.feature);

  // Compute dataset-level stats
  const totalFeatures = summaryTable.length;
  const totalRecords = summaryTable[0]?.count || 20000;
  const avgStd = (summaryTable.reduce((s: number, r: any) => s + r.std, 0) / totalFeatures).toFixed(2);
  const maxRange = summaryTable.reduce((best: any, r: any) => {
    const range = r.max - r.min;
    return range > (best.max - best.min) ? r : best;
  }, summaryTable[0]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* ── Hero Stats Row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <InsightPill label="Numeric Features" value={`${totalFeatures}`} color="#3b82f6" />
        <InsightPill label="Binary/Cat Features" value={`${categoricalSummary?.length || 15}`} color="#10b981" />
        <InsightPill label="Records" value={totalRecords.toLocaleString()} color="#06b6d4" />
        <InsightPill label="Avg Spread (σ)" value={avgStd} color="#f59e0b" />
        <InsightPill label="Widest Range" value={`${maxRange.feature}`} color="#8b5cf6" />
      </div>

      {/* ── Sub-Tab Navigation ─────────────────────────────── */}
      <div className="flex gap-1 bg-white/60 backdrop-blur-sm border border-border/30 rounded-xl p-1.5 shadow-sm overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-1 min-w-max md:min-w-0 md:w-full">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap
              ${activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="ds-active-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-border/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {/* ━━━ Statistics Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "table" && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  Summary Statistics — All Numeric Features
                </CardTitle>
                <p className="text-[11px] text-muted-foreground/60">
                  Equivalent to <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">df.describe()</code> — hover any column header for an explanation
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {/* Learn hint */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 bg-blue-50/60 border border-blue-100/60 rounded-lg px-3 py-2.5 mb-4"
                >
                  <span className="text-sm shrink-0 mt-0.5">💡</span>
                  <p className="text-[11px] text-blue-700/70 leading-relaxed">
                    <strong>How to read:</strong> Compare <strong>Mean vs Median</strong> — if they differ significantly, the data is skewed.
                    Check <strong>Std</strong> relative to Mean — high ratio means high variability.
                    <strong>Q25–Q75</strong> range (IQR) contains the middle 50% of values.
                  </p>
                </motion.div>

                <Table>
                  <TableHeader>
                    <TableRow className="text-[10px] border-b-2">
                      <TableHead className="font-bold text-xs">Feature</TableHead>
                      {["Count", "Mean", "Std", "Min", "Q25", "Median", "Q75", "Max"].map((h) => (
                        <TableHead key={h} className="text-right font-semibold">
                          <span className="inline-flex items-center gap-0.5">
                            {h}
                            <InfoTip text={STAT_TIPS[h]} />
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryTable.map((row: any) => {
                      const isHighlighted = highlightRow === row.feature;
                      const skewRatio = Math.abs(row.mean - row.median) / (row.std || 1);
                      const isSkewed = skewRatio > 0.2;
                      return (
                        <TableRow
                          key={row.feature}
                          className={`text-xs cursor-pointer transition-colors duration-150 ${
                            isHighlighted ? "bg-blue-50/60" : "hover:bg-slate-50/50"
                          }`}
                          onClick={() => {
                            setHighlightRow(isHighlighted ? null : row.feature);
                            const distIdx = distributionComparison.findIndex((d: any) => d.feature === row.feature);
                            if (distIdx >= 0) setSelectedFeature(distIdx);
                          }}
                        >
                          <TableCell className="font-semibold text-xs py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              {row.feature}
                              {isSkewed && (
                                <Badge variant="secondary" className="text-[7px] px-1 py-0 bg-amber-50 text-amber-600 border-amber-200">
                                  skewed
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums py-2.5 text-muted-foreground">{row.count.toLocaleString()}</TableCell>
                          <TableCell className={`text-right tabular-nums py-2.5 font-medium ${isSkewed ? "text-amber-600" : ""}`}>{row.mean}</TableCell>
                          <TableCell className="text-right tabular-nums py-2.5">{row.std}</TableCell>
                          <TableCell className="text-right tabular-nums py-2.5 text-muted-foreground/60">{row.min}</TableCell>
                          <TableCell className="text-right tabular-nums py-2.5 text-muted-foreground/60">{row.q25}</TableCell>
                          <TableCell className="text-right tabular-nums py-2.5 font-bold">{row.median}</TableCell>
                          <TableCell className="text-right tabular-nums py-2.5 text-muted-foreground/60">{row.q75}</TableCell>
                          <TableCell className="text-right tabular-nums py-2.5 text-muted-foreground/60">{row.max}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <p className="text-[10px] text-muted-foreground/40 mt-3 text-center">
                  💡 Click any row to see its distribution and box plot in the other tabs
                </p>
              </CardContent>
            </Card>
          )}

          {/* ━━━ Categorical Stats ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "categorical" && categoricalSummary && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  Categorical / Binary Features — {categoricalSummary.length} Columns
                </CardTitle>
                <p className="text-[11px] text-muted-foreground/60">
                  Value distributions and dry eye prevalence for all non-numeric attributes
                </p>
              </CardHeader>
              <CardContent>
                {/* Learn hint */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100/60 rounded-lg px-3 py-2.5 mb-4"
                >
                  <span className="text-sm shrink-0 mt-0.5">💡</span>
                  <p className="text-[11px] text-emerald-700/70 leading-relaxed">
                    <strong>How to read:</strong> For each feature, the bars show the proportion of each value.
                    The <strong className="text-red-500">dry eye rate</strong> next to each value tells you whether that
                    group has higher or lower prevalence than the dataset average (65.2%). Large differences = potential risk factors.
                  </p>
                </motion.div>

                <div className="space-y-3">
                  {categoricalSummary.map((feat: any) => (
                    <motion.div
                      key={feat.feature}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-border/30 p-4 hover:bg-slate-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-xs">✅</span>
                        <p className="text-xs font-bold flex-1">{feat.feature}</p>
                        <Badge variant="secondary" className="text-[8px]">{feat.type}</Badge>
                        <span className="text-[9px] text-muted-foreground/50">
                          Mode: <strong className="text-foreground">{feat.mode}</strong> ({feat.mode_pct}%)
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {feat.values.map((v: any) => (
                          <div key={v.value} className="flex items-center gap-2">
                            <span className="text-[10px] font-medium w-24 truncate shrink-0 text-right">
                              {v.value}
                            </span>
                            <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${v.pct}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{
                                  background: v.dry_eye_rate !== null
                                    ? v.dry_eye_rate > 66 ? "#ef444480" : v.dry_eye_rate > 64 ? "#3b82f680" : "#22c55e80"
                                    : "#94a3b880"
                                }}
                              />
                              <span className="absolute inset-0 flex items-center px-2 text-[9px] font-medium text-foreground/70">
                                {v.count.toLocaleString()} ({v.pct}%)
                              </span>
                            </div>
                            {v.dry_eye_rate !== null && (
                              <span className={`text-[9px] font-bold tabular-nums w-12 text-right ${
                                v.dry_eye_rate > 66 ? "text-red-500" : v.dry_eye_rate > 64 ? "text-slate-500" : "text-emerald-500"
                              }`}>
                                {v.dry_eye_rate}%
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground/40 mt-3 text-center">
                  Dry eye rates: <span className="text-red-400 font-semibold">red</span> = above avg (66%+),
                  <span className="text-emerald-400 font-semibold"> green</span> = below avg (&lt;64%),
                  <span className="text-slate-400 font-semibold"> grey</span> = near average
                </p>
              </CardContent>
            </Card>
          )}

          {/* ━━━ Distribution Comparison ━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "dist" && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-sm font-bold">
                      Distribution — Dry Eye vs No Dry Eye
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      How {current.feature} distributes across patient groups — look for separation between bars
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Learn hint */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 bg-blue-50/60 border border-blue-100/60 rounded-lg px-3 py-2.5 mb-4"
                >
                  <span className="text-sm shrink-0">💡</span>
                  <p className="text-[11px] text-blue-700/70 leading-relaxed">
                    If the <span className="text-blue-600 font-semibold">blue (Dry Eye)</span> and{" "}
                    <span className="text-amber-600 font-semibold">amber (No Dry Eye)</span> bars overlap heavily,
                    the feature has weak discriminatory power. Clear separation = strong predictor.
                  </p>
                </motion.div>

                {/* Feature selector */}
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {distributionComparison.map((d: any, i: number) => (
                    <motion.button
                      key={d.feature}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFeature(i)}
                      className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                        selectedFeature === i
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                          : "bg-white text-muted-foreground border-border/40 hover:border-blue-200 hover:text-blue-600"
                      }`}
                    >
                      {d.feature}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.feature}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart data={current.data} barSize={14} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="range" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                        <YAxis tick={AX} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={TT} wrapperStyle={{ zIndex: 100 }} formatter={(v: number) => [v.toLocaleString(), ""]} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                        <Bar dataKey="Dry Eye" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.85} />
                        <Bar dataKey="No Dry Eye" fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.85} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          )}

          {/* ━━━ Box Plot Analysis ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === "box" && (
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  Box Plot — {current.feature}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground/60">
                  Quartile spread comparison between dry eye patients and healthy controls
                </p>
              </CardHeader>
              <CardContent>
                {/* Learn hint */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 bg-blue-50/60 border border-blue-100/60 rounded-lg px-3 py-2.5 mb-4"
                >
                  <span className="text-sm shrink-0">💡</span>
                  <p className="text-[11px] text-blue-700/70 leading-relaxed">
                    Compare the <strong>Median</strong> values — a large difference suggests this feature separates groups.
                    The <strong>IQR</strong> (Q3-Q1) shows variability — wider IQR = more spread in that group.
                  </p>
                </motion.div>

                {/* Feature selector */}
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {distributionComparison.map((d: any, i: number) => (
                    <motion.button
                      key={d.feature}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFeature(i)}
                      className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                        selectedFeature === i
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                          : "bg-white text-muted-foreground border-border/40 hover:border-blue-200 hover:text-blue-600"
                      }`}
                    >
                      {d.feature}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.feature}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {currentBoxData.map((box: any) => {
                      const iqr = (box.q3 - box.q1).toFixed(2);
                      const range = (box.max - box.min).toFixed(2);
                      const isDryEye = box.group === "Dry Eye";
                      return (
                        <motion.div
                          key={box.group}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: isDryEye ? 0 : 0.1 }}
                          className={`rounded-xl p-5 border ${
                            isDryEye
                              ? "bg-blue-50/40 border-blue-200/50"
                              : "bg-amber-50/40 border-amber-200/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${isDryEye ? "bg-blue-500" : "bg-amber-500"}`} />
                            <p className="text-xs font-bold">{box.group}</p>
                          </div>

                          {/* Visual range bar */}
                          <div className="relative h-8 mb-4 bg-white/60 rounded-lg border border-border/20">
                            {/* IQR box */}
                            <div
                              className={`absolute top-1 bottom-1 rounded ${isDryEye ? "bg-blue-200/60" : "bg-amber-200/60"}`}
                              style={{
                                left: `${((box.q1 - box.min) / (box.max - box.min)) * 100}%`,
                                width: `${((box.q3 - box.q1) / (box.max - box.min)) * 100}%`,
                              }}
                            />
                            {/* Median line */}
                            <div
                              className={`absolute top-0 bottom-0 w-0.5 ${isDryEye ? "bg-blue-600" : "bg-amber-600"}`}
                              style={{ left: `${((box.median - box.min) / (box.max - box.min)) * 100}%` }}
                            />
                            {/* Min/Max whiskers */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-slate-300 rounded-full" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-slate-300 rounded-full" />
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center">
                            {[
                              { l: "Min", v: box.min },
                              { l: "Q1", v: box.q1 },
                              { l: "Median", v: box.median, bold: true },
                              { l: "Q3", v: box.q3 },
                              { l: "Max", v: box.max },
                              { l: "Mean", v: box.mean },
                              { l: "IQR", v: iqr },
                              { l: "Range", v: range },
                            ].map((s: any) => (
                              <div key={s.l} className="space-y-0.5">
                                <p className="text-[8px] text-muted-foreground/50 font-semibold uppercase">{s.l}</p>
                                <p className={`text-sm tabular-nums ${s.bold ? "font-bold" : "font-semibold"}`}>{s.v}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Comparison insight */}
                {currentBoxData.length === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 rounded-lg border border-slate-100 bg-gradient-to-r from-slate-50/50 to-white p-3"
                  >
                    <p className="text-[11px] text-slate-500">
                      <strong className="text-slate-700">Quick comparison:</strong>{" "}
                      Median {current.feature} is <strong>{currentBoxData[0].median}</strong> for Dry Eye
                      vs <strong>{currentBoxData[1].median}</strong> for No Dry Eye
                      (Δ = {Math.abs(currentBoxData[0].median - currentBoxData[1].median).toFixed(2)}).
                      {Math.abs(currentBoxData[0].median - currentBoxData[1].median) < 1
                        ? " Minimal difference — this feature may not separate the groups well."
                        : " Notable difference — worth investigating as a potential predictor."}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
