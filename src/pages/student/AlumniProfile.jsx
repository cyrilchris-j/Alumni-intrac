import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Building2, GraduationCap, Calendar,
  Mail, Phone, Link2, MessageSquare, BookOpen, ArrowLeft,
  Briefcase, Star, Users
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
import { formatFirebaseError } from '../../utils/formatters';
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
      alert(formatFirebaseError(e));
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
      alert(formatFirebaseError(e));
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
      alert(formatFirebaseError(e));
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
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <div className="border-4 border-white rounded-full shadow-md flex-shrink-0">
                <Avatar src={alumni.photoURL} name={alumni.fullName} size="2xl" />
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-heading font-bold text-text-primary">{alumni.fullName}</h1>
                  {alumni.verificationStatus === 'verified' && (
                    <Badge variant="success">✓ Verified Alumni</Badge>
                  )}
                </div>
                <p className="text-text-secondary">{alumni.jobRole} {alumni.company && `at ${alumni.company}`}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                leftIcon={Link2}
                disabled={connectBtn.disabled}
                loading={connecting}
                onClick={handleConnect}
                variant={connectBtn.disabled ? 'outline' : 'primary'}
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
              >
                Message
              </Button>
              <Button
                leftIcon={BookOpen}
                variant="gold"
                onClick={() => setShowMentorshipModal(true)}
              >
                Request Mentorship
              </Button>
            </div>
          </div>

          {/* Quick info */}
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            {alumni.location && (
              <span className="flex items-center gap-1.5"><MapPin size={14} />{alumni.location}</span>
            )}
            {alumni.graduationYear && (
              <span className="flex items-center gap-1.5"><GraduationCap size={14} />Class of {alumni.graduationYear}</span>
            )}
            {alumni.department && (
              <span className="flex items-center gap-1.5"><Briefcase size={14} />{alumni.department}</span>
            )}
            {alumni.college && (
              <span className="flex items-center gap-1.5"><Building2 size={14} />{alumni.college}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {alumni.bio && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-heading font-semibold text-text-primary mb-3">About</h2>
              <p className="text-text-secondary leading-relaxed">{alumni.bio}</p>
            </div>
          )}

          {/* Experience */}
          {alumni.experience && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Experience</h2>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-text-muted" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{alumni.jobRole}</p>
                  <p className="text-text-secondary text-sm">{alumni.company}</p>
                  <p className="text-text-muted text-sm mt-1">{alumni.experience}</p>
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Education</h2>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-text-primary">{alumni.college}</p>
                <p className="text-text-secondary text-sm">{alumni.department}</p>
                {alumni.graduationYear && (
                  <p className="text-text-muted text-sm">Graduated {alumni.graduationYear}</p>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {alumni.skills?.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {alumni.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg border border-primary-100">
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
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-base font-heading font-semibold text-text-primary mb-4">Contact</h2>
            <div className="space-y-3">
              <a
                href={`mailto:${alumni.email}`}
                className="flex items-center gap-3 text-sm text-text-secondary hover:text-primary-600 transition-colors"
              >
                <Mail size={16} className="text-text-muted flex-shrink-0" />
                <span className="truncate">{alumni.email}</span>
              </a>
              {alumni.phone && (
                <a
                  href={`tel:${alumni.phone}`}
                  className="flex items-center gap-3 text-sm text-text-secondary hover:text-primary-600 transition-colors"
                >
                  <Phone size={16} className="text-text-muted flex-shrink-0" />
                  {alumni.phone}
                </a>
              )}
              {alumni.linkedinUrl && (
                <a
                  href={alumni.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <LinkedInIcon size={16} className="flex-shrink-0" />
                  LinkedIn Profile
                </a>
              )}
            </div>
          </div>

          {/* Mentorship CTA */}
          <div className="bg-green-50 rounded-xl border border-green-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} className="text-green-600" />
              <h3 className="font-semibold text-text-primary text-sm">Open to Mentorship</h3>
            </div>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">
              {alumni.fullName?.split(' ')[0]} is available to guide students in their career journey.
            </p>
            <Button
              size="sm"
              variant="success"
              fullWidth
              onClick={() => setShowMentorshipModal(true)}
            >
              Request Mentorship
            </Button>
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
