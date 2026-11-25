import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  FileQuestion,
  FileText,
  Award,
  Bell,
  Settings,
  LogOut,
  BookOpen,
  Calendar,
  CheckCircle,
  HelpCircle,
  BarChart3,
  ListChecks,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Faculty Management', path: '/admin/faculty', icon: GraduationCap },
    { label: 'Student Management', path: '/admin/students', icon: Users },
    { label: 'Academic Structure', path: '/admin/academic', icon: Layers },
    { label: 'Exam Management', path: '/admin/exams', icon: FileText },
    { label: 'Question Bank', path: '/admin/questions', icon: FileQuestion },
    { label: 'Results & Analytics', path: '/admin/results', icon: Award },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const facultyNav = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'My Students', path: '/faculty/students', icon: Users },
    { label: 'Create Exam', path: '/faculty/create-exam', icon: FileText },
    { label: 'Manage Exams', path: '/faculty/exams', icon: ListChecks },
    { label: 'Question Bank', path: '/faculty/questions', icon: FileQuestion },
    { label: 'Submissions & Results', path: '/faculty/submissions', icon: Award },
    { label: 'Performance Analytics', path: '/faculty/performance', icon: BarChart3 },
    { label: 'Profile', path: '/faculty/profile', icon: Settings },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Exams', path: '/student/exams', icon: FileText },
    { label: 'My Results', path: '/student/results', icon: Award },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'My Profile', path: '/student/profile', icon: Settings },
  ];

  const navItems = user?.role === 'admin' 
    ? adminNav 
    : user?.role === 'faculty' 
    ? facultyNav 
    : studentNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#172554] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-wider text-white">EXAMORA</h1>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold block">
                {user?.role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* User Card info inside sidebar */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-white text-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
            <p className="text-[10px] text-blue-300 truncate">
              {user?.role === 'student' ? `Section: ${user?.section || 'N/A'}` : user?.department || 'EXAMORA Staff'}
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout bottom button */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
