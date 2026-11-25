import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  AlertCircle,
  Save,
  Layers
} from 'lucide-react';

export default function CreateExam() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: user?.department || 'Computer Science & Engineering',
    course: (user?.assignedCourses && user.assignedCourses[0]) || 'B.Tech Computer Science',
    year: '2nd Year',
    semester: '4th Semester',
    subject: (user?.assignedSubjects && user.assignedSubjects[0]) || 'Operating Systems',
    sections: user?.assignedSections ? [user.assignedSections[0]] : ['CSE-A'],
    examType: 'Internal Examination',
    examDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    duration: 45,
    totalMarks: 30,
    passingMarks: 12,
    instructions: '1. All objective questions carry negative marks for incorrect answers.\n2. Do not refresh browser.',
    negativeMarking: true,
    negativeMarksPerWrongAnswer: 0.5,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowReview: true,
    allowBackNavigation: true,
    resultVisibility: true,
    status: 'Scheduled'
  });

  useEffect(() => {
    // Fetch questions for faculty's chosen subject
    api.get(`/questions?subject=${encodeURIComponent(formData.subject)}`)
      .then(res => {
        if (res.success) {
          setAvailableQuestions(res.questions || []);
          // Pre-select first 4 questions
          setSelectedQuestionIds((res.questions || []).slice(0, 5).map(q => q._id));
        }
      }).catch(() => {});
  }, [formData.subject]);

  const handleSectionToggle = (sec) => {
    if (formData.sections.includes(sec)) {
      if (formData.sections.length === 1) {
        showToast('At least one section must be assigned.', 'warning');
        return;
      }
      setFormData({ ...formData, sections: formData.sections.filter(s => s !== sec) });
    } else {
      setFormData({ ...formData, sections: [...formData.sections, sec] });
    }
  };

  const handleQuestionToggle = (qId) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== qId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter an exam title', 'warning');
      return;
    }
    if (formData.sections.length === 0) {
      showToast('Please select at least one assigned section', 'warning');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      showToast('Please attach at least one question to this exam', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        questions: selectedQuestionIds,
        numberOfQuestions: selectedQuestionIds.length
      };

      const res = await api.post('/faculty/exams', payload);
      if (res.success) {
        showToast('Exam scheduled and published successfully!', 'success');
        navigate('/faculty/exams');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create exam', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create & Schedule Examination</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Define exam configuration, section-wise student eligibility, time window, and question sets.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Step 1: Basic Information */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            1. Basic Examination Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Exam Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mid-Term Assessment: Operating Systems"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Exam Type</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="Internal Examination">Internal Examination</option>
                <option value="Mid-Term Examination">Mid-Term Examination</option>
                <option value="Semester Examination">Semester Examination</option>
                <option value="Quiz">Quiz</option>
                <option value="Practice Test">Practice Test</option>
                <option value="Assignment Test">Assignment Test</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Syllabus</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Topics covered, units, or special notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
            />
          </div>
        </div>

        {/* Step 2: Subject & Section Assignment (CRITICAL) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              2. Section-Wise Examination Assignment
            </h2>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              Strict Access Control
            </span>
          </div>
          <p className="text-slate-500">
            Only students belonging to the chosen section(s) will be permitted to access and take this exam.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              >
                {(user?.assignedSubjects || ['Operating Systems', 'Computer Networks']).map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Sections <span className="text-slate-400 font-normal">(Select one or multiple)</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(user?.assignedSections || ['CSE-A', 'CSE-B']).map((sec) => {
                  const isSelected = formData.sections.includes(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleSectionToggle(sec)}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sec}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Schedule, Timing, and Marks */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            3. Schedule, Timing & Grading Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Exam Date</label>
              <input
                type="date"
                required
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Time Window</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Time Window</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Passing Marks</label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* Flags and options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.negativeMarking}
                onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">Negative Marking</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">Shuffle Questions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowReview}
                onChange={(e) => setFormData({ ...formData, allowReview: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">Allow Review</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.resultVisibility}
                onChange={(e) => setFormData({ ...formData, resultVisibility: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">Instant Results</span>
            </label>
          </div>
        </div>

        {/* Step 4: Question Selection from Question Bank */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              4. Select Exam Questions ({selectedQuestionIds.length} Selected)
            </h2>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
            {availableQuestions.length === 0 ? (
              <p className="text-center py-6 text-slate-400">No questions available for this subject.</p>
            ) : (
              availableQuestions.map((q) => {
                const isChecked = selectedQuestionIds.includes(q._id);
                return (
                  <div
                    key={q._id}
                    onClick={() => handleQuestionToggle(q._id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      isChecked ? 'bg-blue-50/70 border-blue-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{q.questionText}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <span>{q.difficulty}</span>
                        <span>•</span>
                        <span>{q.marks} Marks</span>
                        <span>•</span>
                        <span className="uppercase">{q.type}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/faculty/exams')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Publishing Exam...' : 'Publish & Schedule Exam'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
