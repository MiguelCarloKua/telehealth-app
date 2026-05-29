"use client";

import { useState, useEffect } from 'react';
import { Pill, Calendar, FileText, Activity, ClipboardList, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiCall } from '@/lib/utils/api';

type TabType = 'appointments' | 'medical-records' | 'prescriptions';

function EmptyState({ icon: Icon, title, message, action }: {
  icon: React.ElementType;
  title: string;
  message: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-[#e8eeff] dark:bg-[#0c1840] flex items-center justify-center">
        <Icon size={26} className="text-[#2448c4] dark:text-blue-400 opacity-60" />
      </div>
      <p className="font-semibold text-[#1e3a8a] dark:text-blue-200">{title}</p>
      <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-70 max-w-xs">{message}</p>
      {action && (
        <Link href={action.href} className="mt-2 px-4 py-2 bg-[#1e3a8a] hover:bg-[#152870] text-white text-sm font-semibold rounded-xl transition-colors">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      // FIX: was incorrectly using 'userId' — must be 'patientId'
      const patientId = sessionStorage.getItem('patientId');
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const [apptData, clinicalData, prescData] = await Promise.allSettled([
          apiCall(`/appointments?patientId=${patientId}`),
          apiCall(`/clinical-notes?patientId=${patientId}`),
          apiCall(`/prescriptions?patientId=${patientId}`),
        ]);

        setAppointments(apptData.status === 'fulfilled' ? (apptData.value ?? []) : []);
        setMedicalRecords(clinicalData.status === 'fulfilled' ? (clinicalData.value ?? []) : []);
        setPrescriptions(prescData.status === 'fulfilled' ? (prescData.value ?? []) : []);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const tabs = [
    { id: 'appointments' as const, label: 'Appointment History', icon: Calendar, count: appointments.length },
    { id: 'medical-records' as const, label: 'Medical Records', icon: FileText, count: medicalRecords.length },
    { id: 'prescriptions' as const, label: 'Prescriptions', icon: Pill, count: prescriptions.length },
  ];

  const statusStyle = (status: string) => {
    if (status === 'completed') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (status === 'cancelled') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (status === 'in_progress') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (status === 'active') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (status === 'expired') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a8a] dark:text-blue-100">Medical Records</h1>
        <p className="text-[#2448c4] dark:text-blue-400 opacity-70 mt-1">Access your consultations, medical records, and prescriptions.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 flex-wrap border-b border-blue-100 dark:border-[#1e3a8a]/40">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold transition-colors text-sm ${
              activeTab === id
                ? 'border-[#1e3a8a] dark:border-blue-400 text-[#1e3a8a] dark:text-blue-300'
                : 'border-transparent text-[#2448c4] dark:text-blue-500 hover:text-[#1e3a8a] dark:hover:text-blue-300'
            }`}
          >
            <Icon size={16} />
            {label}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === id
                  ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white'
                  : 'bg-[#e8eeff] dark:bg-[#0c1840] text-[#2448c4] dark:text-blue-400'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#0e1e55] rounded-2xl shadow-sm border border-blue-100 dark:border-[#1e3a8a]/40 overflow-hidden">
        {loading ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#2448c4] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#2448c4] dark:text-blue-400">Loading your records…</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
            <AlertCircle size={36} className="text-red-400" />
            <p className="font-semibold text-red-600 dark:text-red-400">Failed to load records</p>
            <p className="text-sm text-gray-500">Please refresh the page to try again.</p>
          </div>
        ) : activeTab === 'appointments' ? (
          appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointment history yet"
              message="Once you book and attend a consultation, it will appear here."
              action={{ label: 'Find a Doctor', href: '/patient/doctors' }}
            />
          ) : (
            <div className="divide-y divide-blue-50 dark:divide-[#1e3a8a]/20">
              {appointments.map((apt) => (
                <div key={apt._id} className="p-6 flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#e8eeff] dark:bg-[#0c1840] text-[#2448c4] dark:text-blue-400 rounded-xl shrink-0">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1e3a8a] dark:text-blue-100">
                        Dr. {apt.doctor?.firstname ?? '—'} {apt.doctor?.lastname ?? ''}
                      </h3>
                      <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-80 mt-0.5">
                        {apt.doctor?.specialty ?? 'Specialist'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(apt.scheduledDate).toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} · {apt.startTime} – {apt.endTime}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-medium">Reason:</span> {apt.reason || 'General Consultation'}
                      </p>
                      {apt.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium">Notes:</span> {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`self-start shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${statusStyle(apt.status)}`}>
                    {formatStatus(apt.status)}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'medical-records' ? (
          medicalRecords.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No medical records yet"
              message="After a consultation, your doctor can add clinical notes and findings which will appear here."
            />
          ) : (
            <div className="divide-y divide-blue-50 dark:divide-[#1e3a8a]/20">
              {medicalRecords.map((rec) => (
                <div key={rec._id} className="p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
                      <ClipboardList size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-[#1e3a8a] dark:text-blue-100">
                        Dr. {rec.doctor?.firstname ?? '—'} {rec.doctor?.lastname ?? ''}
                      </h3>
                      <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-80 mt-0.5">
                        {rec.doctor?.specialty ?? 'Specialist'} · {new Date(rec.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                    {[
                      { label: 'Chief Complaint', value: rec.chiefComplaint },
                      { label: 'Diagnosis', value: rec.diagnosis },
                      { label: 'Clinical Findings', value: rec.clinicalFindings },
                      { label: 'Recommendations', value: rec.recommendations },
                    ].map(({ label, value }) => value ? (
                      <div key={label}>
                        <p className="text-xs font-bold text-[#2448c4] dark:text-blue-400 uppercase tracking-wide">{label}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{value}</p>
                      </div>
                    ) : null)}
                    {rec.followUpDate && (
                      <div>
                        <p className="text-xs font-bold text-[#2448c4] dark:text-blue-400 uppercase tracking-wide">Follow-up</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{new Date(rec.followUpDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          prescriptions.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No prescriptions yet"
              message="Medications prescribed by your doctor after a consultation will appear here."
            />
          ) : (
            <div className="divide-y divide-blue-50 dark:divide-[#1e3a8a]/20">
              {prescriptions.map((rx) => (
                <div key={rx._id} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl shrink-0">
                      <Pill size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-[#1e3a8a] dark:text-blue-100">
                        Dr. {rx.doctor?.firstname ?? '—'} {rx.doctor?.lastname ?? ''}
                      </h3>
                      <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-80 mt-0.5">
                        Issued {new Date(rx.createdAt ?? rx.issuedDate).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 ${statusStyle(rx.status)}`}>
                      {formatStatus(rx.status)}
                    </span>
                  </div>
                  <div className="space-y-2 pl-16">
                    {(rx.medications ?? []).map((med: any, i: number) => (
                      <div key={i} className="p-4 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl border border-blue-50 dark:border-[#1e3a8a]/20">
                        <p className="font-semibold text-[#1e3a8a] dark:text-blue-100">{med.name} <span className="font-normal text-[#2448c4] dark:text-blue-400">({med.dosage})</span></p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 text-sm">
                          <div>
                            <p className="text-xs font-bold text-[#2448c4] dark:text-blue-400 uppercase tracking-wide">Frequency</p>
                            <p className="text-gray-700 dark:text-gray-300 mt-0.5">{med.frequency}</p>
                          </div>
                          {med.duration && (
                            <div>
                              <p className="text-xs font-bold text-[#2448c4] dark:text-blue-400 uppercase tracking-wide">Duration</p>
                              <p className="text-gray-700 dark:text-gray-300 mt-0.5">{med.duration}</p>
                            </div>
                          )}
                          {med.instructions && (
                            <div className="md:col-span-3">
                              <p className="text-xs font-bold text-[#2448c4] dark:text-blue-400 uppercase tracking-wide">Instructions</p>
                              <p className="text-gray-700 dark:text-gray-300 mt-0.5">{med.instructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
