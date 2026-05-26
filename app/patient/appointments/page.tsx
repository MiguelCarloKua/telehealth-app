export default function AppointmentsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-500">Manage your upcoming and past consultations.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
          + Book New
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Sample Appointment Row */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-2">UPCOMING</span>
            <h3 className="text-lg font-bold text-gray-900">Dr. Sarah Jenkins</h3>
            <p className="text-gray-500">Cardiology Consultation • May 28, 2026 at 10:00 AM</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
              Reschedule
            </button>
            <button className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}