"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Star, Video, Calendar, X, ArrowUpDown } from 'lucide-react';
import { apiCall } from '@/lib/utils/api';

interface Doctor {
  _id: string;
  firstname: string;
  lastname: string;
  specialty: string;
  bio: string;
  experience: number;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await apiCall('/doctors');
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
      // 2. FIX: Update search filter to check against both first and last name
      let result = doctors.filter((doc) => {
        const fullName = `${doc.firstname} ${doc.lastname}`.toLowerCase();
        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      // 3. FIX: Update sorting logic to sort by lastname or firstname
      if (sortBy === 'name-asc') {
        result.sort((a, b) => a.lastname.localeCompare(b.lastname));
      } else if (sortBy === 'name-desc') {
        result.sort((a, b) => b.lastname.localeCompare(a.lastname));
      }

      setFilteredDoctors(result);
    }, [searchQuery, sortBy, doctors]);

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
              <option value="name">Name (A-Z)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
            Loading doctors...
          </div>
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* 4. FIX: Safely grab the first letter of firstname and lastname */}
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                    {doctor.firstname?.charAt(0)}{doctor.lastname?.charAt(0)}
                  </div>
                  <div>
                    {/* 5. FIX: Display the full name safely */}
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Dr. {doctor.firstname} {doctor.lastname}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">{doctor.specialty}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
                {doctor.bio || "No bio available."}
              </p>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 font-medium transition-colors">
                  <Calendar size={16} /> Book
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors">
                  <Video size={16} /> Video
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
            No doctors found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}