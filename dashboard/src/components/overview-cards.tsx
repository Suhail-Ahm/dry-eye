"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, subtitle, gradient, icon, trend }: StatCardProps) {
  return (
    <Card className={`${gradient} border-0 shadow-sm interactive-card group overflow-hidden relative`}>
      {/* Subtle ambient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/40 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight animate-counter">{value}</p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground/70">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="rounded-xl p-2.5 bg-white/70 backdrop-blur-sm shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
              {icon}
            </div>
            {trend && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                {trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OverviewCardsProps {
  data: {
    total_rows: number;
    total_columns: number;
    positive_rate: number;
    avg_age: number;
    avg_screen_time: number;
    avg_sleep_duration: number;
  };
}

export function OverviewCards({ data }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        title="Total Records"
        value={data.total_rows.toLocaleString()}
        subtitle="Patient entries"
        gradient="stat-gradient-blue"
        icon={
          <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      />
      <StatCard
        title="Features"
        value={data.total_columns}
        subtitle="Input variables"
        gradient="stat-gradient-teal"
        icon={
          <svg className="h-5 w-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
          </svg>
        }
      />
      <StatCard
        title="Positive Rate"
        value={`${data.positive_rate}%`}
        subtitle="Has Dry Eye"
        gradient="stat-gradient-rose"
        icon={
          <svg className="h-5 w-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
          </svg>
        }
      />
      <StatCard
        title="Avg Age"
        value={data.avg_age}
        subtitle="Years"
        gradient="stat-gradient-violet"
        icon={
          <svg className="h-5 w-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        }
      />
      <StatCard
        title="Avg Screen Time"
        value={`${data.avg_screen_time}h`}
        subtitle="Hours/day"
        gradient="stat-gradient-amber"
        icon={
          <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="3" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" />
          </svg>
        }
      />
      <StatCard
        title="Avg Sleep"
        value={`${data.avg_sleep_duration}h`}
        subtitle="Hours/night"
        gradient="stat-gradient-emerald"
        icon={
          <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        }
      />
    </div>
  );
}
