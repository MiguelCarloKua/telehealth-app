"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { Send, Sparkles, User, Bot, Stethoscope, Calendar, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Doctor {
  _id: string;
  firstname: string;
  lastname: string;
  specialty: string;
  expertiseTags?: string[];
  bio?: string;
  experience?: number;
  profileImage?: string;
}

interface PatientProfile {
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  medicalHistory?: string[];
}

function bmiValue(h?: number, w?: number) {
  if (!h || !w) return null;
  return ((w / (h * h)) * 10000).toFixed(1);
}

function matchScore(doctor: Doctor, profile: PatientProfile): number {
  if (!profile.medicalHistory?.length && !profile.allergies?.length) return 0;
  const conditions = [
    ...(profile.medicalHistory ?? []),
    ...(profile.allergies ?? []),
  ].map(s => s.toLowerCase());
  const tags = (doctor.expertiseTags ?? []).map(t => t.toLowerCase());
  const specialty = doctor.specialty.toLowerCase();
  let score = 0;
  for (const condition of conditions) {
    for (const tag of tags) {
      if (tag.includes(condition) || condition.includes(tag)) score += 2;
    }
    if (specialty.includes(condition) || condition.includes(specialty)) score += 1;
  }
  return score;
}

function AIChatInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyMissing, setKeyMissing] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [profile, setProfile] = useState<PatientProfile>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const init = async () => {
      try {
        const patientId = sessionStorage.getItem('patientId');
        if (!patientId) { window.location.href = '/auth/login'; return; }

        const [userRes, doctorsRes] = await Promise.all([
          fetch(`/api/users/${patientId}`),
          fetch('/api/doctors'),
        ]);

        const userData = userRes.ok ? await userRes.json() : {};
        const doctorsData: Doctor[] = doctorsRes.ok ? await doctorsRes.json() : [];

        const patientProfile: PatientProfile = {
          bloodType: userData.bloodType,
          height: userData.height,
          weight: userData.weight,
          allergies: userData.allergies ?? [],
          medicalHistory: userData.medicalHistory ?? [],
        };

        setProfile(patientProfile);
        setDoctors(doctorsData);

        // Score and sort doctors by relevance
        const scored = doctorsData
          .map(d => ({ doctor: d, score: matchScore(d, patientProfile) }))
          .sort((a, b) => b.score - a.score);
        setRecommendedDoctors(scored.slice(0, 5).map(s => s.doctor));

        // Compose initial AI prompt
        const initialMessage = initialQuery.trim()
          ? initialQuery.trim()
          : 'Hello! Please analyze my health profile and recommend which specialists I should see and why.';

        const firstMessage: Message = { role: 'user', content: initialMessage };
        setMessages([firstMessage]);

        const aiResponse = await fetch('/api/ai/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [firstMessage],
            patientId,
          }),
        });

        if (!aiResponse.ok) {
          const err = await aiResponse.json().catch(() => ({}));
          if (err.error === 'AI_NOT_CONFIGURED') {
            setKeyMissing(true);
            setError('GROQ_API_KEY is not set. Add it to your .env.local file to enable AI recommendations.');
          } else if (err.error === 'AI_RATE_LIMITED') {
            setError('The AI service is rate-limited right now. Please wait a moment and try again.');
          } else {
            setError('MedAI could not connect right now. Type your question below to try again.');
          }
          return;
        }

        const { content } = await aiResponse.json();
        setMessages([firstMessage, { role: 'assistant', content }]);
      } catch (err) {
        setError('Failed to initialize the AI assistant. Please refresh and try again.');
      } finally {
        setInitializing(false);
      }
    };

    init();
  }, [initialQuery]);

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || sending) return;

    const patientId = sessionStorage.getItem('patientId');
    const userMsg: Message = { role: 'user', content: msgText };
    const newHistory = [...messages, userMsg];

    setMessages(newHistory);
    setInput('');
    setSending(true);
    setError(null); // clear transient errors on new attempt

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, patientId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          err.error === 'AI_RATE_LIMITED'
            ? "I'm currently rate-limited. Please wait a moment and try again."
            : "I'm sorry, I couldn't respond right now. Please try again.";
        setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
        return;
      }

      const { content } = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I encountered an error. Please try sending your message again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const bmi = bmiValue(profile.height, profile.weight);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── Chat Column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="bg-[#e8eeff] dark:bg-[#0a1638] border-b border-blue-200 dark:border-[#1e3a8a]/40 px-6 py-4 flex items-center gap-3">
          <Link href="/patient/doctors" className="text-[#2448c4] dark:text-blue-400 hover:text-[#1e3a8a] mr-1">
            <ChevronLeft size={20} />
          </Link>
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#cddbfe] to-[#7aa0f8] dark:from-[#1e3a8a] dark:to-[#2448c4] flex items-center justify-center shadow-sm">
            <Sparkles size={18} className="text-[#1e3a8a] dark:text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[#1e3a8a] dark:text-blue-100 leading-tight">MedAI Health Assistant</h1>
            <p className="text-xs text-[#2448c4] dark:text-blue-400 opacity-80">Personalized to your health profile</p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {initializing ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#cddbfe] to-[#7aa0f8] dark:from-[#1e3a8a] dark:to-[#2448c4] flex items-center justify-center">
                <Sparkles size={24} className="text-[#1e3a8a] dark:text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#1e3a8a] dark:text-blue-200">Analyzing your health profile…</p>
                <p className="text-sm text-blue-400 mt-1">Finding the right specialists for you</p>
              </div>
              <Loader2 size={20} className="text-[#2448c4] dark:text-blue-400 animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#cddbfe] to-[#7aa0f8] dark:from-[#1e3a8a] dark:to-[#2448c4] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={15} className="text-[#1e3a8a] dark:text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#1e3a8a] text-white rounded-br-sm'
                      : 'bg-white dark:bg-[#0e1e55] text-[#1e3a8a] dark:text-blue-100 border border-blue-100 dark:border-[#1e3a8a]/40 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-[#cddbfe] dark:bg-[#1e3a8a]/50 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={15} className="text-[#1e3a8a] dark:text-blue-300" />
                    </div>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#cddbfe] to-[#7aa0f8] dark:from-[#1e3a8a] dark:to-[#2448c4] flex items-center justify-center shrink-0">
                    <Bot size={15} className="text-[#1e3a8a] dark:text-white" />
                  </div>
                  <div className="bg-white dark:bg-[#0e1e55] border border-blue-100 dark:border-[#1e3a8a]/40 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#2448c4] dark:bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick suggestions */}
        {!initializing && messages.length <= 2 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {[
              'What symptoms should concern me?',
              'How often should I get checked?',
              'What does my BMI mean?',
            ].map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#f0f4ff] dark:bg-[#0c1840] border border-blue-200 dark:border-[#1e3a8a]/40 text-[#2448c4] dark:text-blue-300 hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-blue-100 dark:border-[#1e3a8a]/40 px-4 py-4 bg-white dark:bg-[#0a1638]">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms or ask a health question…"
              rows={1}
              className="flex-1 resize-none px-4 py-3 rounded-xl bg-[#f0f4ff] dark:bg-[#0c1840] border border-blue-200 dark:border-[#1e3a8a]/40 text-[#1e3a8a] dark:text-blue-100 placeholder-blue-300 dark:placeholder-blue-700 focus:outline-none focus:ring-2 focus:ring-[#2448c4] text-sm"
              style={{ maxHeight: '120px' }}
              disabled={initializing || keyMissing}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending || initializing || keyMissing}
              className="p-3 bg-[#1e3a8a] hover:bg-[#152870] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-blue-300 dark:text-blue-600 mt-2 text-center">
            MedAI is an assistant, not a substitute for professional medical advice.
          </p>
        </div>
      </div>

      {/* ── Doctors Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 border-l border-blue-100 dark:border-[#1e3a8a]/40 bg-[#f0f4ff] dark:bg-[#060d24] overflow-y-auto">
        <div className="p-4 border-b border-blue-100 dark:border-[#1e3a8a]/40">
          <h2 className="font-bold text-[#1e3a8a] dark:text-blue-100 text-sm flex items-center gap-2">
            <Stethoscope size={14} className="text-[#2448c4] dark:text-blue-400" />
            Recommended for You
          </h2>
          {(profile.medicalHistory?.length ?? 0) > 0 && (
            <p className="text-xs text-blue-400 mt-0.5">Based on your health profile</p>
          )}
        </div>

        {/* Patient vitals strip */}
        {(bmi || profile.bloodType) && (
          <div className="mx-3 mt-3 p-3 bg-white dark:bg-[#0e1e55] rounded-xl border border-blue-100 dark:border-[#1e3a8a]/30 grid grid-cols-2 gap-2 text-center text-xs">
            {bmi && (
              <div>
                <p className="text-blue-400">BMI</p>
                <p className="font-bold text-[#1e3a8a] dark:text-blue-200">{bmi}</p>
              </div>
            )}
            {profile.bloodType && (
              <div>
                <p className="text-blue-400">Blood</p>
                <p className="font-bold text-red-600 dark:text-red-400">{profile.bloodType}</p>
              </div>
            )}
          </div>
        )}

        <div className="p-3 space-y-3 flex-1">
          {recommendedDoctors.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope size={28} className="text-blue-200 dark:text-blue-800 mx-auto mb-2" />
              <p className="text-xs text-blue-400">No doctors available yet</p>
            </div>
          ) : (
            recommendedDoctors.map(doctor => (
              <div
                key={doctor._id}
                className="bg-white dark:bg-[#0e1e55] rounded-xl p-4 border border-blue-100 dark:border-[#1e3a8a]/30 hover:border-[#2448c4]/40 dark:hover:border-blue-600/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#cddbfe] dark:bg-[#1e3a8a]/50 flex items-center justify-center text-[#1e3a8a] dark:text-blue-200 font-bold text-xs shrink-0 overflow-hidden">
                    {doctor.profileImage ? (
                      <img src={doctor.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      `${doctor.firstname[0]}${doctor.lastname[0]}`
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1e3a8a] dark:text-blue-100 text-sm truncate">
                      Dr. {doctor.firstname} {doctor.lastname}
                    </p>
                    <p className="text-[#2448c4] dark:text-blue-400 text-xs">{doctor.specialty}</p>
                  </div>
                </div>
                {doctor.bio && (
                  <p className="text-xs text-blue-400 dark:text-blue-500 line-clamp-2 mb-3">{doctor.bio}</p>
                )}
                <Link
                  href="/patient/appointments"
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Calendar size={12} /> Book Appointment
                </Link>
              </div>
            ))
          )}

          <Link
            href="/patient/doctors"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#e8eeff] dark:bg-[#0a1638] hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 rounded-xl text-xs font-semibold text-[#2448c4] dark:text-blue-300 border border-blue-200 dark:border-[#1e3a8a]/40 transition-colors mt-1"
          >
            Browse All Doctors →
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 size={24} className="text-[#2448c4] animate-spin" />
      </div>
    }>
      <AIChatInner />
    </Suspense>
  );
}
