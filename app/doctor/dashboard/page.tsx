"use client";

import Link from 'next/link';
import { Video, Users, FileSignature, Clock, ChevronRight } from 'lucide-react';

export default function DoctorDashboard() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Good morning, Dr. Jenkins</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">You have 4 consultations scheduled for today.</p>
      </header>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Patients</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <FileSignature size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Notes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Up Next</h2>
          <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Alex Smith</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Clock size={14} /> 10:00 AM - 10:30 AM
                </p>
              </div>
              <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold px-3 py-1 rounded-full">IN 15 MINS</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="font-semibold">Reason:</span> Persistent headache and slight fever since yesterday.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">
                <Video size={18} /> Join Session
              </button>
              <Link href="/doctor/patients" className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                View Records
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}