"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { User, Shield, Palette, Stethoscope, Sun, Moon, Monitor } from 'lucide-react';

export default function DoctorSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: 'profile', name: 'Professional Profile', icon: Stethoscope },
    { id: 'account', name: 'Account Details', icon: User },
    { id: 'security', name: 'Security & Password', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Provider Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your public profile, specialization, and preferences.</p>
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
                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' 
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
          
          {/* PROFESSIONAL PROFILE TAB (Specific to Doctors) */}
          {activeTab === 'profile' && (
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Public Profile</h2>
             
             <div className="space-y-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                 <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer">
                    <option>Cardiology</option>
                    <option>Dermatology</option>
                    <option>General Practice</option>
                    <option>Neurology</option>
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Bio</label>
                 <textarea 
                   rows={4} 
                   defaultValue="Expert in cardiovascular health with 15+ years of clinical experience." 
                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                 ></textarea>
                 <p className="text-xs text-gray-500 mt-1">This will be displayed to patients when they browse doctors.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                   <input type="number" defaultValue="15" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Number</label>
                   <input type="text" defaultValue="MD-98234-XYZ" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                 </div>
               </div>
             </div>
             
             <button className="bg-violet-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-violet-700 transition-colors">Update Profile</button>
           </div>
          )}

          {/* ACCOUNT DETAILS TAB */}
          {activeTab === 'account' && (
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Personal Details</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                 <input type="text" defaultValue="Sarah" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                 <input type="text" defaultValue="Jenkins" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                   Professional Email <Shield size={14} className="text-gray-400" />
                 </label>
                 <input type="email" value="dr.jenkins@healthapp.com" disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                   Contact Number <Shield size={14} className="text-gray-400" />
                 </label>
                 <input type="tel" value="+1 (555) 888-0021" disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" />
               </div>
             </div>
             <button className="bg-violet-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-violet-700 transition-colors">Save Changes</button>
           </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && mounted && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Theme Preferences</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Customize your dashboard appearance.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                    theme === 'light' 
                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Sun size={32} className={`mb-3 ${theme === 'light' ? 'text-violet-600' : 'text-gray-500'}`} />
                  <span className={`font-semibold ${theme === 'light' ? 'text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>Light Mode</span>
                </button>

                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                    theme === 'dark' 
                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Moon size={32} className={`mb-3 ${theme === 'dark' ? 'text-violet-600' : 'text-gray-500'}`} />
                  <span className={`font-semibold ${theme === 'dark' ? 'text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>Dark Mode</span>
                </button>

                <button 
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                    theme === 'system' 
                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Monitor size={32} className={`mb-3 ${theme === 'system' ? 'text-violet-600' : 'text-gray-500'}`} />
                  <span className={`font-semibold ${theme === 'system' ? 'text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>System</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}