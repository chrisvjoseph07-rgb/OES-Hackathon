import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Play, 
  Calendar,
  Lock,
  Eye
} from 'lucide-react';

export default function MyExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'upcoming', 'completed'

  useEffect(() => {
    api.get('/student/exams').then(res => {
      if (res.success) setExams(res.exams || []);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  const availableExams = exams.filter(e => e.status === 'Active' && !e.hasAttempted);
  const upcomingExams = exams.filter(e => e.status === 'Scheduled');
  const completedExams = exams.filter(e => e.hasAttempted || e.status === 'Completed');

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Assigned Examinations</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Access tests permitted for your academic course, year, and enrolled section.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'available' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'
          }`}
        >
          <Clock className="w-4 h-4" />
          Available Now ({availableExams.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'upcoming' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Upcoming Tests ({upcomingExams.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'completed' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Completed ({completedExams.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableExams.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
              No tests currently waiting to be started.
            </div>
          ) : (
            availableExams.map(e => (
              <div key={e._id} className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                      ACTIVE
                    </span>
                    <span className="text-xs font-bold text-slate-600">{e.duration} mins</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-3">{e.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{e.subject}</p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <p>Total Marks: {e.totalMarks}</p>
                    <p>Passing Marks: {e.passingMarks}</p>
                    <p>Window: {e.startTime} - {e.endTime}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    to={`/student/exams/${e._id}/take`}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-600/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start Examination
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingExams.map(e => (
            <div key={e._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  SCHEDULED
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-3">{e.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{e.subject}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <p>Date: {e.examDate}</p>
                  <p>Window: {e.startTime} - {e.endTime}</p>
                  <p>Duration: {e.duration} Minutes</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button disabled className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                  <Lock className="w-3.5 h-3.5" /> Opens on {e.examDate}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedExams.map(e => (
            <div key={e._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  COMPLETED
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-3">{e.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{e.subject}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/student/results"
                  className="w-full py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Performance & Result
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
