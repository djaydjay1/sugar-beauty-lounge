"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus, Search } from "lucide-react";

type Invoice = {
  id: string; invoice_number: string; total: number; subtotal: number; vat_amount: number;
  status: string; payment_method: string | null; created_at: string; paid_at: string | null;
  clients: { name: string } | null;
};
type Expense = {
  id: string; category: string; description: string; amount: number; date: string; created_at: string;
};

const INV_COLORS: Record<string, { bg: string; text: string }> = {
  paid:      { bg: "#d1fae5", text: "#065f46" },
  sent:      { bg: "#dbeafe", text: "#1e40af" },
  draft:     { bg: "#f3f4f6", text: "#374151" },
  overdue:   { bg: "#fee2e2", text: "#991b1b" },
  cancelled: { bg: "#f3f4f6", text: "#9ca3af" },
};

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"invoices" | "expenses">("invoices");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [invRes, expRes] = await Promise.all([
        supabase.from("invoices").select("*, clients(name)").order("created_at", { ascending: false }).limit(100),
        supabase.from("expenses").select("*").order("date", { ascending: false }).limit(100),
      ]);
      setInvoices((invRes.data as unknown as Invoice[]) || []);
      setExpenses(expRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const paidInvoices = invoices.filter(i => i.status === "paid");
  const overdueInvoices = invoices.filter(i => i.status === "overdue");
  const monthRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
  const monthExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalVAT = paidInvoices.reduce((s, i) => s + i.vat_amount, 0);

  const filteredInvoices = invoices.filter(i => !search || i.clients?.name?.toLowerCase().includes(search.toLowerCase()) || i.invoice_number.includes(search));
  const filteredExpenses = expenses.filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold">Finance</h1>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: "var(--color-plum)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue (Total)", value: formatCurrency(monthRevenue), icon: TrendingUp, color: "#059669" },
          { label: "Expenses", value: formatCurrency(monthExpenses), icon: TrendingDown, color: "#dc2626" },
          { label: "Net Profit", value: formatCurrency(monthRevenue - monthExpenses), icon: DollarSign, color: monthRevenue > monthExpenses ? "#059669" : "#dc2626" },
          { label: "VAT Collected", value: formatCurrency(totalVAT), icon: AlertCircle, color: "var(--color-gold-dark)" },
        ].map((card, i) => (
          <div key={i} className="p-5 rounded-2xl border"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{card.label}</p>
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
            </div>
            <p className="font-display text-xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      {overdueInvoices.length > 0 && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: "#fee2e2" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#dc2626" }} />
          <p className="text-sm" style={{ color: "#991b1b" }}>
            {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""} — total {formatCurrency(overdueInvoices.reduce((s, i) => s + i.total, 0))}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ background: "var(--color-surface)" }}>
        {(["invoices","expenses"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
            style={{
              background: tab === t ? "var(--color-card)" : "transparent",
              color: tab === t ? "var(--color-plum)" : "var(--color-text-muted)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t}
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm"
          style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--color-surface)" }} />)}
          </div>
        ) : tab === "invoices" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Invoice #</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Client</th>
                <th className="px-4 py-3 font-medium text-xs hidden md:table-cell" style={{ color: "var(--color-text-muted)" }}>Date</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Total</th>
                <th className="px-4 py-3 font-medium text-xs hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>VAT (5%)</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => {
                const sc = INV_COLORS[inv.status] || INV_COLORS.draft;
                return (
                  <tr key={inv.id} className="border-b hover:bg-[--color-surface] transition-colors cursor-pointer" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-plum)" }}>{inv.invoice_number}</td>
                    <td className="px-4 py-3">{inv.clients?.name || "–"}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm" style={{ color: "var(--color-text-muted)" }}>{formatDate(inv.created_at)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm" style={{ color: "var(--color-text-muted)" }}>{formatCurrency(inv.vat_amount)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                        style={{ background: sc.bg, color: sc.text }}>{inv.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Date</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Category</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Description</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="border-b hover:bg-[--color-surface] transition-colors" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--color-text-muted)" }}>{formatDate(exp.date)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: "var(--color-surface)", color: "var(--color-text-muted)" }}>{exp.category}</span>
                  </td>
                  <td className="px-4 py-3">{exp.description}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "#dc2626" }}>{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
