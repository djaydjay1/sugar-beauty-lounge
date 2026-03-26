"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Megaphone, Star, Instagram, Plus, TrendingUp } from "lucide-react";

type Review = {
  id: string; rating: number; comment: string | null; reply: string | null;
  platform: string; created_at: string;
  clients: { name: string } | null;
};
type SocialPost = {
  id: string; platform: string; caption: string; status: string;
  scheduled_at: string | null; published_at: string | null; created_at: string;
};
type Promotion = {
  id: string; name: string; discount_type: string; discount_value: number;
  code: string | null; valid_from: string; valid_until: string;
  usage_count: number; max_uses: number | null; is_active: boolean;
};

const PLATFORM_ICONS: Record<string, string> = { google: "🔍", internal: "⭐", instagram: "📸" };

export default function MarketingPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"reviews" | "social" | "promos">("reviews");

  useEffect(() => {
    async function load() {
      const [revRes, postRes, promoRes] = await Promise.all([
        supabase.from("reviews").select("*, clients(name)").order("created_at", { ascending: false }).limit(50),
        supabase.from("social_posts").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("promotions").select("*").order("valid_from", { ascending: false }),
      ]);
      setReviews((revRes.data as unknown as Review[]) || []);
      setPosts(postRes.data || []);
      setPromos(promoRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const unanswered = reviews.filter(r => !r.reply).length;

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Marketing</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {avgRating > 0 && `${avgRating.toFixed(1)} avg rating · `}
            {unanswered > 0 ? `${unanswered} unanswered review${unanswered !== 1 ? "s" : ""}` : "All reviews answered ✓"}
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: "var(--color-plum)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Avg Rating", value: avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : "–", icon: Star, color: "var(--color-gold)" },
          { label: "Published Posts", value: posts.filter(p => p.status === "published").length, icon: Instagram, color: "#e1306c" },
          { label: "Active Promos", value: promos.filter(p => p.is_active).length, icon: TrendingUp, color: "var(--color-plum)" },
        ].map((card, i) => (
          <div key={i} className="p-5 rounded-2xl border"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{card.label}</p>
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
            </div>
            <p className="font-display text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ background: "var(--color-surface)" }}>
        {(["reviews","social","promos"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
            style={{
              background: tab === t ? "var(--color-card)" : "transparent",
              color: tab === t ? "var(--color-plum)" : "var(--color-text-muted)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t === "promos" ? "Promotions" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "var(--color-surface)" }} />)}
          </div>
        ) : tab === "reviews" ? (
          reviews.length === 0 ? (
            <div className="p-16 text-center">
              <Star className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No reviews yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {reviews.map(review => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{PLATFORM_ICONS[review.platform]}</span>
                      <p className="font-medium text-sm">{review.clients?.name || "Anonymous"}</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5" fill={i < review.rating ? "var(--color-gold)" : "none"}
                            style={{ color: "var(--color-gold)" }} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: "var(--color-text-soft)" }}>{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>&ldquo;{review.comment}&rdquo;</p>
                  )}
                  {review.reply ? (
                    <div className="pl-3 border-l-2 mt-2" style={{ borderColor: "var(--color-plum-light)" }}>
                      <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-plum)" }}>Your reply</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{review.reply}</p>
                    </div>
                  ) : (
                    <button className="mt-2 text-xs font-medium" style={{ color: "var(--color-plum)" }}>
                      Reply with AI ✨
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        ) : tab === "social" ? (
          posts.length === 0 ? (
            <div className="p-16 text-center">
              <Instagram className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No posts yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {posts.map(post => (
                <div key={post.id} className="px-6 py-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: "var(--color-surface)" }}>
                    {post.platform === "instagram" ? "📸" : post.platform === "tiktok" ? "🎵" : "📘"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{post.caption}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                      {post.scheduled_at ? `Scheduled: ${formatDate(post.scheduled_at)}` :
                       post.published_at ? `Published: ${formatDate(post.published_at)}` :
                       `Draft · ${formatDate(post.created_at)}`}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 capitalize"
                    style={{
                      background: post.status === "published" ? "#d1fae5" : post.status === "scheduled" ? "#dbeafe" : "var(--color-surface)",
                      color: post.status === "published" ? "#065f46" : post.status === "scheduled" ? "#1e40af" : "var(--color-text-muted)",
                    }}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          promos.length === 0 ? (
            <div className="p-16 text-center">
              <Megaphone className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-text-soft)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No promotions</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {promos.map(promo => (
                <div key={promo.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{promo.name}</p>
                      {promo.code && (
                        <code className="text-xs px-2 py-0.5 rounded font-mono"
                          style={{ background: "var(--color-surface)", color: "var(--color-plum)" }}>{promo.code}</code>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {promo.discount_type === "percentage" ? `${promo.discount_value}% off` : `AED ${promo.discount_value} off`}
                      {" · "}{formatDate(promo.valid_from)} – {formatDate(promo.valid_until)}
                      {" · "}{promo.usage_count}{promo.max_uses ? `/${promo.max_uses}` : ""} uses
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: promo.is_active ? "#d1fae5" : "#fee2e2", color: promo.is_active ? "#065f46" : "#991b1b" }}>
                    {promo.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
