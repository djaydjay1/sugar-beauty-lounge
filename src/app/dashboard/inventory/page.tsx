"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Package, AlertCircle, Plus, Search, ArrowDown, ArrowUp } from "lucide-react";

type Item = {
  id: string; name: string; category: string; brand: string | null;
  unit: string; current_stock: number; reorder_level: number;
  cost_per_unit: number; supplier: string | null;
  locations: { name: string } | null;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low">("all");

  const load = useCallback(async () => {
    const { data } = await supabase.from("inventory_items").select("*, locations(name)").order("name");
    setItems((data as unknown as Item[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function adjustStock(id: string, type: "in" | "out", qty: number) {
    await supabase.from("inventory_transactions").insert({ item_id: id, type, quantity: qty, notes: "Manual adjustment" });
    load();
  }

  const lowStock = items.filter(i => i.current_stock <= i.reorder_level);
  const filtered = items
    .filter(i => filter === "all" || i.current_stock <= i.reorder_level)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Inventory</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {items.length} items · {lowStock.length} low stock
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: "var(--color-plum)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: "#fee2e2" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "#991b1b" }}>Low Stock Alert</p>
            <p className="text-xs mt-0.5" style={{ color: "#991b1b" }}>
              {lowStock.map(i => i.name).join(", ")} — below reorder level
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
            className="pl-9 pr-4 py-2 rounded-xl border text-sm"
            style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--color-surface)" }}>
          {(["all","low"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
              style={{
                background: filter === f ? "var(--color-card)" : "transparent",
                color: filter === f ? "var(--color-plum)" : "var(--color-text-muted)",
                boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>
              {f === "low" ? "⚠️ Low Stock" : "All Items"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--color-surface)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No items found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Item</th>
                <th className="px-4 py-3 font-medium text-xs hidden md:table-cell" style={{ color: "var(--color-text-muted)" }}>Category</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Stock</th>
                <th className="px-4 py-3 font-medium text-xs hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>Reorder At</th>
                <th className="px-4 py-3 font-medium text-xs hidden lg:table-cell" style={{ color: "var(--color-text-muted)" }}>Cost/Unit</th>
                <th className="px-4 py-3 font-medium text-xs" style={{ color: "var(--color-text-muted)" }}>Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.current_stock <= item.reorder_level;
                return (
                  <tr key={item.id} className="border-b hover:bg-[--color-surface] transition-colors" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.name}</p>
                      {item.brand && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.brand}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: "var(--color-surface)", color: "var(--color-text-muted)" }}>{item.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: isLow ? "#dc2626" : "#059669" }}>
                        {item.current_stock} {item.unit}
                      </span>
                      {isLow && <span className="ml-2 text-xs" style={{ color: "#dc2626" }}>LOW</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm" style={{ color: "var(--color-text-muted)" }}>{item.reorder_level} {item.unit}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm" style={{ color: "var(--color-text-muted)" }}>{formatCurrency(item.cost_per_unit)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => adjustStock(item.id, "in", 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                          style={{ background: "#d1fae5" }} title="Add 1">
                          <ArrowDown className="w-3.5 h-3.5" style={{ color: "#065f46" }} />
                        </button>
                        <button onClick={() => adjustStock(item.id, "out", 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                          style={{ background: "#fee2e2" }} title="Use 1">
                          <ArrowUp className="w-3.5 h-3.5" style={{ color: "#991b1b" }} />
                        </button>
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
