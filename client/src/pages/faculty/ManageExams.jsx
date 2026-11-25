import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  Eye, 
  CheckCircle, 
  Play, 
  Square
} from 'lucide-react';

export default function ManageExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faculty/exams');
      if (res.success) setExams(res.exams || []);
    } catch (err) {
      showToast('Failed to load exams', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/faculty/exams/${id}/status`, { status: newStatus });
      showToast(`Exam marked as ${newStatus}`, 'success');
      fetchExams();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete exam "${title}"?`)) return;
    try {
      await api.delete(`/faculty/exams/${id}`);
      showToast('Exam deleted', 'success');
      fetchExams();
    } catch (err) {
      showToast('Failed to delete exam', 'error');
    }
  };

  const toggleResultsPublish = async (exam) => {
    try {
      await api.post(`/faculty/exams/${exam._id}/publish-results`, {
        resultVisibility: !exam.resultVisibility
      });
      showToast(`Results ${!exam.resultVisibility ? 'published' : 'hidden'} for students`, 'success');
      fetchExams();
    } catch (err) {
      showToast('Failed to toggle results visibility', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Manage Examinations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Start, conclude, modify status, and evaluate candidate submissions for your tests.
          </p>
        </div>
        <Link
          to="/faculty/create-exam"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Exam
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map(e => (
          <div key={e._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  e.status === 'Active' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                  e.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-800' :
                  e.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {e.status}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{e.examType}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3">{e.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{e.subject}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Sections:</span>
                  <span className="font-bold text-blue-600">{(e.sections || []).join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Window:</span>
                  <span>{e.examDate} ({e.startTime} - {e.endTime})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration & Marks:</span>
                  <span>{e.duration} mins • {e.totalMarks} Marks</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                {e.status === 'Scheduled' ? (
                  <button
                    onClick={() => handleStatusChange(e._id, 'Active')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Exam
                  </button>
                ) : e.status === 'Active' ? (
                  <button
                    onClick={() => handleStatusChange(e._id, 'Completed')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition"
                  >
                    <Square className="w-3.5 h-3.5" /> End Exam
                  </button>
                ) : (
                  <button
                    onClick={() => toggleResultsPublish(e)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
                      e.resultVisibility ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {e.resultVisibility ? 'Results Published' : 'Publish Results'}
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <Link
                    to={`/faculty/exams/${e._id}/submissions`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View Submissions"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(e._id, e.title)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
