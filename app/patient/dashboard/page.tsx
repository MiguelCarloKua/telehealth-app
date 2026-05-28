"use client";

import Link from 'next/link';
import { Sparkles, Video, Activity, Pill, Bell, ChevronRight, Stethoscope, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/utils/api';

interface Appointment {
  _id: string;
  doctor: { name: string; specialty: string };
  scheduledDate: string;
  startTime: string;
}

interface Prescription {
  _id: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  doctor: { name: string };
  status: string;
}

interface PatientVitals {
  height?: number;
  weight?: number;
  bloodType?: string;
}

export default function PatientDashboard() {
  const [vitals, setVitals] = useState<PatientVitals>({
    height: 0,
    weight: 0,
  });
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const patientId = localStorage.getItem('patientId');
        // Inside your useEffect
        const storedName = localStorage.getItem('patientName');
        // If storedName is null, try to fetch it from the userData object
        if (storedName) {
          setPatientName(storedName.split(' ')[0]);
        }
        if (!patientId) return;

          // Fetch everything in parallel, including the User profile for vitals
          const [appointmentsData, prescriptionsData, notificationsData, userData] = await Promise.all([
            apiCall(`/appointments?patientId=${patientId}&status=scheduled`),
            apiCall(`/prescriptions?patientId=${patientId}&status=active`),
            apiCall(`/notifications?userId=${patientId}`),
            fetch(`/api/users/${patientId}`).then(res => res.json()) // NEW: Fetch User Profile
          ]);

          setAppointments(appointmentsData);
          setPrescriptions(prescriptionsData);
          setNotifications(notificationsData);
          
          // NEW: Sync database vitals to dashboard state
          if (userData) {
            setVitals({
              height: userData.height || 0,
              weight: userData.weight || 0,
              bloodType: userData.bloodType || 'N/A' // Added this
            });
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

  // 2. Update your useEffect's Promise.all to fetch the notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientId = localStorage.getItem('patientId');
        if (!patientId) return;
        
        // Add the notifications API call here
        const [appointmentsData, prescriptionsData, notificationsData] = await Promise.all([
          apiCall(`/appointments?patientId=${patientId}&status=scheduled`),
          apiCall(`/prescriptions?patientId=${patientId}&status=active`),
          apiCall(`/notifications?userId=${patientId}`)
        ]);

        setAppointments(appointmentsData);
        setPrescriptions(prescriptionsData);
        setNotifications(notificationsData); // Save to state
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextAppointment = appointments[0];
  const bmi = vitals.height && vitals.weight ? ((vitals.weight / (vitals.height * vitals.height)) * 10000).toFixed(1) : '0';
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {patientName}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here is your health overview for today.</p>
        </div>
      </header>

      {/* Top Row: AI & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Symptom Checker (Spans 2 columns on large screens) */}
        <section className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-2xl p-6 md:p-8 border border-blue-100 dark:border-blue-900/30 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300">Not feeling well?</h2>
          </div>
          <p className="text-blue-700 dark:text-blue-400/80 mb-6 max-w-xl text-sm md:text-base">
            Describe your symptoms, and our AI will instantly recommend the right specialist for your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="E.g., I have a persistent headache and a slight fever..." 
              className="flex-1 px-5 py-4 rounded-xl border border-white/50 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
              Ask AI
            </button>
          </div>
        </section>

        {/* Notifications Panel */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={18} className="text-gray-500" /> Recent Alerts
            </h2>
            {/* Dynamic Badge: Only shows if there are notifications */}
            {notifications.length > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">
                {notifications.length} New
              </span>
            )}
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            
            {/* Dynamic List Rendering */}
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                You're all caught up!
              </p>
            ) : (
              // Use .slice(0, 3) to only show the 3 most recent alerts on the dashboard
              notifications.slice(0, 3).map((notif) => (
                <div key={notif._id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                </div>
              ))
            )}
            
          </div>
        </section>
      </div>

      {/* Middle Row: Schedule & Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Appointment */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Appointment</h2>
            <Link href="/patient/appointments" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center">
              View Calendar <ChevronRight size={16} />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">Loading appointment...</p>
            </div>
          ) : nextAppointment ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm text-center min-w-[70px] border border-gray-100 dark:border-gray-700">
                <div className="text-xs font-bold text-red-500 uppercase tracking-wider">May</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">28</div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{nextAppointment.doctor.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{nextAppointment.doctor.specialty} • {nextAppointment.startTime}</p>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                <Video size={18} /> Join Call
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
            </div>
          )}
        </div>

        {/* Health Vitals (Using required Registration data) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-blue-600 dark:text-blue-400" /> Health Vitals
            </h2>
            <Link href="/patient/settings" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <span className="text-sm">Update</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Height</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{vitals.height}<span className="text-sm text-gray-500 font-normal"> cm</span></p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Weight</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{vitals.weight}<span className="text-sm text-gray-500 font-normal"> kg</span></p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center border border-blue-100 dark:border-blue-900/30">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">BMI</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{bmi}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Prescriptions & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Prescriptions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Pill size={18} className="text-gray-500" /> Active Prescriptions
            </h2>
            <Link href="/patient/records" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading prescriptions...</p>
            ) : prescriptions.length > 0 ? (
              prescriptions.map((prescription) =>
                prescription.medications.map((med, idx) => (
                  <div key={`${prescription._id}-${idx}`} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{med.name} ({med.dosage})</p>
                      <p className="text-xs text-gray-500">{med.frequency} • {prescription.doctor.name}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">ACTIVE</span>
                  </div>
                ))
              )
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No active prescriptions</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/patient/doctors" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-gray-700 group transition-all">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Stethoscope size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Find Doctor</span>
            </Link>
            <Link href="/patient/records" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-gray-700 group transition-all">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <FileText size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">My Records</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}