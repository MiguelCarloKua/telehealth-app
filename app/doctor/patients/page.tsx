"use client";

import { useState, useEffect } from 'react';
import { Search, FileText, Pill, X, Save, Plus, User } from 'lucide-react';
import { apiCall } from '@/lib/utils/api';
import Link from 'next/link';

interface Patient {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  profileImage?: string;
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [patientsWithRecords, setPatientsWithRecords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'note' | 'prescription' | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [noteForm, setNoteForm] = useState({
    chiefComplaint: '', clinicalFindings: '', diagnosis: '', recommendations: '',
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    medicationName: '', dosage: '', frequency: 'Once a day', duration: '30 days', instructions: '',
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const doctorId = sessionStorage.getItem('doctorId');
        if (!doctorId) return;

        const data = await apiCall(`/appointments?doctorId=${doctorId}`);

        const uniqueMap = new Map<string, Patient>();
        const completedPatients = new Set<string>();

        if (Array.isArray(data)) {
          data.forEach((apt: any) => {
            if (apt.patient?._id) {
              uniqueMap.set(apt.patient._id, apt.patient);
              // Patient has records if any appointment is completed
              if (apt.status === 'completed' || apt.status === 'in_progress') {
                completedPatients.add(apt.patient._id);
              }
            }
          });
        }

        const list = Array.from(uniqueMap.values());
        setPatients(list);
        setFilteredPatients(list);
        setPatientsWithRecords(completedPatients);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter((p) => {
      const full = `${p.firstname} ${p.lastname} ${p.email}`.toLowerCase();
      return full.includes(searchQuery.toLowerCase());
    });
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const openModal = (type: 'note' | 'prescription', patient: Patient) => {
    setActiveModal(type);
    setSelectedPatient(patient);
    setSubmitSuccess('');
    setNoteForm({ chiefComplaint: '', clinicalFindings: '', diagnosis: '', recommendations: '' });
    setPrescriptionForm({ medicationName: '', dosage: '', frequency: 'Once a day', duration: '30 days', instructions: '' });
  };

  const closeModal = () => { setActiveModal(null); setSelectedPatient(null); };

  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSubmitLoading(true);
    try {
      const doctorId = sessionStorage.getItem('doctorId');
      const res = await fetch('/api/clinical-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: doctorId,
          patient: selectedPatient._id,
          chiefComplaint: noteForm.chiefComplaint,
          clinicalFindings: noteForm.clinicalFindings,
          diagnosis: noteForm.diagnosis,
          recommendations: noteForm.recommendations,
        }),
      });
      if (res.ok) {
        // Mark this patient as having records now
        setPatientsWithRecords(prev => new Set([...prev, selectedPatient._id]));
        setSubmitSuccess('Clinical note saved successfully.');
        setTimeout(closeModal, 1200);
      } else {
        const err = await res.json();
        alert(err.error ?? 'Failed to save note.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleIssuePrescription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSubmitLoading(true);
    try {
      const doctorId = sessionStorage.getItem('doctorId');
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: doctorId,
          patient: selectedPatient._id,
          medications: [{
            name: prescriptionForm.medicationName,
            dosage: prescriptionForm.dosage,
            frequency: prescriptionForm.frequency,
            duration: prescriptionForm.duration,
            instructions: prescriptionForm.instructions,
          }],
          status: 'active',
        }),
      });
      if (res.ok) {
        setPatientsWithRecords(prev => new Set([...prev, selectedPatient._id]));
        setSubmitSuccess('Prescription issued successfully.');
        setTimeout(closeModal, 1200);
      } else {
        const err = await res.json();
        alert(err.error ?? 'Failed to issue prescription.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100">My Patients</h1>
          <p className="text-purple-500 dark:text-purple-400 mt-1">Review records, add clinical notes, and issue prescriptions.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-purple-200 dark:border-purple-800 rounded-xl bg-white dark:bg-[#230d42] text-purple-900 dark:text-purple-100 focus:ring-2 focus:ring-purple-500 outline-none placeholder-purple-300 dark:placeholder-purple-600"
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-[#230d42] rounded-2xl border border-purple-100 dark:border-purple-900/40 p-6">
            <p className="text-purple-400">Loading patients…</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => {
            const hasRecords = patientsWithRecords.has(patient._id);
            return (
              <div key={patient._id} className="bg-white dark:bg-[#230d42] rounded-2xl shadow-sm border border-purple-100 dark:border-purple-900/40 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-3 items-center flex-1">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-700 overflow-hidden font-bold flex items-center justify-center shrink-0">
                      {patient.profileImage ? (
                        <img src={patient.profileImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{(patient.firstname?.[0] ?? 'P').toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900 dark:text-purple-100">{patient.firstname} {patient.lastname}</h3>
                      <p className="text-sm text-purple-500 dark:text-purple-400">{patient.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* View Records — disabled and greyed if no completed consultations */}
                    {hasRecords ? (
                      <Link
                        href={`/doctor/patients/${patient._id}/records`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#faf5ff] dark:bg-[#1c0a38] border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-medium rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm"
                      >
                        <FileText size={15} /> View Records
                      </Link>
                    ) : (
                      <span
                        title="No records yet — records will appear after a completed consultation"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 font-medium rounded-xl text-sm cursor-not-allowed select-none"
                      >
                        <FileText size={15} /> View Records
                      </span>
                    )}

                    <button
                      onClick={() => openModal('note', patient)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-xl transition-colors shadow-sm text-sm"
                    >
                      <FileText size={15} /> Add Note
                    </button>
                    <button
                      onClick={() => openModal('prescription', patient)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-medium rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm"
                    >
                      <Pill size={15} /> Prescribe
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-[#230d42] rounded-2xl border border-purple-100 dark:border-purple-900/40 p-10 text-center">
            <User size={40} className="mx-auto text-purple-200 dark:text-purple-800 mb-3" />
            <p className="text-purple-500 dark:text-purple-400">
              {searchQuery ? 'No patients match your search.' : 'No patients yet. Patients will appear here after you have appointments.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Clinical Note Modal ── */}
      {activeModal === 'note' && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleSaveNote} className="bg-white dark:bg-[#230d42] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-purple-100 dark:border-purple-900/40 flex justify-between items-center bg-purple-50 dark:bg-[#1c0a38]">
              <div>
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">Add Clinical Note</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-0.5">Patient: {selectedPatient.firstname} {selectedPatient.lastname}</p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 text-purple-400 hover:text-purple-600 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {submitSuccess && <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">{submitSuccess}</div>}
              {[
                { key: 'chiefComplaint', label: 'Chief Complaint / Symptoms', placeholder: 'E.g., Persistent headache for 3 days', multiline: false },
                { key: 'clinicalFindings', label: 'Clinical Findings', placeholder: 'Observations during consultation…', multiline: true },
                { key: 'diagnosis', label: 'Diagnosis', placeholder: 'Clinical diagnosis…', multiline: false },
                { key: 'recommendations', label: 'Recommendations', placeholder: 'Recommended treatment or follow-up…', multiline: true },
              ].map(({ key, label, placeholder, multiline }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">{label}</label>
                  {multiline ? (
                    <textarea required rows={3} value={(noteForm as any)[key]} onChange={e => setNoteForm({ ...noteForm, [key]: e.target.value })} placeholder={placeholder} className="w-full p-3 bg-[#faf5ff] dark:bg-[#1c0a38] border border-purple-200 dark:border-purple-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white resize-none" />
                  ) : (
                    <input required type="text" value={(noteForm as any)[key]} onChange={e => setNoteForm({ ...noteForm, [key]: e.target.value })} placeholder={placeholder} className="w-full p-3 bg-[#faf5ff] dark:bg-[#1c0a38] border border-purple-200 dark:border-purple-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white" />
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-purple-100 dark:border-purple-900/40 bg-purple-50 dark:bg-[#1c0a38] flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-5 py-2 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
                <Save size={16} /> {submitLoading ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Prescription Modal ── */}
      {activeModal === 'prescription' && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleIssuePrescription} className="bg-white dark:bg-[#230d42] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-purple-100 dark:border-purple-900/40 flex justify-between items-center bg-purple-50 dark:bg-[#1c0a38]">
              <div>
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">Issue Prescription</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-0.5">Patient: {selectedPatient.firstname} {selectedPatient.lastname}</p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 text-purple-400 hover:text-purple-600 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {submitSuccess && <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">{submitSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Medication Name</label>
                <input required type="text" value={prescriptionForm.medicationName} onChange={e => setPrescriptionForm({ ...prescriptionForm, medicationName: e.target.value })} placeholder="E.g., Amoxicillin" className="w-full p-3 bg-[#faf5ff] dark:bg-[#1c0a38] border border-purple-200 dark:border-purple-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Dosage</label>
                  <input required type="text" value={prescriptionForm.dosage} onChange={e => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })} placeholder="E.g., 500 mg" className="w-full p-3 bg-[#faf5ff] dark:bg-[#1c0a38] border border-purple-200 dark:border-purple-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Duration</label>
                  <input required type="text" value={prescriptionForm.duration} onChange={e => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })} placeholder="E.g., 7 days" className="w-full p-3 bg-[#faf5ff] dark:bg-[#1c0a38] border border-purple-200 dark:border-purple-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Frequency</label>
                <select value={prescriptionForm.frequency} onChange={e => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })} className="w-full p-3 bg-[#faf5ff] dark:bg-[#1c0a38] border border-purple-200 dark:border-purple-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white cursor-pointer">
                  <option>Once a day</option>
                  <option>Twice a day</option>
                  <option>Three times a day</option>
                  <option>Every 8 hours</option>
                  <option>As needed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Instructions <span className="font-normal text-purple-400">(optional)</span></label>
                <textarea rows={2} value={prescriptionForm.instructions} onChange={e => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })} placeholder="E.g., Take with food…" className="w-full p-3 bg-[#faf5ff] dark:bg-[#1c0a38] border border-purple-200 dark:border-purple-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white resize-none" />
              </div>
            </div>

            <div className="p-6 border-t border-purple-100 dark:border-purple-900/40 bg-purple-50 dark:bg-[#1c0a38] flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-5 py-2 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
                <Plus size={16} /> {submitLoading ? 'Issuing…' : 'Issue Prescription'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
