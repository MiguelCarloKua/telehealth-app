"use client";

import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { apiCall } from '@/lib/utils/api';

interface Doctor {
  _id: string;
  firstname: string;
  lastname: string;
  specialty: string;
  bio?: string;
  experience?: number;
  profileImage?: string;
  expertiseTags?: string[];
}

const PAGE_SIZE = 9;

const SPECIALTIES = [
  'All Specialties',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await apiCall('/doctors');
        setDoctors(data || []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, specialty, sortBy]);

  const filtered = doctors
    .filter(doc => {
      const fullName = `${doc.firstname} ${doc.lastname}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.expertiseTags ?? []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSpecialty =
        specialty === 'All Specialties' || doc.specialty === specialty;
      return matchesSearch && matchesSpecialty;
    })
    .sort((a, b) =>
      sortBy === 'name-desc'
        ? b.lastname.localeCompare(a.lastname)
        : a.lastname.localeCompare(b.lastname)
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goTo = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a] dark:text-blue-100">Find a Doctor</h1>
          <p className="text-[#2448c4] dark:text-blue-400 opacity-70 mt-1">
            Browse our network of specialists and book online.
          </p>
        </div>
        <Link
          href="/patient/ai"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#152870] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Sparkles size={16} /> AI Recommendation
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-[#0e1e55] p-4 rounded-2xl shadow-sm border border-blue-100 dark:border-[#1e3a8a]/40">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-blue-600" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, specialty, or keyword…"
            className="w-full pl-11 pr-4 py-3 bg-[#f0f4ff] dark:bg-[#0c1840] border border-blue-100 dark:border-[#1e3a8a]/40 rounded-xl text-[#1e3a8a] dark:text-blue-100 placeholder-blue-300 dark:placeholder-blue-700 focus:outline-none focus:ring-2 focus:ring-[#2448c4] text-sm"
          />
        </div>

        <select
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
          className="px-4 py-3 bg-[#f0f4ff] dark:bg-[#0c1840] border border-blue-100 dark:border-[#1e3a8a]/40 rounded-xl text-[#1e3a8a] dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2448c4] text-sm cursor-pointer"
        >
          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 dark:text-blue-600 pointer-events-none" size={16} />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="pl-9 pr-4 py-3 bg-[#f0f4ff] dark:bg-[#0c1840] border border-blue-100 dark:border-[#1e3a8a]/40 rounded-xl text-[#1e3a8a] dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2448c4] text-sm cursor-pointer"
          >
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-70">
          {filtered.length === 0
            ? 'No doctors found'
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} doctor${filtered.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0e1e55] rounded-2xl p-6 border border-blue-100 dark:border-[#1e3a8a]/40 animate-pulse h-52" />
          ))
        ) : paginated.length > 0 ? (
          paginated.map(doctor => (
            <div
              key={doctor._id}
              className="bg-white dark:bg-[#0e1e55] p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-[#1e3a8a]/40 hover:border-[#2448c4]/50 dark:hover:border-blue-600/50 hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-[#cddbfe] dark:bg-[#1e3a8a]/50 flex items-center justify-center font-bold text-lg text-[#1e3a8a] dark:text-blue-200 shrink-0 overflow-hidden border-2 border-blue-200 dark:border-[#1e3a8a]/60">
                  {doctor.profileImage ? (
                    <img src={doctor.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    `${doctor.firstname?.charAt(0) ?? ''}${doctor.lastname?.charAt(0) ?? ''}`
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[#1e3a8a] dark:text-blue-100 leading-tight">
                    Dr. {doctor.firstname} {doctor.lastname}
                  </h3>
                  <p className="text-[#2448c4] dark:text-blue-400 font-medium text-sm mt-0.5">{doctor.specialty}</p>
                  {doctor.experience !== undefined && (
                    <p className="text-xs text-blue-300 dark:text-blue-500 mt-0.5">
                      {doctor.experience} yr{doctor.experience !== 1 ? 's' : ''} experience
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-80 mb-3 flex-1 line-clamp-3">
                {doctor.bio || 'No bio available.'}
              </p>

              {(doctor.expertiseTags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doctor.expertiseTags!.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#e8eeff] dark:bg-[#0c1840] text-[#2448c4] dark:text-blue-400 text-xs rounded-full border border-blue-100 dark:border-[#1e3a8a]/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-blue-50 dark:border-[#1e3a8a]/30 mt-auto">
                <Link
                  href="/patient/appointments"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <Calendar size={14} /> Book
                </Link>
                <Link
                  href="/patient/ai"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#f0f4ff] dark:bg-[#0c1840] hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 text-[#2448c4] dark:text-blue-400 rounded-xl text-sm font-semibold transition-colors border border-blue-100 dark:border-[#1e3a8a]/40"
                >
                  <Sparkles size={14} /> Ask AI
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
            <User size={40} className="text-blue-200 dark:text-blue-800" />
            <p className="text-[#2448c4] dark:text-blue-400 font-medium">No doctors found matching your criteria.</p>
            <button
              onClick={() => { setSearchQuery(''); setSpecialty('All Specialties'); }}
              className="text-sm text-[#1e3a8a] dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-white dark:bg-[#0e1e55] border border-blue-100 dark:border-[#1e3a8a]/40 text-[#2448c4] dark:text-blue-400 hover:bg-[#f0f4ff] dark:hover:bg-[#0c1840] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => goTo(page)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                page === currentPage
                  ? 'bg-[#1e3a8a] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0e1e55] border border-blue-100 dark:border-[#1e3a8a]/40 text-[#2448c4] dark:text-blue-400 hover:bg-[#f0f4ff] dark:hover:bg-[#0c1840]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-white dark:bg-[#0e1e55] border border-blue-100 dark:border-[#1e3a8a]/40 text-[#2448c4] dark:text-blue-400 hover:bg-[#f0f4ff] dark:hover:bg-[#0c1840] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
