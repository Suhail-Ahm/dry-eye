"use client";

import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo with subtle pulse glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-400/20 blur-md" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-lg shadow-blue-500/25">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground leading-tight">
              Dry Eye Disease
            </h1>
            <p className="text-[10px] text-muted-foreground/60 font-medium tracking-wide uppercase">
              Exploratory Data Analysis
            </p>
          </div>
        </div>

        {/* Meta badges – pill style with subtle borders */}
        <div className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className="bg-blue-50/80 text-blue-600 border-blue-100 font-medium text-[10px] px-2.5 py-1 backdrop-blur-sm"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 pulse-glow" />
            20K Records
          </Badge>
          <Badge
            variant="secondary"
            className="bg-teal-50/80 text-teal-600 border-teal-100 font-medium text-[10px] px-2.5 py-1"
          >
            26 Features
          </Badge>
          <Badge
            variant="secondary"
            className="bg-violet-50/80 text-violet-600 border-violet-100 font-medium text-[10px] px-2.5 py-1"
          >
            Binary Target
          </Badge>
        </div>
      </div>
    </header>
  );
}
