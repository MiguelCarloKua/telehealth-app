"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { User, Shield, Palette, Trash2, Activity, Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: User },
    { id: 'security', name: 'Security & Password', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    // Removed Notifications Tab as requested
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and personal data.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} /> {tab.name}
              </button>
            );
          })}
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 max-w-3xl">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Personal Information</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                 <input type="text" defaultValue="Alex" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                 <input type="text" defaultValue="Smith" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                   Email <Shield size={14} className="text-gray-400" />
                 </label>
                 <input type="email" value="alex@example.com" disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                   Contact Number <Shield size={14} className="text-gray-400" />
                 </label>
                 <input type="tel" value="+1 (555) 019-2834" disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" />
               </div>
             </div>
             
             <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 pt-4 flex items-center gap-2">
               <Activity size={20}/> Health Vitals
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                 <input type="number" defaultValue="70" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                 <input type="number" defaultValue="175" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
             </div>
             <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">Save Changes</button>
           </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none" />
                  </div>
                  <button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-xl font-semibold hover:bg-gray-800 transition-colors">Update Password</button>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Delete Account</h3>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">Permanently remove your account and data.</p>
                </div>
                <button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">Delete Account</button>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && mounted && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Theme Preferences</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Choose how HealthApp looks to you. Select a single theme, or sync with your system and automatically switch between day and night.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Light Mode Button */}
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                    theme === 'light' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Sun size={32} className={`mb-3 ${theme === 'light' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`font-semibold ${theme === 'light' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>Light Mode</span>
                </button>

                {/* Dark Mode Button */}
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                    theme === 'dark' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Moon size={32} className={`mb-3 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`font-semibold ${theme === 'dark' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>Dark Mode</span>
                </button>

                {/* System Mode Button */}
                <button 
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                    theme === 'system' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Monitor size={32} className={`mb-3 ${theme === 'system' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`font-semibold ${theme === 'system' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>System</span>
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}