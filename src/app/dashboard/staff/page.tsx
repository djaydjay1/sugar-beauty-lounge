"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate, getInitials } from "@/lib/utils";
import { UserCheck, AlertCircle, Plus } from "lucide-react";

type StaffMember = {
  id: string; name: string; role: string; phone: string | null; email: string | null;
  nationality: string | null; hire_date: string; base_salary: number; commission_rate: number;
  is_active: boolean; visa_expiry: string | null; passport_expiry: string | null;
  locations: { name: string } | null;
};

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("staff").select("*, locations(name)").order("name");
      setStaff((data as unknown as StaffMember[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const expiringDocs = staff.filter(s => {
    const v = s.visa_expiry ? daysUntil(s.visa_expiry) : 999;
    const p = s.passport_expiry ? daysUntil(s.passport_expiry) : 999;
    return Math.min(v, p) <= 60;
  });

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Staff</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {staff.filter(s => s.is_active).length} active · {staff.length} total
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: "var(--color-plum)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {expiringDocs.length > 0 && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: "#fef3c7" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "#92400e" }}>Document Expiry Alert</p>
            <p className="text-xs mt-0.5" style={{ color: "#92400e" }}>
              {expiringDocs.map(s => s.name).join(", ")} — visa or passport expiring within 60 days
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? [...Array(8)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />)
          : staff.map(member => {
            const visaDays = member.visa_expiry ? daysUntil(member.visa_expiry) : null;
            const passportDays = member.passport_expiry ? daysUntil(member.passport_expiry) : null;
            const docAlert = (visaDays !== null && visaDays <= 60) || (passportDays !== null && passportDays <= 60);
            return (
              <div key={member.id} className="p-5 rounded-2xl border"
                style={{ background: "var(--color-card)", borderColor: docAlert ? "#fbbf24" : "var(--color-border)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: member.is_active ? "var(--color-blush-light)" : "var(--color-surface)", color: "var(--color-plum)" }}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{member.role}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {member.locations?.name && <p>📍 {member.locations.name}</p>}
                  {member.nationality && <p>🌍 {member.nationality}</p>}
                  <p>📅 Hired {formatDate(member.hire_date, "MMM yyyy")}</p>
                  {member.visa_expiry && (
                    <p style={{ color: visaDays !== null && visaDays <= 60 ? "#dc2626" : "inherit" }}>
                      🪪 Visa: {formatDate(member.visa_expiry)}
                      {visaDays !== null && visaDays <= 60 && ` (${visaDays}d)`}
                    </p>
                  )}
                  {member.passport_expiry && (
                    <p style={{ color: passportDays !== null && passportDays <= 60 ? "#dc2626" : "inherit" }}>
                      📕 Passport: {formatDate(member.passport_expiry)}
                      {passportDays !== null && passportDays <= 60 && ` (${passportDays}d)`}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: member.is_active ? "#d1fae5" : "#fee2e2", color: member.is_active ? "#065f46" : "#991b1b" }}>
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                    AED {member.base_salary.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
