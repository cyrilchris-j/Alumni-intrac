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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">My Profile</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your academic credentials, skills, and personal information.
          </p>
        </div>
        <Button
          variant={editing ? 'ghost' : 'primary'}
          onClick={() => setEditing((prev) => !prev)}
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card / Overview */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-border p-6 text-center shadow-sm">
          <div className="relative w-28 h-28 mx-auto mb-4">
            <Avatar
              src={photoPreview || userProfile.photoURL}
              name={userProfile.fullName}
              size="2xl"
              className="w-28 h-28 mx-auto"
            />
            {editing && (
              <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 shadow-md">
                <Upload size={14} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>

          <h2 className="text-xl font-heading font-bold text-text-primary mb-1">
            {userProfile.fullName}
          </h2>
          <p className="text-sm text-text-secondary mb-4">{userProfile.department}</p>

          <div className="border-t border-border pt-4 text-left space-y-3 text-sm">
            <div className="flex items-center gap-3 text-text-secondary">
              <GraduationCap size={16} className="text-primary-600 flex-shrink-0" />
              <span>{userProfile.year || 'Student'} {userProfile.section && `(Sec ${userProfile.section})`}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Building2 size={16} className="text-primary-600 flex-shrink-0" />
              <span className="truncate">{userProfile.college || 'PSG College of Technology'}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Mail size={16} className="text-primary-600 flex-shrink-0" />
              <span className="truncate">{currentUser?.email}</span>
            </div>
            {userProfile.phone && (
              <div className="flex items-center gap-3 text-text-secondary">
                <Phone size={16} className="text-primary-600 flex-shrink-0" />
                <span>{userProfile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Details / Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm">
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
                  label="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Section"
                  placeholder="e.g. A, B, C"
                  value={form.section}
                  onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                />
                <Input
                  label="College"
                  value={form.college}
                  onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
                />
              </div>

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
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
