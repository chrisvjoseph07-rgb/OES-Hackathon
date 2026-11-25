import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Bell, Send, Users, Shield, BookOpen, Layers } from 'lucide-react';

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [targetSection, setTargetSection] = useState('');
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    setSending(true);
    try {
      await api.post('/notifications/broadcast', {
        title,
        message,
        targetRole,
        targetSection: targetSection || null
      });
      showToast('Announcement sent to recipients successfully!', 'success');
      setTitle('');
      setMessage('');
      setTargetSection('');
    } catch (err) {
      showToast(err.message || 'Failed to send announcement', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Announcements</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Broadcast alerts to all university users, faculty, or students of specific sections.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Announcement Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-Term Examination Schedule Released"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              >
                <option value="all">Everyone (All Roles)</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>

            {targetRole === 'student' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specific Section (Optional)</label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                >
                  <option value="">All Student Sections</option>
                  <option value="CSE-A">CSE-A Only</option>
                  <option value="CSE-B">CSE-B Only</option>
                  <option value="ECE-A">ECE-A Only</option>
                  <option value="ME-A">ME-A Only</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Announcement Message</label>
            <textarea
              rows="5"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the notification details here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Send Announcement</span>
          </button>
        </form>
      </div>
    </div>
  );
}
