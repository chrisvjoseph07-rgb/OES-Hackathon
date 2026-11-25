import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Award, 
  ArrowRight, 
  Sparkles,
  Play,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard').then(res => {
      if (res.success) setData(res);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const activeExams = data?.activeExams || [];
  const upcomingExams = data?.upcomingExams || [];
  const myAttempts = data?.myAttempts || [];

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Card with Student Profile Details */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#2563EB] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 transform skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-blue-200 mb-2">
              <Sparkles className="w-3 h-3 text-blue-300" />
              Active Academic Session 2025-2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
              Roll No: <span className="font-mono font-bold text-white">{user?.studentId || user?.rollNumber}</span> • {user?.course} • {user?.year} ({user?.semester})
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
            <span className="text-xs text-blue-200">Designated Section</span>
            <span className="text-2xl font-black bg-white text-blue-900 px-3 py-1 rounded-xl shadow-md">
              {user?.section}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Available Exams</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-2 block">{activeExams.length}</span>
          <span className="text-[10px] text-emerald-600/80">Ready to take</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Upcoming Exams</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{upcomingExams.length}</span>
          <span className="text-[10px] text-slate-400">Scheduled</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Exams Completed</span>
            <CheckCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{stats.totalExamsTaken || 0}</span>
          <span className="text-[10px] text-slate-400">Submissions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Average Score</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{stats.avgScore || 0}%</span>
          <span className="text-[10px] text-slate-400">Cumulative average</span>
        </div>
      </div>

      {/* Available Exams Section (Ready to Start) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Exams Available Right Now
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tests assigned to your section ({user?.section}). Start during the open window.
            </p>
          </div>
          <Link to="/student/exams" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
            View All Exams <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {activeExams.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100">
            <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No active tests in session for your section at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeExams.map((exam) => (
              <div key={exam._id} className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      LIVE NOW
                    </span>
                    <span className="text-xs font-bold text-slate-600">{exam.duration} Minutes</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-2">{exam.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{exam.subject}</p>
                  
                  <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Window: {exam.startTime} - {exam.endTime}</span>
                    <span>Total Marks: {exam.totalMarks}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-100">
                  <Link
                    to={`/student/exams/${exam._id}/take`}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 text-xs transition"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start Examination
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Upcoming Tests & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Examinations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Upcoming Scheduled Tests
          </h3>

          <div className="space-y-3">
            {upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No scheduled tests yet</p>
            ) : (
              upcomingExams.map((e) => (
                <div key={e._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{e.title}</h4>
                    <span className="text-[11px] text-slate-500">{e.subject} • {e.duration} mins</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">{e.examDate}</span>
                    <span className="block text-[10px] text-slate-400">{e.startTime} - {e.endTime}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Recent Examination Results
            </h3>
            <Link to="/student/results" className="text-xs text-blue-600 hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {myAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No completed tests yet</p>
            ) : (
              myAttempts.map((a) => (
                <div key={a._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{a.examTitle}</h4>
                    <span className="text-[11px] text-slate-500">{a.subject}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900">{a.marksObtained} / {a.totalMarks}</span>
                    <span className={`block text-[10px] font-bold ${a.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {a.percentage}% • {a.passed ? 'PASSED' : 'FAILED'}
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
