import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, UserCheck, Clock, Users, MessageSquare } from 'lucide-react';
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
import { timeAgo } from '../../utils/formatters';

const Connections = () => {
  const { currentUser, userProfile, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('connections');
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

      // Load all relevant profiles
      const allIds = new Set([
        ...conns.map((c) => c.senderId === currentUser.uid ? c.receiverId : c.senderId),
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
      console.error(e);
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
      await acceptConnection(conn.id, userProfile?.fullName, conn.senderId);
      await loadData();
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (conn) => {
    setActioning(`reject_${conn.id}`);
    try {
      await rejectConnection(conn.id);
      await loadData();
    } finally {
      setActioning(null);
    }
  };

  const tabs = [
    { id: 'connections', label: 'Connections', count: connections.length },
    { id: 'pending', label: 'Requests', count: pending.length },
    { id: 'sent', label: 'Sent', count: sent.length },
  ];

  const getOtherId = (conn) =>
    conn.senderId === currentUser.uid ? conn.receiverId : conn.senderId;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">Connections</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your network connections.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'
              }`}>
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
          {/* Connections */}
          {activeTab === 'connections' && (
            connections.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No connections yet"
                description="Start building your network by connecting with alumni."
                action={() => navigate('/student/alumni')}
                actionLabel="Explore Alumni"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {connections.map((conn) => {
                  const otherId = getOtherId(conn);
                  const profile = profiles[otherId];
                  return (
                    <div key={conn.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
                      <Avatar src={profile?.photoURL} name={profile?.fullName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm truncate">{profile?.fullName || 'Unknown'}</p>
                        <p className="text-xs text-text-secondary truncate">{profile?.jobRole} {profile?.company && `• ${profile.company}`}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => navigate('/student/messages')}>
                          <MessageSquare size={14} />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/student/alumni/${otherId}`)}>
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Pending requests */}
          {activeTab === 'pending' && (
            pending.length === 0 ? (
              <EmptyState icon={Clock} title="No pending requests" description="You'll see connection requests from alumni here." />
            ) : (
              <div className="space-y-3">
                {pending.map((conn) => {
                  const profile = profiles[conn.senderId];
                  return (
                    <div key={conn.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
                      <Avatar src={profile?.photoURL} name={profile?.fullName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm">{profile?.fullName}</p>
                        <p className="text-xs text-text-secondary">{profile?.jobRole} {profile?.company && `• ${profile.company}`}</p>
                        <p className="text-xs text-text-muted mt-0.5">{timeAgo(conn.createdAt)}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="success"
                          loading={actioning === conn.id}
                          onClick={() => handleAccept(conn)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={actioning === `reject_${conn.id}`}
                          onClick={() => handleReject(conn)}
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

          {/* Sent requests */}
          {activeTab === 'sent' && (
            sent.length === 0 ? (
              <EmptyState icon={Link2} title="No sent requests" description="Requests you send will appear here." />
            ) : (
              <div className="space-y-3">
                {sent.map((conn) => {
                  const profile = profiles[conn.receiverId];
                  return (
                    <div key={conn.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
                      <Avatar src={profile?.photoURL} name={profile?.fullName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm">{profile?.fullName}</p>
                        <p className="text-xs text-text-secondary">{profile?.jobRole}</p>
                      </div>
                      <Badge variant="warning" dot>Pending</Badge>
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
