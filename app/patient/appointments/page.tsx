"use client";

import { Calendar as CalendarIcon, Clock, Video, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AppointmentsPage() {
  // 5 Placeholder Appointments
  const appointments = [
    { id: 1, doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", date: "May 28, 2026", time: "10:00 AM", status: "Upcoming", type: "Video" },
    { id: 2, doctor: "Dr. Marcus Chen", specialty: "Dermatology", date: "June 02, 2026", time: "2:30 PM", status: "Upcoming", type: "Video" },
    { id: 3, doctor: "Dr. Emily Santos", specialty: "General Practice", date: "June 15, 2026", time: "09:00 AM", status: "Upcoming", type: "In-Person" },
    { id: 4, doctor: "Dr. Alan Turing", specialty: "Neurology", date: "April 10, 2026", time: "11:00 AM", status: "Completed", type: "Video" },
    { id: 5, doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", date: "Jan 05, 2026", time: "01:00 PM", status: "Completed", type: "In-Person" },
  ];

  // Simple static calendar generation for UI mockup
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your schedule or book a new consultation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Booking Calendar */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Book Consultation</h2>
          
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><ChevronLeft size={20} /></button>
            <span className="font-semibold text-gray-900 dark:text-white">May 2026</span>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><ChevronRight size={20} /></button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-6">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-xs font-semibold text-gray-400 py-2">{day}</div>
            ))}
            {/* Empty slots for month start offset */}
            <div className="p-2"></div><div className="p-2"></div><div className="p-2"></div><div className="p-2"></div><div className="p-2"></div>
            {daysInMonth.map(day => (
              <button 
                key={day} 
                className={`p-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors
                  ${day === 28 ? 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-600' : 'text-gray-700 dark:text-gray-300'}
                `}
              >
                {day}
              </button>
            ))}
          </div>

          <button className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800">
            Find Available Slots
          </button>
        </div>

        {/* Right Column: Appointment List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your Schedule</h2>
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center gap-4 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${apt.status === 'Upcoming' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {apt.status.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    {apt.type === 'Video' ? <Video size={14} /> : <CalendarIcon size={14} />} {apt.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{apt.doctor}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{apt.specialty}</span>
                  <span>•</span>
                  <Clock size={14} /> {apt.date} at {apt.time}
                </p>
              </div>
              
              {apt.status === 'Upcoming' && (
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Reschedule
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1">
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}