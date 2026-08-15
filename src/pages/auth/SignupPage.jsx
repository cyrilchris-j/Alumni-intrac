import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Link2, GraduationCap, UserCheck, Eye, EyeOff,
  Mail, Lock, User, Building2, Phone, Upload
} from 'lucide-react';
import { signUpWithEmail } from '../../firebase/auth';
import { createUserDocument, createStudentProfile, createAlumniProfile } from '../../services/userService';
import { uploadProfilePhoto } from '../../firebase/storage';
import { formatFirebaseError } from '../../utils/formatters';
import { DEPARTMENTS, STUDENT_YEARS, GRADUATION_YEARS, POPULAR_SKILLS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const SignupPage = () => {
  const [step, setStep] = useState('role'); // 'role' | 'form'
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    college: 'PSG College of Technology',
    department: '', phone: '', skills: '',
    // Student specific
    year: '', section: '', interests: '',
    // Alumni specific
    graduationYear: '', company: '', jobRole: '',
    location: '', experience: '', linkedinUrl: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Create Firebase Auth user
      const user = await signUpWithEmail(form.email, form.password, form.fullName);

      // Upload profile photo if provided
      let photoURL = '';
      if (profilePhoto) {
        photoURL = await uploadProfilePhoto(profilePhoto, user.uid);
      }

      const skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);

      // Create user document
      await createUserDocument(user.uid, {
        email: form.email,
        role,
        displayName: form.fullName,
        photoURL,
      });

      // Create role-specific profile
      if (role === 'student') {
        await createStudentProfile(user.uid, {
          fullName: form.fullName,
          email: form.email,
          college: form.college,
          department: form.department,
          year: form.year,
          section: form.section,
          phone: form.phone,
          skills,
          interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
          photoURL,
        });
        navigate('/student/dashboard', { replace: true });
      } else {
        await createAlumniProfile(user.uid, {
          fullName: form.fullName,
          email: form.email,
          college: form.college,
          department: form.department,
          graduationYear: form.graduationYear,
          company: form.company,
          jobRole: form.jobRole,
          location: form.location,
          skills,
          experience: form.experience,
          linkedinUrl: form.linkedinUrl,
          phone: form.phone,
          photoURL,
          bio: '',
          verificationStatus: 'pending',
        });
        navigate('/alumni/dashboard', { replace: true });
      }
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Link2 size={20} className="text-white" />
              </div>
              <span className="text-2xl font-heading font-bold text-text-primary">AlumLink</span>
            </Link>
            <h1 className="text-2xl font-heading font-bold text-text-primary">Join AlumLink</h1>
            <p className="text-text-secondary mt-1 text-sm">Select how you'd like to join the network</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setRole('student'); setStep('form'); }}
              className="bg-white border-2 border-border hover:border-primary-400 rounded-2xl p-8 text-center transition-all duration-200 group hover:shadow-card-hover"
            >
              <div className="w-16 h-16 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <GraduationCap size={30} className="text-primary-600" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">I'm a Student</h3>
              <p className="text-sm text-text-secondary">
                Connect with alumni, find mentors, and discover opportunities.
              </p>
            </button>

            <button
              onClick={() => { setRole('alumni'); setStep('form'); }}
              className="bg-white border-2 border-border hover:border-primary-400 rounded-2xl p-8 text-center transition-all duration-200 group hover:shadow-card-hover"
            >
              <div className="w-16 h-16 bg-green-50 group-hover:bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <UserCheck size={30} className="text-green-600" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">I'm an Alumni</h3>
              <p className="text-sm text-text-secondary">
                Give back, mentor students, and share opportunities.
              </p>
            </button>
          </div>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <Link2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-text-primary">AlumLink</span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Create your {role === 'student' ? 'Student' : 'Alumni'} account
          </h1>
          <p className="text-text-secondary mt-1 text-sm">Fill in your details to get started</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-card p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile photo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-border">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <label className="btn-secondary btn-sm cursor-pointer inline-flex items-center gap-2 rounded-lg">
                  <Upload size={14} />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-text-muted mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>

            {/* Common fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Priya Menon"
                leftIcon={User}
                value={form.fullName}
                onChange={handleChange('fullName')}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="priya@college.edu"
                leftIcon={Mail}
                value={form.email}
                onChange={handleChange('email')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  leftIcon={Lock}
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-9 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                leftIcon={Lock}
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="College"
                placeholder="PSG College of Technology"
                leftIcon={Building2}
                value={form.college}
                onChange={handleChange('college')}
                required
              />
              <Select
                label="Department"
                options={DEPARTMENTS}
                value={form.department}
                onChange={handleChange('department')}
                required
              />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              leftIcon={Phone}
              value={form.phone}
              onChange={handleChange('phone')}
            />

            {/* Student-specific fields */}
            {role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Year of Study"
                  options={STUDENT_YEARS}
                  value={form.year}
                  onChange={handleChange('year')}
                  required
                />
                <Input
                  label="Section"
                  placeholder="e.g., A, B, C"
                  value={form.section}
                  onChange={handleChange('section')}
                />
              </div>
            )}

            {/* Alumni-specific fields */}
            {role === 'alumni' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Graduation Year"
                    options={GRADUATION_YEARS}
                    value={form.graduationYear}
                    onChange={handleChange('graduationYear')}
                    required
                  />
                  <Input
                    label="Current Company"
                    placeholder="Google, TCS, Infosys..."
                    value={form.company}
                    onChange={handleChange('company')}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Job Role / Title"
                    placeholder="Software Engineer, PM..."
                    value={form.jobRole}
                    onChange={handleChange('jobRole')}
                    required
                  />
                  <Input
                    label="Location"
                    placeholder="Chennai, Bangalore..."
                    value={form.location}
                    onChange={handleChange('location')}
                  />
                </div>
                <Input
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/in/yourname"
                  value={form.linkedinUrl}
                  onChange={handleChange('linkedinUrl')}
                  hint="Optional but recommended"
                />
              </>
            )}

            <Input
              label={role === 'student' ? 'Skills' : 'Key Skills'}
              placeholder="e.g., JavaScript, Python, React (comma-separated)"
              value={form.skills}
              onChange={handleChange('skills')}
              hint="Separate multiple skills with commas"
            />

            {role === 'student' && (
              <Input
                label="Interests"
                placeholder="e.g., Web Development, Machine Learning, Design"
                value={form.interests}
                onChange={handleChange('interests')}
                hint="Comma-separated interests"
              />
            )}

            <div className="flex items-center gap-4 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('role')}
              >
                ← Back
              </Button>
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Create Account
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-text-secondary mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
