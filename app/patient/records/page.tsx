"use client";

import { useState, useEffect } from 'react';
import { Pill, Download } from 'lucide-react';
import { apiCall } from '@/lib/utils/api';

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const patientId = localStorage.getItem('userId');
      if (!patientId) return;

      try {
        const data = await apiCall(`/prescriptions?patientId=${patientId}`);
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch records");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Records</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Access your history and prescriptions.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading records...</p>
        ) : records.length === 0 ? (
          <p className="p-6 text-gray-500">No medical records found.</p>
        ) : (
          records.map((record) => (
            record.medications.map((med: any, index: number) => (
              <div key={`${record._id}-${index}`} className="p-6 flex flex-col xl:flex-row justify-between gap-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Pill size={24} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{med.name} ({med.dosage})</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Dr. {record.doctor?.name} • {new Date(record.issuedDate).toLocaleDateString()}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
                      {med.frequency}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
                  <Download size={16} /> PDF
                </button>
              </div>
            ))
          ))
        )}
      </div>
    </div>
  );
}