"use client";

import { useState } from 'react';
import { Search, FileText, Pill, X, Save, Plus } from 'lucide-react';

export default function DoctorPatients() {
  const [activeModal, setActiveModal] = useState<'note' | 'prescription' | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const openModal = (type: 'note' | 'prescription', patientName: string) => {
    setActiveModal(type);
    setSelectedPatient(patientName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPatient(null);
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
          <input type="text" placeholder="Search patient name..." className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" />
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-4 items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center">AS</div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Alex Smith</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last visit: May 20, 2026</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <FileText size={16} /> View Records
            </button>
            <button 
              onClick={() => openModal('note', 'Alex Smith')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors shadow-sm"
            >
              <FileText size={16} /> Add Note
            </button>
            <button 
              onClick={() => openModal('prescription', 'Alex Smith')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 font-medium rounded-xl hover:bg-violet-100 transition-colors"
            >
              <Pill size={16} /> Prescribe
            </button>
          </div>
        </div>
      </div>

      {/* --- ADD CLINICAL NOTE MODAL --- */}
      {activeModal === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Clinical Note</h3>
                <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Patient: {selectedPatient}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chief Complaint / Symptoms</label>
                <input type="text" placeholder="E.g., Persistent headache for 3 days" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clinical Findings</label>
                <textarea rows={3} placeholder="Observations during consultation..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis & Recommendations</label>
                <textarea rows={3} placeholder="Final diagnosis and recommended steps..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
              <button onClick={closeModal} className="px-6 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
              <button onClick={closeModal} className="px-6 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 flex items-center gap-2"><Save size={18}/> Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRESCRIBE MEDICATION MODAL --- */}
      {activeModal === 'prescription' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-violet-50 dark:bg-violet-900/20">
              <div>
                <h3 className="text-xl font-bold text-violet-900 dark:text-violet-300">New Prescription</h3>
                <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Patient: {selectedPatient}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 rounded-full hover:bg-violet-200 dark:hover:bg-violet-800"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medication Name</label>
                <input type="text" placeholder="E.g., Amoxicillin" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage</label>
                  <input type="text" placeholder="E.g., 500mg" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                  <select className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white appearance-none cursor-pointer">
                    <option>Once a day</option>
                    <option>Twice a day</option>
                    <option>Every 8 hours</option>
                    <option>As needed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions (Optional)</label>
                <textarea rows={2} placeholder="Take with food..." className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
              <button onClick={closeModal} className="px-6 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
              <button onClick={closeModal} className="px-6 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 flex items-center gap-2"><Plus size={18}/> Issue Prescription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}