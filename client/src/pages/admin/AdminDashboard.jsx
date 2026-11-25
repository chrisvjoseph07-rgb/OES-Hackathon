import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  CheckCircle, 
  Clock, 
  Building2,
  TrendingUp,
  AlertCircle,
  Calendar,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => {
        if (res.success) setData(res);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading EXAMORA Admin Overview...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const upcomingExams = data?.upcomingExams || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time examination statistics, student distributions, and institutional metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Live & Operating
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase text-slate-500">Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalStudents || 0}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Enrolled candidates</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase text-slate-500">Faculty</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalFaculty || 0}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Professors & Instructors</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase text-slate-500">Exams</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalExams || 0}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Total created</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase text-slate-500">Active</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600">{stats.activeExams || 0}</span>
            <span className="text-[10px] text-emerald-600/80 block mt-0.5">Live now</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase text-slate-500">Completed</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.completedExams || 0}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Evaluated</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase text-slate-500">Departments</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalDepartments || 0}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Academic units</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students by Department */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Students by Academic Department</h3>
              <p className="text-xs text-slate-400 mt-0.5">Student enrollment breakdown</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.studentsByDept || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="students" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass vs Fail Ratio */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pass vs Fail Outcome</h3>
              <p className="text-xs text-slate-400 mt-0.5">Overall candidate performance</p>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.passVsFail || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts.passVsFail || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Examination Activity */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Monthly Examination & Attempt Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Exam participation trends across academic calendar</p>
          </div>
          <Activity className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.monthlyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="attempts" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} name="Student Attempts" />
              <Line type="monotone" dataKey="exams" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} name="Exams Conducted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Exams & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Examinations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Active & Upcoming Examinations
            </h3>
            <Link to="/admin/exams" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No active or scheduled exams</p>
            ) : (
              upcomingExams.map((exam) => (
                <div key={exam._id} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between transition">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{exam.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{exam.subject}</span>
                      <span>•</span>
                      <span className="bg-blue-100/80 text-blue-800 px-1.5 py-0.2 rounded font-medium">
                        {(exam.sections || []).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      exam.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {exam.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">{exam.examDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Recent Institutional Activity
            </h3>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent activities logged</p>
            ) : (
              recentActivity.slice(0, 6).map((log, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/30 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      By {log.userName} ({log.userRole})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
