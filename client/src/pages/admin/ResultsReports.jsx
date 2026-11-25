import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Award, 
  Search, 
  Download, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Percent
} from 'lucide-react';

export default function ResultsReports() {
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/admin/results').then(res => {
      if (res.success) {
        setAttempts(res.attempts || []);
        setExams(res.exams || []);
      }
    }).catch(err => {
      showToast('Failed to load results', 'error');
    }).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Section', 'Exam Title', 'Score', 'Total Marks', 'Percentage', 'Outcome'];
    const rows = filtered.map(a => [
      `"${a.studentName}"`,
      `"${a.studentRoll || ''}"`,
      `"${a.section || ''}"`,
      `"${a.examTitle}"`,
      `"${a.marksObtained}"`,
      `"${a.totalMarks}"`,
      `"${a.percentage}%"`,
      `"${a.passed ? 'PASSED' : 'FAILED'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `examora_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filtered = attempts.filter(a => {
    const matchesSearch = (a.studentName && a.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (a.studentRoll && a.studentRoll.toLowerCase().includes(search.toLowerCase()));
    const matchesExam = !examFilter || a.examId === examFilter;
    return matchesSearch && matchesExam;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Institutional Results & Performance</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Examine candidate marks, evaluate pass/fail ratios, and export assessment records.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-md transition"
        >
          <Download className="w-4 h-4" />
          Export All Results (CSV)
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800"
          />
        </div>
        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
        >
          <option value="">All Examinations</option>
          {exams.map(e => (
            <option key={e._id} value={e._id}>{e.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Roll ID</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Examination</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">No examination attempts found.</td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{a.studentName}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{a.studentRoll || 'N/A'}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {a.section || 'CSE-A'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{a.examTitle}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {a.marksObtained} / {a.totalMarks}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      {a.percentage}%
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        a.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {a.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {a.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
