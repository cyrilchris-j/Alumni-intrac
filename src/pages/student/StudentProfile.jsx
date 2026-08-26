import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, GraduationCap,
  BookOpen, Sparkles, Save, Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { SkeletonProfile } from '../../components/ui/Skeleton';
import { updateStudentProfile, updateProfilePhoto } from '../../services/userService';
import { DEPARTMENTS, STUDENT_YEARS } from '../../utils/constants';

const StudentProfile = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    registerNo: '',
    department: '',
    year: '',
    section: '',
    phone: '',
    college: '',
    skills: '',
    interests: '',
    bio: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (userProfile) {
      setForm({
        fullName: userProfile.fullName || '',
        registerNo: userProfile.registerNo || '',
        department: userProfile.department || '',
        year: userProfile.year || '',
        section: userProfile.section || '',
        phone: userProfile.phone || '',
        college: userProfile.college || 'PSG College of Technology',
        skills: Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : (userProfile.skills || ''),
        interests: Array.isArray(userProfile.interests) ? userProfile.interests.join(', ') : (userProfile.interests || ''),
        bio: userProfile.bio || '',
      });
    }
  }, [userProfile]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      if (photoFile) {
        await updateProfilePhoto(photoFile, currentUser.uid, 'student');
      }

      await updateStudentProfile(currentUser.uid, {
        fullName: form.fullName,
        registerNo: form.registerNo,
        department: form.department,
        year: form.year,
        section: form.section,
        phone: form.phone,
        college: form.college,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
        bio: form.bio,
      });

      await refreshProfile();
      setEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!userProfile) {
    return (
      <DashboardLayout>
        <SkeletonProfile />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_12px_36px_-6px_rgba(37,99,235,0.08),0_4px_16px_-2px_rgba(0,0,0,0.02)] overflow-hidden mb-6 transition-all duration-300">
        {/* Banner Cover with Premium Gradient & Ambient Lighting */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-1/3 w-80 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        </div>

        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-12 sm:-mt-14 mb-4">
            <div className="flex items-end gap-4 min-w-0">
              <div className="relative p-1 bg-white rounded-full shadow-xl ring-4 ring-white/90 shadow-blue-900/10 flex-shrink-0">
                <Avatar
                  src={photoPreview || userProfile.photoURL}
                  name={userProfile.fullName}
                  size="xl"
                  className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0"
                />
                {editing && (
                  <label className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-md">
                    <Upload size={14} />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                )}
              </div>
              <div className="min-w-0 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 truncate">
                    {userProfile.fullName || 'Student Profile'}
                  </h1>
                  {userProfile.registerNo && (
                    <span className="inline-block px-3 py-0.5 bg-blue-50 text-blue-700 text-xs font-mono font-bold rounded-full border border-blue-200 shadow-2xs">
                      Reg No: {userProfile.registerNo}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-medium truncate mt-0.5">
                  {userProfile.year || '3 Year'} {userProfile.department || 'CSE'} Student
                </p>
              </div>
            </div>

            <Button
              variant={editing ? 'secondary' : 'primary'}
              onClick={() => setEditing((prev) => !prev)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold flex-shrink-0 shadow-sm transition-transform active:scale-95"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Details / Edit Form (Full Width) */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
              <Input
                label="Register Number"
                placeholder="e.g. 217101"
                value={form.registerNo}
                onChange={(e) => setForm((f) => ({ ...f, registerNo: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <Input
                label="Section"
                placeholder="e.g. A, B, C"
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                options={DEPARTMENTS}
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                required
              />
              <Select
                label="Year of Study"
                options={STUDENT_YEARS}
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                required
              />
            </div>

            <Input
              label="College"
              value={form.college}
              onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
            />

            <Input
              label="Skills (Comma-separated)"
              placeholder="React, Python, Machine Learning"
              value={form.skills}
              onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            />

            <Input
              label="Interests (Comma-separated)"
              placeholder="Web Development, Cloud Computing, UI/UX"
              value={form.interests}
              onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
            />

            <div>
              <label className="form-label">About Me</label>
              <textarea
                className="form-input h-24 resize-none"
                placeholder="Write a brief introduction about yourself, career goals, etc."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saving} leftIcon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Quick Credentials Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <GraduationCap size={16} className="text-blue-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Academic Status</span>
                  <span className="font-semibold text-slate-800">{userProfile.year || 'Student'} {userProfile.section && `(Sec ${userProfile.section})`}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-medium block">Institution</span>
                  <span className="font-semibold text-slate-800 truncate block">{userProfile.college || 'PSG College of Technology'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-medium block">Email Address</span>
                  <span className="font-semibold text-slate-800 truncate block">{currentUser?.email}</span>
                </div>
              </div>
              {userProfile.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Phone Contact</span>
                    <span className="font-semibold text-slate-800">{userProfile.phone}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-heading font-semibold text-text-primary text-base mb-2">About</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {userProfile.bio || "No introduction added yet. Click 'Edit Profile' to share more about yourself."}
              </p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-text-primary text-base mb-2">Skills</h3>
              {userProfile.skills && userProfile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg border border-primary-100">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No skills listed yet.</p>
              )}
            </div>

            <div>
              <h3 className="font-heading font-semibold text-text-primary text-base mb-2">Interests</h3>
              {userProfile.interests && userProfile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest) => (
                    <span key={interest} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No interests listed yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
