"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { User, Shield, Palette, Stethoscope, Sun, Moon, Monitor, Camera, Tags } from 'lucide-react';

export default function DoctorSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Submission States
  const [profileSaving, setProfileSaving] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Account Details State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Professional Profile State
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [expertiseTags, setExpertiseTags] = useState(''); // NEW: For AI matching

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setMounted(true);
    const fetchUserData = async () => {
      const doctorId = sessionStorage.getItem('doctorId');
      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${doctorId}`);
        if (response.ok) {
          const data = await response.json();
          // Account
          setFirstName(data.firstname || '');
          setLastName(data.lastname || '');
          setEmail(data.email || '');
          setPhoneNumber(data.phoneNumber || '');
          setProfileImage(data.profileImage || '');
          
          // Professional
          setSpecialty(data.specialty || '');
          setBio(data.bio || '');
          setExperience(data.experience?.toString() || '');
          setLicenseNumber(data.licenseNumber || '');
          setExpertiseTags(data.expertiseTags?.join(', ') || ''); // Convert array to string
        }
      } catch (err) {
        console.error("Failed to load doctor settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfessionalProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      const doctorId = sessionStorage.getItem('doctorId');
      
      // ADD THIS SAFEGUARD:
      if (!doctorId || doctorId === 'null') {
        setError('Session data lost. Please log out and log back in.');
        return;
      }

      setProfileSaving(true);
      setError('');

    // Convert comma-separated string back to an array of trimmed tags
    const tagsArray = expertiseTags.split(',').map(tag => tag.trim()).filter(Boolean);

    try {
      const response = await fetch(`/api/users/${doctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty,
          bio,
          experience: Number(experience),
          expertiseTags: tagsArray, // Send array to backend
        }),
      });

      if (response.ok) {
        alert('Professional profile updated successfully!');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveAccountDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSaving(true);
    setError('');
    const doctorId = sessionStorage.getItem('doctorId');

    try {
      const response = await fetch(`/api/users/${doctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          profileImage,
        }),
      });

      if (response.ok) {
        sessionStorage.setItem('doctorName', `${firstName} ${lastName}`);
        alert('Account details updated successfully!');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update account details');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setAccountSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaving(true);
    const doctorId = sessionStorage.getItem('doctorId');

    try {
      const response = await fetch(`/api/users/${doctorId}`, {
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
    } catch (err) {
      setPasswordError('An error occurred while saving.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This will permanently delete your doctor account and schedule.")) return;
    
    const doctorId = sessionStorage.getItem('doctorId');
    try {
      const response = await fetch(`/api/users/${doctorId}`, { method: 'DELETE' });
      
      if (response.ok) {
        await fetch('/api/auth/logout', { method: 'POST' });
        sessionStorage.clear();
        window.location.href = '/auth/register'; 
      }
    } catch (err) {
      console.error("Deletion error:", err);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Professional Profile', icon: Stethoscope },
    { id: 'account', name: 'Account Details', icon: User },
    { id: 'security', name: 'Security & Password', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  // Skeleton Loader for better UX
  if (loading) {
    return (
      <div className="p-6 md:p-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mb-8"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
            ))}
          </div>
          <div className="flex-1 h-[500px] bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

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
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                  setPasswordError('');
                }}
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
          
          {/* PROFESSIONAL PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfessionalProfile} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Public Profile</h2>
              
              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                  <input 
                    type="text" 
                    required 
                    value={specialty} 
                    onChange={e => setSpecialty(e.target.value)} 
                    placeholder="e.g. Cardiology"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Tags size={16} className="text-gray-400"/> Expertise Tags
                  </label>
                  <input 
                    type="text" 
                    value={expertiseTags} 
                    onChange={e => setExpertiseTags(e.target.value)} 
                    placeholder="e.g. Migraines, Pediatrics, Fever, Hypertension"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate keywords with commas. This helps our AI recommend you to the right patients.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Bio</label>
                  <textarea 
                    rows={4} 
                    required
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Describe your expertise, background, and clinical experience..." 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">This will be displayed directly on your public booking page.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      value={experience} 
                      onChange={e => setExperience(e.target.value)} 
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                      License Number <Shield size={14} className="text-gray-400" />
                    </label>
                    <input 
                      type="text" 
                      disabled 
                      value={licenseNumber} 
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>
              
              <button type="submit" disabled={profileSaving} className="bg-violet-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
                {profileSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          )}

          {/* ACCOUNT DETAILS TAB */}
          {activeTab === 'account' && (
             <form onSubmit={handleSaveAccountDetails} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Personal Details</h2>
               
               {error && <p className="text-sm text-red-500">{error}</p>}

               <div className="flex items-center gap-6 pb-4">
                 <div className="h-20 w-20 rounded-full flex items-center justify-center font-bold overflow-hidden border border-violet-200 dark:border-violet-700 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400 text-2xl">
                   {profileImage ? (
                     <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                   ) : (
                     firstName.charAt(0) + lastName.charAt(0)
                   )}
                 </div>
                 <div>
                   <label className="flex items-center gap-2 cursor-pointer bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-4 py-2 rounded-lg font-medium hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors">
                     <Camera size={18} /> Change Picture
                     <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                   </label>
                   <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                   <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                   <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                     Professional Email <Shield size={14} className="text-gray-400" />
                   </label>
                   <input type="email" value={email} disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                     Contact Number <Shield size={14} className="text-gray-400" />
                   </label>
                   <input type="tel" value={phoneNumber} disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 cursor-not-allowed" />
                 </div>
               </div>
               <button type="submit" disabled={accountSaving} className="bg-violet-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
                 {accountSaving ? 'Saving...' : 'Save Changes'}
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
                    <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
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