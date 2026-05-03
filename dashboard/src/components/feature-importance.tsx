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
  Cell,
} from "recharts";

const TOOLTIP_STYLE = {
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
  fontSize: "12px",
};

function shortenLabel(label: string): string {
  const map: Record<string, string> = {
    "Sleep duration": "Sleep Duration",
    "Sleep quality": "Sleep Quality",
    "Stress level": "Stress Level",
    "Heart rate": "Heart Rate",
    "Daily steps": "Daily Steps",
    "Physical activity": "Physical Activity",
    "Average screen time": "Screen Time",
    "BP_Systolic": "BP Systolic",
    "BP_Diastolic": "BP Diastolic",
    "Sleep disorder": "Sleep Disorder",
    "Wake up during night": "Wake at Night",
    "Feel sleepy during day": "Daytime Sleepiness",
    "Caffeine consumption": "Caffeine",
    "Alcohol consumption": "Alcohol",
    "Medical issue": "Medical Issue",
    "Ongoing medication": "Medication",
    "Smart device before bed": "Device Before Bed",
    "Blue-light filter": "Blue-Light Filter",
    "Discomfort Eye-strain": "Eye Strain",
    "Redness in eye": "Redness",
    "Itchiness/Irritation in eye": "Itchiness",
  };
  return map[label] || label;
}

interface FeatureImportanceItem {
  name: string;
  type: string;
  score: number;
  chi2?: number;
  cramers_v?: number;
  correlation?: number;
  p_value: number;
}

interface FeatureImportanceProps {
  data: FeatureImportanceItem[];
}

function getBarColor(score: number, maxScore: number): string {
  const ratio = score / maxScore;
  if (ratio > 0.7) return "#1d4ed8";
  if (ratio > 0.5) return "#2563eb";
  if (ratio > 0.3) return "#3b82f6";
  if (ratio > 0.15) return "#60a5fa";
  return "#93c5fd";
}

export function FeatureImportance({ data }: FeatureImportanceProps) {
  const top15 = data.slice(0, 15);
  const maxScore = Math.max(...top15.map((d) => d.score));

  const chartData = top15.map((d) => ({
    name: shortenLabel(d.name),
    score: d.score,
    type: d.type,
    pValue: d.p_value,
  }));

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Feature Importance — Association with Dry Eye Disease
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Cramér&apos;s V (categorical) or |Point-Biserial r| (numeric) — ranked
          by association strength
        </p>
      </CardHeader>
      <CardContent>
          <LearnHint text="Features are ranked by association strength with dry eye: Cramér's V for categorical features and |Point-Biserial r| for numeric ones. Taller bars = stronger statistical relationship. All features shown have p < 0.05 (statistically significant)." />
        <ResponsiveContainer width="100%" height={480}>
          <BarChart data={chartData} layout="vertical" barSize={18} margin={{ left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              domain={[0, "auto"]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: "#334155" }}
              axisLine={false}
              tickLine={false}
              width={130}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              wrapperStyle={{ zIndex: 100 }}
              formatter={(value: number, _name: string, props: { payload: { type: string; pValue: number } }) => {
                const { type, pValue } = props.payload;
                return [
                  `${value.toFixed(4)} (${type === "categorical" ? "Cramér's V" : "| r |"}) — p=${pValue < 0.001 ? "<0.001" : pValue.toFixed(4)}`,
                  "Score",
                ];
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.score, maxScore)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-6 justify-center mt-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Strong association</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-300" />
            <span>Weak association</span>
          </div>
          <span className="text-muted-foreground/60">|</span>
          <span>Lower p-value = more statistically significant</span>
        </div>
      </CardContent>
    </Card>
  );
}
