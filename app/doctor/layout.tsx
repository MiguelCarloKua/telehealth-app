"use client";

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LayoutDashboard, CalendarDays, Users, Settings, LogOut, Bell, Stethoscope, CheckCheck } from 'lucide-react';
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

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [initials, setInitials] = useState('D');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const isFirstLoad = useRef(true);
  const toastCounter = useRef(0);

  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: 'Overview', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Schedule', href: '/doctor/schedule', icon: CalendarDays },
    { name: 'My Patients', href: '/doctor/patients', icon: Users },
  ];

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 420);
  }, []);

  // Auto-dismiss oldest toast after 5s
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
      sessionStorage.removeItem('doctorId');
      sessionStorage.removeItem('doctorName');
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // --- BFCache PROTECTION ---
  useEffect(() => {
    const checkAuth = () => {
      if (!sessionStorage.getItem('doctorId')) router.replace('/auth/login');
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
    const doctorId = sessionStorage.getItem('doctorId');

    const syncInitials = () => {
      const name = sessionStorage.getItem('doctorName');
      if (name) {
        const parts = name.split(' ');
        setInitials((parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase());
      }
    };

    const fetchProfile = async () => {
      if (!doctorId) return;
      try {
        const res = await fetch(`/api/users/${doctorId}`);
        if (res.ok) {
          const data = await res.json();
          setProfileImage(data.profileImage || null);
          setImageError(false);
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
    const doctorId = sessionStorage.getItem('doctorId');
    if (!doctorId) return;

    const source = new EventSource(`/api/notifications/stream?userId=${doctorId}`);

    source.onmessage = (event) => {
      try {
        const incoming: Notif[] = JSON.parse(event.data);
        if (!isFirstLoad.current) {
          setNotifications(prev => {
            const prevIds = new Set(prev.map(n => n._id));
            const newOnes = incoming.filter(n => !prevIds.has(n._id));
            if (newOnes.length > 0) {
              setToasts(t => [
                ...t,
                ...newOnes.map(n => ({ id: `${n._id}-${++toastCounter.current}`, title: n.title, message: n.message, exiting: false })),
              ]);
            }
            return incoming;
          });
        } else {
          isFirstLoad.current = false;
          setNotifications(incoming);
        }
      } catch {}
    };

    source.onerror = () => source.close();
    return () => source.close();
  }, []);

  // --- MARK SINGLE AS READ ---
  const markAsRead = async (notifId: string) => {
    setNotifications(prev => prev.filter(n => n._id !== notifId));
    try {
      await fetch(`/api/notifications/${notifId}`, { method: 'PATCH' });
    } catch {}
  };

  // --- MARK ALL AS READ ---
  const markAllAsRead = async () => {
    const doctorId = sessionStorage.getItem('doctorId');
    setNotifications([]);
    try {
      await apiCall(`/notifications?userId=${doctorId}`, { method: 'PATCH' });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#faf5ff] dark:bg-[#100620] transition-colors flex flex-col">
      <header className="sticky top-0 z-40 bg-[#f3e8ff] dark:bg-[#1c0a38] border-b border-purple-200 dark:border-purple-900/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-purple-700 p-2 rounded-lg text-white">
                <Stethoscope size={24} />
              </div>
              <span className="text-xl font-bold text-purple-800 dark:text-purple-300 hidden sm:block">HealthApp Provider</span>
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
                        ? 'bg-purple-200 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200'
                        : 'text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/20'
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
                  className="relative p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#f3e8ff] dark:ring-[#1c0a38]">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#230d42] rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900/40 overflow-hidden z-50">
                    <div className="p-4 border-b border-purple-100 dark:border-purple-900/40 flex justify-between items-center">
                      <h3 className="font-bold text-purple-900 dark:text-purple-100">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline"
                        >
                          <CheckCheck size={13} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-sm text-purple-400 dark:text-purple-500 text-center">You're all caught up</p>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => markAsRead(notif._id)}
                            className="w-full text-left p-4 border-b border-purple-50 dark:border-purple-900/20 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex gap-3"
                          >
                            <div className="p-2 rounded-xl flex-shrink-0 h-9 w-9 flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                              <Bell size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">{notif.title}</p>
                              <p className="text-xs text-purple-500 dark:text-purple-400 mt-0.5 line-clamp-2">{notif.message}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-purple-200 dark:bg-purple-900/50" />

              <Link href="/doctor/settings" className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200 transition-colors">
                <Settings size={20} />
              </Link>

              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">
                <LogOut size={20} />
              </button>

              <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-purple-300 dark:border-purple-700 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shrink-0 select-none">
                {profileImage && !imageError ? (
                  <img src={profileImage} alt="Avatar" className="h-full w-full object-cover" onError={() => setImageError(true)} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-purple-600 dark:text-purple-400 p-1"
              >
                <Bell size={24} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-purple-700 dark:text-purple-300">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#f3e8ff] dark:bg-[#1c0a38] border-t border-purple-200 dark:border-purple-900/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-purple-800 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                >
                  <link.icon size={20} /> {link.name}
                </Link>
              ))}
              <div className="border-t border-purple-200 dark:border-purple-900/50 my-2 pt-2">
                <Link href="/doctor/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-purple-800 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/20">
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
            className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} pointer-events-auto w-80 bg-white dark:bg-[#230d42] rounded-xl shadow-2xl border border-purple-200 dark:border-purple-800 flex gap-3 p-4`}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 leading-tight">{toast.title}</p>
              <p className="text-xs text-purple-500 dark:text-purple-400 mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-purple-300 hover:text-purple-600 dark:hover:text-purple-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
