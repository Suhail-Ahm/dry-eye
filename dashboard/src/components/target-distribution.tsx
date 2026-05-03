"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearnHint } from "@/components/learn-tooltip";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#cbd5e1"];
const TT_STYLE = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.08)",
  fontSize: "12px",
  padding: "10px 14px",
};
const TT_WRAPPER = { zIndex: 100 };

interface TargetDistributionProps {
  data: { name: string; value: number; fill: string }[];
}

export function TargetDistribution({ data }: TargetDistributionProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Donut Chart */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Target Variable Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Dry Eye Disease — Yes vs No
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="The target variable is what the model predicts. A 65:35 split means 65% of patients have dry eye — this moderate imbalance affects model evaluation (use F1 over accuracy)." />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                  "Count",
                ]}
                contentStyle={TT_STYLE}
                wrapperStyle={TT_WRAPPER}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Class Balance
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Count comparison — 65:35 ratio
          </p>
        </CardHeader>
        <CardContent>
          <LearnHint text="Class imbalance can cause models to favor the majority class. With a 65:35 ratio, stratified splitting and F1 Score become important to ensure fair evaluation." />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), "Count"]}
                contentStyle={TT_STYLE}
                wrapperStyle={TT_WRAPPER}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
