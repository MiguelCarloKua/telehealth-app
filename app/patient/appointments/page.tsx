"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Video, User, X, MessageSquare, AlertCircle, Phone } from 'lucide-react';
import { apiCall } from '@/lib/utils/api';
import Link from 'next/link';

interface Doctor {
  _id: string;
  firstname: string;
  lastname: string;
  specialty: string;
  availableSlots: { dayOfWeek: string; startTime: string; endTime: string }[];
  blockedDates?: string[];
}

interface Appointment {
  _id: string;
  doctor: Doctor | null; 
  patient: any; 
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'video' | 'live_chat';
  reason: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Booking Flow State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    startTime: '',
    type: 'video',
    reason: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientId = sessionStorage.getItem('patientId');
        if (!patientId) return;

        const [aptData, docData] = await Promise.all([
          apiCall(`/appointments?patientId=${patientId}`),
          apiCall('/doctors') 
        ]);

        setAppointments(aptData || []);
        setDoctors(docData || []);

        // Auto-focus calendar on the month of the next upcoming appointment
        const activeApts = (aptData || []).filter((apt: any) => 
          apt.status === 'scheduled' || apt.status === 'rescheduled'
        );
        if (activeApts.length > 0) {
          setCurrentDate(new Date(activeApts[0].scheduledDate));
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Poll every 5 seconds so in_progress status shows without a page refresh
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- CALENDAR & SLOTS LOGIC ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  // Generated Time Slots
  const generateTimeSlots = (date: Date, doctor: Doctor) => {
      const dayName = DAYS_OF_WEEK[date.getDay()];
      
      // STRICT HOURS FIX: Read from the database schedule, or fallback to 9-5 if not yet configured
      const schedule = (doctor.availableSlots && doctor.availableSlots.length > 0)
        ? doctor.availableSlots.find(s => s.dayOfWeek === dayName)
        : { startTime: '09:00', endTime: '17:00' };
      
      const slots: string[] = [];
      
      if (schedule) {
        let curr = new Date(`2000-01-01T${schedule.startTime}:00`);
        const end = new Date(`2000-01-01T${schedule.endTime}:00`);

        while (curr < end) {
          slots.push(curr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
          curr.setMinutes(curr.getMinutes() + 30);
        }
      }
      
      setAvailableTimeSlots(slots);
      setFormData(prev => ({ ...prev, startTime: slots[0] || '' }));
    };
    
  const handleDateSelect = (day: number) => {
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(dateObj);
    if (selectedDoctor) generateTimeSlots(dateObj, selectedDoctor);
  };

  // --- BOOKING SUBMIT ---
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedDoctor || !formData.startTime) return;

    setBookingLoading(true);
    setError('');
    const patientId = sessionStorage.getItem('patientId');

    const [hours, minutes] = formData.startTime.split(':');
    const finalScheduledDate = new Date(selectedDate);
    finalScheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endDate = new Date(selectedDate);
    endDate.setHours(parseInt(hours), parseInt(minutes) + 30);
    const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: patientId,
          doctor: selectedDoctor._id,
          scheduledDate: finalScheduledDate.toISOString(),
          startTime: formData.startTime,
          endTime: endTimeStr,
          type: formData.type,
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAppointments([...appointments, data]);
        setSelectedDate(null);
        setFormData({ startTime: '', type: 'video', reason: '' });
        alert('Appointment successfully booked!');
      } else {
        setError(data.error || 'Failed to book appointment. Time slot may be taken.');
      }
    } catch (error) {
      setError('A network error occurred.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (aptId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/appointments/${aptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        setAppointments(prev => prev.map(apt => apt._id === aptId ? { ...apt, status: 'cancelled' } : apt));
      } else {
        alert("Failed to cancel appointment.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduledDate);
    if (activeTab === 'upcoming') return (apt.status === 'scheduled' || apt.status === 'rescheduled' || apt.status === 'in_progress') && aptDate >= today;
    if (activeTab === 'past') return apt.status === 'completed' || (aptDate < today && apt.status !== 'cancelled');
    if (activeTab === 'cancelled') return apt.status === 'cancelled';
    return false;
  }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your schedule or book a new consultation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: BOOKING FLOW */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Book Consultation</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Select Doctor</label>
            <select 
              value={selectedDoctor?._id || ''}
              onChange={(e) => {
                const doc = doctors.find(d => d._id === e.target.value);
                setSelectedDoctor(doc || null);
                setSelectedDate(null);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Choose a specialist...</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>Dr. {doc.firstname} {doc.lastname} - {doc.specialty}</option>
              ))}
            </select>
          </div>

          <div className={`transition-opacity duration-300 ${selectedDoctor ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Select Date</label>
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><ChevronLeft size={20}/></button>
              <span className="font-semibold text-gray-900 dark:text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><ChevronRight size={20}/></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="text-xs font-semibold text-gray-400 py-1">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayName = DAYS_OF_WEEK[dateObj.getDay()];
                const isPast = dateObj < today;

                // --- 100% FOOLPROOF STRING CHECK ---
                // We construct the explicit YYYY-MM-DD string for the current calendar grid cell
                const gridDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                // We split the MongoDB ISODate right at the 'T' to get a clean string, avoiding ALL timezone shifts
                const isBlocked = selectedDoctor?.blockedDates?.some(blockedItem => {
                  const normalizedBlocked = String(blockedItem).split('T')[0];
                  return normalizedBlocked === gridDateStr;
                }) ?? false;

                // Check active appointments using the same clean string method
                const hasApt = appointments.some(apt => {
                  if (apt.status === 'cancelled') return false;
                  return String(apt.scheduledDate).split('T')[0] === gridDateStr;
                });

                // Check Selected Date
                let isSelected = false;
                if (selectedDate) {
                  const selectedGridStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                  isSelected = selectedGridStr === gridDateStr;
                }

                // Check explicit working hours
                const isDocAvailable = selectedDoctor?.availableSlots && selectedDoctor.availableSlots.length > 0
                  ? selectedDoctor.availableSlots.some(s => s.dayOfWeek === dayName)
                  : true;

                const isSelectable = !isPast && isDocAvailable && !isBlocked;
                
                return (
                  <button 
                    type="button"
                    key={day} 
                    disabled={!isSelectable} 
                    onClick={() => handleDateSelect(day)}
                    className={`relative p-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center min-h-[40px]
                      ${isBlocked 
                        ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 cursor-not-allowed opacity-60' 
                        : !isSelectable 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-40' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                      }
                      ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700 font-bold border-transparent shadow-sm' : ''}
                    `}
                  >
                    <span>{day}</span>
                    {hasApt && !isSelected && !isBlocked && (
                      <div className="h-1 w-1 rounded-full bg-blue-400 absolute bottom-1"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in fade-in">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl flex items-start gap-2"><AlertCircle size={16} className="shrink-0 mt-0.5"/>{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Time Slot</label>
                  <select required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full p-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none">
                    {availableTimeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none">
                    <option value="video">Video Call</option>
                    <option value="live_chat">Live Chat</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <textarea required rows={2} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Symptoms..." className="w-full p-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none resize-none"></textarea>
              </div>
              <button type="submit" disabled={bookingLoading} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: SCHEDULE TABS & LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            {['upcoming', 'past', 'cancelled'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 font-semibold text-sm rounded-lg capitalize transition-colors ${activeTab === tab ? (tab === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400') : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">Loading your schedule...</div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div key={apt._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center gap-4 transition-colors hover:border-blue-300">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${apt.status === 'scheduled' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : apt.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        {apt.type === 'video' ? <Video size={14} /> : <MessageSquare size={14} />} 
                        {apt.type === 'video' ? 'Virtual Consultation' : 'Live Chat'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <User size={18} className="text-blue-600"/> Dr. {apt.doctor?.firstname} {apt.doctor?.lastname}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{apt.doctor?.specialty}</span>
                      <span>•</span><CalendarIcon size={14} /> {new Date(apt.scheduledDate).toLocaleDateString()} 
                      <span>•</span><Clock size={14} /> {apt.startTime} - {apt.endTime}
                    </p>
                  </div>
                  
                  {(apt.status === 'scheduled' || apt.status === 'rescheduled' || apt.status === 'in_progress') ? (
                    <div className="flex flex-col md:flex-row gap-2">
                      <Link
                        href={`/patient/consultations/${apt._id}`}
                        className={`px-4 py-2 font-medium rounded-xl transition-colors text-sm flex items-center gap-2 justify-center ${
                          apt.status === 'in_progress'
                            ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                            : 'bg-[#1e3a8a] hover:bg-[#152870] text-white'
                        }`}
                      >
                        <Phone size={16} />
                        {apt.status === 'in_progress' ? '🔴 Join Now — LIVE' : 'Join Consultation'}
                      </Link>
                      {apt.status !== 'in_progress' && (
                        <button
                          onClick={() => handleCancel(apt._id)}
                          className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <CalendarIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No {activeTab} appointments</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Use the calendar to schedule a new consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}