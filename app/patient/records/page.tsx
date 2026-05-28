"use client";

import { useState } from 'react';
import { FileText, Download, Pill, TestTube, Stethoscope, Star } from 'lucide-react';

export default function RecordsPage() {
  // Added an attendedRating property to state so it can be updated
  const [records, setRecords] = useState([
    { id: 1, title: "Lisinopril Prescription", doctor: "Dr. Sarah Jenkins", date: "May 20, 2026", type: "Prescription", icon: Pill, attendedRating: 5 },
    { id: 2, title: "General Consultation Notes", doctor: "Dr. Emily Santos", date: "March 05, 2026", type: "Notes", icon: Stethoscope, attendedRating: 0 }, // 0 means unrated
    { id: 3, title: "Amoxicillin Prescription", doctor: "Dr. Alan Turing", date: "Jan 10, 2026", type: "Prescription", icon: Pill, attendedRating: 4 },
  ]);

  const handleRate = (recordId: number, ratingValue: number) => {
    setRecords(records.map(rec => 
      rec.id === recordId ? { ...rec, attendedRating: ratingValue } : rec
    ));
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Records</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Access your history and rate your recent treatments.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {records.map((record, index) => {
          const Icon = record.icon;
          return (
            <div key={record.id} className={`p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${index !== records.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
              
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{record.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {record.doctor} • {record.date}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-md">
                    {record.type}
                  </span>
                </div>
              </div>

              {/* Rating System & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                
                {/* Star Rating Logic */}
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                    {record.attendedRating > 0 ? 'Your Rating' : 'Rate Treatment'}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => handleRate(record.id, star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          size={18} 
                          className={star <= record.attendedRating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'
                          } 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto">
                  <Download size={16} /> PDF
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}