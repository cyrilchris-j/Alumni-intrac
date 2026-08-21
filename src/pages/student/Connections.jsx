import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Clock, Users, MessageSquare, Building2, GraduationCap, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  getUserConnections,
  getPendingRequests,
  getSentRequests,
  acceptConnection,
  rejectConnection,
} from '../../services/connectionService';
import { getAlumniProfile, getStudentProfile } from '../../services/userService';
import { getOrCreateConversation } from '../../services/messageService';
import { timeAgo, formatFirebaseError } from '../../utils/formatters';

const Connections = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('connections'); // 'connections' | 'pending' | 'sent'
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [sent, setSent] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [conns, pend, sentReqs] = await Promise.all([
        getUserConnections(currentUser.uid),
        getPendingRequests(currentUser.uid),
        getSentRequests(currentUser.uid),
      ]);
      setConnections(conns);
      setPending(pend);
      setSent(sentReqs);

      // Load all relevant profiles (both alumni and student)
      const allIds = new Set([
        ...conns.map((c) => (c.senderId === currentUser.uid ? c.receiverId : c.senderId)),
        ...pend.map((c) => c.senderId),
        ...sentReqs.map((c) => c.receiverId),
      ]);

      const profileMap = {};
      await Promise.all(
        [...allIds].map(async (uid) => {
          if (!profileMap[uid]) {
            const alumniP = await getAlumniProfile(uid).catch(() => null);
            const studentP = alumniP ? null : await getStudentProfile(uid).catch(() => null);
            profileMap[uid] = alumniP || studentP;
          }
        })
      );
      setProfiles(profileMap);
    } catch (e) {
      console.error('Error loading connections:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleAccept = async (conn) => {
    setActioning(conn.id);
    try {
      await acceptConnection(conn.id, userProfile?.fullName || 'User', conn.senderId);
      await loadData();
    } catch (err) {
      alert(formatFirebaseError(err));
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (conn) => {
    setActioning(`reject_${conn.id}`);
    try {
      await rejectConnection(conn.id);
      await loadData();
    } catch (err) {
      alert(formatFirebaseError(err));
    } finally {
      setActioning(null);
    }
  };

  const handleStartChat = async (otherId, otherName) => {
    setActioning(`chat_${otherId}`);
    try {
      await getOrCreateConversation(currentUser.uid, otherId, {
        [currentUser.uid]: userProfile?.fullName || 'User',
        [otherId]: otherName || 'User',
      });
      navigate('/student/messages', { state: { conversationWith: otherId } });
    } catch (err) {
      alert('Failed to initiate conversation');
    } finally {
      setActioning(null);
    }
  };

  const tabs = [
    { id: 'connections', label: 'My Connections', count: connections.length },
    { id: 'pending', label: 'Received Requests', count: pending.length },
    { id: 'sent', label: 'Sent Requests', count: sent.length },
  ];

  const getOtherId = (conn) =>
    conn.senderId === currentUser.uid ? conn.receiverId : conn.senderId;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Connections & Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your network of mentors, alumni, and fellow scholars.
          </p>
        </div>
        <Button onClick={() => navigate('/student/alumni')} leftIcon={Users} variant="primary" className="text-xs font-bold">
          Discover New Connections
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Active Connections (Accepted Only) */}
          {activeTab === 'connections' && (
            connections.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No active connections"
                description="Start building your network by connecting with alumni leaders and fellow scholars."
                action={() => navigate('/student/alumni')}
                actionLabel="Explore Directory"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {connections.map((conn) => {
                  const otherId = getOtherId(conn);
                  const profile = profiles[otherId];
                  const isAlumni = Boolean(profile?.graduationYear || profile?.company);
                  return (
                    <div
                      key={conn.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Info */}
                        <div className="flex items-start gap-3.5 mb-3">
                          <Avatar src={profile?.photoURL} name={profile?.fullName} size="lg" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-heading font-semibold text-slate-900 text-sm truncate">
                                {profile?.fullName || 'Network Connection'}
                              </h3>
                              {profile?.verificationStatus === 'verified' && (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200/80 flex items-center gap-0.5">
                                  <CheckCircle size={10} /> Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                              {profile?.jobRole || profile?.department}
                            </p>
                            {profile?.company ? (
                              <p className="text-xs text-primary-600 font-medium truncate flex items-center gap-1 mt-1">
                                <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                                {profile.company}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1 mt-1">
                                <GraduationCap size={12} className="text-slate-400 flex-shrink-0" />
                                {profile?.year || 'Collegiate Scholar'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3.5 border-t border-slate-100 mt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          loading={actioning === `chat_${otherId}`}
                          onClick={() => handleStartChat(otherId, profile?.fullName)}
                          className="flex-1 text-xs font-medium"
                          leftIcon={MessageSquare}
                        >
                          Message
                        </Button>
                        {isAlumni ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/student/alumni/${otherId}`)}
                            className="text-xs px-3.5 font-medium"
                          >
                            Profile
                          </Button>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 px-2">
                            Connected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Pending Requests Received */}
          {activeTab === 'pending' && (
            pending.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No pending requests received"
                description="When someone sends you a connection request, you'll see it here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pending.map((conn) => {
                  const profile = profiles[conn.senderId];
                  return (
                    <div
                      key={conn.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3.5 mb-4">
                        <Avatar src={profile?.photoURL} name={profile?.fullName} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-slate-900 text-sm truncate">
                            {profile?.fullName || 'User'}
                          </p>
                          <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                            {profile?.jobRole || profile?.department}
                          </p>
                          {profile?.company && (
                            <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1 mt-1">
                              <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                              {profile.company}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-1">
                            Received {timeAgo(conn.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3.5 border-t border-slate-100 mt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          loading={actioning === conn.id}
                          onClick={() => handleAccept(conn)}
                          className="flex-1 text-xs font-medium"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={actioning === `reject_${conn.id}`}
                          onClick={() => handleReject(conn)}
                          className="flex-1 text-xs font-medium text-slate-700 hover:text-red-600"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Sent Requests */}
          {activeTab === 'sent' && (
            sent.length === 0 ? (
              <EmptyState
                icon={Link2}
                title="No sent requests"
                description="Requests you send to alumni and peers will appear here with pending status."
                action={() => navigate('/student/alumni')}
                actionLabel="Find People"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sent.map((conn) => {
                  const profile = profiles[conn.receiverId];
                  return (
                    <div
                      key={conn.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3.5 mb-4">
                        <Avatar src={profile?.photoURL} name={profile?.fullName} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-slate-900 text-sm truncate">
                            {profile?.fullName || 'User'}
                          </p>
                          <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                            {profile?.jobRole || profile?.department}
                          </p>
                          {profile?.company && (
                            <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1 mt-1">
                              <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                              {profile.company}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-1">
                            Sent {timeAgo(conn.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-slate-100 mt-2 flex justify-end">
                        <Badge variant="warning" dot className="text-xs font-medium px-2.5 py-1">
                          Pending Approval
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Connections;
