"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TT = { borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)", fontSize: "12px" };
const AX = { fontSize: 10, fill: "#64748b" };

interface DataOverviewProps {
  summaryTable: any[];
  distributionComparison: any[];
  boxPlots: any[];
}

export function DataOverview({ summaryTable, distributionComparison, boxPlots }: DataOverviewProps) {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const current = distributionComparison[selectedFeature];

  // Box plot data for selected feature
  const currentBoxData = boxPlots.filter((b: any) => b.feature === current.feature);

  return (
    <div className="space-y-6">
      {/* Summary Statistics Table */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Summary Statistics — All Numeric Features
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Equivalent to pandas df.describe() — count, mean, std, quartiles
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-[10px]">
                <TableHead className="font-semibold text-xs">Feature</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Mean</TableHead>
                <TableHead className="text-right">Std</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Q25</TableHead>
                <TableHead className="text-right">Median</TableHead>
                <TableHead className="text-right">Q75</TableHead>
                <TableHead className="text-right">Max</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryTable.map((row: any) => (
                <TableRow key={row.feature} className="text-xs">
                  <TableCell className="font-medium text-xs py-2">{row.feature}</TableCell>
                  <TableCell className="text-right tabular-nums py-2">{row.count.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums py-2">{row.mean}</TableCell>
                  <TableCell className="text-right tabular-nums py-2">{row.std}</TableCell>
                  <TableCell className="text-right tabular-nums py-2">{row.min}</TableCell>
                  <TableCell className="text-right tabular-nums py-2">{row.q25}</TableCell>
                  <TableCell className="text-right tabular-nums py-2 font-semibold">{row.median}</TableCell>
                  <TableCell className="text-right tabular-nums py-2">{row.q75}</TableCell>
                  <TableCell className="text-right tabular-nums py-2">{row.max}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Distribution Comparison: Dry Eye vs No Dry Eye */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm font-semibold">
                Distribution Comparison — Dry Eye vs No Dry Eye
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overlaid histograms showing how each feature distributes across classes
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {distributionComparison.map((d: any, i: number) => (
                <Badge
                  key={d.feature}
                  variant={selectedFeature === i ? "default" : "secondary"}
                  className={`cursor-pointer text-[10px] px-2 py-0.5 transition-all ${
                    selectedFeature === i
                      ? "bg-blue-600 text-white shadow-sm"
                      : "hover:bg-blue-50 hover:text-blue-700"
                  }`}
                  onClick={() => setSelectedFeature(i)}
                >
                  {d.feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={current.data} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={AX} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} formatter={(v: number) => [v.toLocaleString(), ""]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Dry Eye" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.8} />
              <Bar dataKey="No Dry Eye" fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Box Plot Comparison */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Box Plot Summary — {current.feature}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Quartile comparison between Dry Eye and No Dry Eye groups
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBoxData.map((box: any) => (
              <div
                key={box.group}
                className={`rounded-xl p-4 border ${
                  box.group === "Dry Eye"
                    ? "bg-blue-50/50 border-blue-200/60"
                    : "bg-amber-50/50 border-amber-200/60"
                }`}
              >
                <p className="text-xs font-semibold mb-3">{box.group}</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { l: "Min", v: box.min },
                    { l: "Q1", v: box.q1 },
                    { l: "Median", v: box.median },
                    { l: "Q3", v: box.q3 },
                    { l: "Max", v: box.max },
                    { l: "Mean", v: box.mean },
                    { l: "IQR", v: (box.q3 - box.q1).toFixed(2) },
                    { l: "Range", v: (box.max - box.min).toFixed(2) },
                  ].map((s) => (
                    <div key={s.l} className="space-y-0.5">
                      <p className="text-[9px] text-muted-foreground font-medium">{s.l}</p>
                      <p className="text-sm font-bold tabular-nums">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
