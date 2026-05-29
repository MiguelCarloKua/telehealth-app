"use client";

import Link from 'next/link';
import { Video, Users, FileSignature, Clock, User, CalendarDays, ClipboardList, Plus, ChevronRight, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/utils/api';

interface PatientType {
  _id: string;
  firstname: string;
  lastname: string;
  email?: string;
  profileImage?: string;
}

interface Appointment {
  _id: string;
  patient: PatientType | null;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: string;
  type?: string;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function DoctorDashboard() {
  const [scheduled, setScheduled] = useState<Appointment[]>([]);
  const [completed, setCompleted] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('Doctor');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorId = sessionStorage.getItem('doctorId');
        if (!doctorId) return;

        const [docUser, scheduledData, completedData] = await Promise.all([
          fetch(`/api/users/${doctorId}`).then(r => r.json()),
          apiCall(`/appointments?doctorId=${doctorId}&status=scheduled`),
          apiCall(`/appointments?doctorId=${doctorId}&status=completed`),
        ]);

        if (docUser?.lastname) setDoctorName(`Dr. ${docUser.lastname}`);
        setScheduled(scheduledData || []);
        setCompleted(completedData || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const todayAppointments = scheduled.filter(a => isToday(a.scheduledDate));
  const upcomingAppointments = scheduled.filter(a => !isToday(a.scheduledDate)).slice(0, 4);
  const nextAppointment = todayAppointments[0] ?? null;
  const recentCompleted = completed.slice(0, 4);

  const quickActions = [
    { label: 'My Patients', href: '/doctor/patients', icon: Users, color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
    { label: 'Schedule', href: '/doctor/schedule', icon: CalendarDays, color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
    { label: 'Consultations', href: '/doctor/consultations', icon: Stethoscope, color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
    { label: 'Write Note', href: '/doctor/patients', icon: Plus, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100">
          {getGreeting()}, {doctorName}
        </h1>
        <p className="text-purple-500 dark:text-purple-400 mt-1">
          {loading ? 'Loading...' : `${todayAppointments.length} consultation${todayAppointments.length !== 1 ? 's' : ''} today`}
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#230d42] p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-400 dark:text-purple-500 uppercase tracking-wide">Today's Patients</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{loading ? '—' : todayAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#230d42] p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <FileSignature size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-400 dark:text-purple-500 uppercase tracking-wide">Upcoming</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{loading ? '—' : scheduled.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#230d42] p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-400 dark:text-purple-500 uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{loading ? '—' : completed.length}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Up Next — spans 2 cols */}
        <div className="lg:col-span-2 space-y-4">

          {/* Next appointment hero */}
          <div className="bg-white dark:bg-[#230d42] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm">
            <h2 className="text-base font-bold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-purple-500" /> Up Next
            </h2>
            {loading ? (
              <div className="h-24 bg-purple-50 dark:bg-purple-900/20 rounded-xl animate-pulse" />
            ) : nextAppointment ? (
              <div className="bg-[#faf5ff] dark:bg-[#1c0a38] rounded-xl p-5 border border-purple-100 dark:border-purple-900/40">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-purple-200 dark:bg-purple-900/60 flex items-center justify-center border-2 border-purple-300 dark:border-purple-700 overflow-hidden shrink-0 text-purple-600 dark:text-purple-300">
                      {nextAppointment.patient?.profileImage ? (
                        <img src={nextAppointment.patient.profileImage} alt="Patient" className="h-full w-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900 dark:text-purple-100">
                        {nextAppointment.patient
                          ? `${nextAppointment.patient.firstname} ${nextAppointment.patient.lastname}`
                          : 'Unknown Patient'}
                      </h3>
                      <p className="text-sm text-purple-500 dark:text-purple-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {nextAppointment.startTime} – {nextAppointment.endTime}
                      </p>
                    </div>
                  </div>
                  <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full shrink-0">
                    UP NEXT
                  </span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-5 bg-white dark:bg-[#2d1058] p-3 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <span className="font-semibold">Reason:</span> {nextAppointment.reason || 'General Consultation'}
                </p>
                <div className="flex gap-3">
                  <Link
                    href={`/doctor/consultations/${nextAppointment._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Video size={16} /> Join Session
                  </Link>
                  {nextAppointment.patient && (
                    <Link
                      href={`/doctor/patients/${nextAppointment.patient._id}/records`}
                      className="px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2"
                    >
                      <ClipboardList size={16} /> Records
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                <CalendarDays size={36} className="text-purple-300 dark:text-purple-700 mb-3" />
                <p className="text-purple-500 dark:text-purple-400 font-medium">No consultations scheduled for today</p>
                <Link href="/doctor/schedule" className="mt-3 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                  Manage Schedule →
                </Link>
              </div>
            )}
          </div>

          {/* Today's full schedule */}
          <div className="bg-white dark:bg-[#230d42] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <CalendarDays size={16} className="text-purple-500" /> Today's Schedule
              </h2>
              <Link href="/doctor/schedule" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-14 bg-purple-50 dark:bg-purple-900/20 rounded-xl animate-pulse" />)}
              </div>
            ) : todayAppointments.length === 0 ? (
              <p className="text-sm text-purple-400 dark:text-purple-500 py-3">No appointments today.</p>
            ) : (
              <div className="space-y-2">
                {todayAppointments.map((apt, idx) => (
                  <div
                    key={apt._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      idx === 0
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                        : 'bg-[#faf5ff] dark:bg-[#1c0a38]/50 border-purple-100 dark:border-purple-900/30'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-purple-200 dark:bg-purple-900/60 flex items-center justify-center overflow-hidden shrink-0 text-purple-600 dark:text-purple-300 text-xs font-bold">
                      {apt.patient?.profileImage ? (
                        <img src={apt.patient.profileImage} alt="" className="h-full w-full object-cover" />
                      ) : apt.patient ? (
                        `${apt.patient.firstname[0]}${apt.patient.lastname[0]}`
                      ) : <User size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">
                        {apt.patient ? `${apt.patient.firstname} ${apt.patient.lastname}` : 'Unknown'}
                      </p>
                      <p className="text-xs text-purple-400 dark:text-purple-500">{apt.startTime} – {apt.endTime}</p>
                    </div>
                    <span className="text-xs font-medium text-purple-500 dark:text-purple-400 shrink-0">
                      {apt.type?.replace('_', ' ') ?? 'Consultation'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#230d42] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm">
            <h2 className="text-base font-bold text-purple-900 dark:text-purple-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, href, icon: Icon, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#faf5ff] dark:bg-[#1c0a38]/60 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-100 dark:border-purple-900/30 transition-colors group text-center"
                >
                  <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-semibold text-purple-800 dark:text-purple-200">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming (non-today) */}
          <div className="bg-white dark:bg-[#230d42] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-purple-900 dark:text-purple-100">Upcoming</h2>
              <Link href="/doctor/schedule" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                See all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl animate-pulse" />)}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-purple-400 dark:text-purple-500">No upcoming appointments.</p>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map(apt => (
                  <div key={apt._id} className="flex items-center gap-3 p-3 rounded-xl bg-[#faf5ff] dark:bg-[#1c0a38]/50 border border-purple-100 dark:border-purple-900/30">
                    <div className="shrink-0 text-center min-w-10">
                      <p className="text-[10px] font-bold text-purple-400 uppercase">
                        {new Date(apt.scheduledDate).toLocaleDateString('en', { month: 'short' })}
                      </p>
                      <p className="text-lg font-bold text-purple-800 dark:text-purple-200 leading-tight">
                        {new Date(apt.scheduledDate).getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">
                        {apt.patient ? `${apt.patient.firstname} ${apt.patient.lastname}` : 'Unknown'}
                      </p>
                      <p className="text-xs text-purple-400">{apt.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#230d42] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-green-500" /> Recent Activity
              </h2>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl animate-pulse" />)}
              </div>
            ) : recentCompleted.length === 0 ? (
              <p className="text-sm text-purple-400 dark:text-purple-500">No completed consultations yet.</p>
            ) : (
              <div className="space-y-2">
                {recentCompleted.map(apt => (
                  <div key={apt._id} className="flex items-center gap-3 p-3 rounded-xl bg-[#faf5ff] dark:bg-[#1c0a38]/50 border border-purple-100 dark:border-purple-900/30">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">
                        {apt.patient ? `${apt.patient.firstname} ${apt.patient.lastname}` : 'Unknown'}
                      </p>
                      <p className="text-xs text-purple-400">
                        {new Date(apt.scheduledDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · Completed
                      </p>
                    </div>
                    {apt.patient && (
                      <Link
                        href={`/doctor/patients/${apt.patient._id}/records`}
                        className="shrink-0 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Notes
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
