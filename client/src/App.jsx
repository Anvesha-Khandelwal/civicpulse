import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/Login/LoginPage';
import ExplorePage from './pages/ExplorePage';
import ReportPage from './pages/Report/ReportPage';
import MyIssuesPage from './pages/MyIssues/MyIssuesPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const AuthorityRoute = ({ children }) => {
  const { user, loading, isAuthority } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAuthority()) return <Navigate to="/explore" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/explore" />} />
        <Route path="/login" element={
          user ? <Navigate to="/explore" replace /> : <LoginPage />
        } />
        <Route path="/explore" element={
          <ProtectedRoute><ExplorePage /></ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute><ReportPage /></ProtectedRoute>
        } />
        <Route path="/my-issues" element={
          <ProtectedRoute><MyIssuesPage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AuthorityRoute><AdminDashboard /></AuthorityRoute>
        } />
        <Route path="*" element={
          <Navigate to={user ? "/explore" : "/login"} replace />
        } />
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