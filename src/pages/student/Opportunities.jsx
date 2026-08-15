import { useState, useEffect } from 'react';
import {
  Briefcase, Search, MapPin, Building2, ExternalLink,
  Bookmark, BookmarkCheck, Clock, Filter, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  getOpportunities,
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
} from '../../services/opportunityService';
import { OPPORTUNITY_TYPES, WORK_MODES } from '../../utils/constants';
import { formatDate, timeAgo } from '../../utils/formatters';

const Opportunities = () => {
  const { currentUser } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const [opps, saved] = await Promise.all([
        getOpportunities({ search, type: typeFilter, workMode: workModeFilter }),
        currentUser ? getSavedOpportunities(currentUser.uid) : Promise.resolve([]),
      ]);
      setOpportunities(opps);
      setSavedIds(new Set(saved));
      if (opps.length > 0 && !selectedOpp) {
        setSelectedOpp(opps[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [typeFilter, workModeFilter, onlySaved]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOpportunities();
  };

  const toggleSave = async (oppId, e) => {
    e?.stopPropagation();
    if (!currentUser) return;
    try {
      if (savedIds.has(oppId)) {
        await unsaveOpportunity(currentUser.uid, oppId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(oppId);
          return next;
        });
      } else {
        await saveOpportunity(currentUser.uid, oppId);
        setSavedIds((prev) => new Set(prev).add(oppId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (onlySaved && !savedIds.has(opp.id)) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Opportunities</h1>
          <p className="text-text-secondary text-sm mt-1">
            Discover exclusive internships, jobs, and referrals posted by alumni.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={onlySaved ? 'primary' : 'outline'}
            size="sm"
            leftIcon={onlySaved ? BookmarkCheck : Bookmark}
            onClick={() => setOnlySaved((prev) => !prev)}
          >
            {onlySaved ? 'Showing Saved' : 'Saved Opportunities'}
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search title, company, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              placeholder="All Types"
              options={OPPORTUNITY_TYPES}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              placeholder="Work Mode"
              options={WORK_MODES}
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
            />
          </div>
          <div className="sm:col-span-1">
            <Button type="submit" fullWidth size="md">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Main Content: Split List & Details */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="lg:col-span-2">
            <SkeletonCard className="h-96" />
          </div>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description={onlySaved ? "You haven't saved any opportunities yet." : "Try adjusting your search criteria or check back later."}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Opportunity List */}
          <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {filteredOpportunities.map((opp) => {
              const isSelected = selectedOpp?.id === opp.id;
              const isSaved = savedIds.has(opp.id);
              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'border-primary-600 ring-1 ring-primary-600 shadow-sm' : 'border-border hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm line-clamp-1">{opp.title}</h3>
                      <p className="text-xs text-text-secondary font-medium">{opp.company}</p>
                    </div>
                    <button
                      onClick={(e) => toggleSave(opp.id, e)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved ? 'text-primary-600 bg-primary-50' : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1"><MapPin size={11} />{opp.location || 'Remote'}</span>
                    <span>•</span>
                    <span>{opp.workMode}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <Badge variant="primary">{opp.type}</Badge>
                    <span className="text-text-muted">{timeAgo(opp.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details View */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-border p-6 sticky top-4">
            {selectedOpp ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-heading font-bold text-text-primary">{selectedOpp.title}</h2>
                      <Badge variant="primary">{selectedOpp.type}</Badge>
                    </div>
                    <p className="text-sm font-medium text-text-secondary flex items-center gap-2">
                      <Building2 size={15} />
                      {selectedOpp.company}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={savedIds.has(selectedOpp.id) ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={(e) => toggleSave(selectedOpp.id, e)}
                    >
                      {savedIds.has(selectedOpp.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </Button>
                    {selectedOpp.externalLink && (
                      <a
                        href={selectedOpp.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary btn-sm rounded-lg flex items-center gap-1.5"
                      >
                        Apply Now
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl text-xs">
                  <div>
                    <span className="text-text-muted block mb-0.5">Location</span>
                    <span className="font-medium text-text-primary">{selectedOpp.location || 'Remote'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-0.5">Work Mode</span>
                    <span className="font-medium text-text-primary">{selectedOpp.workMode || 'Full-time'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-0.5">Deadline</span>
                    <span className="font-medium text-text-primary">
                      {selectedOpp.deadline ? formatDate(selectedOpp.deadline) : 'No Deadline'}
                    </span>
                  </div>
                  {selectedOpp.postedByName && (
                    <div>
                      <span className="text-text-muted block mb-0.5">Posted by Alumni</span>
                      <span className="font-medium text-primary-600">{selectedOpp.postedByName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-text-primary text-sm mb-2">Description</h4>
                  <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                    {selectedOpp.description}
                  </p>
                </div>

                {selectedOpp.skills && selectedOpp.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-text-primary text-sm mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOpp.skills.map((skill) => (
                        <span key={skill} className="tag bg-gray-100 text-gray-700">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-text-secondary py-12">Select an opportunity to view details.</p>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Opportunities;
