"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TT = { borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.08)", fontSize: "12px", padding: "10px 14px" };
const AX = { fontSize: 10, fill: "#64748b" };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const TYPE_META: Record<string, { color: string; emoji: string; bg: string }> = {
  numeric: { color: "#3b82f6", emoji: "📐", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  binary: { color: "#10b981", emoji: "✅", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ordinal: { color: "#f59e0b", emoji: "🔢", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  categorical: { color: "#8b5cf6", emoji: "📝", bg: "bg-violet-50 text-violet-700 border-violet-200" },
};

/* ── Stat Tile ───────────────────────────────────────────────────────── */
function StatTile({ label, value, delay = 0 }: { label: string; value: string | number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.25 }}
      className="rounded-lg border border-border/40 bg-white p-2.5 text-center"
    >
      <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold tabular-nums mt-0.5">{value}</p>
    </motion.div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */
interface ColumnExplorerProps { data: any[] }

export function ColumnExplorer({ data }: ColumnExplorerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const col = data[selectedIdx];
  const meta = TYPE_META[col.type] || TYPE_META.categorical;

  const selectColumn = (name: string) => {
    const idx = data.findIndex((c: any) => c.name === name);
    if (idx >= 0) setSelectedIdx(idx);
    setSearch("");
  };

  const goPrev = () => setSelectedIdx((i) => (i > 0 ? i - 1 : data.length - 1));
  const goNext = () => setSelectedIdx((i) => (i < data.length - 1 ? i + 1 : 0));

  return (
    <div className="space-y-5">
      {/* ── Column Selector ─────────────────────────────────── */}
      <Card className="shadow-sm border-border/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Prev button */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={goPrev}
              className="shrink-0 w-8 h-8 rounded-lg border border-border/40 bg-white flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
            </motion.button>

            {/* Search/Select */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`🔍 Search columns… (${data.length} total)`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 placeholder:text-muted-foreground/40"
              />
              {search && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-border/40 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {filtered.length === 0 && (
                    <p className="text-xs text-muted-foreground p-3">No columns match</p>
                  )}
                  {filtered.map((c: any) => (
                    <button
                      key={c.name}
                      onClick={() => selectColumn(c.name)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <span>{TYPE_META[c.type]?.emoji}</span>
                      <span className="font-medium">{c.name}</span>
                      <Badge variant="secondary" className="text-[8px] ml-auto">{c.type}</Badge>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Next button */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={goNext}
              className="shrink-0 w-8 h-8 rounded-lg border border-border/40 bg-white flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 18l6-6-6-6"/></svg>
            </motion.button>

            {/* Counter */}
            <span className="text-[10px] text-muted-foreground/50 font-mono shrink-0">
              {selectedIdx + 1}/{data.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Column Profile ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={col.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {/* Profile Card */}
          <Card className="shadow-sm border-border/30 overflow-hidden">
            <div className="h-1" style={{ background: meta.color }} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{meta.emoji}</span>
                    <h3 className="text-lg font-bold tracking-tight">{col.name}</h3>
                    <Badge className={`${meta.bg} text-[9px] font-semibold border`}>{col.type}</Badge>
                  </div>
                  <div className="flex gap-4 text-[11px] text-muted-foreground/60">
                    <span><strong className="text-foreground">{col.unique}</strong> unique values</span>
                    <span><strong className="text-foreground">{col.missing}</strong> missing</span>
                    <span><strong className="text-foreground">{col.total.toLocaleString()}</strong> total</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: meta.color }}>
                    {col.completeness}%
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 font-semibold uppercase">Complete</p>
                </div>
              </div>

              {/* Completeness bar */}
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: meta.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${col.completeness}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Distribution */}
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  {col.type === "numeric" ? "Distribution" : "Value Counts"}
                </CardTitle>
                <p className="text-[10px] text-muted-foreground/50">
                  {col.type === "numeric" ? "Histogram of values" : "Frequency of each category"}
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={col.type === "numeric" ? col.distribution : col.value_counts} barSize={col.type === "numeric" ? 20 : 40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey={col.type === "numeric" ? "range" : "value"} tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                    <YAxis tick={AX} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TT} formatter={(v: number) => [v.toLocaleString(), "Count"]} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {(col.type === "numeric" ? col.distribution : col.value_counts)?.map((_: any, i: number) => (
                        <Cell key={i} fill={meta.color} opacity={0.7 + (i % 3) * 0.1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Dry Eye Rate */}
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Dry Eye Rate</CardTitle>
                <p className="text-[10px] text-muted-foreground/50">
                  How dry eye prevalence changes across {col.name.toLowerCase()} values
                </p>
              </CardHeader>
              <CardContent>
                {col.dry_eye_by_value ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={col.dry_eye_by_value} barSize={col.type === "numeric" ? 20 : 40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey={col.type === "numeric" ? "range" : "value"} tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                      <YAxis tick={AX} axisLine={false} tickLine={false} domain={[40, 80]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip contentStyle={TT} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {col.dry_eye_by_value.map((_: any, i: number) => (
                          <Cell key={i} fill={_?.rate > 65 ? "#ef4444" : _?.rate > 55 ? "#f59e0b" : "#22c55e"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-12">N/A for target variable</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <Card className="shadow-sm border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {col.type === "numeric" && col.stats ? (
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                  <StatTile label="Mean" value={col.stats.mean} delay={0} />
                  <StatTile label="Median" value={col.stats.median} delay={0.03} />
                  <StatTile label="Std Dev" value={col.stats.std} delay={0.06} />
                  <StatTile label="Min" value={col.stats.min} delay={0.09} />
                  <StatTile label="Max" value={col.stats.max} delay={0.12} />
                  <StatTile label="Q1" value={col.stats.q1} delay={0.15} />
                  <StatTile label="Q3" value={col.stats.q3} delay={0.18} />
                  <StatTile label="IQR" value={col.stats.iqr} delay={0.21} />
                  <StatTile label="Skew" value={col.stats.skew} delay={0.24} />
                </div>
              ) : col.stats ? (
                <div className="grid grid-cols-3 gap-2">
                  <StatTile label="Mode" value={col.stats.mode} />
                  <StatTile label="Mode Freq" value={col.stats.mode_freq.toLocaleString()} delay={0.05} />
                  <StatTile label="Mode %" value={`${col.stats.mode_pct}%`} delay={0.1} />
                </div>
              ) : null}

              {/* Extra: correlation or chi-square */}
              <div className="mt-3 flex gap-2 flex-wrap">
                {col.correlation && (
                  <>
                    <Badge variant="secondary" className="text-[9px]">
                      r = {col.correlation.r} (Point-Biserial)
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      p = {col.correlation.p < 0.001 ? "<0.001" : col.correlation.p}
                    </Badge>
                  </>
                )}
                {col.chi_square && (
                  <>
                    <Badge variant="secondary" className="text-[9px]">
                      χ² = {col.chi_square.chi2}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      Cramér&apos;s V = {col.chi_square.cramers_v}
                    </Badge>
                  </>
                )}
                {col.outliers !== undefined && (
                  <Badge variant="secondary" className={`text-[9px] ${col.outliers > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : ""}`}>
                    {col.outliers} outliers (IQR)
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Box Plot Comparison (numeric only) */}
          {col.type === "numeric" && col.box_plot && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(col.box_plot).map(([group, box]: [string, any]) => (
                <motion.div
                  key={group}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className={`rounded-xl p-4 border ${
                    group === "Dry Eye" ? "bg-blue-50/40 border-blue-200/50" : "bg-amber-50/40 border-amber-200/50"
                  }`}
                >
                  <p className="text-xs font-semibold mb-2">{group}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { l: "Min", v: box.min }, { l: "Q1", v: box.q1 },
                      { l: "Median", v: box.median }, { l: "Q3", v: box.q3 },
                      { l: "Max", v: box.max }, { l: "Mean", v: box.mean },
                    ].map((s) => (
                      <div key={s.l}>
                        <p className="text-[8px] text-muted-foreground/50 font-semibold">{s.l}</p>
                        <p className="text-sm font-bold tabular-nums">{s.v}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Insight Card */}
          {col.insight && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-blue-100/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-4"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg shrink-0">💡</span>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Auto-Insight</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{col.insight}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
