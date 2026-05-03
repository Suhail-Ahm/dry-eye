"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearnHint } from "@/components/learn-tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const TT_STYLE = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.08)",
  fontSize: "12px",
  padding: "10px 14px",
};
const TT_WRAPPER = { zIndex: 100 };
const AXIS_TICK = { fontSize: 11, fill: "#64748b" };

interface SleepStressChartsProps {
  sleepDurationDistribution: { range: string; count: number }[];
  sleepQualityDistribution: { quality: string; count: number }[];
  stressLevelDistribution: { level: string; count: number }[];
  dryEyeBySleepQuality: { quality: string; rate: number }[];
  dryEyeByStressLevel: { level: string; rate: number }[];
}

export function SleepStressCharts({
  sleepDurationDistribution,
  sleepQualityDistribution,
  stressLevelDistribution,
  dryEyeBySleepQuality,
  dryEyeByStressLevel,
}: SleepStressChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sleep Duration Distribution */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Sleep Duration Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Hours of sleep per night
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Adults need 7-9 hours of sleep. Less than 6 hours is linked to tear-film instability and increased dry eye risk. Look for where most patients cluster." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sleepDurationDistribution} barSize={35}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [v.toLocaleString(), "Count"]} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sleep Quality & Stress Level */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Sleep Quality & Stress Level
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Scale 1 (low) → 5 (high)
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Sleep quality and stress are ordinal (ranked 1–5). Compare the shapes: if sleep quality is right-skewed and stress is left-skewed, patients tend to report good sleep but high stress." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={sleepQualityDistribution.map((sq, i) => ({
                label: sq.quality,
                "Sleep Quality": sq.count,
                "Stress Level": stressLevelDistribution[i]?.count || 0,
              }))}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} />
              <Bar dataKey="Sleep Quality" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Stress Level" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye by Sleep Quality */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Dry Eye Rate by Sleep Quality
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            1 = Poor → 5 = Excellent
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="A downward trend means better sleep → lower dry eye risk. A flat line means sleep quality alone has weak predictive value for this dataset." />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dryEyeBySleepQuality}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="quality" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} label={{ value: "Sleep Quality", position: "insideBottom", offset: -5, fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 5 }} activeDot={{ r: 7, stroke: "#8b5cf6", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye by Stress Level */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Dry Eye Rate by Stress Level
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            1 = Low → 5 = High
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="High stress triggers inflammation and reduces blink rate, both linked to dry eye. An upward trend here would confirm clinical expectations." />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dryEyeByStressLevel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="level" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} label={{ value: "Stress Level", position: "insideBottom", offset: -5, fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", r: 5 }} activeDot={{ r: 7, stroke: "#f59e0b", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
