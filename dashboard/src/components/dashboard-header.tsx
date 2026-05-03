"use client";

import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1440px] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 shadow-md shadow-blue-500/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Dry Eye Disease
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">
              Exploratory Data Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-600 border-blue-200/60 font-medium text-xs px-2.5 py-0.5"
          >
            20,000 Records
          </Badge>
          <Badge
            variant="secondary"
            className="bg-teal-50 text-teal-600 border-teal-200/60 font-medium text-xs px-2.5 py-0.5"
          >
            26 Features
          </Badge>
          <Badge
            variant="secondary"
            className="bg-violet-50 text-violet-600 border-violet-200/60 font-medium text-xs px-2.5 py-0.5"
          >
            Binary Classification
          </Badge>
        </div>
      </div>
    </header>
  );
}
