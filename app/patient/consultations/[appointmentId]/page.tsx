"use client";

import { useState, useEffect, useRef, use } from 'react';
import { Send, Phone, X, Clock, User } from 'lucide-react';
import { apiCall } from '@/lib/utils/api';
import Link from 'next/link';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstname: string;
    lastname: string;
    profileImage?: string;
  };
  senderRole: 'doctor' | 'patient';
  message: string;
  createdAt: string;
}

interface Appointment {
  _id: string;
  doctor: {
    _id: string;
    firstname: string;
    lastname: string;
    specialty: string;
    profileImage?: string;
  };
  patient: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    profileImage?: string;
  };
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  reason: string;
  notes?: string;
}

export default function PatientConsultation({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = use(params);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const patientId = typeof window !== 'undefined' ? sessionStorage.getItem('patientId') : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Poll both appointment status and messages together so the patient
    // sees the LIVE state immediately when the doctor starts the session.
    const fetchAll = async () => {
      try {
        const [aptData, msgData] = await Promise.all([
          apiCall(`/consultations/${appointmentId}`),
          apiCall(`/consultations/${appointmentId}/messages`),
        ]);
        setAppointment(aptData);
        setMessages(msgData || []);
      } catch (error) {
        console.error('Failed to fetch consultation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !patientId || !appointment) return;

    setSending(true);
    try {
      const messageData = {
        message: newMessage,
        senderId: patientId,
        senderRole: 'patient',
      };

      await apiCall(
        `/consultations/${appointmentId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(messageData),
        }
      );

      setNewMessage('');

      // Fetch updated messages
      const msgData = await apiCall(`/consultations/${appointmentId}/messages`);
      setMessages(msgData || []);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading || !appointment) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading consultation...</p>
        </div>
      </div>
    );
  }

  const isAppointmentTime = () => {
    const now = new Date();
    const appointmentDateTime = new Date(appointment.scheduledDate);
    const [startHour, startMin] = appointment.startTime.split(':').map(Number);
    const [endHour, endMin] = appointment.endTime.split(':').map(Number);

    appointmentDateTime.setHours(startHour, startMin, 0);
    const appointmentEndTime = new Date(appointmentDateTime);
    appointmentEndTime.setHours(endHour, endMin, 0);

    return now >= appointmentDateTime && now <= appointmentEndTime;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/patient/appointments"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Consultation with Dr. {appointment.doctor.firstname} {appointment.doctor.lastname}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {appointment.doctor.specialty}
              </p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${
            appointment.status === 'in_progress'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {appointment.status === 'in_progress' ? '🔴 Live' : 'Scheduled'}
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
            <p className="text-sm text-gray-900 dark:text-white font-semibold mt-1">
              {new Date(appointment.scheduledDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Time</p>
            <p className="text-sm text-gray-900 dark:text-white font-semibold mt-1">
              {appointment.startTime} - {appointment.endTime}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Type</p>
            <p className="text-sm text-gray-900 dark:text-white font-semibold mt-1 capitalize">
              {appointment.type.replace('_', ' ')}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Reason</p>
            <p className="text-sm text-gray-900 dark:text-white font-semibold mt-1 truncate">
              {appointment.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Phone size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {appointment.status === 'in_progress'
                  ? 'No messages yet. Send a message to begin.'
                  : `Waiting for the doctor to start the session. Scheduled at ${appointment.startTime}.`}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.senderRole === 'patient' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-xs md:max-w-md lg:max-w-lg ${
                    msg.senderRole === 'patient' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      msg.senderRole === 'patient'
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <User
                      size={20}
                      className={
                        msg.senderRole === 'patient'
                          ? 'text-blue-600'
                          : 'text-gray-600 dark:text-gray-300'
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {msg.senderRole === 'patient' ? 'You' : `Dr. ${msg.sender.lastname}`}
                    </p>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        msg.senderRole === 'patient'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm wrap-break-word">{msg.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input — unlocked once the doctor starts the session */}
      {appointment.status === 'in_progress' ? (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <div className="max-w-4xl mx-auto text-center text-gray-600 dark:text-gray-400">
            <Clock size={20} className="mx-auto mb-2 opacity-50" />
            <p>Waiting for the doctor to start the session.</p>
          </div>
        </div>
      )}
    </div>
  );
}
