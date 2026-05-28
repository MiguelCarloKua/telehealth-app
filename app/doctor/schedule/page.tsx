"use client";

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { apiCall } from '@/lib/utils/api';

export default function DoctorSchedule() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate standard 9AM - 5PM slots
  const standardSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"];

  useEffect(() => {
    const fetchSchedule = async () => {
      const doctorId = localStorage.getItem('userId');
      if (!doctorId) return;

      try {
        const data = await apiCall(`/appointments?doctorId=${doctorId}&status=scheduled`);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View your booked appointments for today.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Slots</h2>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading schedule...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {standardSlots.map(time => {
              // Check if this time slot exists in our database appointments
              const booking = appointments.find(apt => apt.startTime === time);
              const isBooked = !!booking;

              return (
                <div key={time} className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                  isBooked ? 'bg-violet-50 border-violet-200' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className={isBooked ? 'text-violet-600' : 'text-gray-400'} />
                    <span className="font-bold text-gray-700">{time}</span>
                  </div>
                  
                  <span className={`text-sm font-semibold ${isBooked ? 'text-violet-600' : 'text-green-500'}`}>
                    {isBooked ? `Booked: ${booking.patient?.name}` : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}