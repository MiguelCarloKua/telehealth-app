"use client";

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LayoutDashboard, Stethoscope, Calendar, FileText, Settings, LogOut, Bell, CheckCheck, Sparkles } from 'lucide-react';
import { apiCall } from '@/lib/utils/api';

interface Notif {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

interface ToastItem {
  id: string;
  title: string;
  message: string;
  exiting: boolean;
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [initials, setInitials] = useState('U');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const isFirstLoad = useRef(true);
  const toastCounter = useRef(0);
  const shownToastIds = useRef<Set<string>>(new Set());
  // IDs optimistically removed from the UI before the DB write confirms
  const dismissedIds = useRef<Set<string>>(new Set());

  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Find a Doctor', href: '/patient/doctors', icon: Stethoscope },
    { name: 'AI Advisor', href: '/patient/ai', icon: Sparkles },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Records', href: '/patient/records', icon: FileText },
  ];

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 420);
  }, []);

  useEffect(() => {
    const visible = toasts.filter(t => !t.exiting);
    if (visible.length === 0) return;
    const timer = setTimeout(() => dismissToast(visible[0].id), 5000);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  // --- LOGOUT ---
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.clear();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed', error);
      sessionStorage.clear();
      window.location.href = '/auth/login';
    }
  };

  // --- BFCache PROTECTION ---
  useEffect(() => {
    const checkAuth = () => {
      if (!sessionStorage.getItem('patientId')) router.replace('/auth/login');
    };
    checkAuth();
    window.addEventListener('pageshow', checkAuth);
    window.addEventListener('focus', checkAuth);
    return () => {
      window.removeEventListener('pageshow', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, [router]);

  // --- PROFILE SYNC ---
  useEffect(() => {
    const patientId = sessionStorage.getItem('patientId');

    const syncInitials = () => {
      const name = sessionStorage.getItem('patientName');
      if (name) {
        const parts = name.split(' ');
        setInitials((parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase());
      }
    };

    const fetchProfile = async () => {
      if (!patientId) return;
      try {
        const res = await fetch(`/api/users/${patientId}`);
        if (res.ok) {
          const data = await res.json();
          setProfileImage(data.profileImage || null);
        }
      } catch {}
    };

    syncInitials();
    fetchProfile();
    window.addEventListener('storage', syncInitials);
    return () => window.removeEventListener('storage', syncInitials);
  }, [pathname]);

  // --- SSE NOTIFICATIONS ---
  useEffect(() => {
    const patientId = sessionStorage.getItem('patientId');
    if (!patientId) return;

    const source = new EventSource(`/api/notifications/stream?userId=${patientId}`);

    source.onmessage = (event) => {
      try {
        const incoming: Notif[] = JSON.parse(event.data);
        // Filter out any IDs we've already optimistically dismissed from the UI
        const visible = incoming.filter(n => !dismissedIds.current.has(n._id));
        if (!isFirstLoad.current) {
          const newOnes = visible.filter((n: Notif) => !shownToastIds.current.has(n._id));
          if (newOnes.length > 0) {
            newOnes.forEach((n: Notif) => shownToastIds.current.add(n._id));
            setToasts(t => [
              ...t,
              ...newOnes.map((n: Notif) => ({ id: `${n._id}-${++toastCounter.current}`, title: n.title, message: n.message, exiting: false })),
            ]);
          }
          setNotifications(visible);
        } else {
          isFirstLoad.current = false;
          visible.forEach((n: Notif) => shownToastIds.current.add(n._id));
          setNotifications(visible);
        }
      } catch {}
    };

    source.onerror = () => source.close();
    return () => source.close();
  }, []);

  // --- MARK SINGLE AS READ ---
  const markAsRead = async (notifId: string) => {
    dismissedIds.current.add(notifId);
    setNotifications(prev => prev.filter(n => n._id !== notifId));
    try {
      await fetch(`/api/notifications/${notifId}`, { method: 'PATCH' });
    } catch {
      // Rollback: let it reappear on the next SSE push
      dismissedIds.current.delete(notifId);
    }
  };

  // --- MARK ALL AS READ ---
  const markAllAsRead = async () => {
    const patientId = sessionStorage.getItem('patientId');
    const currentIds = notifications.map(n => n._id);
    currentIds.forEach(id => dismissedIds.current.add(id));
    setNotifications([]);
    try {
      await apiCall(`/notifications?userId=${patientId}`, { method: 'PATCH' });
    } catch {
      // Rollback: remove from dismissed so SSE can restore them
      currentIds.forEach(id => dismissedIds.current.delete(id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#060d24] transition-colors flex flex-col">
      <header className="sticky top-0 z-40 bg-[#e8eeff] dark:bg-[#0a1638] border-b border-blue-200 dark:border-[#1e3a8a]/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="shrink-0 flex items-center gap-2">
              <div className="bg-[#1e3a8a] p-2 rounded-lg text-white">
                <Stethoscope size={24} />
              </div>
              <span className="text-xl font-bold text-[#1e3a8a] dark:text-blue-300 hidden sm:block">HealthApp</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#cddbfe] dark:bg-blue-900/40 text-[#1e3a8a] dark:text-blue-200'
                        : 'text-[#2448c4] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <Icon size={18} /> {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4">

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-[#2448c4] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#e8eeff] dark:ring-[#0a1638]">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0e1e55] rounded-2xl shadow-xl border border-blue-100 dark:border-[#1e3a8a]/40 overflow-hidden z-50">
                    <div className="p-4 border-b border-blue-100 dark:border-[#1e3a8a]/40 flex justify-between items-center">
                      <h3 className="font-bold text-[#1e3a8a] dark:text-blue-100">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 text-xs text-[#2448c4] dark:text-blue-400 font-medium hover:underline"
                        >
                          <CheckCheck size={13} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-sm text-blue-400 dark:text-blue-500 text-center">You're all caught up</p>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => markAsRead(notif._id)}
                            className="w-full text-left p-4 border-b border-blue-50 dark:border-[#1e3a8a]/20 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex gap-3"
                          >
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#2448c4] dark:text-blue-400 flex items-center justify-center">
                              <Bell size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-100 truncate">{notif.title}</p>
                              <p className="text-xs text-blue-400 dark:text-blue-400 mt-0.5 line-clamp-2">{notif.message}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-blue-200 dark:bg-[#1e3a8a]/40" />

              <Link href="/patient/settings" className="text-[#2448c4] dark:text-blue-400 hover:text-[#1e3a8a] dark:hover:text-blue-200 transition-colors">
                <Settings size={20} />
              </Link>

              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">
                <LogOut size={20} />
              </button>

              <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-blue-300 dark:border-[#1e3a8a] bg-blue-100 dark:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-300 shrink-0 select-none">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-[#2448c4] dark:text-blue-400 p-1"
              >
                <Bell size={24} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#1e3a8a] dark:text-blue-300">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#e8eeff] dark:bg-[#0a1638] border-t border-blue-200 dark:border-[#1e3a8a]/40">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-[#1e3a8a] dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                >
                  <link.icon size={20} /> {link.name}
                </Link>
              ))}
              <div className="border-t border-blue-200 dark:border-[#1e3a8a]/40 my-2 pt-2">
                <Link href="/patient/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-[#1e3a8a] dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/20">
                  <Settings size={20} /> Settings
                </Link>
                <button
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={20} /> Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* Toast Stack */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} pointer-events-auto w-80 bg-white dark:bg-[#0e1e55] rounded-xl shadow-2xl border border-blue-200 dark:border-[#1e3a8a]/50 flex gap-3 p-4`}
          >
            <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-[#2448c4] dark:text-blue-400 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-100 leading-tight">{toast.title}</p>
              <p className="text-xs text-blue-400 mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-blue-300 hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
