"use client";

import { useState, useEffect } from 'react';
import { Pill, Calendar, FileText, ClipboardList, AlertCircle, Star, X } from 'lucide-react';
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

function StarRow({ stars, size = 14, interactive = false, hover = 0, onHover, onClick }: {
  stars: number;
  size?: number;
  interactive?: boolean;
  hover?: number;
  onHover?: (n: number) => void;
  onClick?: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= (interactive ? (hover || stars) : stars);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => onHover?.(i)}
            onMouseLeave={() => onHover?.(0)}
            onClick={() => onClick?.(i)}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          >
            <Star
              size={size}
              fill={filled ? 'currentColor' : 'none'}
              className={filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
            />
          </button>
        );
      })}
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

  // Rating state
  const [ratingsMap, setRatingsMap] = useState<Record<string, any>>({});
  const [ratingModal, setRatingModal] = useState<any | null>(null);
  const [selectedStar, setSelectedStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [ratingReason, setRatingReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      const patientId = sessionStorage.getItem('patientId');
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const [apptData, clinicalData, prescData, ratingsData] = await Promise.allSettled([
          apiCall(`/appointments?patientId=${patientId}`),
          apiCall(`/clinical-notes?patientId=${patientId}`),
          apiCall(`/prescriptions?patientId=${patientId}`),
          apiCall(`/ratings?patientId=${patientId}`),
        ]);

        setAppointments(apptData.status === 'fulfilled' ? (apptData.value ?? []) : []);
        setMedicalRecords(clinicalData.status === 'fulfilled' ? (clinicalData.value ?? []) : []);
        setPrescriptions(prescData.status === 'fulfilled' ? (prescData.value ?? []) : []);

        if (ratingsData.status === 'fulfilled') {
          const map: Record<string, any> = {};
          (ratingsData.value ?? []).forEach((r: any) => {
            const apptId = typeof r.appointment === 'object' ? r.appointment._id : r.appointment;
            map[apptId] = r;
          });
          setRatingsMap(map);
        }
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const openRatingModal = (apt: any) => {
    setRatingModal(apt);
    setSelectedStar(0);
    setHoverStar(0);
    setRatingReason('');
    setSubmitError('');
  };

  const submitRating = async () => {
    if (!ratingModal || selectedStar === 0 || !ratingReason.trim()) return;
    const patientId = sessionStorage.getItem('patientId');
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment: ratingModal._id,
          doctor: typeof ratingModal.doctor === 'object' ? ratingModal.doctor._id : ratingModal.doctor,
          patient: patientId,
          stars: selectedStar,
          reason: ratingReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok || res.status === 409) {
        // 409 means already rated — server returns the existing rating document
        setRatingsMap(prev => ({ ...prev, [ratingModal._id]: data }));
        setRatingModal(null);
      } else {
        setSubmitError(data.error || 'Failed to submit rating. Please try again.');
      }
    } catch {
      setSubmitError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
              {appointments.map((apt) => {
                const existingRating = ratingsMap[apt._id];
                return (
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

                    <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyle(apt.status)}`}>
                        {formatStatus(apt.status)}
                      </span>
                      {apt.status === 'completed' && (
                        existingRating ? (
                          <div className="flex flex-col items-start lg:items-end gap-0.5">
                            <StarRow stars={existingRating.stars} size={13} />
                            <span className="text-xs text-gray-400 dark:text-gray-500">Your rating</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openRatingModal(apt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-xl border border-yellow-200 dark:border-yellow-700/40 transition-colors"
                          >
                            <Star size={12} /> Rate Consultation
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
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

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0e1e55] rounded-2xl shadow-2xl border border-blue-100 dark:border-[#1e3a8a]/40 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-50 dark:border-[#1e3a8a]/30">
              <div>
                <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-blue-100">Rate Your Consultation</h2>
                <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-70 mt-0.5">
                  Dr. {ratingModal.doctor?.firstname} {ratingModal.doctor?.lastname}
                </p>
              </div>
              <button
                onClick={() => setRatingModal(null)}
                className="p-2 rounded-xl hover:bg-[#f0f4ff] dark:hover:bg-[#0c1840] text-gray-400 hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="p-4 bg-[#f0f4ff] dark:bg-[#0c1840] rounded-xl text-sm text-gray-600 dark:text-gray-400">
                {new Date(ratingModal.scheduledDate).toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {ratingModal.startTime} – {ratingModal.endTime}
              </div>

              {/* Star Selector */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-200">How would you rate this consultation?</p>
                <div className="flex items-center gap-2">
                  <StarRow
                    stars={selectedStar}
                    size={32}
                    interactive
                    hover={hoverStar}
                    onHover={setHoverStar}
                    onClick={setSelectedStar}
                  />
                  {selectedStar > 0 && (
                    <span className="text-sm font-semibold text-yellow-500 ml-1">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selectedStar]}
                    </span>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-200">
                  Tell us more <span className="font-normal text-gray-400">(required)</span>
                </label>
                <textarea
                  value={ratingReason}
                  onChange={e => setRatingReason(e.target.value)}
                  placeholder="Share your experience with this consultation…"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#f0f4ff] dark:bg-[#0c1840] border border-blue-100 dark:border-[#1e3a8a]/40 rounded-xl text-[#1e3a8a] dark:text-blue-100 placeholder-blue-300 dark:placeholder-blue-700 focus:outline-none focus:ring-2 focus:ring-[#2448c4] text-sm resize-none"
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-500 dark:text-red-400">{submitError}</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setRatingModal(null)}
                className="flex-1 px-4 py-2.5 bg-[#f0f4ff] dark:bg-[#0c1840] hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 text-[#2448c4] dark:text-blue-400 text-sm font-semibold rounded-xl border border-blue-100 dark:border-[#1e3a8a]/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={selectedStar === 0 || !ratingReason.trim() || submitting}
                className="flex-1 px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#152870] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                ) : (
                  <><Star size={14} fill="currentColor" /> Submit Rating</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}