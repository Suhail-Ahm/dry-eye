"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearnHint } from "@/components/learn-tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, LineChart, Line,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TT = { borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.08)", fontSize: "12px", padding: "10px 14px" };
const TT_W = { zIndex: 100 };
const AX = { fontSize: 10, fill: "#64748b" };
const BMI_COLORS = ["#60a5fa", "#22c55e", "#f59e0b", "#ef4444", "#b91c1c"];

interface HealthMetricsProps { data: any }

export function HealthMetrics({ data }: HealthMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
      {/* BMI Distribution */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">BMI Distribution</CardTitle>
          <p className="text-xs text-muted-foreground">Body Mass Index categories (Weight / Height²)</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="BMI classifies patients as Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (30-34.9), or Severely Obese (≥35). Higher BMI is associated with systemic inflammation, which may exacerbate dry eye." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.bmi_distribution} barSize={45}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} formatter={(v: number) => [v.toLocaleString(), "Count"]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.bmi_distribution.map((_: any, i: number) => (
                  <Cell key={i} fill={BMI_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye by BMI */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Dry Eye Rate by BMI</CardTitle>
          <p className="text-xs text-muted-foreground">Prevalence across BMI categories</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Compare dry eye rates across BMI groups. If rates climb with BMI, it suggests a dose-response relationship. Flat rates suggest BMI alone isn't a strong predictor." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.dry_eye_by_bmi} barSize={45}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {data.dry_eye_by_bmi.map((_: any, i: number) => (
                  <Cell key={i} fill={BMI_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Blood Pressure */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Blood Pressure Categories</CardTitle>
          <p className="text-xs text-muted-foreground">Based on AHA guidelines (Systolic/Diastolic)</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="BP is classified per AHA: Normal (<120/80), Elevated (120-129/<80), Stage 1 (130-139/80-89), Stage 2 (≥140/≥90). Hypertension can affect ocular blood flow." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.bp_distribution} barSize={45}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} formatter={(v: number) => [v.toLocaleString(), "Count"]} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye by BP */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Dry Eye Rate by Blood Pressure</CardTitle>
          <p className="text-xs text-muted-foreground">Prevalence across BP categories</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Follow the trend line — an upward slope from Normal to Stage 2 suggests hypertension correlates with dry eye. A flat line means BP is not a significant predictor." />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.dry_eye_by_bp}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Heart Rate */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Heart Rate Distribution</CardTitle>
          <p className="text-xs text-muted-foreground">Resting heart rate (BPM)</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Normal resting heart rate is 60-100 BPM. Elevated resting HR may indicate stress or poor cardiovascular fitness, both of which can influence tear film stability." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.heart_rate_distribution} barSize={35}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} formatter={(v: number) => [v.toLocaleString(), "Count"]} />
              <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye by Heart Rate */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Dry Eye Rate by Heart Rate</CardTitle>
          <p className="text-xs text-muted-foreground">Grouped by BPM ranges</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Look for a trend: rising dry eye rates at higher BPM suggest a physiological link between cardiovascular health and ocular surface health." />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.dry_eye_by_heart_rate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Line type="monotone" dataKey="rate" stroke="#ec4899" strokeWidth={2.5} dot={{ fill: "#ec4899", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Steps */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Daily Steps & Dry Eye Rate</CardTitle>
          <p className="text-xs text-muted-foreground">Step count categories</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Higher step counts indicate more active lifestyles. Physical activity reduces inflammation — a downward trend would support the hypothesis that exercise is protective against dry eye." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.dry_eye_by_steps} barSize={45}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Bar dataKey="rate" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Physical Activity */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Physical Activity & Dry Eye Rate</CardTitle>
          <p className="text-xs text-muted-foreground">Minutes per day</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="WHO recommends 150+ min of moderate activity per week. More active patients may have lower dry eye risk due to improved circulation and reduced systemic inflammation." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.dry_eye_by_physical_activity} barSize={35}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Bar dataKey="rate" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Symptom Co-occurrence */}
      <Card className="shadow-sm border-border/50 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Eye Symptom Co-occurrence & Dry Eye Rate</CardTitle>
          <p className="text-xs text-muted-foreground">Number of concurrent eye symptoms (strain + redness + itchiness) vs Dry Eye prevalence</p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Patients reporting multiple symptoms simultaneously tend to have higher dry eye rates. A steep rise from 0→3 symptoms would suggest strong symptom clustering in dry eye patients." />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.symptom_cooccurrence} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="symptoms" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis yAxisId="left" tick={AX} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={AX} axisLine={false} tickLine={false} domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT} wrapperStyle={TT_W} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar yAxisId="left" dataKey="count" name="Patient Count" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="dry_eye_rate" name="Dry Eye Rate %" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: "#ef4444", r: 5 }} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
