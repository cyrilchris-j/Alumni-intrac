import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Building2, GraduationCap, Calendar,
  Mail, Phone, Link2, MessageSquare, BookOpen, ArrowLeft,
  Briefcase, Users
} from 'lucide-react';
import { LinkedInIcon } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SkeletonProfile } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { getAlumniProfile } from '../../services/userService';
import { sendConnectionRequest, getConnectionStatus } from '../../services/connectionService';
import { sendMentorshipRequest } from '../../services/mentorshipService';
import { getOrCreateConversation } from '../../services/messageService';
import { formatAuthError } from '../../utils/formatters';
import { MENTORSHIP_AREAS } from '../../utils/constants';
import Select from '../../components/ui/Select';

const AlumniProfile = () => {
  const { alumniId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [mentorshipForm, setMentorshipForm] = useState({
    topic: '', message: '', preferredArea: '', availability: ''
  });
  const [mentorshipLoading, setMentorshipLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getAlumniProfile(alumniId);
        setAlumni(profile);

        if (currentUser) {
          const conn = await getConnectionStatus(currentUser.uid, alumniId);
          setConnectionStatus(conn);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [alumniId, currentUser]);

  const handleConnect = async () => {
    if (connectionStatus) return;
    setConnecting(true);
    try {
      await sendConnectionRequest(
        currentUser.uid,
        alumniId,
        userProfile?.fullName || 'Student'
      );
      setConnectionStatus({ status: 'pending', senderId: currentUser.uid });
    } catch (e) {
      alert(formatAuthError(e));
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (connectionStatus?.status !== 'accepted') {
      alert('Direct messaging is available only after the alumni accepts your connection request.');
      return;
    }
    setMessaging(true);
    try {
      await getOrCreateConversation(currentUser.uid, alumniId, {
        [currentUser.uid]: userProfile?.fullName || 'Student',
        [alumniId]: alumni?.fullName,
      });
      navigate('/student/messages', { state: { conversationWith: alumniId } });
    } catch (e) {
      alert(formatAuthError(e));
    } finally {
      setMessaging(false);
    }
  };

  const handleMentorshipRequest = async () => {
    if (!mentorshipForm.topic || !mentorshipForm.message) {
      alert('Please fill in the topic and message.');
      return;
    }
    setMentorshipLoading(true);
    try {
      await sendMentorshipRequest(
        currentUser.uid,
        alumniId,
        mentorshipForm,
        userProfile?.fullName || 'Student'
      );
      setShowMentorshipModal(false);
      alert(`Mentorship request sent to ${alumni.fullName}!`);
    } catch (e) {
      alert(formatAuthError(e));
    } finally {
      setMentorshipLoading(false);
    }
  };

  const getConnectButton = () => {
    if (!connectionStatus) return { label: 'Connect', disabled: false };
    if (connectionStatus.status === 'pending') return { label: 'Request Sent', disabled: true };
    if (connectionStatus.status === 'accepted') return { label: 'Connected', disabled: true };
    return { label: 'Connect', disabled: false };
  };

  const connectBtn = getConnectButton();

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonProfile />
      </DashboardLayout>
    );
  }

  if (!alumni) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-text-secondary">Alumni profile not found.</p>
          <Button onClick={() => navigate(-1)} variant="secondary" className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_12px_36px_-6px_rgba(37,99,235,0.08),0_4px_16px_-2px_rgba(0,0,0,0.02)] overflow-hidden mb-6 transition-all duration-300">
        {/* Banner Cover with Premium Gradient & Ambient Lighting */}
        <div className="relative h-44 sm:h-52 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 overflow-hidden">
          {/* Ambient Lighting & Abstract Glass Orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-1/3 w-96 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-900/30 rounded-full blur-2xl pointer-events-none" />
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        </div>

        <div className="px-6 sm:px-8 pb-7">
          {/* Avatar & Action Buttons Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-5">
            {/* Premium Avatar Ring Container */}
            <div className="relative p-1.5 bg-white rounded-full shadow-xl ring-4 ring-white shadow-blue-900/10 flex-shrink-0 self-start sm:self-auto">
              <Avatar src={alumni.photoURL} name={alumni.fullName} size="2xl" className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap pt-2 sm:pt-0">
              <Button
                leftIcon={Link2}
                disabled={connectBtn.disabled}
                loading={connecting}
                onClick={handleConnect}
                variant={connectBtn.disabled ? 'outline' : 'primary'}
                className="rounded-xl px-5 py-2.5 shadow-sm transition-transform active:scale-95 text-sm"
              >
                {connectBtn.label}
              </Button>
              <Button
                leftIcon={MessageSquare}
                variant="secondary"
                disabled={connectionStatus?.status !== 'accepted'}
                title={
                  connectionStatus?.status === 'accepted'
                    ? 'Send Direct Message'
                    : 'Messaging available after alumni accepts connection request'
                }
                loading={messaging}
                onClick={handleMessage}
                className="rounded-xl px-5 py-2.5 shadow-xs transition-transform active:scale-95 text-sm"
              >
                Message
              </Button>
              <Button
                leftIcon={BookOpen}
                variant="gold"
                onClick={() => setShowMentorshipModal(true)}
                className="rounded-xl px-5 py-2.5 shadow-md shadow-cyan-500/15 transition-transform active:scale-95 text-sm"
              >
                Request Mentorship
              </Button>
            </div>
          </div>

          {/* User Details (Name, Badge, Role) - Cleanly below banner */}
          <div className="mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                {alumni.fullName}
              </h1>
              {alumni.verificationStatus === 'verified' && (
                <Badge variant="success" className="shadow-xs backdrop-blur-xs">
                  ✓ Verified Alumni
                </Badge>
              )}
            </div>
            <p className="text-slate-600 font-medium text-base sm:text-lg mt-1.5 flex items-center gap-2 flex-wrap">
              <span>{alumni.jobRole}</span>
              {alumni.company && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Briefcase size={16} className="text-blue-600 inline" />
                    {alumni.company}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Quick info Micro-Cards */}
          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100">
            {alumni.location && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs font-medium text-slate-700 shadow-2xs hover:bg-blue-50/50 transition-colors">
                <div className="w-5 h-5 rounded-md bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <MapPin size={12} />
                </div>
                {alumni.location}
              </div>
            )}
            {alumni.graduationYear && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs font-medium text-slate-700 shadow-2xs hover:bg-blue-50/50 transition-colors">
                <div className="w-5 h-5 rounded-md bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={12} />
                </div>
                Class of {alumni.graduationYear}
              </div>
            )}
            {alumni.department && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs font-medium text-slate-700 shadow-2xs hover:bg-blue-50/50 transition-colors">
                <div className="w-5 h-5 rounded-md bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={12} />
                </div>
                {alumni.department}
              </div>
            )}
            {alumni.college && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs font-medium text-slate-700 shadow-2xs hover:bg-blue-50/50 transition-colors">
                <div className="w-5 h-5 rounded-md bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Building2 size={12} />
                </div>
                {alumni.college}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {alumni.bio && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-heading font-bold text-slate-900">About</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{alumni.bio}</p>
            </div>
          )}

          {/* Experience */}
          {alumni.experience && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-heading font-bold text-slate-900">Experience</h2>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100 text-blue-600 shadow-2xs">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-base">{alumni.jobRole}</p>
                  <p className="text-blue-600 text-sm font-medium">{alumni.company}</p>
                  <p className="text-slate-500 text-sm mt-1">{alumni.experience}</p>
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
              <h2 className="text-lg font-heading font-bold text-slate-900">Education</h2>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100 text-blue-600 shadow-2xs">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-base">{alumni.college}</p>
                <p className="text-slate-600 text-sm font-medium">{alumni.department}</p>
                {alumni.graduationYear && (
                  <p className="text-slate-500 text-sm mt-0.5">Graduated {alumni.graduationYear}</p>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {alumni.skills?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-heading font-bold text-slate-900">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {alumni.skills.map((skill) => (
                  <span key={skill} className="px-3.5 py-1.5 bg-blue-50/80 text-blue-700 text-sm font-semibold rounded-xl border border-blue-100 shadow-2xs hover:bg-blue-100/60 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Contact */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
              <h2 className="text-base font-heading font-bold text-slate-900">Contact</h2>
            </div>
            <div className="space-y-3.5">
              <a
                href={`mailto:${alumni.email}`}
                className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 hover:text-blue-600 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} />
                </div>
                <span className="truncate font-medium">{alumni.email}</span>
              </a>
              {alumni.phone && (
                <a
                  href={`tel:${alumni.phone}`}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 hover:text-blue-600 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Phone size={16} />
                  </div>
                  <span className="font-medium">{alumni.phone}</span>
                </a>
              )}
              {alumni.linkedinUrl && (
                <a
                  href={alumni.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-2.5 rounded-xl bg-blue-50/50 hover:bg-blue-50 text-sm text-blue-600 hover:text-blue-700 transition-colors border border-blue-100/60 font-semibold"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <LinkedInIcon size={16} />
                  </div>
                  <span>LinkedIn Profile</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mentorship Modal */}
      <Modal
        isOpen={showMentorshipModal}
        onClose={() => setShowMentorshipModal(false)}
        title={`Request Mentorship with ${alumni.fullName}`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowMentorshipModal(false)}>
              Cancel
            </Button>
            <Button variant="gold" loading={mentorshipLoading} onClick={handleMentorshipRequest}>
              Send Mentorship Request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed font-medium">
            💡 <strong>Note:</strong> You can send a mentorship request anytime without requiring a prior accepted connection. Describe your topic and specific questions below so the alumni can review your request.
          </div>

          <div>
            <label className="form-label">Mentorship Topic / Focus Title <span className="text-red-500">*</span></label>
            <input
              className="form-input text-xs"
              placeholder="e.g., Cloud Architecture Roadmap & System Design Advice"
              value={mentorshipForm.topic}
              onChange={(e) => setMentorshipForm((f) => ({ ...f, topic: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="form-label">Preferred Focus Area</label>
            <Select
              options={MENTORSHIP_AREAS}
              value={mentorshipForm.preferredArea}
              onChange={(e) => setMentorshipForm((f) => ({ ...f, preferredArea: e.target.value }))}
              placeholder="Select guidance area"
            />
          </div>
          <div>
            <label className="form-label">Describe Your Topic & Questions (Message) <span className="text-red-500">*</span></label>
            <textarea
              className="form-input h-28 resize-none text-xs"
              placeholder="Introduce yourself, describe your background, and outline the specific questions or guidance you are seeking from this mentor..."
              value={mentorshipForm.message}
              onChange={(e) => setMentorshipForm((f) => ({ ...f, message: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="form-label">Preferred Availability (Optional)</label>
            <input
              className="form-input text-xs"
              placeholder="e.g., Weekends, Evenings after 6 PM IST"
              value={mentorshipForm.availability}
              onChange={(e) => setMentorshipForm((f) => ({ ...f, availability: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AlumniProfile;
