"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { Briefcase, Plus, Check, X, Clock } from "lucide-react";

type LeaveRequest = {
  id: string; type: string; start_date: string; end_date: string;
  days: number; reason: string | null; status: string; created_at: string;
  staff: { name: string; role: string } | null;
};
type Shift = {
  id: string; date: string; start_time: string; end_time: string;
  staff: { name: string } | null;
  locations: { name: string } | null;
};

const LEAVE_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: "#fef3c7", text: "#92400e" },
  approved: { bg: "#d1fae5", text: "#065f46" },
  rejected: { bg: "#fee2e2", text: "#991b1b" },
};

export default function HRPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"leave" | "shifts">("leave");

  async function load() {
    const today = new Date().toISOString().split("T")[0];
    const [leaveRes, shiftRes] = await Promise.all([
      supabase.from("leave_requests").select("*, staff(name, role)").order("created_at", { ascending: false }),
      supabase.from("shifts").select("*, staff(name), locations(name)").gte("date", today).order("date").order("start_time").limit(50),
    ]);
    setLeaves((leaveRes.data as unknown as LeaveRequest[]) || []);
    setShifts((shiftRes.data as unknown as Shift[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateLeave(id: string, status: string) {
    await supabase.from("leave_requests").update({ status: status as import("@/types/database").LeaveStatus }).eq("id", id);
    load();
  }

  const pending = leaves.filter(l => l.status === "pending");

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">HR</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {pending.length} pending leave request{pending.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: "var(--color-plum)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> Add Shift
        </button>
      </div>

      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ background: "var(--color-surface)" }}>
        {(["leave","shifts"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
            style={{
              background: tab === t ? "var(--color-card)" : "transparent",
              color: tab === t ? "var(--color-plum)" : "var(--color-text-muted)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t === "leave" ? `Leave Requests${pending.length > 0 ? ` (${pending.length})` : ""}` : "Upcoming Shifts"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--color-surface)" }} />)}
          </div>
        ) : tab === "leave" ? (
          leaves.length === 0 ? (
            <div className="p-16 text-center">
              <Briefcase className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No leave requests</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {leaves.map(req => {
                const sc = LEAVE_COLORS[req.status] || LEAVE_COLORS.pending;
                return (
                  <div key={req.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "var(--color-blush-light)", color: "var(--color-plum)" }}>
                      {getInitials(req.staff?.name || "?")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{req.staff?.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ background: "var(--color-surface)", color: "var(--color-text-muted)" }}>
                          {req.type.replace("_"," ")}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {formatDate(req.start_date)} → {formatDate(req.end_date)} · {req.days} day{req.days !== 1 ? "s" : ""}
                      </p>
                      {req.reason && <p className="text-xs mt-0.5 italic" style={{ color: "var(--color-text-muted)" }}>{req.reason}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                        style={{ background: sc.bg, color: sc.text }}>{req.status}</span>
                      {req.status === "pending" && (
                        <div className="flex gap-1">
                          <button onClick={() => updateLeave(req.id, "approved")}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style={{ background: "#d1fae5" }}>
                            <Check className="w-3.5 h-3.5" style={{ color: "#065f46" }} />
                          </button>
                          <button onClick={() => updateLeave(req.id, "rejected")}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                            style={{ background: "#fee2e2" }}>
                            <X className="w-3.5 h-3.5" style={{ color: "#991b1b" }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          shifts.length === 0 ? (
            <div className="p-16 text-center">
              <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No upcoming shifts</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                  <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Staff</th>
                  <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Date</th>
                  <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Hours</th>
                  <th className="px-4 py-3 font-medium text-xs hidden md:table-cell" style={{ color: "var(--color-text-muted)" }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map(shift => (
                  <tr key={shift.id} className="border-b hover:bg-[--color-surface] transition-colors" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-4 py-3 font-medium">{shift.staff?.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--color-text-muted)" }}>{formatDate(shift.date)}</td>
                    <td className="px-4 py-3 font-medium">{shift.start_time.slice(0,5)} – {shift.end_time.slice(0,5)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm" style={{ color: "var(--color-text-muted)" }}>{shift.locations?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
