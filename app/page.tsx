import Link from "next/link";
import { Stethoscope, Link2, MapPin, Sparkles, Shield, Clock, ChevronRight, Heart, Users, Star } from "lucide-react";

function LinKodLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-14 h-14" : size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const icon = size === "lg" ? 28 : size === "sm" ? 16 : 20;
  return (
    <div className={`${dims} bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden`}>
      <Stethoscope size={icon} className="text-white z-10" />
      <Link2 size={icon * 0.55} className="text-blue-200 absolute bottom-1.5 right-1.5 opacity-90" />
    </div>
  );
}

const features = [
  {
    icon: MapPin,
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    title: "Nearby Specialists",
    desc: "Find doctors closest to you in your area using real-time location matching — no more long commutes for consultations.",
  },
  {
    icon: Sparkles,
    color: "from-violet-500 to-violet-700",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-600 dark:text-violet-400",
    title: "AI Health Advisor",
    desc: "MedAI analyses your health profile and medical history to recommend the right specialist for your exact needs.",
  },
  {
    icon: Clock,
    color: "from-emerald-500 to-emerald-700",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    title: "Instant Consultations",
    desc: "Book and join live chat sessions with licensed doctors without leaving home. Your health, on your schedule.",
  },
  {
    icon: Shield,
    color: "from-amber-500 to-amber-700",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    title: "Secure Records",
    desc: "All your prescriptions, clinical notes, and appointment history are stored securely and accessible any time.",
  },
];

const stats = [
  { value: "10+", label: "Specialists" },
  { value: "4.9★", label: "Avg. Rating" },
  { value: "24/7", label: "Availability" },
  { value: "100%", label: "Secure" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f0ff] via-white to-white dark:from-[#060d24] dark:via-[#060d24] dark:to-[#060d24] flex flex-col">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#060d24]/80 border-b border-blue-100 dark:border-[#1e3a8a]/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LinKodLogo size="sm" />
            <span className="text-xl font-bold text-[#1e3a8a] dark:text-blue-100 tracking-tight">LinKod</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-[#2448c4] dark:text-blue-300 hover:text-[#1e3a8a] dark:hover:text-blue-100 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2 bg-[#1e3a8a] hover:bg-[#152870] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 max-w-4xl mx-auto w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-[#1e3a8a]/40 border border-blue-200 dark:border-[#1e3a8a]/60 rounded-full text-sm font-semibold text-[#2448c4] dark:text-blue-300 mb-8 animate-fade-in">
          <Heart size={13} fill="currentColor" className="text-blue-500" />
          Healthcare for every Filipino
        </div>

        {/* Logo */}
        <div className="mb-8 animate-scale-in">
          <LinKodLogo size="lg" />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-[#1e3a8a] dark:text-white leading-tight tracking-tight mb-6 animate-slide-up">
          Your health,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            connected.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#2448c4] dark:text-blue-400 opacity-80 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
          LinKod links you to the nearest qualified doctors, personalised AI health advice, and secure medical records — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link
            href="/auth/register"
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#1e3a8a] hover:bg-[#152870] text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Get Started Free
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-[#0e1e55] text-[#1e3a8a] dark:text-blue-200 font-bold rounded-2xl border border-blue-200 dark:border-[#1e3a8a]/60 hover:border-[#2448c4] dark:hover:border-blue-500 transition-all hover:-translate-y-0.5"
          >
            Log In
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-xl animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {stats.map(s => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-[#1e3a8a] dark:text-blue-100">{s.value}</span>
              <span className="text-xs text-[#2448c4] dark:text-blue-400 opacity-70 font-medium mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3a8a] dark:text-blue-100 mb-3">
            Everything you need, nothing you don't
          </h2>
          <p className="text-[#2448c4] dark:text-blue-400 opacity-70 text-lg max-w-xl mx-auto">
            LinKod is built around your real healthcare needs — from finding a nearby doctor to understanding your own health.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-6 bg-white dark:bg-[#0e1e55] rounded-2xl border border-blue-100 dark:border-[#1e3a8a]/40 hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-lg dark:hover:shadow-blue-900/20 transition-all hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className={f.text} />
                </div>
                <h3 className="font-bold text-[#1e3a8a] dark:text-blue-100 mb-2">{f.title}</h3>
                <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-75 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#0c1840] dark:from-[#0e1e55] dark:to-[#060d24] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <LinKodLogo size="sm" />
            <span className="text-white font-bold text-lg">Our Mission</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Bridging the gap between{" "}
            <span className="text-blue-300">patients and doctors</span>
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed mb-10 opacity-90">
            In the Philippines, access to quality healthcare shouldn't depend on your postcode. LinKod (a play on "link" and "kodigo" — Filipino for "connection") was built to remove the barriers between you and the right doctor: distance, information, and time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white hover:bg-blue-50 text-[#1e3a8a] font-bold rounded-2xl transition-colors shadow-lg"
            >
              Join LinKod Today
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-colors"
            >
              Already a member? Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonial strip ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="flex flex-wrap justify-center gap-3 items-center text-sm text-[#2448c4] dark:text-blue-400 opacity-70">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" className="text-yellow-400" />)}
          </div>
          <span className="font-semibold">Trusted by patients across Metro Manila</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1"><Users size={14} /> Doctors available now</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1"><Shield size={14} /> HIPAA-inspired data security</span>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-blue-100 dark:border-[#1e3a8a]/30 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#2448c4] dark:text-blue-500 opacity-60">
          <div className="flex items-center gap-2">
            <LinKodLogo size="sm" />
            <span className="font-semibold">LinKod © 2026</span>
          </div>
          <p>Healthcare, connected. For every Filipino.</p>
        </div>
      </footer>
    </div>
  );
}
