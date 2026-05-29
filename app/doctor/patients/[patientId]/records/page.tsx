"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, FileText, Pill, User, ClipboardList, Activity } from 'lucide-react';

interface Appointment {
  _id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  reason: string;
  doctor?: { firstname: string; lastname: string; specialty: string };
}

interface ClinicalNote {
  _id: string;
  createdAt: string;
  chiefComplaint: string;
  clinicalFindings: string;
  diagnosis: string;
  recommendations: string;
  followUpDate?: string;
  doctor?: { firstname: string; lastname: string; specialty: string };
}

interface Prescription {
  _id: string;
  createdAt: string;
  status: string;
  doctor?: { firstname: string; lastname: string };
  medications: { name: string; dosage: string; frequency: string; duration?: string; instructions?: string }[];
}

interface PatientInfo {
  firstname: string;
  lastname: string;
  email: string;
  profileImage?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  medicalHistory?: string[];
}

function EmptyCard({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <div className="w-11 h-11 rounded-xl bg-[#faf5ff] dark:bg-purple-900/20 flex items-center justify-center">
        <Icon size={20} className="text-purple-300 dark:text-purple-700" />
      </div>
      <p className="text-sm text-purple-400 dark:text-purple-500">{message}</p>
    </div>
  );
}

const statusStyle = (s: string) => {
  if (s === 'completed' || s === 'active') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  if (s === 'cancelled' || s === 'expired') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  if (s === 'in_progress') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
  return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
};

const fmt = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function PatientRecordsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const fetchAll = async () => {
      try {
        const [patRes, apptRes, noteRes, rxRes] = await Promise.allSettled([
          fetch(`/api/users/${patientId}`).then(r => r.ok ? r.json() : null),
          fetch(`/api/appointments?patientId=${patientId}`).then(r => r.ok ? r.json() : []),
          fetch(`/api/clinical-notes?patientId=${patientId}`).then(r => r.ok ? r.json() : []),
          fetch(`/api/prescriptions?patientId=${patientId}`).then(r => r.ok ? r.json() : []),
        ]);

        if (patRes.status === 'fulfilled') setPatient(patRes.value);
        if (apptRes.status === 'fulfilled') setAppointments(apptRes.value ?? []);
        if (noteRes.status === 'fulfilled') setNotes(noteRes.value ?? []);
        if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value ?? []);
      } catch {}
      finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [patientId]);

  const bmi = patient?.height && patient?.weight
    ? ((patient.weight / (patient.height * patient.height)) * 10000).toFixed(1)
    : null;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link href="/doctor/patients" className="p-2 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {loading ? 'Loading…' : patient ? `${patient.firstname} ${patient.lastname}` : 'Patient Records'}
          </h1>
          <p className="text-sm text-purple-500 dark:text-purple-400 mt-0.5">{patient?.email ?? ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Patient profile card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-[#230d42] rounded-2xl border border-purple-100 dark:border-purple-900/40 p-6 flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-200 dark:border-purple-700 overflow-hidden flex items-center justify-center">
                {patient?.profileImage ? (
                  <img src={patient.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-purple-400 dark:text-purple-500" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-purple-900 dark:text-purple-100 text-lg">
                  {patient?.firstname} {patient?.lastname}
                </h2>
                <p className="text-sm text-purple-500 dark:text-purple-400">{patient?.email}</p>
              </div>
            </div>

            {/* Vitals */}
            <div className="bg-white dark:bg-[#230d42] rounded-2xl border border-purple-100 dark:border-purple-900/40 p-5 space-y-3">
              <h3 className="font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2 text-sm">
                <Activity size={15} className="text-purple-500" /> Health Profile
              </h3>
              {(!patient?.bloodType && !patient?.height) ? (
                <p className="text-sm text-purple-400">No health profile data.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Blood Type', value: patient?.bloodType },
                    { label: 'BMI', value: bmi },
                    { label: 'Height', value: patient?.height ? `${patient.height} cm` : null },
                    { label: 'Weight', value: patient?.weight ? `${patient.weight} kg` : null },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="p-2 bg-[#faf5ff] dark:bg-[#1c0a38] rounded-lg">
                      <p className="text-purple-400 font-medium uppercase tracking-wide text-[10px]">{label}</p>
                      <p className="font-bold text-purple-800 dark:text-purple-200 mt-0.5">{value}</p>
                    </div>
                  ) : null)}
                </div>
              )}
              {(patient?.allergies?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {patient!.allergies!.map(a => (
                      <span key={a} className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {(patient?.medicalHistory?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mb-1">Medical History</p>
                  <div className="flex flex-wrap gap-1">
                    {patient!.medicalHistory!.map(h => (
                      <span key={h} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded-full">{h}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Records */}
          <div className="lg:col-span-2 space-y-5">

            {/* Appointment History */}
            <div className="bg-white dark:bg-[#230d42] rounded-2xl border border-purple-100 dark:border-purple-900/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-purple-50 dark:border-purple-900/30 flex items-center gap-2">
                <Calendar size={16} className="text-purple-500" />
                <h3 className="font-bold text-purple-900 dark:text-purple-100 text-sm">Appointment History</h3>
                <span className="ml-auto text-xs font-semibold text-purple-400">{appointments.length}</span>
              </div>
              {appointments.length === 0 ? (
                <EmptyCard icon={Calendar} message="No appointments on record." />
              ) : (
                <div className="divide-y divide-purple-50 dark:divide-purple-900/20">
                  {appointments.map(apt => (
                    <div key={apt._id} className="px-5 py-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                          {new Date(apt.scheduledDate).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })} · {apt.startTime}
                        </p>
                        <p className="text-xs text-purple-500 dark:text-purple-400 mt-0.5">{apt.reason || 'General Consultation'}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle(apt.status)}`}>{fmt(apt.status)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clinical Notes */}
            <div className="bg-white dark:bg-[#230d42] rounded-2xl border border-purple-100 dark:border-purple-900/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-purple-50 dark:border-purple-900/30 flex items-center gap-2">
                <ClipboardList size={16} className="text-purple-500" />
                <h3 className="font-bold text-purple-900 dark:text-purple-100 text-sm">Clinical Notes</h3>
                <span className="ml-auto text-xs font-semibold text-purple-400">{notes.length}</span>
              </div>
              {notes.length === 0 ? (
                <EmptyCard icon={FileText} message="No clinical notes yet. Add one from the Patients page." />
              ) : (
                <div className="divide-y divide-purple-50 dark:divide-purple-900/20">
                  {notes.map(note => (
                    <div key={note._id} className="px-5 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-purple-500 dark:text-purple-400">
                          {new Date(note.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        {note.doctor && (
                          <p className="text-xs text-purple-400">Dr. {note.doctor.firstname} {note.doctor.lastname}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: 'Chief Complaint', value: note.chiefComplaint },
                          { label: 'Diagnosis', value: note.diagnosis },
                          { label: 'Clinical Findings', value: note.clinicalFindings },
                          { label: 'Recommendations', value: note.recommendations },
                        ].map(({ label, value }) => value ? (
                          <div key={label}>
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">{label}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{value}</p>
                          </div>
                        ) : null)}
                        {note.followUpDate && (
                          <div>
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">Follow-up</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{new Date(note.followUpDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prescriptions */}
            <div className="bg-white dark:bg-[#230d42] rounded-2xl border border-purple-100 dark:border-purple-900/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-purple-50 dark:border-purple-900/30 flex items-center gap-2">
                <Pill size={16} className="text-purple-500" />
                <h3 className="font-bold text-purple-900 dark:text-purple-100 text-sm">Prescriptions</h3>
                <span className="ml-auto text-xs font-semibold text-purple-400">{prescriptions.length}</span>
              </div>
              {prescriptions.length === 0 ? (
                <EmptyCard icon={Pill} message="No prescriptions issued yet." />
              ) : (
                <div className="divide-y divide-purple-50 dark:divide-purple-900/20">
                  {prescriptions.map(rx => (
                    <div key={rx._id} className="px-5 py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-purple-500 dark:text-purple-400">
                          {new Date(rx.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle(rx.status)}`}>{fmt(rx.status)}</span>
                      </div>
                      {(rx.medications ?? []).map((med, i) => (
                        <div key={i} className="p-3 bg-[#faf5ff] dark:bg-[#1c0a38] rounded-xl">
                          <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                            {med.name} <span className="font-normal text-purple-500">({med.dosage})</span>
                          </p>
                          <p className="text-xs text-purple-400 mt-0.5">
                            {med.frequency}{med.duration ? ` · ${med.duration}` : ''}
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
