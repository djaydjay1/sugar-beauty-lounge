"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate, formatTime } from "@/lib/utils";
import { Calendar, Plus, Search, Filter, Check, X, Phone } from "lucide-react";

type Appt = {
  id: string; date: string; start_time: string; end_time: string; status: string; source: string; notes: string | null;
  clients: { name: string; phone: string | null } | null;
  services: { name: string; price: number } | null;
  staff: { name: string } | null;
  locations: { name: string } | null;
};

const STATUS_OPTS = ["all","pending","confirmed","in_progress","completed","cancelled","no_show"];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "#fef3c7", text: "#92400e" },
  confirmed:  { bg: "#d1fae5", text: "#065f46" },
  completed:  { bg: "#e0e7ff", text: "#3730a3" },
  cancelled:  { bg: "#fee2e2", text: "#991b1b" },
  no_show:    { bg: "#f3f4f6", text: "#374151" },
  in_progress:{ bg: "#cffafe", text: "#0e7490" },
};

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("appointments")
      .select("*, clients(name, phone), services(name, price), staff(name), locations(name)")
      .order("start_time");
    if (date) q = q.eq("date", date);
    if (status !== "all") q = q.eq("status", status);
    const { data } = await q;
    setAppts((data as unknown as Appt[]) || []);
    setLoading(false);
  }, [date, status]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    await supabase.from("appointments").update({ status: newStatus as import("@/types/database").AppointmentStatus }).eq("id", id);
    load();
  }

  const filtered = appts.filter(a =>
    !search || a.clients?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold">Appointments</h1>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: "var(--color-plum)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client..."
            className="pl-9 pr-4 py-2 rounded-xl border text-sm"
            style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="px-3 py-2 rounded-xl border text-sm"
          style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--color-surface)" }}>
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
              style={{
                background: status === s ? "var(--color-card)" : "transparent",
                color: status === s ? "var(--color-plum)" : "var(--color-text-muted)",
                boxShadow: status === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--color-surface)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No appointments found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Time</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Client</th>
                <th className="px-4 py-3 font-medium text-xs hidden md:table-cell" style={{ color: "var(--color-text-muted)" }}>Service</th>
                <th className="px-4 py-3 font-medium text-xs hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>Staff</th>
                <th className="px-4 py-3 font-medium text-xs hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>Location</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Status</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(appt => {
                const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.pending;
                return (
                  <tr key={appt.id} className="border-b hover:bg-[--color-surface] transition-colors" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-4 py-3 font-medium">{appt.start_time?.slice(0, 5)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{appt.clients?.name}</p>
                      {appt.clients?.phone && (
                        <a href={`tel:${appt.clients.phone}`} className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          <Phone className="w-3 h-3" />{appt.clients.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p>{appt.services?.name}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>AED {appt.services?.price}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>{appt.staff?.name}</td>
                    <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>{appt.locations?.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                        style={{ background: sc.bg, color: sc.text }}>
                        {appt.status.replace("_"," ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {appt.status === "pending" && (
                          <button onClick={() => updateStatus(appt.id, "confirmed")}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style={{ background: "#d1fae5" }} title="Confirm">
                            <Check className="w-3.5 h-3.5" style={{ color: "#065f46" }} />
                          </button>
                        )}
                        {(appt.status === "pending" || appt.status === "confirmed") && (
                          <button onClick={() => updateStatus(appt.id, "cancelled")}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style={{ background: "#fee2e2" }} title="Cancel">
                            <X className="w-3.5 h-3.5" style={{ color: "#991b1b" }} />
                          </button>
                        )}
                        {appt.status === "confirmed" && (
                          <button onClick={() => updateStatus(appt.id, "completed")}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 text-xs font-medium"
                            style={{ background: "#e0e7ff", color: "#3730a3" }} title="Complete">
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
