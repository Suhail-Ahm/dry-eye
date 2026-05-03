"use client";

import { useState, useEffect } from "react";

/* ── Navigation sections ─────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: "Exploration",
    items: [
      { id: "target", icon: "🎯", name: "Target", badge: "65:35" },
      { id: "columns", icon: "🔍", name: "Column Explorer", badge: "28" },
      { id: "demographics", icon: "👥", name: "Demographics" },
      { id: "sleep", icon: "😴", name: "Sleep & Stress" },
      { id: "lifestyle", icon: "🏃", name: "Lifestyle" },
      { id: "health", icon: "🩺", name: "Health Metrics" },
      { id: "eyes", icon: "👁️", name: "Screen & Eyes" },
    ],
  },
  {
    label: "Statistics",
    items: [
      { id: "overview", icon: "📋", name: "Data Summary" },
      { id: "correlations", icon: "📊", name: "Correlations" },
      { id: "importance", icon: "⭐", name: "Feature Importance" },
    ],
  },
  {
    label: "Modeling",
    items: [
      { id: "ml", icon: "🤖", name: "ML Models", badge: "6" },
    ],
  },
];

interface SidebarNavProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on navigation
  const handleNav = (id: string) => {
    onSectionChange(id);
    setMobileOpen(false);
  };

  // Close drawer on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = () => { if (mq.matches) setMobileOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile Hamburger Button (visible < md) ──────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-border/40 shadow-sm text-foreground active:scale-95 transition-transform"
        aria-label="Open navigation"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Mobile Overlay Backdrop ──────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-white/95 backdrop-blur-xl border-r border-border/30
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          
          /* Mobile: off-screen drawer, slides in when open */
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-[260px]
          
          /* Desktop: always visible, collapsible */
          md:translate-x-0
          ${collapsed ? "md:w-[60px]" : "md:w-[220px]"}
        `}
      >
        {/* ── Logo ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border/20">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-teal-400/20 blur-md" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 shadow-lg shadow-blue-500/25">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-foreground leading-tight truncate">
                Dry Eye
              </p>
              <p className="text-[9px] text-muted-foreground/50 font-semibold uppercase tracking-[0.12em]">
                EDA Dashboard
              </p>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Navigation Groups ───────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 scrollbar-none">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {/* Group label */}
              {(!collapsed || mobileOpen) && (
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40 px-2 mb-1.5">
                  {group.label}
                </p>
              )}
              {(collapsed && !mobileOpen) && (
                <div className="w-6 h-px bg-border/30 mx-auto mb-2" />
              )}

              {/* Nav items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const showLabel = !collapsed || mobileOpen;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`
                        w-full flex items-center gap-2.5 rounded-lg text-left
                        transition-all duration-200 ease-out group relative
                        ${showLabel ? "px-2.5 py-2.5" : "justify-center px-0 py-2"}
                        ${isActive
                          ? "bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-500/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }
                      `}
                      title={!showLabel ? item.name : undefined}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-blue-500" />
                      )}

                      <span className="text-sm shrink-0">
                        {item.icon}
                      </span>

                      {showLabel && (
                        <>
                          <span className={`text-[13px] truncate flex-1 ${isActive ? "font-semibold" : "font-medium"}`}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0
                              ${isActive
                                ? "bg-blue-100 text-blue-600"
                                : "bg-muted text-muted-foreground"
                              }`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Collapse Toggle (desktop only) ──────────────────── */}
        <div className="border-t border-border/20 p-2.5 hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent/40 transition-all duration-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {!collapsed && (
              <span className="text-[10px] font-medium">Collapse</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
