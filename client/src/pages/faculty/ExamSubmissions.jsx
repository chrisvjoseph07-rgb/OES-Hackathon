import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { 
  Award, 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  XCircle, 
  Edit3,
  UserCheck
} from 'lucide-react';

export default function ExamSubmissions() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingAttempt, setEvaluatingAttempt] = useState(null);
  const [awardedMarks, setAwardedMarks] = useState('');
  const [facultyFeedback, setFacultyFeedback] = useState('');

  const { showToast } = useToast();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // If examId is in params, get submissions for this exam; otherwise load all faculty submissions
      if (examId) {
        const res = await api.get(`/faculty/exams/${examId}/submissions`);
        if (res.success) {
          setExam(res.exam);
          setSubmissions(res.submissions || []);
        }
      } else {
        const res = await api.get('/admin/results');
        if (res.success) setSubmissions(res.attempts || []);
      }
    } catch (err) {
      showToast('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [examId]);

  const openEvaluationModal = (sub) => {
    setEvaluatingAttempt(sub);
    setAwardedMarks(sub.marksObtained || '');
    setFacultyFeedback(sub.facultyFeedback || '');
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingAttempt) return;

    try {
      await api.post(`/faculty/submissions/${evaluatingAttempt._id}/evaluate`, {
        awardedMarks: Number(awardedMarks),
        facultyFeedback
      });
      showToast('Candidate evaluation saved successfully', 'success');
      setEvaluatingAttempt(null);
      fetchSubmissions();
    } catch (err) {
      showToast(err.message || 'Failed to save evaluation', 'error');
    }
  };

  const exportCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Section', 'Marks', 'Total Marks', 'Percentage', 'Outcome'];
    const rows = submissions.map(s => [
      `"${s.studentName}"`,
      `"${s.studentRoll || ''}"`,
      `"${s.section || ''}"`,
      `"${s.marksObtained}"`,
      `"${s.totalMarks}"`,
      `"${s.percentage}%"`,
      `"${s.passed ? 'PASSED' : 'FAILED'}"`
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `submissions_${exam?.title || 'exam'}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/faculty/exams" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Exams
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {exam ? `Submissions: ${exam.title}` : 'All Candidate Submissions'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review student responses, conduct descriptive answer grading, and finalize scores.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-md transition"
        >
          <Download className="w-4 h-4" />
          Export Submissions CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Roll ID</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Time Taken</th>
                <th className="px-5 py-3.5">Marks Awarded</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">No submissions recorded for this exam yet.</td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{sub.studentName}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{sub.studentRoll || 'N/A'}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {sub.section}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {sub.timeTakenMinutes || 15} mins
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {sub.marksObtained} / {sub.totalMarks}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      {sub.percentage}%
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEvaluationModal(sub)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Grade / Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Grade Modal */}
      <Modal
        isOpen={Boolean(evaluatingAttempt)}
        onClose={() => setEvaluatingAttempt(null)}
        title={`Evaluate Candidate: ${evaluatingAttempt?.studentName}`}
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Final Marks Awarded (Out of {evaluatingAttempt?.totalMarks})
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={awardedMarks}
              onChange={(e) => setAwardedMarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Faculty Feedback & Notes</label>
            <textarea
              rows="3"
              value={facultyFeedback}
              onChange={(e) => setFacultyFeedback(e.target.value)}
              placeholder="Constructive feedback for candidate performance..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEvaluatingAttempt(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Save Evaluation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
