import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, Link2, Eye, EyeOff, GraduationCap,
  UserCheck, ShieldCheck, Sparkles, QrCode, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../../firebase/auth';
import {
  getUserDocument,
  createUserDocument,
  createStudentProfile,
  createAlumniProfile
} from '../../services/userService';
import { formatFirebaseError } from '../../utils/formatters';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const DEMO_ACCOUNTS = {
  student: {
    email: 'student@psgtech.edu',
    password: 'password123',
    name: 'Rahul Sharma',
    role: 'student',
    dept: 'Computer Science & Engineering',
    year: '3rd Year',
  },
  alumni: {
    email: 'alumni@psgtech.edu',
    password: 'password123',
    name: 'Priya Menon',
    role: 'alumni',
    company: 'Google',
    jobRole: 'Senior Product Manager',
    dept: 'Computer Science & Engineering',
    year: '2018',
  },
  admin: {
    email: 'admin@psgtech.edu',
    password: 'password123',
    name: 'College Administrator',
    role: 'admin',
  },
};

const LoginPage = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const redirectByRole = (role) => {
    if (from && from.startsWith(`/${role}`)) {
      navigate(from, { replace: true });
    } else {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser && userRole) {
      redirectByRole(userRole);
    }
  }, [currentUser, userRole, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signInWithEmail(form.email, form.password);
      const userDoc = await getUserDocument(user.uid);
      if (!userDoc) throw new Error('Account not found. Please sign up.');
      redirectByRole(userDoc.role);
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      const userDoc = await getUserDocument(user.uid);
      if (!userDoc) {
        navigate('/signup?google=true', { replace: true });
        return;
      }
      redirectByRole(userDoc.role);
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickDemoLogin = async (roleType) => {
    const demo = DEMO_ACCOUNTS[roleType];
    if (!demo) return;

    setError('');
    setDemoLoading(roleType);
    setForm({ email: demo.email, password: demo.password });

    try {
      let user;
      try {
        // Attempt sign in
        user = await signInWithEmail(demo.email, demo.password);
      } catch (signInErr) {
        // If user not found in Firebase Auth, auto-create demo user for testing
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          user = await signUpWithEmail(demo.email, demo.password, demo.name);

          // Create Firestore documents for demo user
          await createUserDocument(user.uid, {
            email: demo.email,
            role: demo.role,
            displayName: demo.name,
            photoURL: '',
          });

          if (demo.role === 'student') {
            await createStudentProfile(user.uid, {
              fullName: demo.name,
              email: demo.email,
              college: 'PSG College of Technology',
              department: demo.dept,
              year: demo.year,
              skills: ['React', 'JavaScript', 'Python', 'Tailwind CSS'],
              interests: ['Full Stack Development', 'Open Source'],
              phone: '+91 98450 12345',
            });
          } else if (demo.role === 'alumni') {
            await createAlumniProfile(user.uid, {
              fullName: demo.name,
              email: demo.email,
              college: 'PSG College of Technology',
              department: demo.dept,
              graduationYear: demo.year,
              company: demo.company,
              jobRole: demo.jobRole,
              location: 'Bangalore, Karnataka',
              skills: ['Product Strategy', 'Roadmapping', 'Agile', 'Cloud Solutions'],
              experience: '6+ years in core software & product management.',
              verificationStatus: 'verified',
              phone: '+91 98111 00001',
            });
          }
        } else {
          throw signInErr;
        }
      }

      const userDoc = await getUserDocument(user.uid);
      redirectByRole(userDoc?.role || demo.role);
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setDemoLoading('');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Column (Desktop only): Light Blue Background with Official Emblem Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#EBF3FE] flex-col items-center justify-center p-12 min-h-screen border-r border-blue-100/70">
        <div className="flex flex-col items-center justify-center text-center max-w-lg">
          <img
            src="/college_logo.png"
            alt="K.S.R. College of Engineering"
            className="w-64 h-64 object-contain drop-shadow-md transition-transform hover:scale-105 duration-300"
          />
          <h2 className="mt-8 text-base md:text-lg font-serif font-extrabold text-[#1e293b] tracking-wider uppercase leading-relaxed max-w-md">
            COMPUTER SCIENCE AND ENGINEERING
          </h2>
        </div>
      </div>

      {/* Right / Main Content Column */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start lg:justify-center py-3 px-6 sm:py-6 sm:px-10 min-h-screen bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Header (Mobile only): Emblem Logo & Department Name on clean white background */}
          <div className="flex lg:hidden flex-col items-center text-center mb-4 pt-1">
            <img
              src="/college_logo.png"
              alt="K.S.R. College of Engineering"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xs"
            />
            <h2 className="mt-3 text-xs sm:text-sm font-serif font-extrabold text-[#1e293b] tracking-wider uppercase">
              COMPUTER SCIENCE AND ENGINEERING
            </h2>
          </div>

          {/* Welcome Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Sign in to your account to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Quick Demo Access Bar */}
          <div className="mb-5 p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} className="text-blue-600" /> Quick Demo Access
              </span>
              <span className="text-[10px] text-slate-500 font-mono">pwd: password123</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                disabled={!!demoLoading}
                className="py-1.5 px-2 bg-white hover:bg-blue-100/50 text-slate-700 rounded-lg border border-blue-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <GraduationCap size={12} className="text-blue-600" />
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alumni')}
                disabled={!!demoLoading}
                className="py-1.5 px-2 bg-white hover:bg-blue-100/50 text-slate-700 rounded-lg border border-blue-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <UserCheck size={12} className="text-emerald-600" />
                Alumni
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                disabled={!!demoLoading}
                className="py-1.5 px-2 bg-white hover:bg-blue-100/50 text-slate-700 rounded-lg border border-blue-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <ShieldCheck size={12} className="text-amber-600" />
                Admin
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* College Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                College Email
              </label>
              <input
                type="email"
                placeholder="cyrilchristopherj28cse24_27@ksrce.ac.in"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
                className="w-full px-3.5 py-3 text-xs sm:text-sm font-medium bg-[#edf4fe] border border-blue-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-10 py-3 text-xs sm:text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

            <p className="text-center text-xs text-slate-500 mt-6 font-medium">
              Need access? Student & Alumni accounts are provisioned by{' '}
              <span className="text-blue-600 font-semibold">College Administration</span>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
