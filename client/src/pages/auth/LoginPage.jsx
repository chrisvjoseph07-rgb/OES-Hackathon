import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Shield, 
  GraduationCap, 
  BookOpen, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
  User,
  Phone,
  Layers,
  Hash
} from 'lucide-react';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('student'); // 'admin', 'faculty', 'student'
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech Computer Science',
    year: '2nd Year',
    semester: '4th Semester',
    section: 'CSE-A',
    studentId: '',
    designation: 'Assistant Professor',
    assignedSubjects: 'Operating Systems',
    assignedSections: 'CSE-A',
    adminCode: 'EXAMORA2026'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, register, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}/dashboard`);
    }

    const savedEmail = localStorage.getItem('examora_remember_email');
    const savedRole = localStorage.getItem('examora_remember_role');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password, selectedRole, rememberMe);
      showToast(`Welcome back, ${loggedUser.fullName}!`, 'success');
      navigate(`/${loggedUser.role}/dashboard`);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regData.fullName.trim() || !regData.email.trim() || !regData.password) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...regData,
        role: selectedRole
      };

      const newUser = await register(payload);
      showToast(`Account created successfully! Welcome, ${newUser.fullName}`, 'success');
      navigate(`/${newUser.role}/dashboard`);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    setAuthMode('login');
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'admin') {
      setEmail('admin@examora.com');
      setPassword('password123');
    } else if (role === 'faculty') {
      setEmail('faculty@examora.com');
      setPassword('password123');
    } else {
      setEmail('student@examora.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#1e1b4b] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <div className="relative z-10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-wider text-white">EXAMORA</span>
            <span className="hidden sm:inline-block text-xs text-blue-200/80 ml-2 font-medium">CampusTest Examination Suite</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 hidden md:inline">Quick Demo Fill:</span>
          <button 
            type="button"
            onClick={() => fillDemoCredentials('admin')}
            className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/40 border border-indigo-400/30 rounded-lg transition"
          >
            Admin
          </button>
          <button 
            type="button"
            onClick={() => fillDemoCredentials('faculty')}
            className="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-200 hover:bg-blue-500/40 border border-blue-400/30 rounded-lg transition"
          >
            Faculty
          </button>
          <button 
            type="button"
            onClick={() => fillDemoCredentials('student')}
            className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/40 border border-emerald-400/30 rounded-lg transition"
          >
            Student
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 flex-1 flex flex-col lg:flex-row items-center justify-center gap-10">
        
        {/* Left Side: Branding & Academic Illustration */}
        <div className="lg:w-1/2 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Next-Gen Online Examination Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">EXAMORA</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-lg leading-relaxed">
            Your smart, secure academic examination management platform. Register as a Student, Faculty member, or Administrator, schedule section-wise tests, and view instant evaluated performance.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
              <h4 className="text-sm font-bold text-white">Section-Wise Access</h4>
              <p className="text-xs text-slate-400">Strict department & section validation</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-blue-400 mb-1" />
              <h4 className="text-sm font-bold text-white">Instant Auto Scoring</h4>
              <p className="text-xs text-slate-400">Automated MCQ & penalty evaluation</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card (Sign In / Create Account Toggle) */}
        <div className="lg:w-1/2 w-full max-w-md">
          
          {/* Top Auth Mode Switcher */}
          <div className="flex bg-white/10 p-1 rounded-2xl mb-4 border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Create Account
            </button>
          </div>

          {/* Role Selection Tabs / Cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-indigo-600/30 border-indigo-400 shadow-lg shadow-indigo-600/20 text-white font-bold ring-2 ring-indigo-500/40'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <Shield className={`w-5 h-5 ${selectedRole === 'admin' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span className="text-xs">{authMode === 'register' ? 'New Admin' : 'Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('faculty')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedRole === 'faculty'
                  ? 'bg-blue-600/30 border-blue-400 shadow-lg shadow-blue-600/20 text-white font-bold ring-2 ring-blue-500/40'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <GraduationCap className={`w-5 h-5 ${selectedRole === 'faculty' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="text-xs">{authMode === 'register' ? 'New Faculty' : 'Faculty'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedRole === 'student'
                  ? 'bg-emerald-600/30 border-emerald-400 shadow-lg shadow-emerald-600/20 text-white font-bold ring-2 ring-emerald-500/40'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <BookOpen className={`w-5 h-5 ${selectedRole === 'student' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-xs">{authMode === 'register' ? 'New Student' : 'Student'}</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/50 max-h-[75vh] overflow-y-auto">
            <div className="mb-5 text-left">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full mb-2">
                {authMode === 'login' ? `${selectedRole.toUpperCase()} PORTAL` : `CREATE ${selectedRole.toUpperCase()} ACCOUNT`}
              </span>
              <h2 className="text-xl font-black text-white">
                {authMode === 'login' ? 'Sign in to your account' : `Register as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'login' 
                  ? `Enter credentials to access your ${selectedRole} dashboard.` 
                  : `Create your credentials to join the university examination platform.`}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'admin' 
                          ? 'admin@examora.com' 
                          : selectedRole === 'faculty' 
                          ? 'faculty@examora.com' 
                          : 'student@examora.com'
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Remember me</span>
                  </label>
                  <button 
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Need an account? Register
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* CREATE ACCOUNT / REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regData.fullName}
                      onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        placeholder="you@examora.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regData.phone}
                        onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                        placeholder="+1 555-0199"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* ROLE SPECIFIC FIELDS */}
                {selectedRole === 'student' && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider block">
                      Student Academic Details
                    </span>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Department</label>
                        <select
                          value={regData.department}
                          onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                          className="w-full bg-slate-800 border border-white/15 rounded-lg px-2 py-1.5 text-white text-xs"
                        >
                          <option value="Computer Science & Engineering">Computer Science</option>
                          <option value="Electronics & Communication Engineering">Electronics</option>
                          <option value="Mechanical Engineering">Mechanical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Assigned Section *</label>
                        <select
                          value={regData.section}
                          onChange={(e) => setRegData({ ...regData, section: e.target.value })}
                          className="w-full bg-slate-800 border border-emerald-400/50 rounded-lg px-2 py-1.5 text-emerald-300 font-bold text-xs"
                        >
                          <option value="CSE-A">CSE-A</option>
                          <option value="CSE-B">CSE-B</option>
                          <option value="ECE-A">ECE-A</option>
                          <option value="ME-A">ME-A</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Year</label>
                        <select
                          value={regData.year}
                          onChange={(e) => setRegData({ ...regData, year: e.target.value })}
                          className="w-full bg-slate-800 border border-white/15 rounded-lg px-2 py-1 text-white text-xs"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Semester</label>
                        <select
                          value={regData.semester}
                          onChange={(e) => setRegData({ ...regData, semester: e.target.value })}
                          className="w-full bg-slate-800 border border-white/15 rounded-lg px-2 py-1 text-white text-xs"
                        >
                          <option value="1st Semester">1st Sem</option>
                          <option value="2nd Semester">2nd Sem</option>
                          <option value="3rd Semester">3rd Sem</option>
                          <option value="4th Semester">4th Sem</option>
                          <option value="5th Semester">5th Sem</option>
                          <option value="6th Semester">6th Sem</option>
                          <option value="7th Semester">7th Sem</option>
                          <option value="8th Semester">8th Sem</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Roll / ID</label>
                        <input
                          type="text"
                          value={regData.studentId}
                          onChange={(e) => setRegData({ ...regData, studentId: e.target.value })}
                          placeholder="CS202499"
                          className="w-full bg-slate-800 border border-white/15 rounded-lg px-2 py-1 text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'faculty' && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <span className="font-bold text-blue-400 text-[11px] uppercase tracking-wider block">
                      Faculty Academic Teaching Details
                    </span>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Department</label>
                        <select
                          value={regData.department}
                          onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                          className="w-full bg-slate-800 border border-white/15 rounded-lg px-2 py-1.5 text-white text-xs"
                        >
                          <option value="Computer Science & Engineering">Computer Science</option>
                          <option value="Electronics & Communication Engineering">Electronics</option>
                          <option value="Mechanical Engineering">Mechanical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Designation</label>
                        <select
                          value={regData.designation}
                          onChange={(e) => setRegData({ ...regData, designation: e.target.value })}
                          className="w-full bg-slate-800 border border-white/15 rounded-lg px-2 py-1.5 text-white text-xs"
                        >
                          <option value="Professor">Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Lecturer">Lecturer</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Teaching Subject</label>
                        <input
                          type="text"
                          value={regData.assignedSubjects}
                          onChange={(e) => setRegData({ ...regData, assignedSubjects: e.target.value })}
                          placeholder="e.g. Operating Systems"
                          className="w-full bg-slate-800 border border-white/15 rounded-lg px-2 py-1 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">Assigned Section</label>
                        <input
                          type="text"
                          value={regData.assignedSections}
                          onChange={(e) => setRegData({ ...regData, assignedSections: e.target.value })}
                          placeholder="e.g. CSE-A, CSE-B"
                          className="w-full bg-slate-800 border border-white/15 rounded-lg px-2 py-1 text-white text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'admin' && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <span className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider block">
                      Administrator Privileges
                    </span>
                    <label className="block text-slate-400 text-[10px]">Admin Registration Security PIN</label>
                    <input
                      type="text"
                      value={regData.adminCode}
                      onChange={(e) => setRegData({ ...regData, adminCode: e.target.value })}
                      placeholder="EXAMORA2026"
                      className="w-full bg-slate-800 border border-indigo-400/50 rounded-lg px-3 py-1.5 text-indigo-300 font-mono text-xs"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-lg shadow-emerald-600/30 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register {selectedRole.toUpperCase()} Account</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-slate-400 hover:text-white transition"
                  >
                    Already have an account? <span className="text-blue-400 font-bold underline">Sign in</span>
                  </button>
                </div>
              </form>
            )}

            {/* Demo credential helper note */}
            <div className="mt-5 pt-3 border-t border-white/10 text-center">
              <p className="text-[11px] text-slate-400">
                Default password for demo accounts: <code className="text-blue-300 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">password123</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 border-t border-white/10">
        © 2026 EXAMORA Online Examination Management System. All rights reserved.
      </footer>
    </div>
  );
}
