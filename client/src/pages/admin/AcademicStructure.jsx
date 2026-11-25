import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { 
  Layers, 
  Plus, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Hash
} from 'lucide-react';

export default function AcademicStructure() {
  const [activeTab, setActiveTab] = useState('departments'); // 'departments', 'courses', 'sections', 'subjects'
  const [data, setData] = useState({ departments: [], courses: [], sections: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic form state
  const [formData, setFormData] = useState({});

  const { showToast } = useToast();

  const fetchStructure = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/academic-structure');
      if (res.success) {
        setData({
          departments: res.departments || [],
          courses: res.courses || [],
          sections: res.sections || [],
          subjects: res.subjects || []
        });
      }
    } catch (err) {
      showToast('Failed to load academic structure', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  const openModal = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'departments') {
        await api.post('/admin/departments', formData);
      } else if (activeTab === 'courses') {
        await api.post('/admin/courses', formData);
      } else if (activeTab === 'sections') {
        await api.post('/admin/sections', formData);
      } else if (activeTab === 'subjects') {
        await api.post('/admin/subjects', formData);
      }
      showToast(`${activeTab.slice(0, -1)} added successfully`, 'success');
      setIsModalOpen(false);
      fetchStructure();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await api.delete(`/admin/academic/${type}/${id}`);
      showToast(`${type} deleted successfully`, 'success');
      fetchStructure();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Academic Structure</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure institutional hierarchy: Departments, Degrees/Courses, Sections, and Academic Subjects.
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'departments' ? 'Department' : activeTab === 'courses' ? 'Course' : activeTab === 'sections' ? 'Section' : 'Subject'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'departments' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Departments ({data.departments.length})
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'courses' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Courses ({data.courses.length})
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'sections' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hash className="w-4 h-4" />
          Sections ({data.sections.length})
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'subjects' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subjects ({data.subjects.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.departments.map(d => (
              <div key={d._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {d.code}
                    </span>
                    <button
                      onClick={() => handleDelete('department', d._id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{d.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">HOD: {d.hodName || 'Not Assigned'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.courses.map(c => (
              <div key={c._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {c.code || 'DEG'}
                    </span>
                    <button
                      onClick={() => handleDelete('course', c._id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{c.departmentName}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    Duration: {c.durationYears || 4} Years ({c.totalSemesters || 8} Semesters)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {data.sections.map(s => (
              <div key={s._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-lg">
                      {s.name}
                    </span>
                    <button
                      onClick={() => handleDelete('section', s._id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-xs mt-2">{s.courseName || 'B.Tech'}</h3>
                  <p className="text-[11px] text-slate-500">{s.year} • {s.semester}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    Room: {s.roomNumber || 'TBD'} | Capacity: {s.capacity || 60}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.subjects.map(sub => (
              <div key={sub._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <button
                      onClick={() => handleDelete('subject', sub._id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{sub.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{sub.departmentName}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    Credits: {sub.credits || 3}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add New ${activeTab.slice(0, -1).toUpperCase()}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {activeTab === 'departments' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Engineering"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CE"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arthur Miller"
                  value={formData.hodName || ''}
                  onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
            </>
          )}

          {activeTab === 'courses' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Artificial Intelligence"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. BT-AI"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.departmentName || 'Computer Science & Engineering'}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  {data.departments.map(d => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTab === 'sections' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE-C"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={formData.courseName || 'B.Tech Computer Science'}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  {data.courses.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    placeholder="2nd Year"
                    value={formData.year || '2nd Year'}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="text"
                    placeholder="4th Semester"
                    value={formData.semester || '4th Semester'}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'subjects' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS501"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    placeholder="3"
                    value={formData.credits || 3}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.departmentName || 'Computer Science & Engineering'}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  {data.departments.map(d => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20 transition"
            >
              Save Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
