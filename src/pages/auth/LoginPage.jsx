import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, Link2, Eye, EyeOff, GraduationCap,
  UserCheck, ShieldCheck, Sparkles
} from 'lucide-react';
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Link2 size={20} className="text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-text-primary">AlumLink</span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary mt-1 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Quick Demo Credentials Selector */}
          <div className="mb-6 p-4 bg-primary-50/60 rounded-xl border border-primary-100">
            <p className="text-xs font-semibold text-primary-900 mb-2">
              ⚡ Quick Demo Login (Default password: <code className="bg-white px-1.5 py-0.5 rounded border border-primary-200 text-primary-700 font-mono text-[11px]">password123</code>)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs bg-white py-1.5"
                loading={demoLoading === 'student'}
                onClick={() => handleQuickDemoLogin('student')}
              >
                <GraduationCap size={13} />
                Student
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs bg-white py-1.5"
                loading={demoLoading === 'alumni'}
                onClick={() => handleQuickDemoLogin('alumni')}
              >
                <UserCheck size={13} />
                Alumni
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs bg-white py-1.5"
                loading={demoLoading === 'admin'}
                onClick={() => handleQuickDemoLogin('admin')}
              >
                <ShieldCheck size={13} />
                Admin
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@college.edu"
              leftIcon={Mail}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-text-primary">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-text-muted">or continue with</span>
            </div>
          </div>

          {/* Google sign-in */}
          <Button
            variant="outline"
            fullWidth
            size="lg"
            loading={googleLoading}
            onClick={handleGoogleSignIn}
            className="border-border"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-medium hover:text-primary-700">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
