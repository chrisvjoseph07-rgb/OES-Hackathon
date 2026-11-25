import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Calendar,
  Trash2
} from 'lucide-react';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { showToast } = useToast();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/results');
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

  const filteredExams = exams.filter(e => {
    const matchesSearch = (e.title && e.title.toLowerCase().includes(search.toLowerCase())) ||
      (e.subject && e.subject.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Institutional Exam Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor all scheduled, active, and completed examinations across all university departments.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exams by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.map((e) => (
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
                <span className="text-xs text-slate-400 font-medium">{e.examType}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3">{e.title}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{e.subject}</p>
              
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Sections:</span>
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

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Faculty: {e.createdByName}</span>
              <button
                onClick={() => handleDelete(e._id, e.title)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Delete exam"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
