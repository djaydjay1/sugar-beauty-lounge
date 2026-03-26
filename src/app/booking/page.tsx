"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Clock, MapPin, User, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";

type Service = Database["public"]["Tables"]["services"]["Row"] & { service_categories: { name: string } | null };
type Location = Database["public"]["Tables"]["locations"]["Row"];
type StaffMember = Database["public"]["Tables"]["staff"]["Row"];

type Step = 1 | 2 | 3 | 4;

interface BookingState {
  service: Service | null;
  location: Location | null;
  staff: StaffMember | null;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const TIMES = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30"];

const STEP_LABELS = ["Service", "Date & Time", "Your Details", "Confirm"];

function BookingPageInner() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    service: null, location: null, staff: null,
    date: "", time: "", name: "", phone: "", email: "", notes: "",
  });

  useEffect(() => {
    async function load() {
      const [svcs, locs] = await Promise.all([
        supabase.from("services").select("*, service_categories(name)").eq("is_active", true).order("sort_order"),
        supabase.from("locations").select("*").eq("is_active", true),
      ]);
      setServices((svcs.data as Service[]) || []);
      setLocations(locs.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const loadStaff = useCallback(async (serviceId: string, locationId: string) => {
    const { data } = await supabase
      .from("staff")
      .select("*")
      .eq("is_active", true)
      .eq("location_id", locationId);
    setStaff(data || []);
  }, []);

  useEffect(() => {
    if (booking.service && booking.location) loadStaff(booking.service.id, booking.location.id);
  }, [booking.service, booking.location, loadStaff]);

  async function submit() {
    if (!booking.service || !booking.location || !booking.staff || !booking.date || !booking.time) return;
    setSubmitting(true);
    try {
      // Upsert client
      const { data: clientData } = await supabase
        .from("clients")
        .upsert({ name: booking.name, phone: booking.phone, email: booking.email || null }, { onConflict: "phone" })
        .select()
        .single();

      if (!clientData) throw new Error("Failed to create client");

      // Create appointment
      const startTime = booking.time;
      const [h, m] = startTime.split(":").map(Number);
      const endMinutes = h * 60 + m + (booking.service.duration_minutes || 60);
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

      const { error } = await supabase.from("appointments").insert({
        client_id: clientData.id,
        staff_id: booking.staff.id,
        service_id: booking.service.id,
        location_id: booking.location.id,
        date: booking.date,
        start_time: startTime,
        end_time: endTime,
        status: "pending",
        source: "website",
        notes: booking.notes || null,
      });

      if (error) throw error;
      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again or call us.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--color-bg)" }}>
        <Toaster />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--color-blush-light)" }}>
            <Check className="w-10 h-10" style={{ color: "var(--color-plum)" }} />
          </div>
          <h1 className="font-display text-4xl font-semibold mb-3" style={{ color: "var(--color-text)" }}>
            You&apos;re Booked!
          </h1>
          <p className="text-lg mb-2" style={{ color: "var(--color-text-muted)" }}>
            {booking.service?.name} at {booking.location?.name}
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
            {formatDate(booking.date)} at {booking.time} with {booking.staff?.name}
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
            We&apos;ll confirm your appointment shortly via WhatsApp or phone.
          </p>
          <Link href="/"
            className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full"
            style={{ background: "var(--color-plum)", color: "#fff" }}>
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Toaster />
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}>
        <Link href="/" className="font-display text-lg font-semibold" style={{ color: "var(--color-plum)" }}>
          Sugar Beauty Lounge
        </Link>
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Online Booking</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEP_LABELS.map((label, i) => {
            const s = (i + 1) as Step;
            const active = step === s;
            const done = step > s;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                    style={{
                      background: done ? "var(--color-plum)" : active ? "var(--color-plum)" : "var(--color-surface)",
                      color: done || active ? "#fff" : "var(--color-text-muted)",
                    }}>
                    {done ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  <span className="text-xs font-medium hidden sm:block" style={{ color: active ? "var(--color-plum)" : "var(--color-text-muted)" }}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className="flex-1 h-px mx-2" style={{ background: done ? "var(--color-plum)" : "var(--color-border)" }} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: SERVICE + LOCATION */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-3xl font-semibold mb-2">Choose a Service</h2>
              <p className="mb-8 text-sm" style={{ color: "var(--color-text-muted)" }}>Select the service you&apos;d like to book</p>

              {loading ? (
                <div className="grid gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 mb-8">
                  {services.map(svc => (
                    <button key={svc.id} onClick={() => setBooking(b => ({ ...b, service: svc }))}
                      className="text-left p-4 rounded-2xl border transition-all flex items-center justify-between"
                      style={{
                        borderColor: booking.service?.id === svc.id ? "var(--color-plum)" : "var(--color-border)",
                        background: booking.service?.id === svc.id ? "var(--color-blush-light)" : "var(--color-card)",
                      }}>
                      <div>
                        <p className="font-medium">{svc.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.duration_minutes} min</span>
                          <span>{svc.service_categories?.name}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-sm" style={{ color: "var(--color-plum)" }}>
                        {svc.price_from ? "From " : ""}AED {svc.price}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <h3 className="font-semibold mb-4">Choose a Location</h3>
              <div className="grid gap-3 mb-8">
                {locations.map(loc => (
                  <button key={loc.id} onClick={() => setBooking(b => ({ ...b, location: loc }))}
                    className="text-left p-4 rounded-2xl border transition-all"
                    style={{
                      borderColor: booking.location?.id === loc.id ? "var(--color-plum)" : "var(--color-border)",
                      background: booking.location?.id === loc.id ? "var(--color-blush-light)" : "var(--color-card)",
                    }}>
                    <p className="font-medium">{loc.name}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      <MapPin className="w-3 h-3" />{loc.address}
                    </div>
                  </button>
                ))}
              </div>

              <button disabled={!booking.service || !booking.location}
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                style={{ background: "var(--color-plum)", color: "#fff" }}>
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: DATE, TIME, STAFF */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display text-3xl font-semibold mb-2">Pick a Date & Time</h2>
              <p className="mb-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
                {booking.service?.name} · {booking.location?.name}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Date</label>
                <input type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={booking.date}
                  onChange={e => setBooking(b => ({ ...b, date: e.target.value }))}
                  className="w-full p-3 rounded-xl border text-sm"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-3">Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIMES.map(t => (
                    <button key={t} onClick={() => setBooking(b => ({ ...b, time: t }))}
                      className="py-2 rounded-xl text-sm font-medium border transition-all"
                      style={{
                        borderColor: booking.time === t ? "var(--color-plum)" : "var(--color-border)",
                        background: booking.time === t ? "var(--color-plum)" : "var(--color-card)",
                        color: booking.time === t ? "#fff" : "var(--color-text)",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {staff.length > 0 && (
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-3">Preferred Staff (optional)</label>
                  <div className="grid gap-2">
                    {staff.map(s => (
                      <button key={s.id} onClick={() => setBooking(b => ({ ...b, staff: b.staff?.id === s.id ? null : s }))}
                        className="text-left p-3 rounded-xl border flex items-center gap-3 transition-all"
                        style={{
                          borderColor: booking.staff?.id === s.id ? "var(--color-plum)" : "var(--color-border)",
                          background: booking.staff?.id === s.id ? "var(--color-blush-light)" : "var(--color-card)",
                        }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "var(--color-blush)", color: "var(--color-plum)" }}>
                          {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{s.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                disabled={!booking.date || !booking.time}
                onClick={() => {
                  if (!booking.staff && staff.length > 0) {
                    setBooking(b => ({ ...b, staff: staff[0] }));
                  }
                  setStep(3);
                }}
                className="w-full py-3.5 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                style={{ background: "var(--color-plum)", color: "#fff" }}>
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 3: CONTACT DETAILS */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display text-3xl font-semibold mb-2">Your Details</h2>
              <p className="mb-8 text-sm" style={{ color: "var(--color-text-muted)" }}>We&apos;ll send your confirmation via WhatsApp</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                  <input type="text" placeholder="Your name"
                    value={booking.name}
                    onChange={e => setBooking(b => ({ ...b, name: e.target.value }))}
                    className="w-full p-3 rounded-xl border text-sm"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">WhatsApp / Phone *</label>
                  <input type="tel" placeholder="+971 XX XXX XXXX"
                    value={booking.phone}
                    onChange={e => setBooking(b => ({ ...b, phone: e.target.value }))}
                    className="w-full p-3 rounded-xl border text-sm"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email (optional)</label>
                  <input type="email" placeholder="your@email.com"
                    value={booking.email}
                    onChange={e => setBooking(b => ({ ...b, email: e.target.value }))}
                    className="w-full p-3 rounded-xl border text-sm"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
                  <textarea placeholder="Any preferences or special requests..."
                    value={booking.notes}
                    onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))}
                    rows={3}
                    className="w-full p-3 rounded-xl border text-sm resize-none"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
                </div>
              </div>

              <button
                disabled={!booking.name || !booking.phone}
                onClick={() => setStep(4)}
                className="w-full py-3.5 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                style={{ background: "var(--color-plum)", color: "#fff" }}>
                Review Booking <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 4: CONFIRM */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display text-3xl font-semibold mb-2">Confirm Booking</h2>
              <p className="mb-8 text-sm" style={{ color: "var(--color-text-muted)" }}>Please review your appointment details</p>

              <div className="rounded-2xl border p-6 mb-6 space-y-4"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" style={{ color: "var(--color-gold)" }} />
                  <div>
                    <p className="font-semibold">{booking.service?.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{booking.service?.duration_minutes} min · {formatCurrency(booking.service?.price || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: "var(--color-plum)" }} />
                  <div>
                    <p className="font-semibold">{booking.location?.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{booking.location?.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" style={{ color: "var(--color-plum)" }} />
                  <p className="font-semibold">{booking.date && formatDate(booking.date)} at {booking.time}</p>
                </div>
                {booking.staff && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" style={{ color: "var(--color-plum)" }} />
                    <div>
                      <p className="font-semibold">{booking.staff.name}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{booking.staff.role}</p>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <p className="font-semibold">{booking.name}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{booking.phone}</p>
                  {booking.email && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{booking.email}</p>}
                </div>
              </div>

              <p className="text-xs mb-6 text-center" style={{ color: "var(--color-text-muted)" }}>
                By confirming you agree to our cancellation policy. Please cancel at least 24 hours in advance.
              </p>

              <button onClick={submit} disabled={submitting}
                className="w-full py-3.5 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                style={{ background: "var(--color-plum)", color: "#fff" }}>
                {submitting ? "Booking..." : "Confirm Appointment"}
                {!submitting && <Check className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}><p style={{ color: "var(--color-text-muted)" }}>Loading...</p></div>}>
      <BookingPageInner />
    </Suspense>
  );
}
