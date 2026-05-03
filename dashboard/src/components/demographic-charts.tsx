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
const AXIS_TICK = { fontSize: 11, fill: "#64748b" };

interface DemographicChartsProps {
  ageDistribution: { range: string; count: number }[];
  genderDistribution: { name: string; count: number }[];
  dryEyeByGender: {
    name: string;
    rate: number;
    positive: number;
    negative: number;
  }[];
  dryEyeByAgeGroup: {
    name: string;
    rate: number;
    positive: number;
    total: number;
  }[];
}

export function DemographicCharts({
  ageDistribution,
  genderDistribution,
  dryEyeByGender,
  dryEyeByAgeGroup,
}: DemographicChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
      {/* Age Distribution */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Age Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Histogram of participant ages
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="A uniform age distribution means all age groups are equally represented — no age bias in the dataset. Skewed distributions may bias findings toward a specific age group." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ageDistribution} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [v.toLocaleString(), "Count"]} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gender Distribution */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Gender Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Male vs Female split
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="A balanced gender split ensures findings aren't biased toward one sex. Dry eye is clinically more common in women — check the rate chart below to verify this dataset matches real-world patterns." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={genderDistribution} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [v.toLocaleString(), "Count"]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <Cell fill="#8b5cf6" />
                <Cell fill="#3b82f6" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye by Gender */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Dry Eye Rate by Gender
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Percentage of positive cases
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="If dry eye rates differ significantly between genders, gender may be a useful predictor. Similar rates mean this feature has low discriminatory power for this dataset." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dryEyeByGender} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="positive" name="Positive" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="negative" name="Negative" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dry Eye by Age Group */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Dry Eye Rate by Age Group
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Prevalence across age brackets
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="In clinical literature, dry eye prevalence increases with age due to decreased tear production. Look for an upward trend — a flat line would suggest this synthetic dataset lacks that relationship." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dryEyeByAgeGroup} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TT_STYLE} wrapperStyle={TT_WRAPPER} formatter={(v: number) => [`${v}%`, "Dry Eye Rate"]} />
              <Bar dataKey="rate" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
