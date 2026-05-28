"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // <-- Added useRouter
import { Menu, X, LayoutDashboard, Stethoscope, Calendar, FileText, Settings, LogOut, Bell, Info } from 'lucide-react';
import { apiCall } from '@/lib/utils/api'; 

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [initials, setInitials] = useState('U'); // Dynamic initials
  
  const pathname = usePathname();
  const router = useRouter(); // <-- Initialized router

  const navLinks = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Find a Doctor', href: '/patient/doctors', icon: Stethoscope },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Records', href: '/patient/records', icon: FileText },
  ];

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      // 1. Tell the backend to destroy the secure cookies
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // 2. Clear frontend local storage
      localStorage.removeItem('patientId');
      localStorage.removeItem('patientName');
      
      // 3. Push to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // --- BFCache / BACK BUTTON PROTECTION ---
  useEffect(() => {
    const checkAuth = () => {
      const patientId = localStorage.getItem('patientId');
      if (!patientId) {
        // Use replace instead of push so they can't hit 'forward' again
        router.replace('/auth/login'); 
      }
    };

    // Check immediately on mount
    checkAuth();

    // Listen for the user returning to the tab or using the Back button
    window.addEventListener('pageshow', checkAuth);
    window.addEventListener('focus', checkAuth);

    return () => {
      window.removeEventListener('pageshow', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, [router]);
  
  // --- INITIAL LOAD & POLLING LOGIC ---
  useEffect(() => {
    // Set dynamic initials from local storage
    const storedName = localStorage.getItem('patientName');
    if (storedName) {
      const parts = storedName.split(' ');
      const init = parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '');
      setInitials(init.toUpperCase());
    }

    const fetchNotifications = async () => {
      const patientId = localStorage.getItem('patientId'); 
      if (!patientId) return;

      try {
        const data = await apiCall(`/notifications?userId=${patientId}`);
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Stethoscope size={24} />
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 hidden sm:block">HealthApp</span>
            </div>

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
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} /> {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                         <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">No new notifications</p>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif._id} className="p-4 border-b border-gray-50 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer flex gap-3">
                            <div className="p-2 rounded-xl flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-500">
                              <Info size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{notif.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
              <Link href="/patient/settings" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Settings size={20} />
              </Link>
              
              {/* --- FIX: Desktop Logout Button --- */}
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">
                <LogOut size={20} />
              </button>

              {/* Dynamic Initials */}
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-700">
                {initials}
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button className="relative text-gray-600 dark:text-gray-300 p-1">
                <Bell size={24} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <link.icon size={20} /> {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                <Link href="/patient/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Settings size={20} /> Settings
                </Link>
                
                {/* --- FIX: Mobile Logout Button --- */}
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
    </div>
  );
}