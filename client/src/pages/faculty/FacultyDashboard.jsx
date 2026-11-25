import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Layers, 
  Plus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty/dashboard').then(res => {
      if (res.success) setData(res);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const upcomingExams = data?.upcomingExams || [];
  const activeExams = data?.activeExams || [];
  const recentSubmissions = data?.recentSubmissions || [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Faculty Portal • {user?.department} • Designation: {user?.designation || 'Instructor'}
          </p>
        </div>
        <Link
          to="/faculty/create-exam"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Examination
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">My Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{stats.totalStudentsCount || 0}</span>
          <span className="text-[10px] text-slate-400">In assigned sections</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Assigned Sections</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">
            {(user?.assignedSections || []).join(', ') || 'None'}
          </span>
          <span className="text-[10px] text-slate-400">Teaching batches</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Active Exams</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-2 block">{stats.activeExamsCount || 0}</span>
          <span className="text-[10px] text-emerald-600/80">Live right now</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Upcoming Exams</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{stats.upcomingExamsCount || 0}</span>
          <span className="text-[10px] text-slate-400">Scheduled tests</span>
        </div>
      </div>

      {/* Assigned Subjects & Sections Pill Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">Assigned Teaching Subjects</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {(user?.assignedSubjects || ['Operating Systems', 'Computer Networks']).map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-bold border border-white/10">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">Target Sections</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5 sm:justify-end">
            {(user?.assignedSections || ['CSE-A', 'CSE-B']).map((sec, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500 text-xs font-black">
                {sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Active/Upcoming Exams & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active & Scheduled Exams */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Active & Scheduled Examinations</h3>
            <Link to="/faculty/exams" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
              Manage Exams <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {[...activeExams, ...upcomingExams].length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No active or upcoming exams</p>
            ) : (
              [...activeExams, ...upcomingExams].slice(0, 5).map(e => (
                <div key={e._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{e.title}</h4>
                    <span className="text-[11px] text-slate-500">{e.subject} • Sections: {(e.sections || []).join(', ')}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      e.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {e.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">{e.examDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Student Submissions</h3>
            <Link to="/faculty/submissions" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentSubmissions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent submissions</p>
            ) : (
              recentSubmissions.slice(0, 5).map(sub => (
                <div key={sub._id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{sub.studentName}</p>
                    <span className="text-[10px] text-slate-400">{sub.examTitle} ({sub.section})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">{sub.marksObtained} / {sub.totalMarks}</span>
                    <span className={`text-[10px] font-bold block ${sub.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {sub.percentage}% • {sub.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
