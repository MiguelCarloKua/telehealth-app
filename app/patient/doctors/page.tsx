"use client";

"use client";

import { useState } from 'react';
import { Search, Filter, Star, Video, Calendar, X, ArrowUpDown } from 'lucide-react';

export default function DoctorsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'name-asc', 'name-desc'
  const [searchQuery, setSearchQuery] = useState('');

  // Extended Database with Tags
  const doctorDB = [
    { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiology", rating: 4.9, reviews: 124, available: "Today at 2:00 PM", bio: "Expert in cardiovascular health.", tags: ["Heart", "Blood Pressure", "Adults"] },
    { id: 2, name: "Dr. Marcus Chen", specialty: "Dermatology", rating: 4.8, reviews: 89, available: "Tomorrow at 10:00 AM", bio: "Specializes in medical dermatology.", tags: ["Skin", "Acne", "Allergies"] },
    { id: 3, name: "Dr. Emily Santos", specialty: "General Practice", rating: 5.0, reviews: 312, available: "Available Now", bio: "Primary care and family medicine.", tags: ["Family", "Fever", "Checkups"] },
    { id: 4, name: "Dr. Alan Turing", specialty: "Neurology", rating: 4.7, reviews: 56, available: "Wed, May 30", bio: "Focuses on brain and nervous system.", tags: ["Brain", "Migraines", "Nerves"] },
    { id: 5, name: "Dr. Olivia Bennett", specialty: "Pediatrics", rating: 4.9, reviews: 201, available: "Today at 4:30 PM", bio: "Dedicated to children's health.", tags: ["Children", "Vaccines", "Growth"] },
    { id: 6, name: "Dr. James Wilson", specialty: "Orthopedics", rating: 4.6, reviews: 78, available: "Thu, May 31", bio: "Bone and joint specialist.", tags: ["Bones", "Joints", "Sports Injuries"] },
    { id: 7, name: "Dr. Rachel Kim", specialty: "Psychiatry", rating: 4.9, reviews: 145, available: "Tomorrow at 1:00 PM", bio: "Mental health and therapy.", tags: ["Mental Health", "Anxiety", "Therapy"] },
    { id: 8, name: "Dr. David Patel", specialty: "Gastroenterology", rating: 4.8, reviews: 92, available: "Fri, June 01", bio: "Digestive system expert.", tags: ["Stomach", "Digestion", "Gut Health"] },
    { id: 9, name: "Dr. Maria Garcia", specialty: "Endocrinology", rating: 4.7, reviews: 110, available: "Today at 5:00 PM", bio: "Hormones and metabolism.", tags: ["Hormones", "Diabetes", "Thyroid"] },
    { id: 10, name: "Dr. Robert Taylor", specialty: "Ophthalmology", rating: 4.9, reviews: 167, available: "Tomorrow at 9:00 AM", bio: "Eye care and vision.", tags: ["Eyes", "Vision", "Cataracts"] },
    { id: 11, name: "Dr. Linda Lee", specialty: "Gynecology", rating: 5.0, reviews: 289, available: "Mon, June 04", bio: "Women's reproductive health.", tags: ["Women's Health", "Pregnancy"] },
    { id: 12, name: "Dr. Hassan Meyer", specialty: "ENT", rating: 4.5, reviews: 45, available: "Today at 6:00 PM", bio: "Ear, Nose, and Throat specialist.", tags: ["Ears", "Throat", "Sinus"] },
  ];

  // Sorting and Filtering Logic
  const filteredAndSortedDoctors = doctorDB
    .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find a Doctor</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Browse our network of top-rated specialists and filter by expertise.</p>
      </div>

      {/* Advanced Search, Filter & Sort Controls */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or specialty..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative w-full lg:w-48">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none cursor-pointer appearance-none">
              <option value="">All Body Systems</option>
              <option value="heart">Heart & Blood</option>
              <option value="brain">Brain & Nerves</option>
              <option value="skin">Skin & Hair</option>
              <option value="stomach">Digestive</option>
            </select>
          </div>
          
          <div className="relative w-full lg:w-48">
            <ArrowUpDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none cursor-pointer appearance-none"
            >
              <option value="rating">Highest Rated</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xl">
                  {doctor.name.split(' ')[1][0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{doctor.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">{doctor.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                <Star className="text-yellow-500 fill-current" size={14} />
                <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">{doctor.rating}</span>
              </div>
            </div>
            
            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {doctor.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mt-auto space-y-3 mb-6 border-t border-gray-100 dark:border-gray-700 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white">{doctor.available}</span>
              </p>
            </div>
            
            <button onClick={() => setSelectedDoctor(doctor)} className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
              View & Book
            </button>
          </div>
        ))}
      </div>
      
            {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex justify-between items-start border-b border-gray-100 dark:border-gray-700">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl">
                  {selectedDoctor.name.split(' ')[1][0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDoctor.name}</h2>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">{selectedDoctor.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="text-yellow-500 fill-current" size={14} />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{selectedDoctor.rating} Rating</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Booking Form */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">About</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{selectedDoctor.bio}</p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Book Consultation</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 p-3 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl font-medium">
                      <Video size={18} /> Video Call
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Calendar size={18} /> In-Person
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date & Time</label>
                    <input type="datetime-local" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  alert(`Appointment booked with ${selectedDoctor.name}!`);
                  setSelectedDoctor(null);
                }}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
