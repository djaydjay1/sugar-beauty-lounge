"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Search, Users, Star, TrendingUp } from "lucide-react";

type Client = {
  id: string; name: string; phone: string | null; email: string | null; whatsapp: string | null;
  language_preference: string; loyalty_points: number; total_spent: number; visit_count: number;
  last_visit_at: string | null; referral_source: string | null; created_at: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("clients").select("*").order("total_spent", { ascending: false });
      setClients(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = clients.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Clients</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{clients.length.toLocaleString()} total clients</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm"
          style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--color-surface)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No clients found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Client</th>
                <th className="px-4 py-3 font-medium text-xs hidden md:table-cell" style={{ color: "var(--color-text-muted)" }}>Contact</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Visits</th>
                <th className="px-4 py-3 font-medium text-xs hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>Total Spent</th>
                <th className="px-4 py-3 font-medium text-xs hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>Last Visit</th>
                <th className="px-4 py-3 font-medium text-xs hidden xl:table-cell" style={{ color: "var(--color-text-muted)" }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b hover:bg-[--color-surface] transition-colors cursor-pointer" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--color-blush-light)", color: "var(--color-plum)" }}>
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {client.language_preference === "ar" ? "Arabic" : "English"}
                          {client.total_spent >= 5000 && " · VIP 👑"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p style={{ color: "var(--color-text-muted)" }}>{client.phone || client.whatsapp || "–"}</p>
                    {client.email && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{client.email}</p>}
                  </td>
                  <td className="px-4 py-3 font-medium">{client.visit_count}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="font-medium" style={{ color: client.total_spent >= 1000 ? "#059669" : "inherit" }}>
                      {formatCurrency(client.total_spent)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {client.last_visit_at ? formatDate(client.last_visit_at) : "Never"}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5" style={{ color: "var(--color-gold)" }} />
                      {client.loyalty_points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
