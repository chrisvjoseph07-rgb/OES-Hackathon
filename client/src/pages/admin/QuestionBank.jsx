import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { 
  FileQuestion, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    questionText: '',
    subject: 'Operating Systems',
    topic: 'Process Management',
    difficulty: 'Medium',
    type: 'mcq',
    marks: 2,
    negativeMarks: 0.5,
    explanation: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 'opt_1'
  });

  const { showToast } = useToast();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/questions');
      if (res.success) setQuestions(res.questions || []);
    } catch (err) {
      showToast('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      questionText: formData.questionText,
      subject: formData.subject,
      topic: formData.topic,
      difficulty: formData.difficulty,
      type: formData.type,
      marks: Number(formData.marks),
      negativeMarks: Number(formData.negativeMarks),
      explanation: formData.explanation,
      options: [
        { id: 'opt_1', text: formData.option1 },
        { id: 'opt_2', text: formData.option2 },
        { id: 'opt_3', text: formData.option3 },
        { id: 'opt_4', text: formData.option4 }
      ],
      correctAnswer: formData.correctAnswer
    };

    try {
      await api.post('/questions', payload);
      showToast('Question created successfully', 'success');
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      showToast(err.message || 'Failed to create question', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      showToast('Question deleted', 'success');
      fetchQuestions();
    } catch (err) {
      showToast('Failed to delete question', 'error');
    }
  };

  const filtered = questions.filter(q => {
    const matchesSearch = q.questionText?.toLowerCase().includes(search.toLowerCase());
    const matchesSub = !subjectFilter || q.subject === subjectFilter;
    const matchesDiff = !diffFilter || q.difficulty === diffFilter;
    return matchesSearch && matchesSub && matchesDiff;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Institutional Question Bank</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Master repository of academic questions: MCQs, Multi-select, True/False, and Descriptive.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
        >
          <option value="">All Subjects</option>
          <option value="Operating Systems">Operating Systems</option>
          <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
          <option value="Database Management Systems">Database Management Systems</option>
          <option value="Computer Networks">Computer Networks</option>
          <option value="Digital Electronics">Digital Electronics</option>
          <option value="Thermodynamics">Thermodynamics</option>
        </select>
        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((q, idx) => (
          <div key={q._id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {q.subject}
                  </span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[10px] text-slate-500 font-medium">{q.topic}</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                    q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                    {q.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600">
                    {q.marks} Marks
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 leading-relaxed">
                  {idx + 1}. {q.questionText}
                </p>

                {Array.isArray(q.options) && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {q.options.map((opt) => {
                      const isCorrect = Array.isArray(q.correctAnswer) 
                        ? q.correctAnswer.includes(opt.id) 
                        : q.correctAnswer === opt.id;
                      return (
                        <div key={opt.id} className={`p-2 rounded-xl text-xs border ${
                          isCorrect ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <span className="font-mono text-[10px] mr-1.5 opacity-60">{opt.id}:</span>
                          {opt.text}
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 inline ml-1.5 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2.5">
                    <span className="font-semibold text-slate-700">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDelete(q._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Examination Question">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Question Text</label>
            <textarea
              rows="3"
              required
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
              placeholder="Enter the question statement..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              >
                <option value="Operating Systems">Operating Systems</option>
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                <option value="Database Management Systems">Database Management Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Digital Electronics">Digital Electronics</option>
                <option value="Thermodynamics">Thermodynamics</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Option 1</label>
              <input
                type="text"
                required
                value={formData.option1}
                onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Option 2</label>
              <input
                type="text"
                required
                value={formData.option2}
                onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Option 3</label>
              <input
                type="text"
                required
                value={formData.option3}
                onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Option 4</label>
              <input
                type="text"
                required
                value={formData.option4}
                onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Correct Answer</label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold text-blue-600"
              >
                <option value="opt_1">Option 1</option>
                <option value="opt_2">Option 2</option>
                <option value="opt_3">Option 3</option>
                <option value="opt_4">Option 4</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marks</label>
              <input
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Negative Marks</label>
              <input
                type="number"
                step="0.25"
                value={formData.negativeMarks}
                onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Explanation / Solution</label>
            <input
              type="text"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              placeholder="Why this answer is correct..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Save Question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
