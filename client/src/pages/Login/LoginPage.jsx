import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('citizen');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    ward: '',
    city: '',
    deptId: '',
    deptUsername: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const mockUser = {
      id: '1',
      name: formData.name || (activeTab === 'citizen' ? 'Arjun Sharma' : 'Dept. Officer'),
      email: formData.emailOrPhone || formData.deptUsername,
      role: activeTab,
      ward: formData.ward || 'Ward 10',
      city: formData.city || 'Bengaluru',
      deptId: formData.deptId || null,
    };
    login(mockUser, 'mock-token-123');
    setLoading(false);
    navigate(activeTab === 'authority' ? '/admin' : '/explore');
  };
  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        id: '2',
        name: 'Google User',
        email: 'user@gmail.com',
        role: 'citizen',
        ward: 'Ward 10',
        city: 'Bengaluru',
      };
      login(mockUser, 'mock-google-token');
      setLoading(false);
      navigate('/explore');
    }, 800);
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 flex-col justify-between p-12">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight">CivicPulse</h1>
          <p className="text-blue-200 text-sm mt-1">Smart India Hackathon 2025</p>
        </div>

        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Your city.<br />Your voice.<br />Your impact.
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            Report civic issues, track resolutions, and hold authorities accountable — all in one place.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            <div>
              <p className="text-white text-2xl font-bold">12,400+</p>
              <p className="text-blue-200 text-xs mt-1">Issues Reported</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold">8,900+</p>
              <p className="text-blue-200 text-xs mt-1">Resolved</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold">340+</p>
              <p className="text-blue-200 text-xs mt-1">Wards Covered</p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-blue-500 bg-opacity-50 rounded-2xl p-5">
          <p className="text-white text-sm leading-relaxed italic">
            "Reported a broken streetlight and it was fixed within 3 days. CivicPulse actually works!"
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-blue-800 font-bold text-sm">P</div>
            <div>
              <p className="text-white text-xs font-medium">Priya Nair</p>
              <p className="text-blue-200 text-xs">Citizen, Bengaluru</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600">CivicPulse</h1>
            <p className="text-gray-400 text-sm">Report. Track. Resolve.</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {isRegister ? 'Join thousands of citizens making a difference' : 'Sign in to continue to CivicPulse'}
          </p>

          {/* Citizen / Authority Tab */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'citizen'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setActiveTab('citizen')}
            >
              🧑 Citizen
            </button>
            <button
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'authority'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setActiveTab('authority')}
            >
              🏛️ Department
            </button>
          </div>

          {/* Google / Social Login — only for citizens */}
          {activeTab === 'citizen' && (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all mb-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all mb-5">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or continue with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {isRegister && activeTab === 'citizen' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
                <input
                  name="name"
                  placeholder="Arjun Sharma"
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              </div>
            )}

            {/* Citizen fields */}
            {activeTab === 'citizen' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Email or Phone</label>
                <input
                  name="emailOrPhone"
                  placeholder="you@email.com or 9876543210"
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              </div>
            )}

            {/* Authority fields */}
            {activeTab === 'authority' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Department ID</label>
                  <input
                    name="deptId"
                    placeholder="e.g. DEPT-BLR-042"
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Username</label>
                  <input
                    name="deptUsername"
                    placeholder="Department username"
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Password</label>
                {!isRegister && (
                  <button type="button" className="text-xs text-blue-500 hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Citizen register extra fields */}
            {isRegister && activeTab === 'citizen' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Ward / Area</label>
                  <input
                    name="ward"
                    placeholder="e.g. Ward 42"
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
                  <input
                    name="city"
                    placeholder="Bengaluru"
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Authority register extra fields */}
            {isRegister && activeTab === 'authority' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Department Name</label>
                <input
                  name="deptName"
                  placeholder="e.g. BBMP Roads & Infrastructure"
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Please wait...
                </span>
              ) : (
                `${isRegister ? 'Create Account' : 'Login'} as ${activeTab === 'citizen' ? 'Citizen' : 'Department'}`
              )}
            </button>
          </form>

          {/* Switch Login / Register */}
          <p className="text-center text-sm text-gray-400 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 font-medium hover:underline"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>

          <p className="text-center text-xs text-gray-300 mt-6">
            By continuing, you agree to CivicPulse's Terms of Service and Privacy Policy
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;