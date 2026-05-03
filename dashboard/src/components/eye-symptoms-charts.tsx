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
  Cell,
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

function shortenSymptomLabel(label: string): string {
  const map: Record<string, string> = {
    "Discomfort Eye-strain": "Eye Strain",
    "Redness in eye": "Redness",
    "Itchiness/Irritation in eye": "Itchiness",
  };
  return map[label] || label;
}

interface EyeSymptomsChartsProps {
  screenTimeDistribution: { range: string; count: number }[];
  blueLightImpact: { name: string; rate: number; count: number }[];
  eyeSymptomsDistribution: { name: string; yes: number; no: number }[];
  dryEyeByEyeSymptom: {
    name: string;
    with_symptom: number;
    without_symptom: number;
  }[];
}

export function EyeSymptomsCharts({
  screenTimeDistribution,
  blueLightImpact,
  eyeSymptomsDistribution,
  dryEyeByEyeSymptom,
}: EyeSymptomsChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
      {/* Screen Time Distribution */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Average Screen Time Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Hours per day
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Prolonged screen use (>4h/day) reduces blink rate by up to 60%, leading to tear film evaporation. The 20-20-20 rule (every 20 min, look 20 ft away for 20 sec) is a common clinical recommendation." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={screenTimeDistribution} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [v.toLocaleString(), "Count"]} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Blue Light Filter Impact */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Blue-Light Filter Impact
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Dry Eye rate with vs without filter
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Blue-light filters reduce high-energy visible light from screens. A lower dry eye rate with filters suggests protective benefit, though evidence is still debated in ophthalmology." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={blueLightImpact} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                <Cell fill="#6366f1" />
                <Cell fill="#a5b4fc" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Eye Symptoms Prevalence */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Eye Symptoms Prevalence
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Count of patients with each symptom
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Eye strain, redness, and itchiness are cardinal signs of dry eye. High prevalence of these symptoms in the dataset provides strong signal for predictive models." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={eyeSymptomsDistribution.map((d) => ({
                name: shortenSymptomLabel(d.name),
                Present: d.yes,
                Absent: d.no,
              }))}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [v.toLocaleString(), ""]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Present" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#fca5a5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye by Eye Symptom */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Dry Eye Rate by Eye Symptom
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            With symptom vs without symptom
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="A large gap between red (with symptom) and grey (without) bars indicates strong association. These symptoms are often the most important features in ML models for dry eye prediction." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={dryEyeByEyeSymptom.map((d) => ({
                name: shortenSymptomLabel(d.name),
                "With Symptom": d.with_symptom,
                "Without Symptom": d.without_symptom,
              }))}
              barSize={25}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [`${v}%`, ""]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="With Symptom" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Without Symptom" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
