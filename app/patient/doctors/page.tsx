export default function DoctorsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
      <p className="text-gray-500 mb-8">Browse our network of specialists and book a consultation.</p>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search doctors by name or symptom..." 
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Specializations</option>
          <option value="cardiology">Cardiology</option>
          <option value="dermatology">Dermatology</option>
          <option value="general">General Practice</option>
        </select>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center hover:border-blue-300 transition-colors">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900">Dr. Sarah Jenkins</h3>
            <p className="text-blue-600 font-medium mb-2">Cardiologist</p>
            <p className="text-sm text-gray-500 mb-6">Available today at 2:00 PM</p>
            <button className="w-full py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
              View Profile & Book
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}