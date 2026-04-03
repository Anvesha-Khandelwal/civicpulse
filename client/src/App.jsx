// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/Login/LoginPage';
import ExplorePage from './pages/ExplorePage';
import ReportPage from './pages/Report/ReportPage';
import MyIssuesPage from './pages/MyIssues/MyIssuesPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

// Only logged-in users (citizen or authority)
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Only authority/admin users
const AuthorityRoute = ({ children }) => {
  const { user, isAuthority } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!isAuthority()) return <Navigate to="/explore" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public routes — no login needed */}
        <Route path="/"        element={<Navigate to="/explore" />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/explore" element={<ExplorePage />} />

        {/* Citizen protected routes */}
        <Route path="/report" element={
          <ProtectedRoute><ReportPage /></ProtectedRoute>
        } />
        <Route path="/my-issues" element={
          <ProtectedRoute><MyIssuesPage /></ProtectedRoute>
        } />

        {/* Authority only */}
        <Route path="/admin" element={
          <AuthorityRoute><AdminDashboard /></AuthorityRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/explore" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;