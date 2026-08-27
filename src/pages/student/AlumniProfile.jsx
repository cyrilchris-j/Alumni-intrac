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
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Directory
      </button>

      {/* ── Profile Header Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_12px_36px_-6px_rgba(37,99,235,0.08),0_4px_16px_-2px_rgba(0,0,0,0.02)] overflow-hidden mb-5">

        {/* Banner */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-96 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-blue-900/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          {/* Avatar and Actions Container */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-14 mb-4">

            {/* Avatar ring */}
            <div className="relative shrink-0 p-1.5 bg-white rounded-full shadow-xl ring-4 ring-white shadow-blue-900/10 self-start sm:self-auto">
              <Avatar
                src={alumni.photoURL}
                name={alumni.fullName}
                size="2xl"
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
              />
            </div>

            {/* Action buttons — 3-column grid on mobile to look neat, normal row on sm+ */}
            <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:items-center sm:gap-2 sm:w-auto sm:mb-1">
              <Button
                leftIcon={Link2}
                disabled={connectBtn.disabled}
                loading={connecting}
                onClick={handleConnect}
                variant={connectBtn.disabled ? 'outline' : 'primary'}
                className="rounded-xl px-1.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm shadow-sm active:scale-95 transition-transform w-full justify-center"
              >
                <span className="truncate">{connectBtn.label}</span>
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
                className="rounded-xl px-1.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm active:scale-95 transition-transform w-full justify-center"
              >
                <span className="truncate">Message</span>
              </Button>
              <Button
                leftIcon={BookOpen}
                variant="gold"
                onClick={() => setShowMentorshipModal(true)}
                className="rounded-xl px-1.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm shadow-md shadow-cyan-500/15 active:scale-95 transition-transform w-full justify-center"
              >
                <span className="truncate">Mentorship</span>
              </Button>
            </div>
          </div>

          {/* Name + badge + title */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                {alumni.fullName}
              </h1>
              {alumni.verificationStatus === 'verified' && (
                <Badge variant="success" className="shadow-xs backdrop-blur-xs shrink-0">
                  ✓ Verified Alumni
                </Badge>
              )}
            </div>
            <p className="text-slate-600 font-medium text-sm sm:text-base flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {alumni.jobRole && <span>{alumni.jobRole}</span>}
              {alumni.company && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-blue-600 shrink-0" />
                    {alumni.company}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Micro-cards — wrappable grid so nothing clips */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            {alumni.location && (
              <MicroCard icon={<MapPin size={11} />}>{alumni.location}</MicroCard>
            )}
            {alumni.graduationYear && (
              <MicroCard icon={<GraduationCap size={11} />}>Class of {alumni.graduationYear}</MicroCard>
            )}
            {alumni.department && (
              <MicroCard icon={<Briefcase size={11} />}>{alumni.department}</MicroCard>
            )}
            {alumni.college && (
              <MicroCard icon={<Building2 size={11} />}>{alumni.college}</MicroCard>
            )}
          </div>
        </div>
      </div>

      {/* ── Unified Symmetrical Single-Column Stack ── */}
      <div className="space-y-5">
        {/* Main content */}
        <div className="space-y-5">

          {/* About */}
          {alumni.bio && (
            <SectionCard title="About">
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{alumni.bio}</p>
            </SectionCard>
          )}

          {/* Experience */}
          {alumni.experience && (
            <SectionCard title="Experience">
              <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 text-blue-600 shadow-2xs">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">{alumni.jobRole}</p>
                  <p className="text-blue-600 text-xs sm:text-sm font-medium truncate">{alumni.company}</p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">{alumni.experience}</p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Education */}
          <SectionCard title="Education">
            <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 text-blue-600 shadow-2xs">
                <GraduationCap size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm sm:text-base">{alumni.college}</p>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">{alumni.department}</p>
                {alumni.graduationYear && (
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Graduated {alumni.graduationYear}</p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Skills */}
          {alumni.skills?.length > 0 && (
            <SectionCard title="Skills">
              <div className="flex flex-wrap gap-2">
                {alumni.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-50/80 text-blue-700 text-xs sm:text-sm font-semibold rounded-xl border border-blue-100 shadow-2xs hover:bg-blue-100/60 transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Contact Details (Clean responsive grid) */}
          <SectionCard title="Contact Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <ContactRow
                icon={<Mail size={15} />}
                href={`mailto:${alumni.email}`}
              >
                <span className="truncate min-w-0 block">{alumni.email}</span>
              </ContactRow>
              {alumni.phone && (
                <ContactRow
                  icon={<Phone size={15} />}
                  href={`tel:${alumni.phone}`}
                >
                  {alumni.phone}
                </ContactRow>
              )}
              {alumni.linkedinUrl && (
                <ContactRow
                  icon={<LinkedInIcon size={15} />}
                  href={alumni.linkedinUrl}
                  external
                  accent
                >
                  LinkedIn Profile
                </ContactRow>
              )}
            </div>
          </SectionCard>
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

/* ── Reusable sub-components ─────────────────────────────────────── */

/** Section card with blue left-bar heading */
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-1 h-5 bg-blue-600 rounded-full shrink-0" />
      <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900">{title}</h2>
    </div>
    {children}
  </div>
);

/** Micro info pill that wraps cleanly and clips long text */
const MicroCard = ({ icon, children }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/70 text-xs font-medium text-slate-700 shadow-2xs hover:bg-blue-50/50 transition-colors max-w-[calc(50%-0.5rem)] sm:max-w-xs">
    <div className="w-4.5 h-4.5 rounded-md bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <span className="truncate">{children}</span>
  </div>
);

/** Contact link row with min touch target */
const ContactRow = ({ icon, href, children, external = false, accent = false }) => (
  <a
    href={href}
    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    className={[
      'flex items-center gap-3 px-2.5 py-2 rounded-xl min-h-[44px] text-sm font-medium transition-colors border',
      accent
        ? 'bg-blue-50/60 hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-100/70'
        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 border-transparent hover:border-slate-100',
    ].join(' ')}
  >
    <div className={[
      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
      accent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600',
    ].join(' ')}>
      {icon}
    </div>
    <span className="truncate min-w-0">{children}</span>
  </a>
);

export default AlumniProfile;
