import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Search } from 'lucide-react';

export default function MyStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/faculty/students')
      .then(res => {
        if (res.success) setStudents(res.students || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const matchesSec = !sectionFilter || s.section === sectionFilter;
    const matchesSearch = (s.fullName && s.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase()));
    return matchesSec && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Assigned Students</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Students enrolled in your designated teaching sections: {(user?.assignedSections || []).join(', ')}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800"
          />
        </div>
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
        >
          <option value="">All My Sections</option>
          {(user?.assignedSections || []).map(sec => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Year / Sem</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-800">{s.fullName}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{s.studentId}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {s.section}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{s.year} • {s.semester}</td>
                  <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
