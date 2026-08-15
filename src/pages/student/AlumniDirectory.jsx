import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, MapPin, Building2, GraduationCap,
  Link2, MessageSquare, X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SkeletonCard } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import { searchAlumni } from '../../services/userService';
import { sendConnectionRequest, getConnectionStatus } from '../../services/connectionService';
import { getOrCreateConversation } from '../../services/messageService';
import { formatFirebaseError, debounce } from '../../utils/formatters';
import { DEPARTMENTS, GRADUATION_YEARS } from '../../utils/constants';

const AlumniDirectory = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    graduationYear: '',
    company: '',
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [actioning, setActioning] = useState(null);

  const loadAlumni = useCallback(async (query = '', filts = {}) => {
    setLoading(true);
    try {
      const results = await searchAlumni(query, filts);
      setAlumni(results);

      // Load connection statuses
      if (currentUser) {
        const statusMap = {};
        await Promise.all(
          results.map(async (a) => {
            const conn = await getConnectionStatus(currentUser.uid, a.id);
            statusMap[a.id] = conn;
          })
        );
        setConnectionStatuses(statusMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAlumni();
  }, [loadAlumni]);

  const debouncedSearch = useCallback(
    debounce((query, filts) => loadAlumni(query, filts), 400),
    [loadAlumni]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedSearch(searchQuery, newFilters);
  };

  const clearFilters = () => {
    const cleared = { department: '', graduationYear: '', company: '', location: '' };
    setFilters(cleared);
    loadAlumni(searchQuery, cleared);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const handleConnect = async (alumni) => {
    if (!currentUser) return;
    const status = connectionStatuses[alumni.id];
    if (status) return;

    setActioning(alumni.id);
    try {
      const connId = await sendConnectionRequest(
        currentUser.uid,
        alumni.id,
        userProfile?.fullName || 'Student'
      );
      setConnectionStatuses((prev) => ({
        ...prev,
        [alumni.id]: { status: 'pending', senderId: currentUser.uid },
      }));
    } catch (e) {
      alert(formatFirebaseError(e));
    } finally {
      setActioning(null);
    }
  };

  const handleMessage = async (alumniId, alumniName) => {
    setActioning(`msg_${alumniId}`);
    try {
      await getOrCreateConversation(currentUser.uid, alumniId, {
        [currentUser.uid]: userProfile?.fullName || 'Student',
        [alumniId]: alumniName,
      });
      navigate('/student/messages', { state: { conversationWith: alumniId } });
    } catch (e) {
      alert(formatFirebaseError(e));
    } finally {
      setActioning(null);
    }
  };

  const getConnectionButtonProps = (alumniId) => {
    const conn = connectionStatuses[alumniId];
    if (!conn) return { label: 'Connect', disabled: false };
    if (conn.status === 'pending') return { label: 'Pending', disabled: true };
    if (conn.status === 'accepted') return { label: 'Connected', disabled: true };
    return { label: 'Connect', disabled: false };
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">Alumni Directory</h1>
        <p className="text-text-secondary text-sm mt-1">
          Discover and connect with alumni from your college.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search alumni, companies, skills..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Button
            variant="secondary"
            leftIcon={Filter}
            onClick={() => setShowFilters((v) => !v)}
            className="flex-shrink-0"
          >
            Filters
            {hasFilters && (
              <span className="w-2 h-2 bg-primary-600 rounded-full ml-1" />
            )}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select
              placeholder="Department"
              options={DEPARTMENTS}
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            />
            <Select
              placeholder="Graduation Year"
              options={GRADUATION_YEARS.slice(0, 20)}
              value={filters.graduationYear}
              onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
            />
            <input
              placeholder="Company"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              className="px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-text-secondary mb-4">
          {alumni.length} alumni found
        </p>
      )}

      {/* Alumni Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : alumni.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No alumni found"
          description={searchQuery || hasFilters ? "Try adjusting your search or filters." : "Alumni will appear here once they join the platform."}
          action={hasFilters ? clearFilters : null}
          actionLabel={hasFilters ? "Clear Filters" : null}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {alumni.map((a) => {
            const btnProps = getConnectionButtonProps(a.id);
            return (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-card-hover transition-all duration-250 hover:-translate-y-0.5"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar src={a.photoURL} name={a.fullName} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-text-primary text-sm">{a.fullName}</h3>
                      {a.verificationStatus === 'verified' && (
                        <Badge variant="success" className="text-[10px] px-1.5 py-0.5">✓ Verified</Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{a.jobRole}</p>
                    {a.company && (
                      <p className="text-xs text-primary-600 font-medium mt-0.5 flex items-center gap-1">
                        <Building2 size={11} className="flex-shrink-0" />
                        <span className="truncate">{a.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 mb-4">
                  {a.location && (
                    <p className="text-xs text-text-muted flex items-center gap-1.5">
                      <MapPin size={12} />{a.location}
                    </p>
                  )}
                  {a.graduationYear && (
                    <p className="text-xs text-text-muted flex items-center gap-1.5">
                      <GraduationCap size={12} />Class of {a.graduationYear}
                    </p>
                  )}
                  {a.department && (
                    <p className="text-xs text-text-muted truncate">{a.department}</p>
                  )}
                </div>

                {/* Skills */}
                {a.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {a.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="tag">{skill}</span>
                    ))}
                    {a.skills.length > 4 && (
                      <span className="tag text-text-muted">+{a.skills.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={btnProps.disabled}
                    loading={actioning === a.id}
                    variant={btnProps.disabled ? 'outline' : 'primary'}
                    onClick={() => handleConnect(a)}
                  >
                    <Link2 size={13} />
                    {btnProps.label}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={actioning === `msg_${a.id}`}
                    onClick={() => handleMessage(a.id, a.fullName)}
                    title="Message"
                  >
                    <MessageSquare size={13} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/student/alumni/${a.id}`)}
                    title="View Profile"
                  >
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AlumniDirectory;
