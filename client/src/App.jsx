import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import DashboardLayout from './components/layouts/DashboardLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FacultyManagement from './pages/admin/FacultyManagement';
import StudentManagement from './pages/admin/StudentManagement';
import AcademicStructure from './pages/admin/AcademicStructure';
import ExamManagement from './pages/admin/ExamManagement';
import QuestionBank from './pages/admin/QuestionBank';
import ResultsReports from './pages/admin/ResultsReports';
import Announcements from './pages/admin/Announcements';
import SystemSettings from './pages/admin/SystemSettings';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MyStudents from './pages/faculty/MyStudents';
import CreateExam from './pages/faculty/CreateExam';
import ManageExams from './pages/faculty/ManageExams';
import ExamSubmissions from './pages/faculty/ExamSubmissions';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyExams from './pages/student/MyExams';
import TakeExam from './pages/student/TakeExam';
import StudentResults from './pages/student/StudentResults';

// Common
import ProfilePage from './pages/common/ProfilePage';

function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="faculty" element={<FacultyManagement />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="academic" element={<AcademicStructure />} />
              <Route path="exams" element={<ExamManagement />} />
              <Route path="questions" element={<QuestionBank />} />
              <Route path="results" element={<ResultsReports />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Faculty Routes */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="students" element={<MyStudents />} />
              <Route path="create-exam" element={<CreateExam />} />
              <Route path="exams" element={<ManageExams />} />
              <Route path="exams/:examId/submissions" element={<ExamSubmissions />} />
              <Route path="submissions" element={<ExamSubmissions />} />
              <Route path="questions" element={<QuestionBank />} />
              <Route path="performance" element={<ResultsReports />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="exams" element={<MyExams />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="notifications" element={<StudentDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Fullscreen Distraction-Free Exam Interface */}
            <Route
              path="/student/exams/:examId/take"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <TakeExam />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
