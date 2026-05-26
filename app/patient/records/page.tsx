export default function RecordsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Records</h1>
      <p className="text-gray-500 mb-8">Access your consultation history and prescriptions.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">General Checkup</h3>
            <p className="text-sm text-gray-500">Dr. Alan Turing • April 15, 2026</p>
          </div>
          <button className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100">
            View Prescription
          </button>
        </div>
      </div>
    </div>
  );
}