"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, Star, MapPin, Phone, Clock, Instagram, ArrowRight,
  ChevronDown, Heart, Award, Shield
} from "lucide-react";

const SERVICES = [
  { icon: "💇‍♀️", name: "Hair", desc: "Cuts, colour, styling & blowouts", from: 99 },
  { icon: "💅", name: "Nails", desc: "Manicure, pedicure, gel & nail art", from: 99 },
  { icon: "✨", name: "Facials", desc: "Dermalogica facials & skin treatments", from: 99 },
  { icon: "🌸", name: "Waxing", desc: "Full body waxing & depilation", from: 10 },
  { icon: "👁️", name: "Lashes & Brows", desc: "Extensions, perms & threading", from: 30 },
  { icon: "💄", name: "Makeup", desc: "Bridal, occasion & everyday looks", from: 150 },
];

const LOCATIONS = [
  { name: "Mall of the Emirates", address: "Sheikh Zayed Road, Dubai", hours: "9AM – 10PM" },
  { name: "Dubai Sports City", address: "Canal Residence West, Dubai", hours: "9AM – 10PM" },
  { name: "Bawabat AlSharq", address: "Abu Dhabi", hours: "9AM – 10PM" },
];

const REVIEWS = [
  { name: "Sarah M.", rating: 5, text: "Absolutely love this place. My nails always come out perfect and the staff are so attentive. My go-to in Dubai!", service: "Gel Manicure" },
  { name: "Layla A.", rating: 5, text: "Best lash extensions in Dubai. The technicians are highly skilled and the salon is always so clean and relaxing.", service: "Lash Extensions" },
  { name: "Emma K.", rating: 5, text: "Came for a facial and left glowing. The Dermalogica treatment was incredible. Already booked my next session!", service: "Dermalogica Facial" },
];

const WHY = [
  { icon: <Award className="w-6 h-6" />, title: "Premium Products", desc: "We use only top-tier brands including Dermalogica for every treatment." },
  { icon: <Shield className="w-6 h-6" />, title: "Hygiene First", desc: "Strict sanitation protocols and single-use tools for every client." },
  { icon: <Heart className="w-6 h-6" />, title: "Personalised Care", desc: "We remember your preferences and tailor every visit to you." },
  { icon: <Star className="w-6 h-6" />, title: "Expert Team", desc: "Trained and certified beauty professionals with years of experience." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(250,247,245,0.85)", borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-semibold" style={{ color: "var(--color-plum)" }}>
            Sugar Beauty Lounge
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <a href="#services" className="hover:text-[--color-plum] transition-colors">Services</a>
            <a href="#locations" className="hover:text-[--color-plum] transition-colors">Locations</a>
            <a href="#reviews" className="hover:text-[--color-plum] transition-colors">Reviews</a>
          </div>
          <Link
            href="/booking"
            className="text-sm font-medium px-5 py-2.5 rounded-full transition-all"
            style={{ background: "var(--color-plum)", color: "#fff" }}
          >
            Book Now
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20"
            style={{ background: "radial-gradient(ellipse at top right, var(--color-blush-light), transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-15"
            style={{ background: "radial-gradient(ellipse at bottom left, var(--color-gold-light), transparent 70%)" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
              style={{ background: "var(--color-blush-light)", color: "var(--color-blush-dark)" }}>
              <Sparkles className="w-3.5 h-3.5" />
              3 Locations Across the UAE
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.1] mb-6" style={{ color: "var(--color-text)" }}>
              Where Beauty<br />
              <span style={{ color: "var(--color-plum)" }}>Meets Luxury</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--color-text-muted)" }}>
              Premium beauty services crafted for the modern woman in Dubai.
              From precision haircuts to radiant facials — every detail perfected.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full transition-all hover:opacity-90"
                style={{ background: "var(--color-plum)", color: "#fff" }}
              >
                Book an Appointment <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full border transition-all"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Our Services
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                    style={{ background: i % 2 === 0 ? "var(--color-blush)" : "var(--color-gold-light)", color: "var(--color-plum)" }}>
                    {["S","M","L","A"][i-1]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "var(--color-gold)" }} />)}
                  <span className="text-sm font-semibold ml-1">4.9</span>
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Loved by 2,000+ clients</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(135deg, var(--color-blush-light), var(--color-plum-light), var(--color-plum))" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-8xl opacity-20 text-white select-none">✦</span>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl backdrop-blur-sm"
                  style={{ background: "rgba(255,255,255,0.85)" }}>
                  <p className="font-display text-sm font-semibold" style={{ color: "var(--color-plum)" }}>New Customer Offer</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>10% off your first visit</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl shadow-lg flex items-center justify-center"
                style={{ background: "var(--color-gold-light)" }}>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold" style={{ color: "var(--color-plum)" }}>10%</p>
                  <p className="text-xs font-medium" style={{ color: "var(--color-plum-dark)" }}>OFF first visit</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <a href="#services" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ color: "var(--color-text-soft)" }}>
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* WHY US */}
      <section className="py-20" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl"
                style={{ background: "var(--color-card)" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--color-blush-light)", color: "var(--color-plum)" }}>
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-body)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium mb-3 tracking-widest uppercase" style={{ color: "var(--color-gold)" }}>Our Services</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold" style={{ color: "var(--color-text)" }}>
              Beauty, Elevated
            </h2>
            <p className="mt-4 text-lg max-w-lg mx-auto" style={{ color: "var(--color-text-muted)" }}>
              From everyday grooming to special occasions, we have everything you need.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-7 rounded-3xl border transition-all hover:shadow-lg cursor-pointer"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
              >
                <div className="text-4xl mb-4">{svc.icon}</div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text)" }}>{svc.name}</h3>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>{svc.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--color-plum)" }}>
                    From AED {svc.from}
                  </span>
                  <Link href={`/booking?service=${svc.name.toLowerCase()}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: "var(--color-plum)", color: "#fff" }}>
                    Book →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/booking"
              className="inline-flex items-center gap-2 font-medium px-8 py-3.5 rounded-full transition-all hover:opacity-90"
              style={{ background: "var(--color-plum)", color: "#fff" }}>
              Book Any Service <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section id="locations" className="py-24" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium mb-3 tracking-widest uppercase" style={{ color: "var(--color-gold)" }}>Find Us</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold">3 Locations, One Standard</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {LOCATIONS.map((loc, i) => (
              <motion.div
                key={loc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-7 rounded-3xl border"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--color-blush-light)" }}>
                  <MapPin className="w-5 h-5" style={{ color: "var(--color-plum)" }} />
                </div>
                <h3 className="font-semibold text-lg mb-1">{loc.name}</h3>
                <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>{loc.address}</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  <Clock className="w-4 h-4" />
                  {loc.hours} Daily
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="tel:+97144520989"
              className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full border transition-all hover:border-[--color-plum]"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
              <Phone className="w-4 h-4" /> +971 4 452 0989
            </a>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium mb-3 tracking-widest uppercase" style={{ color: "var(--color-gold)" }}>Reviews</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold">What Our Clients Say</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-7 rounded-3xl border"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: "var(--color-gold)" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-text-muted)" }}>
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{review.name}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "var(--color-blush-light)", color: "var(--color-blush-dark)" }}>
                    {review.service}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 text-center text-white"
            style={{ background: "linear-gradient(135deg, var(--color-plum-dark), var(--color-plum), var(--color-plum-light))" }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, var(--color-gold-light) 0%, transparent 50%)" }} />
            <p className="text-sm font-medium mb-3 tracking-widest uppercase opacity-75">New Customer Offer</p>
            <h2 className="font-display text-4xl font-semibold mb-4">Your First Visit, 10% Off</h2>
            <p className="text-lg opacity-80 mb-8 max-w-md mx-auto">
              Book online and enjoy 10% off your first service at any of our Dubai locations.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 font-medium px-8 py-3.5 rounded-full transition-all hover:opacity-90"
              style={{ background: "var(--color-gold)", color: "var(--color-plum-dark)" }}
            >
              Claim Your Discount <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display text-xl font-semibold" style={{ color: "var(--color-plum)" }}>
                Sugar Beauty Lounge
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Premium beauty services across the UAE
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
              <a href="mailto:info@sugarbeautylounge.com" className="hover:text-[--color-plum] transition-colors">
                info@sugarbeautylounge.com
              </a>
              <a href="tel:+97144520989" className="hover:text-[--color-plum] transition-colors">
                +971 4 452 0989
              </a>
              <a href="https://instagram.com/sugarbeautylounge" target="_blank" rel="noopener noreferrer"
                className="hover:text-[--color-plum] transition-colors flex items-center gap-1">
                <Instagram className="w-4 h-4" /> @sugarbeautylounge
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-text-soft)" }}>
            <span>© {new Date().getFullYear()} Sugar Beauty Lounge. All rights reserved.</span>
            <Link href="/dashboard" className="hover:text-[--color-plum] transition-colors">Staff Portal</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
