import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, GraduationCap,
  MapPin, Save, Upload, Briefcase, CheckCircle2
} from 'lucide-react';
import { LinkedInIcon } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { SkeletonProfile } from '../../components/ui/Skeleton';
import { updateAlumniProfile, updateProfilePhoto } from '../../services/userService';
import { DEPARTMENTS, GRADUATION_YEARS, POPULAR_LOCATIONS } from '../../utils/constants';

const AlumniOwnProfile = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    department: '',
    graduationYear: '',
    company: '',
    jobRole: '',
    location: '',
    experience: '',
    linkedinUrl: '',
    phone: '',
    college: '',
    skills: '',
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
        graduationYear: userProfile.graduationYear || '',
        company: userProfile.company || '',
        jobRole: userProfile.jobRole || '',
        location: userProfile.location || '',
        experience: userProfile.experience || '',
        linkedinUrl: userProfile.linkedinUrl || '',
        phone: userProfile.phone || '',
        college: userProfile.college || 'PSG College of Technology',
        skills: Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : (userProfile.skills || ''),
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
        await updateProfilePhoto(photoFile, currentUser.uid, 'alumni');
      }

      await updateAlumniProfile(currentUser.uid, {
        fullName: form.fullName,
        department: form.department,
        graduationYear: form.graduationYear,
        company: form.company,
        jobRole: form.jobRole,
        location: form.location,
        experience: form.experience,
        linkedinUrl: form.linkedinUrl,
        phone: form.phone,
        college: form.college,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        bio: form.bio,
      });

      await refreshProfile();
      setEditing(false);
      setSuccessMsg('Alumni profile updated successfully!');
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

  const isVerified = userProfile.verificationStatus === 'verified';

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">My Professional Profile</h1>
          <p className="text-text-secondary text-sm mt-1">
            Keep your professional experience and contact links up to date.
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
        {/* Profile Card */}
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

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h2 className="text-xl font-heading font-bold text-text-primary">
              {userProfile.fullName}
            </h2>
          </div>

          <p className="text-sm font-medium text-text-secondary mb-1">{userProfile.jobRole}</p>
          <p className="text-xs text-primary-600 font-semibold mb-3">{userProfile.company}</p>

          <div className="mb-4">
            {isVerified ? (
              <Badge variant="success" dot>Verified Alumni</Badge>
            ) : (
              <Badge variant="warning" dot>Verification Pending</Badge>
            )}
          </div>

          <div className="border-t border-border pt-4 text-left space-y-3 text-sm">
            <div className="flex items-center gap-3 text-text-secondary">
              <GraduationCap size={16} className="text-primary-600 flex-shrink-0" />
              <span>Class of {userProfile.graduationYear} • {userProfile.department}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Building2 size={16} className="text-primary-600 flex-shrink-0" />
              <span className="truncate">{userProfile.college || 'PSG College of Technology'}</span>
            </div>
            {userProfile.location && (
              <div className="flex items-center gap-3 text-text-secondary">
                <MapPin size={16} className="text-primary-600 flex-shrink-0" />
                <span>{userProfile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-text-secondary">
              <Mail size={16} className="text-primary-600 flex-shrink-0" />
              <span className="truncate">{currentUser?.email}</span>
            </div>
            {userProfile.linkedinUrl && (
              <div className="flex items-center gap-3 text-primary-600">
                <LinkedInIcon size={16} className="flex-shrink-0" />
                <a href={userProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                  LinkedIn Profile
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Form or View */}
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
                <Input
                  label="Current Company"
                  placeholder="Google, Microsoft, Zoho..."
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  required
                />
                <Input
                  label="Job Role / Title"
                  placeholder="Senior Software Engineer, PM..."
                  value={form.jobRole}
                  onChange={(e) => setForm((f) => ({ ...f, jobRole: e.target.value }))}
                  required
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
                  label="Graduation Year"
                  options={GRADUATION_YEARS}
                  value={form.graduationYear}
                  onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  placeholder="Chennai, Bangalore, Remote..."
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
                <Input
                  label="Experience (Summary)"
                  placeholder="5+ years in full-stack web development"
                  value={form.experience}
                  onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                />
              </div>

              <Input
                label="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/username"
                value={form.linkedinUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
              />

              <Input
                label="Key Skills (Comma-separated)"
                placeholder="React, Node.js, System Design, Cloud Architecture"
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
              />

              <div>
                <label className="form-label">Professional Bio</label>
                <textarea
                  className="form-input h-24 resize-none"
                  placeholder="Share a brief overview of your career journey, achievements, and mentorship focus."
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} leftIcon={Save}>
                  Save Profile
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-semibold text-text-primary text-base mb-2">About & Bio</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {userProfile.bio || "No professional bio added yet. Click 'Edit Profile' to introduce yourself to prospective mentees."}
                </p>
              </div>

              {userProfile.experience && (
                <div>
                  <h3 className="font-heading font-semibold text-text-primary text-base mb-2">Experience Overview</h3>
                  <p className="text-sm text-text-secondary">{userProfile.experience}</p>
                </div>
              )}

              <div>
                <h3 className="font-heading font-semibold text-text-primary text-base mb-2">Skills & Expertise</h3>
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
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlumniOwnProfile;
