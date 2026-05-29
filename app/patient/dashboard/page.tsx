"use client";

import Link from 'next/link';
import { Sparkles, Video, Activity, Pill, Bell, ChevronRight, Stethoscope, FileText, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/utils/api';

interface Appointment {
  _id: string;
  doctor: { firstname: string; lastname: string; specialty: string };
  scheduledDate: string;
  startTime: string;
}

interface Prescription {
  _id: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  doctor: { firstname?: string; lastname?: string; name?: string };
  status: string;
}

interface PatientVitals {
  height: number;
  weight: number;
  bloodType?: string;
}

interface Notif {
  _id: string;
  title: string;
  message: string;
}

export default function PatientDashboard() {
  const [vitals, setVitals] = useState<PatientVitals>({ height: 0, weight: 0 });
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [symptomQuery, setSymptomQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientId = sessionStorage.getItem('patientId');
        const storedName = sessionStorage.getItem('patientName');
        if (storedName) setPatientName(storedName.split(' ')[0]);
        if (!patientId) { window.location.href = '/auth/login'; return; }

        const [appointmentsData, prescriptionsData, notificationsData, userData] = await Promise.all([
          apiCall(`/appointments?patientId=${patientId}&status=scheduled`),
          apiCall(`/prescriptions?patientId=${patientId}&status=active`),
          apiCall(`/notifications?userId=${patientId}`),
          fetch(`/api/users/${patientId}`).then(r => r.json()),
        ]);

        setAppointments(appointmentsData || []);
        setPrescriptions(prescriptionsData || []);
        setNotifications(notificationsData || []);
        if (userData) {
          setVitals({
            height: userData.height || 0,
            weight: userData.weight || 0,
            bloodType: userData.bloodType || 'N/A',
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

  const nextAppointment = appointments[0] ?? null;
  const bmi = vitals.height && vitals.weight
    ? ((vitals.weight / (vitals.height * vitals.height)) * 10000).toFixed(1)
    : '—';

  const doctorDisplayName = (apt: Appointment) =>
    `Dr. ${apt.doctor.firstname} ${apt.doctor.lastname}`;

  const prescriptionDoctorName = (p: Prescription) =>
    p.doctor.name ?? `Dr. ${p.doctor.lastname ?? ''}`.trim();

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a] dark:text-blue-100">
            Welcome back, {patientName || 'there'}!
          </h1>
          <p className="text-[#2448c4] dark:text-blue-400 mt-1 opacity-70">Here is your health overview for today.</p>
        </div>
      </header>

      {/* Top Row: AI + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Symptom Checker */}
        <section className="lg:col-span-2 bg-linear-to-br from-[#e8eeff] to-[#cddbfe] dark:from-[#0c1840] dark:to-[#0f2060] rounded-2xl p-6 md:p-8 border border-blue-200 dark:border-[#1e3a8a]/40 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-[#1e3a8a] dark:text-blue-400" size={22} />
            <h2 className="text-xl font-bold text-[#1e3a8a] dark:text-blue-200">Not feeling well?</h2>
          </div>
          <p className="text-[#2448c4] dark:text-blue-400 mb-5 max-w-xl text-sm">
            Describe your symptoms and our AI will recommend the right specialist for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={symptomQuery}
              onChange={e => setSymptomQuery(e.target.value)}
              placeholder="E.g., I have a persistent headache and a slight fever..."
              className="flex-1 px-5 py-3 rounded-xl border border-blue-200 dark:border-[#1e3a8a]/50 bg-white/80 dark:bg-[#060d24]/80 backdrop-blur-sm text-[#1e3a8a] dark:text-blue-100 placeholder-blue-300 dark:placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-[#2448c4] shadow-sm"
            />
            <Link
              href={symptomQuery ? `/patient/ai?q=${encodeURIComponent(symptomQuery)}` : '/patient/ai'}
              className="bg-[#1e3a8a] hover:bg-[#152870] text-white px-7 py-3 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap text-center"
            >
              Ask AI
            </Link>
          </div>
        </section>

        {/* Notifications Panel */}
        <section className="bg-white dark:bg-[#0e1e55] rounded-2xl p-6 border border-blue-100 dark:border-[#1e3a8a]/40 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-blue-100 flex items-center gap-2">
              <Bell size={16} className="text-[#2448c4] dark:text-blue-400" /> Recent Alerts
            </h2>
            {notifications.length > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {notifications.length} New
              </span>
            )}
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-blue-400 dark:text-blue-500 text-center py-4">You're all caught up!</p>
            ) : (
              notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif._id}
                  className="p-3 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl border-l-4 border-[#2448c4] dark:border-blue-600"
                >
                  <p className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-100">{notif.title}</p>
                  <p className="text-xs text-[#2448c4] dark:text-blue-400 mt-1 opacity-80">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Middle Row: Schedule + Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Appointment */}
        <div className="bg-white dark:bg-[#0e1e55] p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-[#1e3a8a]/40">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-blue-100 flex items-center gap-2">
              <Calendar size={16} className="text-[#2448c4] dark:text-blue-400" /> Upcoming Appointment
            </h2>
            <Link href="/patient/appointments" className="text-[#2448c4] dark:text-blue-400 text-sm font-medium hover:underline flex items-center">
              View all <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="h-20 bg-blue-50 dark:bg-blue-900/20 rounded-xl animate-pulse" />
          ) : nextAppointment ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl border border-blue-100 dark:border-[#1e3a8a]/30">
              <div className="bg-white dark:bg-[#0e1e55] p-3 rounded-xl shadow-sm text-center min-w-16 border border-blue-100 dark:border-[#1e3a8a]/30">
                <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                  {new Date(nextAppointment.scheduledDate).toLocaleDateString('en', { month: 'short' })}
                </div>
                <div className="text-2xl font-extrabold text-[#1e3a8a] dark:text-blue-100">
                  {new Date(nextAppointment.scheduledDate).getDate()}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1e3a8a] dark:text-blue-100">{doctorDisplayName(nextAppointment)}</h3>
                <p className="text-sm text-[#2448c4] dark:text-blue-400 mt-0.5">
                  {nextAppointment.doctor.specialty} · {nextAppointment.startTime}
                </p>
              </div>
              <Link
                href={`/patient/consultations/${nextAppointment._id}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                <Video size={16} /> Join Call
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl border border-blue-100 dark:border-[#1e3a8a]/30">
              <Calendar size={32} className="text-blue-200 dark:text-blue-800 mb-2" />
              <p className="text-[#2448c4] dark:text-blue-400 text-sm">No upcoming appointments</p>
              <Link href="/patient/doctors" className="mt-2 text-sm font-semibold text-[#1e3a8a] dark:text-blue-400 hover:underline">
                Find a Doctor →
              </Link>
            </div>
          )}
        </div>

        {/* Health Vitals */}
        <div className="bg-white dark:bg-[#0e1e55] p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-[#1e3a8a]/40">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-blue-100 flex items-center gap-2">
              <Activity size={16} className="text-[#2448c4] dark:text-blue-400" /> Health Vitals
            </h2>
            <Link href="/patient/settings" className="text-sm font-medium text-[#2448c4] dark:text-blue-400 hover:underline">
              Update
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl text-center border border-blue-100 dark:border-[#1e3a8a]/30">
              <p className="text-xs text-[#2448c4] dark:text-blue-400 font-medium mb-1">Height</p>
              <p className="text-xl font-bold text-[#1e3a8a] dark:text-blue-100">
                {vitals.height || '—'}<span className="text-xs font-normal text-blue-400"> cm</span>
              </p>
            </div>
            <div className="p-4 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl text-center border border-blue-100 dark:border-[#1e3a8a]/30">
              <p className="text-xs text-[#2448c4] dark:text-blue-400 font-medium mb-1">Weight</p>
              <p className="text-xl font-bold text-[#1e3a8a] dark:text-blue-100">
                {vitals.weight || '—'}<span className="text-xs font-normal text-blue-400"> kg</span>
              </p>
            </div>
            <div className="p-4 bg-[#cddbfe] dark:bg-[#1e3a8a]/30 rounded-xl text-center border border-[#a4c0fb] dark:border-[#1e3a8a]/50">
              <p className="text-xs text-[#1e3a8a] dark:text-blue-300 font-semibold mb-1">BMI</p>
              <p className="text-xl font-bold text-[#1e3a8a] dark:text-blue-200">{bmi}</p>
            </div>
          </div>
          {vitals.bloodType && vitals.bloodType !== 'N/A' && (
            <div className="mt-3 flex items-center justify-between p-3 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl border border-blue-100 dark:border-[#1e3a8a]/30">
              <span className="text-xs font-medium text-[#2448c4] dark:text-blue-400">Blood Type</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{vitals.bloodType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Prescriptions + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Active Prescriptions */}
        <div className="bg-white dark:bg-[#0e1e55] p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-[#1e3a8a]/40">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-blue-100 flex items-center gap-2">
              <Pill size={16} className="text-[#2448c4] dark:text-blue-400" /> Active Prescriptions
            </h2>
            <Link href="/patient/records" className="text-sm font-medium text-[#2448c4] dark:text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl animate-pulse" />)}
              </div>
            ) : prescriptions.length > 0 ? (
              prescriptions.map((prescription) =>
                prescription.medications.map((med, idx) => (
                  <div
                    key={`${prescription._id}-${idx}`}
                    className="flex justify-between items-center p-3 rounded-xl bg-[#f0f4ff] dark:bg-[#0c1840] border border-blue-100 dark:border-[#1e3a8a]/30 hover:border-[#2448c4]/40 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-[#1e3a8a] dark:text-blue-100 text-sm">{med.name} <span className="font-normal text-blue-400">({med.dosage})</span></p>
                      <p className="text-xs text-blue-400 mt-0.5">{med.frequency} · {prescriptionDoctorName(prescription)}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">
                      ACTIVE
                    </span>
                  </div>
                ))
              )
            ) : (
              <p className="text-sm text-blue-400 dark:text-blue-500 py-2">No active prescriptions</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#0e1e55] p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-[#1e3a8a]/40">
          <h2 className="text-base font-bold text-[#1e3a8a] dark:text-blue-100 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/patient/doctors"
              className="flex items-center gap-3 p-4 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 border border-blue-100 dark:border-[#1e3a8a]/30 group transition-all"
            >
              <div className="p-2 bg-white dark:bg-[#0e1e55] rounded-lg shadow-sm text-[#2448c4] dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Stethoscope size={18} />
              </div>
              <span className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-200">Find Doctor</span>
            </Link>
            <Link
              href="/patient/records"
              className="flex items-center gap-3 p-4 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 border border-blue-100 dark:border-[#1e3a8a]/30 group transition-all"
            >
              <div className="p-2 bg-white dark:bg-[#0e1e55] rounded-lg shadow-sm text-[#2448c4] dark:text-blue-400 group-hover:scale-110 transition-transform">
                <FileText size={18} />
              </div>
              <span className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-200">My Records</span>
            </Link>
            <Link
              href="/patient/appointments"
              className="flex items-center gap-3 p-4 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 border border-blue-100 dark:border-[#1e3a8a]/30 group transition-all"
            >
              <div className="p-2 bg-white dark:bg-[#0e1e55] rounded-lg shadow-sm text-[#2448c4] dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Calendar size={18} />
              </div>
              <span className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-200">Appointments</span>
            </Link>
            <Link
              href="/patient/doctors?book=1"
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-900/30 group transition-all"
            >
              <div className="p-2 bg-white dark:bg-[#0e1e55] rounded-lg shadow-sm text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                <Bell size={18} />
              </div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">Book Now</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
