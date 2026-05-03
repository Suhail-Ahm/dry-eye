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
  Legend,
} from "recharts";

const TT_STYLE = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.08)",
  fontSize: "12px",
  padding: "10px 14px",
};
const TT_WRAPPER = { zIndex: 100 };
const AXIS_TICK = { fontSize: 10, fill: "#64748b" };

interface LifestyleChartsProps {
  lifestyleDistribution: { name: string; yes: number; no: number }[];
  dryEyeByLifestyle: {
    name: string;
    yes_rate: number;
    no_rate: number;
  }[];
}

function shortenLabel(label: string): string {
  const map: Record<string, string> = {
    "Sleep disorder": "Sleep Dis.",
    "Wake up during night": "Wake Night",
    "Feel sleepy during day": "Sleepy Day",
    "Caffeine consumption": "Caffeine",
    "Alcohol consumption": "Alcohol",
    "Smoking": "Smoking",
    "Medical issue": "Medical",
    "Ongoing medication": "Medication",
    "Smart device before bed": "Device Bed",
  };
  return map[label] || label;
}

export function LifestyleCharts({
  lifestyleDistribution,
  dryEyeByLifestyle,
}: LifestyleChartsProps) {
  const distData = lifestyleDistribution.map((d) => ({
    name: shortenLabel(d.name),
    Yes: d.yes,
    No: d.no,
  }));

  const rateData = dryEyeByLifestyle.map((d) => ({
    name: shortenLabel(d.name),
    "Has Factor": d.yes_rate,
    "No Factor": d.no_rate,
  }));

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Distribution */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Lifestyle & Habits Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Yes vs No for each lifestyle factor
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="These are binary (Yes/No) lifestyle factors. A heavily skewed distribution (e.g., 90% No for smoking) means fewer patients have that risk factor — the model has less evidence to learn from." />
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={distData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [v.toLocaleString(), ""]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Yes" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="No" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye Rate by Factor */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Dry Eye Rate — With vs Without Factor
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Impact of each lifestyle factor on Dry Eye prevalence
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Compare the orange (Has Factor) vs grey (No Factor) bars. A large gap means the lifestyle factor has a strong association with dry eye. Similar heights mean weak association." />
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={rateData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [`${v}%`, ""]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Has Factor" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="No Factor" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
