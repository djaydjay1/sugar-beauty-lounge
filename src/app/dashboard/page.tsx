"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Calendar, Users, DollarSign, Star, TrendingUp, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  todayAppointments: number;
  pendingConfirmations: number;
  monthRevenue: number;
  totalClients: number;
  avgRating: number;
  lowStock: number;
}

interface TodayAppt {
  id: string;
  start_time: string;
  status: string;
  clients: { name: string } | null;
  services: { name: string } | null;
  staff: { name: string } | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "var(--color-gold-light)", text: "var(--color-gold-dark)" },
  confirmed:  { bg: "#d1fae5", text: "#065f46" },
  completed:  { bg: "#e0e7ff", text: "#3730a3" },
  cancelled:  { bg: "#fee2e2", text: "#991b1b" },
  no_show:    { bg: "#fef3c7", text: "#92400e" },
  in_progress:{ bg: "#cffafe", text: "#0e7490" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayAppts, setTodayAppts] = useState<TodayAppt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split("T")[0];
      const monthStart = today.slice(0, 7) + "-01";

      const [apptRes, clientRes, revenueRes, ratingRes, stockRes] = await Promise.all([
        supabase.from("appointments").select("id, start_time, status, clients(name), services(name), staff(name)").eq("date", today).order("start_time"),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("total").eq("status", "paid").gte("created_at", monthStart),
        supabase.from("reviews").select("rating"),
        supabase.from("inventory_items").select("id", { count: "exact", head: true }).lt("current_stock", 5),
      ]);

      const appts = (apptRes.data as unknown as TodayAppt[]) || [];
      setTodayAppts(appts);

      const monthRevenue = (revenueRes.data || []).reduce((s, i) => s + Number(i.total), 0);
      const ratings = revenueRes.data ? (ratingRes.data || []).map(r => r.rating) : [];
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      setStats({
        todayAppointments: appts.length,
        pendingConfirmations: appts.filter(a => a.status === "pending").length,
        monthRevenue,
        totalClients: clientRes.count || 0,
        avgRating: Math.round(avgRating * 10) / 10,
        lowStock: stockRes.count || 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const KPI_CARDS = stats ? [
    { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: "var(--color-plum)" },
    { label: "Pending Confirmations", value: stats.pendingConfirmations, icon: Clock, color: "var(--color-gold-dark)" },
    { label: "Month Revenue", value: formatCurrency(stats.monthRevenue), icon: DollarSign, color: "#059669" },
    { label: "Total Clients", value: stats.totalClients.toLocaleString(), icon: Users, color: "var(--color-blush-dark)" },
    { label: "Avg Rating", value: stats.avgRating > 0 ? `${stats.avgRating} ⭐` : "–", icon: Star, color: "var(--color-gold)" },
    { label: "Low Stock Items", value: stats.lowStock, icon: AlertCircle, color: stats.lowStock > 0 ? "#ef4444" : "#6b7280" },
  ] : [];

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--color-text)" }}>Good morning ✨</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {formatDate(new Date(), "EEEE, dd MMMM yyyy")}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
            ))
          : KPI_CARDS.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl border"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{card.label}</p>
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <p className="font-display text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
                  {card.value}
                </p>
              </motion.div>
            ))}
      </div>

      {/* Today's Appointments */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: "var(--color-plum)" }} />
            Today&apos;s Schedule
          </h2>
          <a href="/dashboard/appointments" className="text-xs font-medium" style={{ color: "var(--color-plum)" }}>
            View all →
          </a>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--color-surface)" }} />
            ))}
          </div>
        ) : todayAppts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No appointments today</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {todayAppts.map(appt => {
              const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.pending;
              return (
                <div key={appt.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[--color-surface] transition-colors">
                  <div className="w-14 text-center">
                    <p className="text-sm font-semibold">{appt.start_time?.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{appt.clients?.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                      {appt.services?.name} · {appt.staff?.name}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: sc.bg, color: sc.text }}>
                    {appt.status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
