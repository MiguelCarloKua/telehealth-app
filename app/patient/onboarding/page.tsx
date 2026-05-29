"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/utils/api';
import { Activity } from 'lucide-react';

export default function PatientOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    height: '',
    weight: '',
    allergies: '',
    medicalHistory: ''
  });

  useEffect(() => {
    // Security check
    if (!sessionStorage.getItem('patientId')) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const patientId = sessionStorage.getItem('patientId');

    try {
      // Format arrays
      const allergiesArray = formData.allergies.split(',').map(item => item.trim()).filter(Boolean);
      const historyArray = formData.medicalHistory.split(',').map(item => item.trim()).filter(Boolean);

      await fetch(`/api/users/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodType: formData.bloodType,
          height: Number(formData.height),
          weight: Number(formData.weight),
          allergies: formData.allergies.split(',').map(a => a.trim()),
          medicalHistory: formData.medicalHistory.split(',').map(h => h.trim()),
          // Add dateOfBirth and gender if they weren't passed during registration
        }),
      });

      // Once complete, route to dashboard
      router.push('/patient/dashboard');
    } catch (error) {
      console.error("Failed to save medical history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Baseline</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Help us personalize your care recommendations.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Type</label>
              <select required value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
              <input type="number" required value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
              <input type="number" required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies (comma separated)</label>
            <input type="text" placeholder="Peanuts, Penicillin, None" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Existing Medical Conditions (comma separated)</label>
            <input type="text" placeholder="Asthma, Hypertension, None" value={formData.medicalHistory} onChange={e => setFormData({...formData, medicalHistory: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4">
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}