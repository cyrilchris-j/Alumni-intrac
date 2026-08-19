import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, CheckCircle, XCircle, Users, MessageSquare,
  Plus, Search, Building2, Sparkles, Send, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { getStudentMentorshipRequests, sendMentorshipRequest } from '../../services/mentorshipService';
import { getAlumniProfile, searchAlumni } from '../../services/userService';
import { getOrCreateConversation } from '../../services/messageService';
import { formatDate, timeAgo, formatFirebaseError } from '../../utils/formatters';
import { MENTORSHIP_STATUS, MENTORSHIP_AREAS } from '../../utils/constants';

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  accepted: { label: 'Active', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Declined', variant: 'danger', icon: XCircle },
};

const StudentMentorship = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alumniProfiles, setAlumniProfiles] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'accepted'

  // Find a mentor modal state
  const [showFindModal, setShowFindModal] = useState(false);
  const [mentorSearch, setMentorSearch] = useState('');
  const [availableAlumni, setAvailableAlumni] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [mentorshipForm, setMentorshipForm] = useState({
    topic: '',
    preferredArea: 'Career Guidance',
    message: '',
  });
  const [sendingRequest, setSendingRequest] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const reqs = await getStudentMentorshipRequests(currentUser.uid);
      setRequests(reqs);

      const profiles = {};
      await Promise.all(
        reqs.map(async (r) => {
          if (!profiles[r.alumniId]) {
            const p = await getAlumniProfile(r.alumniId);
            if (p) profiles[r.alumniId] = p;
          }
        })
      );
      setAlumniProfiles(profiles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleOpenFindModal = async () => {
    setShowFindModal(true);
    try {
      const list = await searchAlumni('');
      setAvailableAlumni(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAlumni = (alumni) => {
    setSelectedAlumni(alumni);
    setMentorshipForm({
      topic: '',
      preferredArea: 'Career Guidance',
      message: `Hi ${alumni.fullName}, I would love some mentorship guidance on my career preparation and skills roadmap.`,
    });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedAlumni || !mentorshipForm.topic || !mentorshipForm.message) {
      alert('Please select a mentor and complete the topic and message.');
      return;
    }
    setSendingRequest(true);
    try {
      await sendMentorshipRequest(
        currentUser.uid,
        selectedAlumni.id || selectedAlumni.uid,
        mentorshipForm,
        userProfile?.fullName || 'Student'
      );
      setShowFindModal(false);
      setSelectedAlumni(null);
      await loadData();
      alert(`Mentorship request sent to ${selectedAlumni.fullName}!`);
    } catch (err) {
      alert(formatFirebaseError(err));
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSendMessage = async (alumniId, alumniName) => {
    try {
      await getOrCreateConversation(currentUser.uid, alumniId, {
        [currentUser.uid]: userProfile?.fullName || 'Student',
        [alumniId]: alumniName,
      });
      navigate('/student/messages', { state: { conversationWith: alumniId } });
    } catch (e) {
      alert('Failed to start chat');
    }
  };

  const filtered = requests.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return r.status === MENTORSHIP_STATUS.PENDING;
    if (activeTab === 'accepted') return r.status === MENTORSHIP_STATUS.ACCEPTED;
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All Requests', count: requests.length },
    {
      id: 'pending',
      label: 'Pending',
      count: requests.filter((r) => r.status === MENTORSHIP_STATUS.PENDING).length,
    },
    {
      id: 'accepted',
      label: 'Accepted',
      count: requests.filter((r) => r.status === MENTORSHIP_STATUS.ACCEPTED).length,
    },
  ];

  const filteredAlumniSearch = availableAlumni.filter((a) => {
    if (!mentorSearch) return true;
    const lower = mentorSearch.toLowerCase();
    return (
      a.fullName?.toLowerCase().includes(lower) ||
      a.company?.toLowerCase().includes(lower) ||
      a.jobRole?.toLowerCase().includes(lower) ||
      a.skills?.some((s) => s.toLowerCase().includes(lower))
    );
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-crest font-bold text-gold-600 uppercase tracking-widest bg-gold-100/60 px-2.5 py-0.5 rounded-full border border-gold-200/80">
            Advisory Council
          </span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1.5">
            Mentorship & Advisory Program
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Connect with accomplished alumni leaders for 1-on-1 career guidance, portfolio reviews, and graduate strategy.
          </p>
        </div>
        <Button variant="gold" onClick={handleOpenFindModal} leftIcon={Sparkles} className="shadow-gold-glow text-xs font-bold">
          Request a Mentor
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit border border-slate-200/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-primary-950 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-[10px] rounded-full px-2 py-0.5 font-bold ${
                  activeTab === tab.id
                    ? 'bg-gold-100 text-gold-900 border border-gold-300/80'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={
            activeTab === 'all'
              ? 'No mentorship requests yet'
              : `No ${activeTab} mentorship requests`
          }
          description="Find a verified alumni mentor in your field to accelerate your career growth."
          action={handleOpenFindModal}
          actionLabel="Find an Advisory Mentor"
        />
      ) : (
        <div className="space-y-4 w-full">
          {filtered.map((request) => {
            const alumni = alumniProfiles[request.alumniId];
            const config = statusConfig[request.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div
                key={request.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-200"
              >
                {/* Header Row: Avatar, Info & Status */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar
                      src={alumni?.photoURL}
                      name={alumni?.fullName}
                      size="md"
                      ring
                      className="w-12 h-12 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-bold text-slate-900 text-base sm:text-lg truncate">
                          {alumni?.fullName || 'Alumni Mentor'}
                        </h3>
                        {alumni?.verificationStatus === 'verified' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium truncate mt-0.5">
                        {alumni?.jobRole} {alumni?.company && `at ${alumni.company}`}
                      </p>
                    </div>
                  </div>

                  <Badge variant={config.variant} className="capitalize flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-bold">
                    <StatusIcon size={13} />
                    {config.label}
                  </Badge>
                </div>

                {/* Mentorship Topic Box */}
                <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/80 mb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-widest flex items-center gap-1">
                      <BookOpen size={12} className="text-blue-600" />
                      Mentorship Topic
                    </span>
                    {request.preferredArea && (
                      <span className="text-xs bg-white text-slate-700 px-2.5 py-0.5 rounded-lg border border-blue-200/80 font-semibold shadow-2xs">
                        {request.preferredArea}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {request.topic}
                  </p>
                </div>

                {/* Quote / Message Box */}
                {request.message && (
                  <div className="p-3.5 bg-slate-50/80 rounded-r-xl border-l-4 border-l-blue-600 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans mb-1">
                    "{request.message}"
                  </div>
                )}

                {/* Footer Row: Timestamp & Message Action */}
                <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 whitespace-nowrap">
                    <Clock size={13} className="text-slate-400" />
                    Requested {timeAgo(request.createdAt)}
                  </span>
                  {request.status === MENTORSHIP_STATUS.ACCEPTED && (
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={MessageSquare}
                      onClick={() => handleSendMessage(request.alumniId, alumni?.fullName)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
                    >
                      Send Message
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Find a Mentor Modal */}
      <Modal
        isOpen={showFindModal}
        onClose={() => {
          setShowFindModal(false);
          setSelectedAlumni(null);
        }}
        title="Find an Alumni Mentor"
        size="lg"
        footer={
          selectedAlumni ? (
            <div className="flex gap-2 w-full justify-end">
              <Button
                variant="ghost"
                onClick={() => setSelectedAlumni(null)}
                disabled={sendingRequest}
              >
                Back to Mentors
              </Button>
              <Button
                loading={sendingRequest}
                onClick={handleSubmitRequest}
                leftIcon={Send}
              >
                Submit Mentorship Request
              </Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setShowFindModal(false)}>
              Close
            </Button>
          )
        }
      >
        {!selectedAlumni ? (
          <div className="space-y-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search alumni by name, company, job role, or skill..."
                value={mentorSearch}
                onChange={(e) => setMentorSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {filteredAlumniSearch.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No mentors found"
                  description="Try adjusting your search keywords."
                />
              ) : (
                filteredAlumniSearch.map((alumni) => (
                  <div
                    key={alumni.id || alumni.uid}
                    className="p-4 rounded-xl border border-border hover:border-primary-500 hover:bg-primary-50/30 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={alumni.photoURL} name={alumni.fullName} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-text-primary text-sm truncate">
                            {alumni.fullName}
                          </h4>
                          {alumni.verificationStatus === 'verified' && (
                            <Badge variant="success" className="text-[10px] px-1 py-0.2">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate">
                          {alumni.jobRole} • {alumni.company}
                        </p>
                        {alumni.skills?.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {alumni.skills.slice(0, 3).map((sk) => (
                              <span key={sk} className="tag text-[10px] py-0.2 px-1.5">
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectAlumni(alumni)}
                      className="flex-shrink-0 text-xs"
                    >
                      Request
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100 flex items-center gap-3">
              <Avatar src={selectedAlumni.photoURL} name={selectedAlumni.fullName} size="sm" />
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Requesting Mentorship with {selectedAlumni.fullName}
                </p>
                <p className="text-xs text-text-secondary">
                  {selectedAlumni.jobRole} at {selectedAlumni.company}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed font-medium">
              💡 <strong>Note:</strong> You can request mentorship directly from any alumni. Describe your specific topic, goals, and questions below for the mentor to review.
            </div>

            <Input
              label="Mentorship Topic / Focus Title *"
              placeholder="e.g. Guidance on Cloud Architecture & System Design roadmap"
              value={mentorshipForm.topic}
              onChange={(e) => setMentorshipForm((f) => ({ ...f, topic: e.target.value }))}
              required
            />

            <Select
              label="Preferred Focus Area"
              options={MENTORSHIP_AREAS}
              value={mentorshipForm.preferredArea}
              onChange={(e) => setMentorshipForm((f) => ({ ...f, preferredArea: e.target.value }))}
            />

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Describe Your Topic & Questions (Message) *
              </label>
              <textarea
                rows={4}
                value={mentorshipForm.message}
                onChange={(e) => setMentorshipForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Introduce yourself and specify what questions or guidance you would like help with..."
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default StudentMentorship;
