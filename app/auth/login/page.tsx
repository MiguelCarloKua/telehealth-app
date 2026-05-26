import Link from 'next/link';

export default function Login() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Log in to manage your health journey.</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              required 
              placeholder="alex@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="#" className="text-sm text-blue-600 font-medium hover:underline">
                Forgot password?
              </a>
            </div>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Log In
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account yet?{' '}
          <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
}