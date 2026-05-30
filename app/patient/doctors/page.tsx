"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, Sparkles, User, Star, X, MapPin } from 'lucide-react';
import Link from 'next/link';
import { apiCall } from '@/lib/utils/api';

// Fallback coords: Caloocan City Hall area
const CALOOCAN_FALLBACK = { lat: 14.6560, lng: 120.9788 };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Doctor {
  _id: string;
  firstname: string;
  lastname: string;
  specialty: string;
  bio?: string;
  experience?: number;
  profileImage?: string;
  expertiseTags?: string[];
  location?: {
    barangay: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
}

interface RatingSummary {
  average: number;
  count: number;
  reviews: any[];
}

const PAGE_SIZE = 9;

function buildAiQuery(doctor: Doctor, distanceKm: number): string {
  const name = `Dr. ${doctor.firstname} ${doctor.lastname}`;
  const location = doctor.location?.barangay
    ? `${doctor.location.barangay}, ${doctor.location.city} (${distanceKm.toFixed(1)} km from my location)`
    : 'Caloocan';
  const tags = (doctor.expertiseTags ?? []).join(', ') || 'not specified';
  const exp = doctor.experience !== undefined ? `${doctor.experience} years of experience` : '';

  return (
    `I'm considering booking ${name}, a ${doctor.specialty} specialist${exp ? ` with ${exp}` : ''}, ` +
    `located in ${location}. Their areas of expertise include: ${tags}.\n\n` +
    `Based on my personal health profile and medical history, please explain:\n` +
    `1. How well does their specialty and expertise match my conditions and needs?\n` +
    `2. What specific health issues or symptoms of mine would they be best suited to address?\n` +
    `3. Is their distance from me reasonable compared to other available specialists?\n` +
    `Give me a clear, honest recommendation on whether I should choose them.`
  );
}

function StarDisplay({ stars, size = 13 }: { stars: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(stars) ? 'currentColor' : 'none'}
          className={i <= Math.round(stars) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
    </div>
  );
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');
  const [sortBy, setSortBy] = useState('nearest');
  const [currentPage, setCurrentPage] = useState(1);

  const [ratingsMap, setRatingsMap] = useState<Record<string, RatingSummary>>({});
  const [reviewsModal, setReviewsModal] = useState<Doctor | null>(null);

  // Real geolocation — falls back to Caloocan if denied or unavailable
  const [patientLoc, setPatientLoc] = useState(CALOOCAN_FALLBACK);
  const [locLabel, setLocLabel] = useState('Caloocan (default)');
  const [locDetecting, setLocDetecting] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocDetecting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPatientLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLabel('Your location (detected)');
        setLocDetecting(false);
      },
      () => {
        setLocDetecting(false); // keep Caloocan fallback
      },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [doctorsData, ratingsData] = await Promise.allSettled([
          apiCall('/doctors'),
          apiCall('/ratings'),
        ]);

        setDoctors(doctorsData.status === 'fulfilled' ? (doctorsData.value ?? []) : []);

        if (ratingsData.status === 'fulfilled') {
          const rMap: Record<string, RatingSummary> = {};
          (ratingsData.value ?? []).forEach((r: any) => {
            const did = r.doctor && typeof r.doctor === 'object' ? r.doctor._id : r.doctor;
            if (!did) return;
            if (!rMap[did]) rMap[did] = { average: 0, count: 0, reviews: [] };
            rMap[did].reviews.push(r);
          });
          Object.keys(rMap).forEach(did => {
            const rm = rMap[did];
            rm.count = rm.reviews.length;
            rm.average = rm.reviews.reduce((s: number, r: any) => s + r.stars, 0) / rm.count;
          });
          setRatingsMap(rMap);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, specialty, sortBy]);

  // Derive specialty options from the actual doctor list with live counts
  const specialtyOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    doctors.forEach(doc => {
      if (doc.specialty) counts[doc.specialty] = (counts[doc.specialty] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count }));
  }, [doctors]);

  const getDistance = (doc: Doctor): number => {
    const coords = doc.location?.coordinates;
    if (!coords) return Infinity;
    return haversineKm(patientLoc.lat, patientLoc.lng, coords.lat, coords.lng);
  };

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
    .sort((a, b) => {
      if (sortBy === 'nearest') return getDistance(a) - getDistance(b);
      if (sortBy === 'name-desc') return b.lastname.localeCompare(a.lastname);
      return a.lastname.localeCompare(b.lastname);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goTo = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const reviewsData = reviewsModal ? ratingsMap[reviewsModal._id] : null;

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
      </div>

      {/* Patient location banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-[#0c1840] border border-blue-100 dark:border-[#1e3a8a]/40 rounded-xl text-sm text-[#1e3a8a] dark:text-blue-300">
        <MapPin size={15} className="shrink-0 text-[#2448c4] dark:text-blue-400" />
        {locDetecting ? (
          <span className="flex items-center gap-1.5 text-[#2448c4] dark:text-blue-400 opacity-70">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
            Detecting your location…
          </span>
        ) : (
          <span>Your location: <span className="font-semibold">{locLabel}</span> — showing nearby doctors sorted by distance</span>
        )}
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
          <option value="All Specialties">All Specialties</option>
          {specialtyOptions.map(({ name, count }) => (
            <option key={name} value={name}>{name} ({count})</option>
          ))}
        </select>

        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 dark:text-blue-600 pointer-events-none" size={16} />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="pl-9 pr-4 py-3 bg-[#f0f4ff] dark:bg-[#0c1840] border border-blue-100 dark:border-[#1e3a8a]/40 rounded-xl text-[#1e3a8a] dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2448c4] text-sm cursor-pointer"
          >
            <option value="nearest">Nearest first</option>
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
          paginated.map(doctor => {
            const ratingStats = ratingsMap[doctor._id];
            return (
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
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
                        {doctor.location?.barangay && (
                          <p className="flex items-center gap-1 text-xs text-blue-300 dark:text-blue-500 mt-0.5">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{doctor.location.barangay}, {doctor.location.city}</span>
                            {doctor.location.coordinates && (
                              <span className="shrink-0">· {getDistance(doctor).toFixed(1)} km</span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Star Rating — top right, opens reviews modal */}
                      {ratingStats ? (
                        <button
                          onClick={() => setReviewsModal(doctor)}
                          title="View reviews"
                          className="flex flex-col items-end shrink-0 gap-0.5 group"
                        >
                          <StarDisplay stars={ratingStats.average} size={13} />
                          <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-[#2448c4] dark:group-hover:text-blue-400 transition-colors">
                            {ratingStats.average.toFixed(1)} ({ratingStats.count})
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0 mt-0.5">No reviews</span>
                      )}
                    </div>
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
                    href={`/patient/ai?q=${encodeURIComponent(buildAiQuery(doctor, getDistance(doctor)))}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#f0f4ff] dark:bg-[#0c1840] hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 text-[#2448c4] dark:text-blue-400 rounded-xl text-sm font-semibold transition-colors border border-blue-100 dark:border-[#1e3a8a]/40"
                    title={`Ask AI about Dr. ${doctor.firstname} ${doctor.lastname}`}
                  >
                    <Sparkles size={14} /> Ask AI
                  </Link>
                </div>
              </div>
            );
          })
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

      {/* Reviews Modal */}
      {reviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0e1e55] rounded-2xl shadow-2xl border border-blue-100 dark:border-[#1e3a8a]/40 w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-blue-50 dark:border-[#1e3a8a]/30 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-blue-100">
                  Dr. {reviewsModal.firstname} {reviewsModal.lastname}
                </h2>
                <p className="text-sm text-[#2448c4] dark:text-blue-400 opacity-70 mt-0.5">{reviewsModal.specialty}</p>
                {reviewsData && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarDisplay stars={reviewsData.average} size={16} />
                    <span className="text-base font-bold text-yellow-500">{reviewsData.average.toFixed(1)}</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      · {reviewsData.count} review{reviewsData.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setReviewsModal(null)}
                className="p-2 rounded-xl hover:bg-[#f0f4ff] dark:hover:bg-[#0c1840] text-gray-400 hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Reviews List */}
            <div className="overflow-y-auto flex-1 divide-y divide-blue-50 dark:divide-[#1e3a8a]/20">
              {!reviewsData || reviewsData.reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                  <Star size={32} className="text-gray-200 dark:text-gray-700" />
                  <p className="font-semibold text-gray-400 dark:text-gray-500">No reviews yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-600">Be the first to rate this doctor after your consultation.</p>
                </div>
              ) : (
                reviewsData.reviews.map((review: any) => (
                  <div key={review._id} className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#cddbfe] dark:bg-[#1e3a8a]/50 flex items-center justify-center text-xs font-bold text-[#1e3a8a] dark:text-blue-200 shrink-0 overflow-hidden">
                          {review.patient?.profileImage ? (
                            <img src={review.patient.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${review.patient?.firstname?.charAt(0) ?? '?'}${review.patient?.lastname?.charAt(0) ?? ''}`
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1e3a8a] dark:text-blue-100">
                            {review.patient?.firstname ?? 'Patient'} {review.patient?.lastname ?? ''}
                          </p>
                          <StarDisplay stars={review.stars} size={12} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        {new Date(review.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-10">
                      {review.reason}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-blue-50 dark:border-[#1e3a8a]/30 shrink-0">
              <button
                onClick={() => setReviewsModal(null)}
                className="w-full px-4 py-2.5 bg-[#f0f4ff] dark:bg-[#0c1840] hover:bg-[#cddbfe] dark:hover:bg-[#1e3a8a]/30 text-[#2448c4] dark:text-blue-400 text-sm font-semibold rounded-xl border border-blue-100 dark:border-[#1e3a8a]/40 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}