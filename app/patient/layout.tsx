import Link from 'next/link';
import { ReactNode } from 'react';

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-blue-600">HealthApp</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/patient/dashboard" className="block p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/patient/doctors" className="block p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors">
            Find a Doctor
          </Link>
          <Link href="/patient/appointments" className="block p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors">
            Appointments
          </Link>
          <Link href="/patient/records" className="block p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors">
            Medical Records
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link href="/auth/login" className="block p-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors">
            Log Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}