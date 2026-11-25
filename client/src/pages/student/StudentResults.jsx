import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Award, CheckCircle, XCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/student/results').then(res => {
      if (res.success) setResults(res.results || []);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Examination Results</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed performance scorecards, automated question evaluations, and faculty remarks.
        </p>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            No completed examination results available yet.
          </div>
        ) : (
          results.map((r) => {
            const isExpanded = expandedId === r._id;
            return (
              <div key={r._id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      <span className="text-xs text-slate-400">{r.subject}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{r.examTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted: {new Date(r.submittedAt || r.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900">{r.marksObtained}</span>
                      <span className="text-xs text-slate-400"> / {r.totalMarks}</span>
                      <span className="block text-xs font-bold text-blue-600">{r.percentage}%</span>
                    </div>

                    {r.questionDetails && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : r._id)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>

                {r.facultyFeedback && (
                  <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
                    <span className="font-bold">Faculty Remarks:</span> {r.facultyFeedback}
                  </div>
                )}

                {/* Detailed Question Review if published */}
                {isExpanded && r.questionDetails && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Question by Question Solution Review
                    </h4>
                    {r.questionDetails.map((q, idx) => (
                      <div key={q._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-2">
                        <p className="font-bold text-slate-900">
                          {idx + 1}. {q.questionText}
                        </p>
                        {q.explanation && (
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-800">Explanation:</span> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
