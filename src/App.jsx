import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './PrivateRoute';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/projects/new" element={<PrivateRoute><CreateProjectPage /></PrivateRoute>} />
        <Route path="/projects/:id/edit" element={<PrivateRoute><CreateProjectPage /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;