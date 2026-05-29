"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Loader2 } from 'lucide-react';

export default function PatientOnboarding() {
  const router = useRouter();
  const [checking, setChecking] = useState(true); // true = still verifying, hides the form
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    height: '',
    weight: '',
    allergies: '',
    medicalHistory: '',
  });

  useEffect(() => {
    const patientId = sessionStorage.getItem('patientId');
    if (!patientId) {
      router.replace('/auth/login');
      return;
    }

    // Check whether this patient has already completed onboarding.
    // Keep the form hidden (checking = true) until the response arrives so
    // there is never a flash of the form for users who are already onboarded.
    fetch(`/api/users/${patientId}`)
      .then(r => r.json())
      .then(data => {
        if (data.height > 0 && data.bloodType) {
          // Already onboarded — redirect silently without ever showing the form
          router.replace('/patient/dashboard');
        } else {
          // Not yet onboarded — reveal the form
          setChecking(false);
        }
      })
      .catch(() => {
        // On fetch error, show the form so the user isn't stuck on a blank screen
        setChecking(false);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const patientId = sessionStorage.getItem('patientId');

    try {
      await fetch(`/api/users/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodType: formData.bloodType,
          height: Number(formData.height),
          weight: Number(formData.weight),
          allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
          medicalHistory: formData.medicalHistory.split(',').map(h => h.trim()).filter(Boolean),
        }),
      });

      router.push('/patient/dashboard');
    } catch (error) {
      console.error('Failed to save medical history:', error);
    } finally {
      setSaving(false);
    }
  };

  // Show a full-screen spinner while we verify — no form flash
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 size={28} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Baseline</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Help us personalise your care recommendations.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Type</label>
              <select required value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
              <input type="number" required min="50" max="300" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
              <input type="number" required min="10" max="500" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies <span className="font-normal text-gray-400">(comma separated)</span></label>
            <input type="text" placeholder="Peanuts, Penicillin, None" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Existing Medical Conditions <span className="font-normal text-gray-400">(comma separated)</span></label>
            <input type="text" placeholder="Asthma, Hypertension, None" value={formData.medicalHistory} onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
