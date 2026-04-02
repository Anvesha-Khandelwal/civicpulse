import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthority } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const citizenLinks = [
    { to: '/explore', label: 'Explore' },
    { to: '/report', label: 'Report Issue' },
    { to: '/my-issues', label: 'My Issues' },
  ];

  const authorityLinks = [
    { to: '/explore', label: 'Explore' },
    { to: '/admin', label: 'Dashboard' },
  ];

  const links = isAuthority() ? authorityLinks : citizenLinks;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/explore" className="text-blue-600 font-bold text-xl tracking-tight">
          CivicPulse
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          <span className={`hidden sm:block text-xs px-2.5 py-1 rounded-full font-medium ${
            isAuthority()
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isAuthority() ? '🏛️ Authority' : '🧑 Citizen'}
          </span>

          {/* User info */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 font-medium">{user?.name?.split(' ')[0]}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 transition-all px-2 py-1 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-50">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center px-4 py-1 text-xs font-medium transition-all ${
              location.pathname === link.to ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;