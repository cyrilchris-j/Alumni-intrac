import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, Link2, Eye, EyeOff, GraduationCap,
  UserCheck, ShieldCheck, Sparkles
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md">
        {/* Modern Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Link2 size={24} className="text-white stroke-[2.5]" />
            </div>
            <span className="text-3xl font-heading font-bold text-slate-900 tracking-wider block">
              AlumLink
            </span>
            <span className="text-xs font-mono font-semibold tracking-widest text-blue-600 uppercase">
              Collegiate Networking Portal
            </span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-slate-900 mt-2">Welcome to the Network</h1>
          <p className="text-slate-500 mt-1 text-xs">Sign in to access your institutional network</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/20 shadow-modal p-8 sm:p-9">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Quick Demo Credentials Selector */}
          <div className="mb-6 p-4 bg-gradient-to-br from-gold-50/80 to-slate-50 rounded-2xl border border-gold-200/60 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={13} className="text-gold-600" /> Quick Demo Access
              </p>
              <span className="text-[10px] text-slate-500 font-mono">pwd: password123</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs bg-white py-1.5 border-slate-200"
                loading={demoLoading === 'student'}
                onClick={() => handleQuickDemoLogin('student')}
              >
                <GraduationCap size={13} className="text-primary-800" />
                Student
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs bg-white py-1.5 border-slate-200"
                loading={demoLoading === 'alumni'}
                onClick={() => handleQuickDemoLogin('alumni')}
              >
                <UserCheck size={13} className="text-emerald-700" />
                Alumni
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs bg-white py-1.5 border-slate-200"
                loading={demoLoading === 'admin'}
                onClick={() => handleQuickDemoLogin('admin')}
              >
                <ShieldCheck size={13} className="text-gold-700" />
                Admin
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Institutional Email"
              type="email"
              placeholder="member@college.edu"
              leftIcon={Mail}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-800 hover:text-gold-700 font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth size="md" variant="primary" loading={loading} className="mt-2 shadow-md">
              Sign In to Portal
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or verify with</span>
            </div>
          </div>

          {/* Google sign-in */}
          <Button
            variant="secondary"
            fullWidth
            size="md"
            loading={googleLoading}
            onClick={handleGoogleSignIn}
            className="border-slate-200 shadow-xs text-xs font-semibold text-slate-700"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-4 h-4"
            />
            Continue with Institutional Google ID
          </Button>

          <p className="text-center text-xs text-slate-500 mt-6 font-medium">
            New to the network?{' '}
            <Link to="/signup" className="text-primary-800 font-bold hover:text-gold-700 transition-colors">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
