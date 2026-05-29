"use client";

import { useState, useEffect } from 'react';
import { Pill, Download, Calendar, FileText } from 'lucide-react';
import { apiCall } from '@/lib/utils/api';

type TabType = 'appointments' | 'medical-records' | 'prescriptions';

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const patientId = sessionStorage.getItem('userId');
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const [apptData, clinicalData, prescData] = await Promise.all([
          apiCall(`/appointments?patientId=${patientId}`),
          apiCall(`/clinical-notes?patientId=${patientId}`),
          apiCall(`/prescriptions?patientId=${patientId}`),
        ]);

        setAppointments(apptData || []);
        setMedicalRecords(clinicalData || []);
        setPrescriptions(prescData || []);
      } catch (error) {
        console.error("Failed to fetch records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const tabs = [
    { id: 'appointments', label: 'Appointment History', icon: Calendar },
    { id: 'medical-records', label: 'Medical Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  ] as const;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Records</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Access your consultations, medical records, and prescriptions.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading records...</p>
        ) : activeTab === 'appointments' ? (
          <AppointmentContent appointments={appointments} />
        ) : activeTab === 'medical-records' ? (
          <MedicalRecordsContent records={medicalRecords} />
        ) : (
          <PrescriptionsContent prescriptions={prescriptions} />
        )}
      </div>
    </div>
  );
}

function AppointmentContent({ appointments }: { appointments: any[] }) {
  if (appointments.length === 0) {
    return <p className="p-6 text-gray-500">No appointment history found.</p>;
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {appointments.map((apt) => (
        <div key={apt._id} className="p-6 flex flex-col xl:flex-row justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Dr. {apt.doctor?.firstname} {apt.doctor?.lastname}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {apt.doctor?.specialty}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {new Date(apt.scheduledDate).toLocaleDateString()} at {apt.startTime} - {apt.endTime}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <strong>Reason:</strong> {apt.reason}
              </p>
              {apt.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Notes:</strong> {apt.notes}
                </p>
              )}
              <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-md ${
                apt.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : apt.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : apt.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {apt.status.replace('_', ' ').charAt(0).toUpperCase() + apt.status.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MedicalRecordsContent({ records }: { records: any[] }) {
  if (records.length === 0) {
    return <p className="p-6 text-gray-500">No medical records found.</p>;
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {records.map((record) => (
        <div key={record._id} className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Dr. {record.doctor?.firstname} {record.doctor?.lastname}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(record.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Chief Complaint</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{record.chiefComplaint}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Diagnosis</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{record.diagnosis}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Clinical Findings</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{record.clinicalFindings}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Recommendations</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{record.recommendations}</p>
            </div>
            {record.followUpDate && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Follow-up Date</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {new Date(record.followUpDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrescriptionsContent({ prescriptions }: { prescriptions: any[] }) {
  if (prescriptions.length === 0) {
    return <p className="p-6 text-gray-500">No prescriptions found.</p>;
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {prescriptions.map((prescription) => (
        <div key={prescription._id} className="p-6">
          <div className="flex flex-col xl:flex-row justify-between gap-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Pill size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Dr. {prescription.doctor?.firstname} {prescription.doctor?.lastname}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Issued: {new Date(prescription.issuedDate).toLocaleDateString()}
                </p>
                {prescription.expiryDate && (
                  <p className="text-sm text-gray-500">
                    Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
                  </p>
                )}
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-md ${
                  prescription.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : prescription.status === 'expired'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 h-fit">
              <Download size={16} /> PDF
            </button>
          </div>

          <div className="space-y-3">
            {prescription.medications.map((med: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {med.name} ({med.dosage})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Frequency</p>
                    <p className="text-gray-700 dark:text-gray-300">{med.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Duration</p>
                    <p className="text-gray-700 dark:text-gray-300">{med.duration}</p>
                  </div>
                  {med.instructions && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Instructions</p>
                      <p className="text-gray-700 dark:text-gray-300">{med.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}