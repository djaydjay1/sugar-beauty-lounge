"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, UserCheck, Package,
  DollarSign, Briefcase, Megaphone, LogOut, Sparkles, Menu, X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/staff", label: "Staff", icon: UserCheck },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/finance", label: "Finance", icon: DollarSign },
  { href: "/dashboard/hr", label: "HR", icon: Briefcase },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 flex flex-col border-r transition-transform md:relative md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <div className="p-5 border-b flex items-center gap-2.5" style={{ borderColor: "var(--color-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-plum)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm leading-tight" style={{ color: "var(--color-plum)" }}>Sugar Beauty</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Owner Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? "var(--color-blush-light)" : "transparent",
                  color: active ? "var(--color-plum)" : "var(--color-text-muted)",
                }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "var(--color-border)" }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[--color-surface]"
            style={{ color: "var(--color-text-muted)" }}>
            <LogOut className="w-4 h-4" />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}>
          <button onClick={() => setOpen(true)} style={{ color: "var(--color-text-muted)" }}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-semibold" style={{ color: "var(--color-plum)" }}>Dashboard</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
