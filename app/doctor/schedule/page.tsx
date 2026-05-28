"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Ban, FileText, User, Clock, Check, Video, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { apiCall } from '@/lib/utils/api';

type TabType = 'appointments' | 'availability';

export default function DoctorSchedule() {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityDate, setAvailabilityDate] = useState(new Date());
  const [rescheduleDateObj, setRescheduleDateObj] = useState(new Date());

  const [selectedApt, setSelectedApt] = useState<any | null>(null);
  const [rescheduleSelectedDate, setRescheduleSelectedDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<string>('');

  const [weeklySchedule, setWeeklySchedule] = useState([
    { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Sunday', startTime: '09:00', endTime: '17:00' },
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const fetchData = async () => {
      const doctorId = localStorage.getItem('doctorId');
      if (!doctorId) return;
      try {
        const [aptData, docData] = await Promise.all([
          apiCall(`/appointments?doctorId=${doctorId}`),
          fetch(`/api/users/${doctorId}`).then(res => res.json())
        ]);
        setAppointments(aptData || []);
        
        if (docData.availableSlots && docData.availableSlots.length > 0) {
          setWeeklySchedule(docData.availableSlots);
        }

        if (docData.blockedDates) {
          const normalized = docData.blockedDates.map((d: string) => {
            const dateObj = new Date(d);
            return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          });
          setBlockedDates([...new Set(normalized)] as string[]);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const getLocalDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAptsForDate = (day: number, targetMonthDate: Date) => {
    return appointments.filter(a => {
      if (a.status === 'cancelled') return false;
      const aptDate = new Date(a.scheduledDate);
      return aptDate.getFullYear() === targetMonthDate.getFullYear() &&
             aptDate.getMonth() === targetMonthDate.getMonth() &&
             aptDate.getDate() === day;
    });
  };

  const toggleBlockDate = (day: number) => {
    const dateToToggle = new Date(availabilityDate.getFullYear(), availabilityDate.getMonth(), day);
    if (dateToToggle < today) return;
    
    const dateStr = getLocalDateString(availabilityDate.getFullYear(), availabilityDate.getMonth(), day);
    setBlockedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
  };

  const saveBlockedDates = async () => {
    setSaving(true);
    const doctorId = localStorage.getItem('doctorId');
    try {
      await fetch(`/api/users/${doctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedDates, availableSlots: weeklySchedule }),
      });
      alert('Calendar and Availability successfully synced to database!');
    } catch (err) { console.error("Failed to save schedule slots:", err); } 
    finally { setSaving(false); }
  };

  const handleReschedule = async () => {
    if (!selectedApt || !rescheduleSelectedDate || !rescheduleTime) return;
    const [hours, minutes] = rescheduleTime.split(':');
    const finalDate = new Date(rescheduleSelectedDate);
    finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    await fetch(`/api/appointments/${selectedApt._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        scheduledDate: finalDate.toISOString(), 
        startTime: rescheduleTime,
        status: 'rescheduled' 
      }),
    });
    alert("Appointment Rescheduled!");
    setSelectedApt(null);
    window.location.reload();
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule(prev => prev.map(s => s.dayOfWeek === day ? { ...s, [field]: value } : s));
  };

  // --- STRICT HOURS LOGIC: Dynamically generate slots for the Reschedule Modal ---
  const generateRescheduleSlots = () => {
    if (!rescheduleSelectedDate) return [];
    
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rescheduleSelectedDate.getDay()];
    const schedule = weeklySchedule.find(s => s.dayOfWeek === dayName) || { startTime: '09:00', endTime: '17:00' };

    // Find slots already booked on this day to prevent double-booking
    const bookedTimes = appointments
      .filter(a => {
         if (a.status === 'cancelled' || a._id === selectedApt?._id) return false;
         const aptDate = new Date(a.scheduledDate);
         return aptDate.getFullYear() === rescheduleSelectedDate.getFullYear() &&
                aptDate.getMonth() === rescheduleSelectedDate.getMonth() &&
                aptDate.getDate() === rescheduleSelectedDate.getDate();
      })
      .map(a => a.startTime);

    const slots = [];
    let curr = new Date(`2000-01-01T${schedule.startTime}:00`);
    const end = new Date(`2000-01-01T${schedule.endTime}:00`);

    while (curr < end) {
      const val = curr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const hour = curr.getHours();
      const mins = String(curr.getMinutes()).padStart(2, '0');
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      
      slots.push({ 
        value: val, 
        label: `${displayHour}:${mins} ${ampm}`,
        isBooked: bookedTimes.includes(val)
      });
      curr.setMinutes(curr.getMinutes() + 30);
    }
    return slots;
  };
  
  const dynamicTimeSlots = generateRescheduleSlots();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const prevAvailMonth = () => setAvailabilityDate(new Date(availabilityDate.getFullYear(), availabilityDate.getMonth() - 1));
  const nextAvailMonth = () => setAvailabilityDate(new Date(availabilityDate.getFullYear(), availabilityDate.getMonth() + 1));

  const renderCalendarGrid = (
    baseDate: Date, 
    onDayClick: (day: number) => void, 
    renderDayContent: (day: number, isPast: boolean) => React.ReactNode,
    size: 'small' | 'large' = 'small'
  ) => {
    const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).getDay();

    return (
      <div className={`grid grid-cols-7 ${size === 'large' ? 'gap-2' : 'gap-1'} text-center`}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs font-semibold text-gray-400 py-2">{day}</div>
        ))}
        {Array.from({length: firstDay}).map((_,i) => <div key={`empty-${i}`}></div>)}
        {Array.from({length: daysInMonth}).map((_,i) => {
          const day = i + 1;
          const isPast = new Date(baseDate.getFullYear(), baseDate.getMonth(), day) < today;
          return (
            <button 
              type="button"
              key={day} 
              disabled={isPast && size === 'large'}
              onClick={() => onDayClick(day)}
              className={`relative ${size === 'large' ? 'min-h-[80px] p-2 border border-gray-100 dark:border-gray-700' : 'min-h-[40px] p-1'} rounded-xl transition-all outline-none`}
            >
              {renderDayContent(day, isPast)}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule Management</h1>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {(['appointments', 'availability'] as TabType[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`pb-4 px-2 capitalize font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-violet-600 text-violet-600 dark:text-violet-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {tab === 'availability' ? 'Manage Availability' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6 self-start">
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><ChevronLeft size={20}/></button>
              <span className="font-semibold text-gray-900 dark:text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><ChevronRight size={20}/></button>
            </div>
            
            {renderCalendarGrid(currentDate, () => {}, (day) => {
              const apts = getAptsForDate(day, currentDate);
              const isToday = today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
              return (
                <div className={`w-full h-full flex flex-col items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${isToday ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                  <span>{day}</span>
                  {apts.length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-violet-500 absolute bottom-1"></div>}
                </div>
              );
            })}
          </div>
          
{/* APPOINTMENTS LIST PANEL */}
          <div className="lg:col-span-2 space-y-4">
            {appointments
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()) // Sort chronologically
              .map(apt => (
              <div key={apt._id} className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-violet-300 ${apt.status === 'cancelled' ? 'opacity-60 border-gray-100 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 flex-shrink-0 border border-gray-200 dark:border-gray-600 overflow-hidden">
                    {apt.patient?.profileImage ? (
                      <img src={apt.patient.profileImage} alt="Patient" className="h-full w-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div>
                    {/* STATUS BADGE & TYPE ADDED HERE */}
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider 
                        ${apt.status === 'scheduled' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : apt.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}
                      >
                        {apt.status ? apt.status.replace('_', ' ') : 'SCHEDULED'}
                      </span>
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        {apt.type === 'video' ? <Video size={12} /> : <MessageSquare size={12} />} 
                        {apt.type === 'video' ? 'Virtual' : 'Chat'}
                      </span>
                    </div>
                    
                    <p className="font-bold text-gray-900 dark:text-white text-lg">{apt.patient?.firstname} {apt.patient?.lastname}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                      <Clock size={14} /> {new Date(apt.scheduledDate).toLocaleDateString()} | {apt.startTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {apt.patient?.medicalHistory && (
                     <Link href={`/doctor/patients/${apt.patient._id}/records`} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 font-medium rounded-xl transition-colors text-sm">
                       <FileText size={16}/> Records
                     </Link>
                  )}
                  
                  {/* HIDE RESCHEDULE BUTTON IF CANCELLED OR COMPLETED */}
                  {(apt.status === 'scheduled' || apt.status === 'rescheduled') && (
                    <button onClick={() => { setSelectedApt(apt); setRescheduleSelectedDate(null); setRescheduleTime(''); }} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-violet-200 hover:bg-violet-50 text-violet-600 dark:border-violet-900/50 dark:hover:bg-violet-900/20 dark:text-violet-400 font-medium rounded-xl transition-colors text-sm">
                      <Edit3 size={16}/> Reschedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Calendar & Hours</h3>
              <p className="text-gray-500 text-sm mt-1">Set your weekly recurring working hours, or block specific dates.</p>
            </div>
            <button onClick={saveBlockedDates} className="bg-violet-600 hover:bg-violet-700 transition-colors text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm">
              <Check size={18} /> {saving ? 'Saving...' : 'Save Calendar'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* WEEKLY HOURS SETUP */}
            <div className="lg:col-span-1 space-y-4 bg-gray-50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 h-fit">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Weekly Hours</h4>
              {weeklySchedule.map(slot => (
                <div key={slot.dayOfWeek} className="flex flex-col space-y-1 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{slot.dayOfWeek}</span>
                  <div className="flex gap-2 items-center">
                    <input type="time" value={slot.startTime} onChange={(e) => handleTimeChange(slot.dayOfWeek, 'startTime', e.target.value)} className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 text-gray-900 dark:text-white outline-none" />
                    <span className="text-gray-500 text-xs">-</span>
                    <input type="time" value={slot.endTime} onChange={(e) => handleTimeChange(slot.dayOfWeek, 'endTime', e.target.value)} className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 text-gray-900 dark:text-white outline-none" />
                  </div>
                </div>
              ))}
            </div>

            {/* BLOCK DATES GRID */}
            <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex justify-between items-center mb-6">
                <button onClick={prevAvailMonth} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"><ChevronLeft size={24}/></button>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{availabilityDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={nextAvailMonth} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"><ChevronRight size={24}/></button>
              </div>

              {renderCalendarGrid(availabilityDate, toggleBlockDate, (day, isPast) => {
                const dateStr = getLocalDateString(availabilityDate.getFullYear(), availabilityDate.getMonth(), day);
                const isBlocked = blockedDates.includes(dateStr);
                
                return (
                  <div className={`w-full h-full flex flex-col items-start justify-start p-2 rounded-lg transition-colors border-2
                    ${isPast ? 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50' : 
                      isBlocked ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400' : 
                      'bg-white dark:bg-gray-800 border-transparent hover:border-violet-300 text-gray-900 dark:text-white shadow-sm'}
                  `}>
                    <span className="font-semibold">{day}</span>
                    {isBlocked && <span className="text-[10px] mt-1 font-bold flex items-center gap-1"><Ban size={10}/> Blocked</span>}
                  </div>
                );
              }, 'large')}
            </div>
          </div>
        </div>
      )}

      {selectedApt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-2xl space-y-6 shadow-2xl border border-gray-200 dark:border-gray-700 my-8">
            <h3 className="font-bold text-2xl text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Reschedule Appointment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">1. Select New Date</label>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <button type="button" onClick={() => setRescheduleDateObj(new Date(rescheduleDateObj.setMonth(rescheduleDateObj.getMonth() - 1)))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft size={16}/></button>
                    <span className="font-semibold text-sm">{rescheduleDateObj.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button type="button" onClick={() => setRescheduleDateObj(new Date(rescheduleDateObj.setMonth(rescheduleDateObj.getMonth() + 1)))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><ChevronRight size={16}/></button>
                  </div>
                  {renderCalendarGrid(rescheduleDateObj, (day) => {
                    const d = new Date(rescheduleDateObj.getFullYear(), rescheduleDateObj.getMonth(), day);
                    if (d >= today) setRescheduleSelectedDate(d);
                  }, (day, isPast) => {
                     const d = new Date(rescheduleDateObj.getFullYear(), rescheduleDateObj.getMonth(), day);
                     const isSelected = rescheduleSelectedDate?.getFullYear() === rescheduleDateObj.getFullYear() &&
                                        rescheduleSelectedDate?.getMonth() === rescheduleDateObj.getMonth() &&
                                        rescheduleSelectedDate?.getDate() === day;
                     return (
                        <div className={`w-full h-full min-h-[35px] flex items-center justify-center rounded-lg text-xs font-medium transition-all
                          ${isPast ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 
                            isSelected ? 'bg-violet-600 text-white font-bold shadow-md' : 'hover:bg-violet-100 dark:hover:bg-violet-900/30 text-gray-700 dark:text-gray-300'}
                        `}>
                          {day}
                        </div>
                     )
                  })}
                </div>
              </div>

              <div className={`transition-opacity duration-300 ${rescheduleSelectedDate ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">2. Select Time (AM/PM)</label>
                <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 pb-2">
                  {dynamicTimeSlots.length === 0 ? (
                    <div className="col-span-2 text-center text-sm text-gray-500 dark:text-gray-400 py-6">No working hours set for this day.</div>
                  ) : (
                    dynamicTimeSlots.map(slot => (
                      <button 
                        type="button"
                        key={slot.value}
                        disabled={slot.isBooked}
                        onClick={() => setRescheduleTime(slot.value)}
                        className={`p-2.5 text-sm font-medium rounded-xl border transition-all
                          ${slot.isBooked 
                            ? 'bg-gray-100 border-transparent text-gray-400 opacity-50 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500' 
                            : rescheduleTime === slot.value 
                              ? 'bg-violet-50 border-violet-600 text-violet-700 dark:bg-violet-900/20 dark:border-violet-500 dark:text-violet-300' 
                              : 'bg-white border-gray-200 text-gray-700 hover:border-violet-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-violet-500'}
                        `}
                      >
                        {slot.label} {slot.isBooked && '(Booked)'}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => setSelectedApt(null)} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-semibold text-gray-900 dark:text-white rounded-xl">
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleReschedule} 
                disabled={!rescheduleSelectedDate || !rescheduleTime}
                className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-700 transition-colors font-semibold text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Confirm New Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}