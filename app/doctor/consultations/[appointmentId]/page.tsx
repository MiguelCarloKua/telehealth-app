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

export default function DoctorConsultation({
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
  const [consultationStarted, setConsultationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const doctorId = typeof window !== 'undefined' ? sessionStorage.getItem('doctorId') : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const aptData = await apiCall(`/consultations/${appointmentId}`);
        setAppointment(aptData);
        setConsultationStarted(aptData.status === 'in_progress');
      } catch (error) {
        console.error('Failed to fetch appointment:', error);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgData = await apiCall(`/consultations/${appointmentId}/messages`);
        setMessages(msgData || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  const handleStartConsultation = async () => {
    try {
      const updated = await apiCall(
        `/consultations/${appointmentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'in_progress' }),
        }
      );
      setAppointment(updated);
      setConsultationStarted(true);
    } catch (error) {
      console.error('Failed to start consultation:', error);
    }
  };

  const handleEndConsultation = async () => {
    try {
      const updated = await apiCall(
        `/consultations/${appointmentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        }
      );
      setAppointment(updated);
      setConsultationStarted(false);
    } catch (error) {
      console.error('Failed to end consultation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !doctorId || !appointment) return;

    setSending(true);
    try {
      const messageData = {
        message: newMessage,
        senderId: doctorId,
        senderRole: 'doctor',
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
              href="/doctor/schedule"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Consultation with {appointment.patient.firstname} {appointment.patient.lastname}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {appointment.patient.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              consultationStarted
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {consultationStarted ? '🔴 Live' : appointment.status}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

          {/* Control Buttons */}
          {isAppointmentTime() && (
            <div className="flex gap-3">
              {!consultationStarted ? (
                <button
                  onClick={handleStartConsultation}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Consultation
                </button>
              ) : (
                <button
                  onClick={handleEndConsultation}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Consultation
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Phone size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {consultationStarted
                  ? 'No messages yet. Start communicating with the patient.'
                  : 'Waiting for consultation to start...'}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.senderRole === 'doctor' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-xs md:max-w-md lg:max-w-lg ${
                    msg.senderRole === 'doctor' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      msg.senderRole === 'doctor'
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <User
                      size={20}
                      className={
                        msg.senderRole === 'doctor'
                          ? 'text-blue-600'
                          : 'text-gray-600 dark:text-gray-300'
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {msg.senderRole === 'doctor'
                        ? 'You'
                        : `${msg.sender.firstname} ${msg.sender.lastname}`}
                    </p>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        msg.senderRole === 'doctor'
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

      {/* Message Input */}
      {consultationStarted ? (
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
            <p>
              {isAppointmentTime()
                ? 'Click "Start Consultation" to begin the session.'
                : 'Messages will be available during the scheduled appointment time.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
