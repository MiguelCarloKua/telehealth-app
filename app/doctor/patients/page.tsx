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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'note' | 'prescription' | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Modal State Variables
  const [noteForm, setNoteForm] = useState({
    chiefComplaint: '',
    clinicalFindings: '',
    diagnosis: ''
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'Once a day',
    instructions: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const doctorId = sessionStorage.getItem('doctorId');
        if (!doctorId) return;

        // FIX: Replaced the broken dynamic route with the reliable query parameter endpoint 
        // that is already working perfectly on your Schedule and Dashboard pages!
        const data = await apiCall(`/appointments?doctorId=${doctorId}`);
        
        // Isolate and extract unique patient documents from relational lookups
        const uniquePatientsMap = new Map();
        if (Array.isArray(data)) {
          data.forEach((apt: any) => {
            if (apt.patient && apt.patient._id) {
              uniquePatientsMap.set(apt.patient._id, apt.patient);
            }
          });
        }

        const uniquePatientsList = Array.from(uniquePatientsMap.values()) as Patient[];
        setPatients(uniquePatientsList);
        setFilteredPatients(uniquePatientsList);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter((patient) => {
      const fullName = `${patient.firstname || ''} ${patient.lastname || ''}`.toLowerCase();
      const email = (patient.email || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const openModal = (type: 'note' | 'prescription', patient: Patient) => {
    setActiveModal(type);
    setSelectedPatient(patient);
    // Reset configurations on modal change
    setNoteForm({ chiefComplaint: '', clinicalFindings: '', diagnosis: '' });
    setPrescriptionForm({ medicationName: '', dosage: '', frequency: 'Once a day', instructions: '' });
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPatient(null);
  };

  // --- SUBMIT CLINICAL NOTE ---
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setSubmitLoading(true);
    try {
      const doctorId = sessionStorage.getItem('doctorId');
      const response = await fetch('/api/clinical-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: doctorId,
          patient: selectedPatient._id,
          chiefComplaint: noteForm.chiefComplaint,
          clinicalFindings: noteForm.clinicalFindings,
          diagnosis: noteForm.diagnosis,
        }),
      });

      if (response.ok) {
        alert('Clinical note successfully appended to patient health profile!');
        closeModal();
      } else {
        alert('Failed to submit clinical note. Please ensure the API route exists.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- SUBMIT PRESCRIPTION ---
  const handleIssuePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setSubmitLoading(true);
    try {
      const doctorId = sessionStorage.getItem('doctorId');
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: doctorId,
          patient: selectedPatient._id,
          medicationName: prescriptionForm.medicationName,
          dosage: prescriptionForm.dosage,
          frequency: prescriptionForm.frequency,
          specialInstructions: prescriptionForm.instructions,
        }),
      });

      if (response.ok) {
        alert('Prescription records successfully issued and synced to patient dashboard!');
        closeModal();
      } else {
        alert('Failed to issue medication prescription records. Please ensure the API route exists.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Patients</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review records, add clinical notes, and issue prescriptions.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patient name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" 
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-500 dark:text-gray-400">Loading patients...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div key={patient._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4 items-center flex-1">
                  <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 overflow-hidden font-bold flex items-center justify-center shrink-0">
                    {patient.profileImage ? (
                      <img src={patient.profileImage} alt="Patient" className="h-full w-full object-cover" />
                    ) : (
                      <span>{(patient.firstname?.[0] || 'P').toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {patient.firstname} {patient.lastname}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{patient.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <Link href={`/doctor/patients/${patient._id}/records`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    <FileText size={16} /> View Records
                  </Link>
                  <button 
                    onClick={() => openModal('note', patient)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors shadow-sm text-sm"
                  >
                    <FileText size={16} /> Add Note
                  </button>
                  <button 
                    onClick={() => openModal('prescription', patient)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 font-medium rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors text-sm"
                  >
                    <Pill size={16} /> Prescribe
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-500 dark:text-gray-400">No patients found</p>
          </div>
        )}
      </div>

      {/* --- ADD CLINICAL NOTE MODAL --- */}
      {activeModal === 'note' && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSaveNote} className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Clinical Note</h3>
                <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Patient: {selectedPatient.firstname} {selectedPatient.lastname}</p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chief Complaint / Symptoms</label>
                <input required type="text" value={noteForm.chiefComplaint} onChange={e => setNoteForm({...noteForm, chiefComplaint: e.target.value})} placeholder="E.g., Persistent headache for 3 days" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clinical Findings</label>
                <textarea required rows={3} value={noteForm.clinicalFindings} onChange={e => setNoteForm({...noteForm, clinicalFindings: e.target.value})} placeholder="Observations during consultation..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis & Recommendations</label>
                <textarea required rows={3} value={noteForm.diagnosis} onChange={e => setNoteForm({...noteForm, diagnosis: e.target.value})} placeholder="Final diagnosis and recommended steps..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-6 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
              <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 flex items-center gap-2 disabled:opacity-50"><Save size={18}/> {submitLoading ? 'Saving...' : 'Save Note'}</button>
            </div>
          </form>
        </div>
      )}

      {/* --- PRESCRIBE MEDICATION MODAL --- */}
      {activeModal === 'prescription' && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleIssuePrescription} className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-violet-50 dark:bg-violet-900/20">
              <div>
                <h3 className="text-xl font-bold text-violet-900 dark:text-violet-300">New Prescription</h3>
                <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Patient: {selectedPatient.firstname} {selectedPatient.lastname}</p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 rounded-full hover:bg-violet-200 dark:hover:bg-violet-800"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medication Name</label>
                <input required type="text" value={prescriptionForm.medicationName} onChange={e => setPrescriptionForm({...prescriptionForm, medicationName: e.target.value})} placeholder="E.g., Amoxicillin" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage</label>
                  <input required type="text" value={prescriptionForm.dosage} onChange={e => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})} placeholder="E.g., 500mg" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                  <select value={prescriptionForm.frequency} onChange={e => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white cursor-pointer">
                    <option value="Once a day">Once a day</option>
                    <option value="Twice a day">Twice a day</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions (Optional)</label>
                <textarea rows={2} value={prescriptionForm.instructions} onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})} placeholder="Take with food..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-6 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
              <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 flex items-center gap-2 disabled:opacity-50"><Plus size={18}/> {submitLoading ? 'Issuing...' : 'Issue Prescription'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}