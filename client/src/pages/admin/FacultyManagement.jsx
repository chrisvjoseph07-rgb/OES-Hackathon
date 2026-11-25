import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  KeyRound, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  Building2
} from 'lucide-react';

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    assignedSubjects: '',
    assignedSections: '',
    assignedCourses: 'B.Tech Computer Science',
    password: 'password123'
  });

  const { showToast } = useToast();

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/faculty');
      if (res.success) setFaculty(res.faculty || []);
    } catch (err) {
      showToast('Failed to load faculty list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const openAddModal = () => {
    setEditingFaculty(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      assignedSubjects: 'Operating Systems, Computer Networks',
      assignedSections: 'CSE-A, CSE-B',
      assignedCourses: 'B.Tech Computer Science',
      password: 'password123'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditingFaculty(f);
    setFormData({
      fullName: f.fullName || '',
      email: f.email || '',
      phone: f.phone || '',
      department: f.department || 'Computer Science & Engineering',
      designation: f.designation || 'Assistant Professor',
      assignedSubjects: Array.isArray(f.assignedSubjects) ? f.assignedSubjects.join(', ') : '',
      assignedSections: Array.isArray(f.assignedSections) ? f.assignedSections.join(', ') : '',
      assignedCourses: Array.isArray(f.assignedCourses) ? f.assignedCourses.join(', ') : '',
      status: f.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      assignedSubjects: formData.assignedSubjects.split(',').map(s => s.trim()).filter(Boolean),
      assignedSections: formData.assignedSections.split(',').map(s => s.trim()).filter(Boolean),
      assignedCourses: formData.assignedCourses.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingFaculty) {
        await api.put(`/admin/faculty/${editingFaculty._id}`, payload);
        showToast('Faculty updated successfully', 'success');
      } else {
        await api.post('/admin/faculty', payload);
        showToast('Faculty member created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchFaculty();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/admin/faculty/${id}`);
      showToast('Faculty deleted successfully', 'success');
      fetchFaculty();
    } catch (err) {
      showToast('Failed to delete faculty', 'error');
    }
  };

  const handleResetPassword = async (id, name) => {
    if (!window.confirm(`Reset password for ${name} to default ('password123')?`)) return;
    try {
      await api.post(`/admin/faculty/${id}/reset-password`, { newPassword: 'password123' });
      showToast('Password reset successfully to password123', 'success');
    } catch (err) {
      showToast('Failed to reset password', 'error');
    }
  };

  const handleToggleStatus = async (f) => {
    const newStatus = f.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admin/faculty/${f._id}`, { status: newStatus });
      showToast(`Account ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
      fetchFaculty();
    } catch (err) {
      showToast('Failed to update account status', 'error');
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = 
      (f.fullName && f.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (f.email && f.email.toLowerCase().includes(search.toLowerCase())) ||
      (f.facultyId && f.facultyId.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = !deptFilter || f.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage academic instructors, departments, assigned subjects, and teaching sections.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by faculty name, email, or Faculty ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="">All Departments</option>
          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
          <option value="Electronics & Communication Engineering">Electronics & Communication</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
        </select>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Faculty Member</th>
                <th className="px-5 py-3.5">Faculty ID</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Assigned Subjects</th>
                <th className="px-5 py-3.5">Assigned Sections</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">Loading faculty members...</td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">No faculty members found.</td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {f.fullName?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{f.fullName}</p>
                          <p className="text-[11px] text-slate-400">{f.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 font-medium">
                      {f.facultyId || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      <div>{f.department}</div>
                      <span className="text-[10px] text-slate-400">{f.designation}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(f.assignedSubjects || []).map((sub, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(f.assignedSections || []).map((sec, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(f)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                          f.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}
                        title="Click to toggle account status"
                      >
                        {f.status === 'active' ? (
                          <><CheckCircle className="w-3 h-3" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(f._id, f.fullName)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(f._id, f.fullName)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? 'Edit Faculty Details' : 'Add New Faculty Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Dr. Alan Turing"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                placeholder="faculty@examora.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                placeholder="+1 555-0123"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electronics & Communication Engineering">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assigned Subjects <span className="text-slate-400 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              value={formData.assignedSubjects}
              onChange={(e) => setFormData({ ...formData, assignedSubjects: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
              placeholder="Operating Systems, Computer Networks"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assigned Sections <span className="text-slate-400 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              value={formData.assignedSections}
              onChange={(e) => setFormData({ ...formData, assignedSections: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
              placeholder="CSE-A, CSE-B"
            />
          </div>

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
              {editingFaculty ? 'Save Changes' : 'Create Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
