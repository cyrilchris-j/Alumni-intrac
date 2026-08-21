import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, MapPin, Building2, GraduationCap,
  Link2, MessageSquare, X, Users, Sparkles, BookOpen, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SkeletonCard } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import { searchAlumni, searchStudents } from '../../services/userService';
import { sendConnectionRequest, getConnectionStatus } from '../../services/connectionService';
import { getOrCreateConversation } from '../../services/messageService';
import { formatFirebaseError, debounce } from '../../utils/formatters';
import { DEPARTMENTS, GRADUATION_YEARS, STUDENT_YEARS } from '../../utils/constants';

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

  const loadData = useCallback(async (query = '', filts = {}) => {
    setLoading(true);
    try {
      const results = await searchAlumni(query, filts);
      setAlumni(results);

      if (currentUser) {
        const statusMap = {};
        await Promise.all(
          results.map(async (a) => {
            const conn = await getConnectionStatus(currentUser.uid, a.id || a.uid);
            if (conn) statusMap[a.id || a.uid] = conn;
          })
        );
        setConnectionStatuses((prev) => ({ ...prev, ...statusMap }));
      }
    } catch (e) {
      console.error('Error loading directory:', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData(searchQuery, filters);
  }, [loadData]);

  const debouncedSearch = useCallback(
    debounce((query, filts) => loadData(query, filts), 350),
    [loadData]
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
    loadData(searchQuery, cleared);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const handleConnect = async (person) => {
    if (!currentUser) return;
    const targetId = person.id || person.uid;
    const status = connectionStatuses[targetId];
    if (status) return;

    setActioning(targetId);
    try {
      await sendConnectionRequest(
        currentUser.uid,
        targetId,
        userProfile?.fullName || 'Student'
      );
      setConnectionStatuses((prev) => ({
        ...prev,
        [targetId]: { status: 'pending', senderId: currentUser.uid },
      }));
    } catch (e) {
      alert(formatFirebaseError(e));
    } finally {
      setActioning(null);
    }
  };

  const handleMessage = async (personId, personName) => {
    setActioning(`msg_${personId}`);
    try {
      await getOrCreateConversation(currentUser.uid, personId, {
        [currentUser.uid]: userProfile?.fullName || 'Student',
        [personId]: personName,
      });
      navigate('/student/messages', { state: { conversationWith: personId } });
    } catch (e) {
      alert(formatFirebaseError(e));
    } finally {
      setActioning(null);
    }
  };

  const getConnectionButtonProps = (targetId) => {
    const conn = connectionStatuses[targetId];
    if (!conn) return { label: 'Connect', disabled: false, variant: 'primary', isConnected: false };
    if (conn.status === 'pending') {
      return {
        label: conn.senderId === currentUser?.uid ? 'Pending' : 'Accept',
        disabled: conn.senderId === currentUser?.uid,
        variant: conn.senderId === currentUser?.uid ? 'outline' : 'success',
        isConnected: false,
      };
    }
    if (conn.status === 'accepted') {
      return { label: 'Connected', disabled: true, variant: 'secondary', isConnected: true };
    }
    return { label: 'Connect', disabled: false, variant: 'primary', isConnected: false };
  };

  const currentList = alumni;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Alumni Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover and connect with distinguished alumni leaders across industries.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search alumni by name, company, leadership role, or expertise..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 shadow-xs"
            />
          </div>
          <Button
            variant="secondary"
            leftIcon={Filter}
            onClick={() => setShowFilters((v) => !v)}
            className="flex-shrink-0 text-xs"
          >
            Refine Filter
            {hasFilters && (
              <span className="w-2 h-2 bg-gold-500 rounded-full ml-1" />
            )}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
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
              placeholder="Company (e.g. Google)"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              className="px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 shadow-xs"
            />
            <input
              placeholder="Location (e.g. Bangalore)"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 shadow-xs"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="col-span-full flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold mt-1"
              >
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing <span className="font-bold text-slate-900 font-serif text-sm">{alumni.length}</span> distinguished alumni
          </p>
        </div>
      )}

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : alumni.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No alumni matches found"
          description={
            searchQuery || hasFilters
              ? 'Try adjusting your search query or criteria.'
              : 'Institutional members will appear here as they register.'
          }
          action={hasFilters ? clearFilters : null}
          actionLabel={hasFilters ? 'Reset Filters' : null}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {alumni.map((person) => {
            const targetId = person.id || person.uid;
            const btnProps = getConnectionButtonProps(targetId);

            return (
              <div
                key={targetId}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:shadow-card-hover hover:border-blue-200 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group shadow-card"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3.5">
                    <Avatar src={person.photoURL} name={person.fullName} size="lg" ring />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-heading font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {person.fullName}
                        </h3>
                        {person.verificationStatus === 'verified' && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 flex items-center gap-0.5">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">
                        {person.jobRole}
                      </p>
                      {person.company && (
                        <p className="text-xs text-blue-700 font-semibold mt-0.5 flex items-center gap-1">
                          <Building2 size={11} className="flex-shrink-0 text-blue-600" />
                          <span className="truncate">{person.company}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5 mb-3 text-xs text-slate-400">
                    {person.location && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="flex-shrink-0 text-slate-400" />
                        {person.location}
                      </p>
                    )}
                    {person.graduationYear && (
                      <p className="flex items-center gap-1.5 truncate text-slate-600 font-medium">
                        <GraduationCap size={12} className="flex-shrink-0 text-blue-600" />
                        Class of {person.graduationYear}
                      </p>
                    )}
                    {person.department && (
                      <p className="truncate text-slate-500 font-medium">{person.department}</p>
                    )}
                  </div>

                  {/* Skills */}
                  {person.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {person.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="tag text-[10px] py-0.5 px-2 bg-slate-50 border-slate-200 font-medium">
                          {skill}
                        </span>
                      ))}
                      {person.skills.length > 3 && (
                        <span className="tag text-[10px] py-0.5 px-1.5 text-slate-400 bg-transparent border-dashed">
                          +{person.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={btnProps.disabled}
                    variant={btnProps.variant}
                    loading={actioning === targetId}
                    onClick={() => handleConnect(person)}
                  >
                    <Link2 size={13} />
                    {btnProps.label}
                  </Button>

                  {btnProps.isConnected && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={actioning === `msg_${targetId}`}
                      onClick={() => handleMessage(targetId, person.fullName)}
                      title="Message"
                    >
                      <MessageSquare size={13} />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/student/alumni/${targetId}`)}
                    title="View Profile"
                    className="text-xs px-2.5"
                  >
                    Profile
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
