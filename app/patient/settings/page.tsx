"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation'; // Added router for deletion redirect
import { User, Shield, Palette, Activity, Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setMounted(true);
    const fetchUserData = async () => {
      const patientId = localStorage.getItem('patientId');
      if (!patientId) return;

      try {
        const response = await fetch(`/api/users/${patientId}`);
        if (response.ok) {
          const data = await response.json();
          setFirstName(data.firstname || '');
          setLastName(data.lastname || '');
          setEmail(data.email || '');
          setHeight(data.height?.toString() || '');
          setWeight(data.weight?.toString() || '');
        }
      } catch (error) {
        console.error("Failed to load user settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const patientId = localStorage.getItem('patientId');

    try {
      const response = await fetch(`/api/users/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastname: lastName, // Only sending allowed fields
          height: Number(height),
          weight: Number(weight),
        }),
      });

      if (response.ok) {
        localStorage.setItem('patientName', `${firstName} ${lastName}`);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaving(true);
    const patientId = localStorage.getItem('patientId');

    try {
      const response = await fetch(`/api/users/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        alert('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        const data = await response.json();
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch (error) {
      setPasswordError('An error occurred while saving.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This will permanently delete your account and medical records. This action cannot be undone.")) return;
    
    const patientId = localStorage.getItem('patientId');
    try {
      const response = await fetch(`/api/users/${patientId}`, { method: 'DELETE' });
      if (response.ok) {
        localStorage.clear();
        router.push('/auth/register');
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Deletion error:", error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: User },
    { id: 'security', name: 'Security & Password', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  if (loading) return <div className="p-8 text-gray-500">Loading settings...</div>;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and personal data.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                  isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} /> {tab.name}
              </button>
            );
          })}
        </aside>

        <div className="flex-1 max-w-3xl">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
             <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Personal Information</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name (Unchangeable)</label>
                   {/* GOAL 1 FIX: Disabled Input State */}
                   <input type="text" disabled value={firstName} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                   <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                     Email <Shield size={14} className="text-gray-400" />
                   </label>
                   <input type="email" value={email} disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" />
                 </div>
               </div>
               
               <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 pt-4 flex items-center gap-2">
                 <Activity size={20}/> Health Vitals
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                   <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                   <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
               </div>
               <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                 {saving ? 'Saving...' : 'Save Changes'}
               </button>
             </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Change Password</h2>
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button type="submit" disabled={passwordSaving} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>

              <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Delete Account</h3>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">Permanently remove your account and data.</p>
                </div>
                <button onClick={handleDeleteAccount} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
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