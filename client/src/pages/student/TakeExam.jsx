import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Save, 
  RotateCcw, 
  Send,
  AlertTriangle,
  GraduationCap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: { value, markedForReview } }
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Initialize Exam Session
  useEffect(() => {
    api.post(`/student/exams/${examId}/start`)
      .then(res => {
        if (res.success) {
          setExam(res.exam);
          setAttemptId(res.attemptId);
          setQuestions(res.questions || []);
          setAnswers(res.savedAnswers || {});

          // Local storage timer persistence across refreshes
          const timerKey = `examora_timer_${res.attemptId}`;
          const storedRemaining = localStorage.getItem(timerKey);
          if (storedRemaining) {
            setTimeRemaining(Number(storedRemaining));
          } else {
            const initialSeconds = (res.exam.duration || 60) * 60;
            setTimeRemaining(initialSeconds);
            localStorage.setItem(timerKey, String(initialSeconds));
          }
        }
      })
      .catch(err => {
        showToast(err.message || 'Cannot access this examination', 'error');
        navigate('/student/dashboard');
      })
      .finally(() => setLoading(false));
  }, [examId, navigate]);

  // Countdown Timer
  useEffect(() => {
    if (timeRemaining === null || submitting) return;

    if (timeRemaining <= 0) {
      handleFinalSubmit(true); // Auto submit on expiry
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const nextTime = prev - 1;
        if (attemptId) {
          localStorage.setItem(`examora_timer_${attemptId}`, String(nextTime));
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, submitting, attemptId]);

  const currentQ = questions[currentIdx] || null;
  const currentAnswer = currentQ ? (answers[currentQ._id]?.value ?? null) : null;
  const currentMarked = currentQ ? (answers[currentQ._id]?.markedForReview ?? false) : false;

  const handleOptionSelect = (optId) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ._id]: {
        value: optId,
        markedForReview: prev[currentQ._id]?.markedForReview || false
      }
    }));
  };

  const handleMultiSelect = (optId) => {
    if (!currentQ) return;
    const existing = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
    let updated;
    if (existing.includes(optId)) {
      updated = existing.filter(id => id !== optId);
    } else {
      updated = [...existing, optId];
    }
    setAnswers(prev => ({
      ...prev,
      [currentQ._id]: {
        value: updated,
        markedForReview: prev[currentQ._id]?.markedForReview || false
      }
    }));
  };

  const handleTextChange = (text) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ._id]: {
        value: text,
        markedForReview: prev[currentQ._id]?.markedForReview || false
      }
    }));
  };

  const toggleMarkForReview = () => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ._id]: {
        value: prev[currentQ._id]?.value ?? null,
        markedForReview: !currentMarked
      }
    }));
  };

  const clearCurrentAnswer = () => {
    if (!currentQ) return;
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ._id];
      return copy;
    });
  };

  const handleFinalSubmit = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);
    setConfirmModalOpen(false);

    try {
      const res = await api.post(`/student/attempts/${attemptId}/submit`, {
        answers
      });

      if (res.success) {
        if (attemptId) localStorage.removeItem(`examora_timer_${attemptId}`);
        showToast(isAuto ? 'Time expired: Exam auto-submitted!' : 'Exam submitted successfully!', 'success');
        navigate('/student/results');
      }
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
      setSubmitting(false);
    }
  };

  // Helper counts
  const answeredCount = Object.values(answers).filter(a => a.value !== null && a.value !== undefined && a.value !== '').length;
  const unansweredCount = questions.length - answeredCount;

  // Format timer
  const formatTime = (secs) => {
    if (secs === null) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Initiating Secure Exam Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-left select-none">
      {/* Top Fixed Distraction-Free Header */}
      <header className="sticky top-0 z-30 bg-[#172554] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wide text-white block">{exam?.title}</span>
            <span className="text-[11px] text-blue-200">{exam?.subject} • Total Marks: {exam?.totalMarks}</span>
          </div>
        </div>

        {/* Countdown Timer with warning styling */}
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl font-mono text-sm sm:text-base font-extrabold flex items-center gap-2 shadow-inner ${
            timeRemaining < 300 
              ? 'bg-rose-500/20 border border-rose-400 text-rose-300 animate-pulse' 
              : 'bg-white/10 border border-white/20 text-emerald-300'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setConfirmModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left / Center: Question Box */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <div>
            {/* Question Header & Badges */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-black">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded-lg">
                  {currentQ?.type?.replace('_', ' ')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-900 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  +{currentQ?.marks} Marks
                </span>
                {exam?.negativeMarking && (
                  <span className="ml-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                    -{currentQ?.negativeMarks || exam?.negativeMarksPerWrongAnswer || 0} Neg
                  </span>
                )}
              </div>
            </div>

            {/* Question Statement */}
            <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed mb-6">
              {currentQ?.questionText}
            </p>

            {/* Answer Options according to question type */}
            <div className="space-y-3">
              {currentQ?.type === 'mcq' && (
                currentQ.options.map((opt) => {
                  const isChecked = currentAnswer === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 text-sm font-semibold ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                      }`}>
                        {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span>{opt.text}</span>
                    </div>
                  );
                })
              )}

              {currentQ?.type === 'multiple_select' && (
                currentQ.options.map((opt) => {
                  const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleMultiSelect(opt.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 text-sm font-semibold ${
                        isChecked
                          ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                        isChecked ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-400'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span>{opt.text}</span>
                    </div>
                  );
                })
              )}

              {currentQ?.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['opt_1', 'opt_2'].map((optId, idx) => {
                    const label = idx === 0 ? 'True' : 'False';
                    const isChecked = currentAnswer === optId;
                    return (
                      <button
                        key={optId}
                        type="button"
                        onClick={() => handleOptionSelect(optId)}
                        className={`py-6 rounded-2xl border-2 font-bold text-base transition ${
                          isChecked
                            ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {(currentQ?.type === 'short_answer' || currentQ?.type === 'descriptive') && (
                <textarea
                  rows={currentQ.type === 'descriptive' ? 6 : 3}
                  value={currentAnswer || ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                  currentMarked
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {currentMarked ? 'Marked for Review' : 'Mark for Review'}
              </button>

              <button
                type="button"
                onClick={clearCurrentAnswer}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Answer
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1"
                >
                  Review & Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Question Navigation Palette */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3">Question Palette</h3>
            
            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Marked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Ans + Marked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span>Unanswered</span>
              </div>
            </div>

            {/* Interactive Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const ans = answers[q._id];
                const hasValue = ans && ans.value !== null && ans.value !== undefined && ans.value !== '';
                const isMarked = ans?.markedForReview;
                const isCurrent = currentIdx === idx;

                let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
                if (hasValue && isMarked) {
                  colorClasses = 'bg-blue-600 text-white border-blue-600 font-bold';
                } else if (hasValue) {
                  colorClasses = 'bg-emerald-500 text-white border-emerald-500 font-bold';
                } else if (isMarked) {
                  colorClasses = 'bg-purple-600 text-white border-purple-600 font-bold';
                }

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-xl border text-xs font-bold transition flex items-center justify-center ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Summary Counts */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Answered:</span>
              <span className="font-bold text-emerald-600">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unanswered:</span>
              <span className="font-bold text-slate-700">{unansweredCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Examination Submission"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-sm">Are you sure you want to submit?</p>
              <p className="text-amber-800 mt-1">Once confirmed, your answers will be automatically graded and no further modifications will be allowed.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 rounded-xl bg-slate-50 text-center">
              <span className="text-2xl font-black text-emerald-600 block">{answeredCount}</span>
              <span className="text-[11px] text-slate-500">Questions Answered</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 text-center">
              <span className="text-2xl font-black text-slate-600 block">{unansweredCount}</span>
              <span className="text-[11px] text-slate-500">Questions Remaining</span>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Resume Test
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleFinalSubmit(false)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Submit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
