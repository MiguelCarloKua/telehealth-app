import Link from 'next/link';

export default function PatientDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-white min-h-screen">
      {/* Header Section */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Alex!</h1>
          <p className="text-gray-500 mt-1">Here is your health overview for today.</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm">
          AL
        </div>
      </header>

      {/* AI Recommendation Widget */}
      <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
        <h2 className="text-xl font-bold text-blue-900 mb-2">Not feeling well?</h2>
        <p className="text-blue-700 mb-4">
          Describe your symptoms, and our AI will recommend the right specialist for you.
        </p>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="E.g., I have a persistent headache and a slight fever..." 
            className="flex-1 px-4 py-3 rounded-xl border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            Ask AI
          </button>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upcoming Appointment Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Appointment</h2>
            <Link href="/patient/appointments" className="text-blue-600 text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="bg-white p-3 rounded-xl shadow-sm text-center min-w-[65px] border border-gray-100">
              <div className="text-xs font-bold text-red-500 uppercase">May</div>
              <div className="text-xl font-extrabold text-gray-900">28</div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Dr. Sarah Jenkins</h3>
              <p className="text-sm text-gray-500">Cardiology • 10:00 AM</p>
            </div>
            {/* The requirement states patients must be able to join a consultation session */}
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
              Join Call
            </button>
          </div>
        </div>

        {/* Quick Actions / Navigation */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/patient/doctors" 
              className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-gray-100 transition-all group"
            >
              <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">👨‍⚕️</span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Find a Doctor</span>
            </Link>
            <Link 
              href="/patient/records" 
              className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-gray-100 transition-all group"
            >
              <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📋</span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Medical Records</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}