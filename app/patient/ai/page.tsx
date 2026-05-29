"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Send, Sparkles, User, Bot, Stethoscope, Calendar, ChevronLeft, Loader2, AlertCircle, Plus, MessageSquare, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface Doctor {
  _id: string;
  firstname: string;
  lastname: string;
  specialty: string;
  expertiseTags?: string[];
  bio?: string;
  profileImage?: string;
}

interface PatientProfile {
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  medicalHistory?: string[];
}

interface Conversation {
  _id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

function bmiValue(h?: number, w?: number) {
  if (!h || !w) return null;
  return ((w / (h * h)) * 10000).toFixed(1);
}

function matchScore(doctor: Doctor, profile: PatientProfile): number {
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadConversations = useCallback(async (patientId: string) => {
    try {
      const res = await fetch(`/api/ai/conversations?patientId=${patientId}`);
      if (res.ok) setConversations(await res.json());
    } catch {}
  }, []);

  const startNewConversation = useCallback(async (
    patientId: string,
    doctorsData: Doctor[],
    patientProfile: PatientProfile,
    query: string,
  ) => {
    // Create a new conversation record
    const convRes = await fetch('/api/ai/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, title: query.slice(0, 50) || 'New Conversation' }),
    });
    const convData = convRes.ok ? await convRes.json() : null;
    const convId = convData?._id ?? null;
    setActiveConvId(convId);

    const initialMsg: Message = {
      role: 'user',
      content: query || 'Hello! Please analyze my health profile and recommend which specialists I should see and why.',
    };
    setMessages([initialMsg]);

    const aiRes = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [initialMsg], patientId, conversationId: convId }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.json().catch(() => ({}));
      if (err.error === 'AI_NOT_CONFIGURED') {
        setKeyMissing(true);
        setError('GROQ_API_KEY is not set. Add it to your .env.local file to enable AI recommendations.');
      } else {
        setError('MedAI could not connect. Type your question below to try again.');
      }
      return;
    }

    const { content } = await aiRes.json();
    const botMsg: Message = { role: 'assistant', content };
    setMessages([initialMsg, botMsg]);
    if (convId) await loadConversations(patientId);
  }, [loadConversations]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const patientId = sessionStorage.getItem('patientId');
        if (!patientId) { window.location.href = '/auth/login'; return; }

        const [userRes, doctorsRes, convListRes] = await Promise.all([
          fetch(`/api/users/${patientId}`),
          fetch('/api/doctors'),
          fetch(`/api/ai/conversations?patientId=${patientId}`),
        ]);

        const userData = userRes.ok ? await userRes.json() : {};
        const doctorsData: Doctor[] = doctorsRes.ok ? await doctorsRes.json() : [];
        const convList: Conversation[] = convListRes.ok ? await convListRes.json() : [];

        const patientProfile: PatientProfile = {
          bloodType: userData.bloodType,
          height: userData.height,
          weight: userData.weight,
          allergies: userData.allergies ?? [],
          medicalHistory: userData.medicalHistory ?? [],
        };

        setProfile(patientProfile);
        setDoctors(doctorsData);
        setConversations(convList);

        const scored = doctorsData
          .map(d => ({ doctor: d, score: matchScore(d, patientProfile) }))
          .sort((a, b) => b.score - a.score);
        setRecommendedDoctors(scored.slice(0, 4).map(s => s.doctor));

        // Load most recent conversation if available and no query param
        if (convList.length > 0 && !initialQuery) {
          const latest = convList[0];
          const convRes = await fetch(`/api/ai/conversations/${latest._id}`);
          if (convRes.ok) {
            const convoData = await convRes.json();
            setActiveConvId(latest._id);
            setMessages(convoData.messages ?? []);
          }
        } else {
          await startNewConversation(patientId, doctorsData, patientProfile, initialQuery);
        }
      } catch (err) {
        setError('Failed to initialize MedAI. Please refresh and try again.');
      } finally {
        setInitializing(false);
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleNewChat = async () => {
    const patientId = sessionStorage.getItem('patientId');
    if (!patientId) return;
    setInitializing(true);
    setMessages([]);
    setError(null);
    setActiveConvId(null);
    await startNewConversation(patientId, doctors, profile, '');
    setInitializing(false);
  };

  const handleLoadConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConvId(convId);
        setMessages(data.messages ?? []);
        setError(null);
      }
    } catch {}
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/ai/conversations/${convId}`, { method: 'DELETE' });
    setConversations(prev => prev.filter(c => c._id !== convId));
    if (activeConvId === convId) {
      setMessages([]);
      setActiveConvId(null);
    }
  };

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || sending) return;

    const patientId = sessionStorage.getItem('patientId');
    const userMsg: Message = { role: 'user', content: msgText };
    const newHistory = [...messages, userMsg];

    setMessages(newHistory);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, patientId, conversationId: activeConvId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error === 'AI_RATE_LIMITED'
          ? "I'm rate-limited right now. Please wait a moment and try again."
          : "I'm sorry, I couldn't respond. Please try again.";
        setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
        return;
      }

      const { content } = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content }]);

      // Refresh conversation list to update titles and timestamps
      if (patientId) await loadConversations(patientId);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." },
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
        {/* Header */}
        <div className="bg-[#e8eeff] dark:bg-[#0a1638] border-b border-blue-200 dark:border-[#1e3a8a]/40 px-6 py-3 flex items-center gap-3">
          <Link href="/patient/doctors" className="text-[#2448c4] dark:text-blue-400 hover:text-[#1e3a8a]">
            <ChevronLeft size={20} />
          </Link>
          <div className="w-9 h-9 rounded-xl bg-[#cddbfe] dark:bg-[#1e3a8a] flex items-center justify-center shadow-sm shrink-0">
            <Sparkles size={18} className="text-[#1e3a8a] dark:text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-[#1e3a8a] dark:text-blue-100 leading-tight truncate">
              {conversations.find(c => c._id === activeConvId)?.title ?? 'MedAI Health Assistant'}
            </h1>
            <p className="text-xs text-[#2448c4] dark:text-blue-400 opacity-80">Personalized to your health profile</p>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] hover:bg-[#152870] text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            <Plus size={13} /> New Chat
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {initializing ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#cddbfe] dark:bg-[#1e3a8a] flex items-center justify-center">
                <Sparkles size={24} className="text-[#1e3a8a] dark:text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#1e3a8a] dark:text-blue-200">Analyzing your health profile…</p>
                <p className="text-sm text-blue-400 mt-1">Finding the right specialists for you</p>
              </div>
              <Loader2 size={20} className="text-[#2448c4] dark:text-blue-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageSquare size={40} className="text-blue-200 dark:text-blue-800" />
              <p className="text-[#2448c4] dark:text-blue-400 text-sm">Start a conversation or ask a health question.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-[#cddbfe] dark:bg-[#1e3a8a] flex items-center justify-center shrink-0 mt-0.5">
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
                  <div className="w-8 h-8 rounded-xl bg-[#cddbfe] dark:bg-[#1e3a8a] flex items-center justify-center shrink-0">
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
            {['What symptoms should concern me?', 'How often should I get checked?', 'What does my BMI mean?'].map(s => (
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

      {/* ── Right Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 border-l border-blue-100 dark:border-[#1e3a8a]/40 bg-[#f0f4ff] dark:bg-[#060d24] overflow-y-auto">

        {/* Conversation History */}
        <div className="border-b border-blue-100 dark:border-[#1e3a8a]/40">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h2 className="font-bold text-[#1e3a8a] dark:text-blue-100 text-sm flex items-center gap-1.5">
              <MessageSquare size={13} className="text-[#2448c4] dark:text-blue-400" /> Recent Chats
            </h2>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-blue-400 px-4 pb-3">No previous conversations.</p>
          ) : (
            <div className="px-2 pb-2 space-y-0.5">
              {conversations.slice(0, 5).map(conv => (
                // div instead of button so the nested delete button is valid HTML
                <div
                  key={conv._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleLoadConversation(conv._id)}
                  onKeyDown={e => e.key === 'Enter' && handleLoadConversation(conv._id)}
                  className={`w-full cursor-pointer px-3 py-2.5 rounded-xl flex items-start justify-between gap-2 transition-colors group ${
                    conv._id === activeConvId
                      ? 'bg-[#cddbfe] dark:bg-[#1e3a8a]/40'
                      : 'hover:bg-white dark:hover:bg-[#0e1e55]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#1e3a8a] dark:text-blue-100 truncate">{conv.title}</p>
                    <p className="text-[10px] text-blue-400 mt-0.5">{timeAgo(conv.lastMessageAt)}</p>
                  </div>
                  <button
                    onClick={e => handleDeleteConversation(conv._id, e)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-blue-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vitals strip */}
        {(bmi || profile.bloodType) && (
          <div className="mx-3 mt-3 p-3 bg-white dark:bg-[#0e1e55] rounded-xl border border-blue-100 dark:border-[#1e3a8a]/30 grid grid-cols-2 gap-2 text-center text-xs">
            {bmi && (
              <div><p className="text-blue-400">BMI</p><p className="font-bold text-[#1e3a8a] dark:text-blue-200">{bmi}</p></div>
            )}
            {profile.bloodType && (
              <div><p className="text-blue-400">Blood</p><p className="font-bold text-red-600 dark:text-red-400">{profile.bloodType}</p></div>
            )}
          </div>
        )}

        {/* Recommended Doctors */}
        <div className="px-4 pt-3 pb-2 flex items-center">
          <h2 className="font-bold text-[#1e3a8a] dark:text-blue-100 text-sm flex items-center gap-1.5">
            <Stethoscope size={13} className="text-[#2448c4] dark:text-blue-400" /> Recommended
          </h2>
        </div>
        <div className="px-3 pb-3 space-y-3">
          {recommendedDoctors.length === 0 ? (
            <p className="text-xs text-blue-400">No doctors available.</p>
          ) : (
            recommendedDoctors.map(doctor => (
              <div key={doctor._id} className="bg-white dark:bg-[#0e1e55] rounded-xl p-3 border border-blue-100 dark:border-[#1e3a8a]/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#cddbfe] dark:bg-[#1e3a8a]/50 flex items-center justify-center text-[#1e3a8a] dark:text-blue-200 font-bold text-xs shrink-0 overflow-hidden">
                    {doctor.profileImage
                      ? <img src={doctor.profileImage} alt="" className="w-full h-full object-cover" />
                      : `${doctor.firstname[0]}${doctor.lastname[0]}`}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1e3a8a] dark:text-blue-100 text-xs truncate">Dr. {doctor.firstname} {doctor.lastname}</p>
                    <p className="text-[#2448c4] dark:text-blue-400 text-[10px]">{doctor.specialty}</p>
                  </div>
                </div>
                <Link
                  href="/patient/appointments"
                  className="w-full flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Calendar size={11} /> Book
                </Link>
              </div>
            ))
          )}
          <Link
            href="/patient/doctors"
            className="flex items-center justify-center gap-1 w-full py-2 bg-[#e8eeff] dark:bg-[#0a1638] hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 rounded-xl text-xs font-semibold text-[#2448c4] dark:text-blue-300 border border-blue-100 dark:border-[#1e3a8a]/40 transition-colors"
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
