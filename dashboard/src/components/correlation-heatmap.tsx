"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface CorrelationHeatmapProps {
  data: {
    labels: string[];
    values: number[][];
  };
}

function shortenLabel(label: string): string {
  const map: Record<string, string> = {
    "Sleep duration": "Sleep Dur.",
    "Sleep quality": "Sleep Qual.",
    "Stress level": "Stress",
    "Heart rate": "Heart Rate",
    "Daily steps": "Steps",
    "Physical activity": "Phys. Act.",
    "Average screen time": "Screen Time",
    "BP_Systolic": "BP Sys.",
    "BP_Diastolic": "BP Dia.",
    "Sleep disorder": "Sleep Dis.",
    "Wake up during night": "Wake Night",
    "Feel sleepy during day": "Sleepy Day",
    "Caffeine consumption": "Caffeine",
    "Alcohol consumption": "Alcohol",
    "Medical issue": "Medical",
    "Ongoing medication": "Medication",
    "Smart device before bed": "Device Bed",
    "Blue-light filter": "Blue Light",
    "Discomfort Eye-strain": "Eye Strain",
    "Redness in eye": "Redness",
    "Itchiness/Irritation in eye": "Itchiness",
    "Dry Eye Disease": "Dry Eye",
  };
  return map[label] || label;
}

function getColor(value: number): string {
  const abs = Math.abs(value);
  if (value > 0) {
    // Blue scale for positive
    if (abs > 0.7) return "#1d4ed8";
    if (abs > 0.5) return "#2563eb";
    if (abs > 0.3) return "#3b82f6";
    if (abs > 0.15) return "#60a5fa";
    if (abs > 0.05) return "#93c5fd";
    return "#dbeafe";
  } else {
    // Red scale for negative
    if (abs > 0.7) return "#b91c1c";
    if (abs > 0.5) return "#dc2626";
    if (abs > 0.3) return "#ef4444";
    if (abs > 0.15) return "#f87171";
    if (abs > 0.05) return "#fca5a5";
    return "#fee2e2";
  }
}

export function CorrelationHeatmap({ data }: CorrelationHeatmapProps) {
  // Select a subset of most interesting features for readability
  const selectedLabels = useMemo(() => [
    "Age", "Sleep duration", "Sleep quality", "Stress level",
    "Heart rate", "Average screen time",
    "Sleep disorder", "Caffeine consumption", "Smoking",
    "Smart device before bed", "Blue-light filter",
    "Discomfort Eye-strain", "Redness in eye",
    "Itchiness/Irritation in eye", "Dry Eye Disease",
  ], []);

  const indices = useMemo(
    () => selectedLabels.map((l) => data.labels.indexOf(l)).filter((i) => i !== -1),
    [data.labels, selectedLabels]
  );

  const filteredLabels = indices.map((i) => shortenLabel(data.labels[i]));
  const filteredValues = indices.map((i) =>
    indices.map((j) => data.values[i][j])
  );

  const cellSize = 38;
  const labelWidth = 80;
  const totalWidth = labelWidth + filteredLabels.length * cellSize + 10;
  const totalHeight = 30 + filteredLabels.length * cellSize + 10;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Feature Correlation Heatmap
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Pearson correlation between selected features (blue = positive, red = negative)
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <svg width={totalWidth} height={totalHeight} className="mx-auto">
          {/* Column labels */}
          {filteredLabels.map((label, j) => (
            <text
              key={`col-${j}`}
              x={labelWidth + j * cellSize + cellSize / 2}
              y={20}
              textAnchor="end"
              fontSize={8}
              fill="#64748b"
              transform={`rotate(-45, ${labelWidth + j * cellSize + cellSize / 2}, 20)`}
            >
              {label}
            </text>
          ))}
          {/* Rows */}
          {filteredLabels.map((rowLabel, i) => (
            <g key={`row-${i}`}>
              {/* Row label */}
              <text
                x={labelWidth - 4}
                y={30 + i * cellSize + cellSize / 2 + 3}
                textAnchor="end"
                fontSize={8}
                fill="#64748b"
              >
                {rowLabel}
              </text>
              {/* Cells */}
              {filteredValues[i].map((val, j) => (
                <g key={`cell-${i}-${j}`}>
                  <rect
                    x={labelWidth + j * cellSize}
                    y={30 + i * cellSize}
                    width={cellSize - 2}
                    height={cellSize - 2}
                    rx={4}
                    fill={getColor(val)}
                    className="transition-opacity hover:opacity-80"
                  >
                    <title>{`${filteredLabels[i]} × ${filteredLabels[j]}: ${val.toFixed(3)}`}</title>
                  </rect>
                  {cellSize >= 30 && (
                    <text
                      x={labelWidth + j * cellSize + (cellSize - 2) / 2}
                      y={30 + i * cellSize + (cellSize - 2) / 2 + 3}
                      textAnchor="middle"
                      fontSize={7}
                      fill={Math.abs(val) > 0.3 ? "#fff" : "#475569"}
                      fontWeight={Math.abs(val) > 0.3 ? 600 : 400}
                    >
                      {val.toFixed(2)}
                    </text>
                  )}
                </g>
              ))}
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#b91c1c" }} />
            <span>Strong negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#fee2e2" }} />
            <span>Weak negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#dbeafe" }} />
            <span>Weak positive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#1d4ed8" }} />
            <span>Strong positive</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
