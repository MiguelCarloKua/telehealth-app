"use client";

import { useState } from 'react';
import { Clock, Lock, CheckCircle2 } from 'lucide-react';

export default function DoctorSchedule() {
  // Mock state to toggle availability
  const [slots, setSlots] = useState([
    { id: 1, time: "09:00 AM", status: "Available" },
    { id: 2, time: "09:30 AM", status: "Booked", patient: "Emily Santos" },
    { id: 3, time: "10:00 AM", status: "Booked", patient: "Alex Smith" },
    { id: 4, time: "10:30 AM", status: "Available" },
    { id: 5, time: "11:00 AM", status: "Available" },
    { id: 6, time: "11:30 AM", status: "Blocked" }, // Restricted slot
  ]);

  const toggleSlot = (id: number) => {
    setSlots(slots.map(slot => {
      if (slot.id === id && slot.status !== "Booked") {
        return { ...slot, status: slot.status === "Available" ? "Blocked" : "Available" };
      }
      return slot;
    }));
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Set your availability. Click an open slot to block it from patient bookings.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today: May 27, 2026</h2>
          <div className="flex gap-4 text-sm font-medium">
            <span className="flex items-center gap-1 text-gray-500"><CheckCircle2 size={14} className="text-green-500"/> Available</span>
            <span className="flex items-center gap-1 text-gray-500"><Lock size={14} className="text-red-500"/> Blocked</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slots.map(slot => (
            <button
              key={slot.id}
              onClick={() => toggleSlot(slot.id)}
              disabled={slot.status === "Booked"}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                slot.status === 'Booked' 
                  ? 'bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800 cursor-not-allowed'
                  : slot.status === 'Blocked'
                    ? 'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 opacity-60'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600 hover:border-violet-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock size={18} className={slot.status === 'Booked' ? 'text-violet-600' : 'text-gray-400'} />
                <span className={`font-bold ${slot.status === 'Booked' ? 'text-violet-900 dark:text-violet-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {slot.time}
                </span>
              </div>
              
              <span className={`text-sm font-semibold ${
                slot.status === 'Booked' ? 'text-violet-600 dark:text-violet-400' 
                : slot.status === 'Blocked' ? 'text-red-500' 
                : 'text-green-500'
              }`}>
                {slot.status === 'Booked' ? `Booked: ${slot.patient}` : slot.status}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}