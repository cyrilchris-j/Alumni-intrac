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
    registerNo: '', year: '', section: '', interests: '',
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
          registerNo: form.registerNo,
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

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="bg-white rounded-3xl border border-border p-8 sm:p-10 shadow-card">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-xs">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 mb-2">
            Managed Portal Access
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Student and Alumni accounts are manually provisioned and assigned by <strong className="text-slate-900">College Administration</strong>. Self-registration is restricted for institution verification and security.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 mb-6">
            <p className="font-semibold text-slate-800 uppercase tracking-wider">How to get your credentials:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Students: Obtain your login email & password from your HOD or Department Admin.</li>
              <li>Alumni: Contact the Alumni Cell / Administration office for account activation.</li>
            </ul>
          </div>

          <Link
            to="/login"
            className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-xs"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
