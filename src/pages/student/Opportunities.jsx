import { useState, useEffect } from 'react';
import {
  Briefcase, Search, MapPin, Building2, ExternalLink,
  Bookmark, BookmarkCheck, Clock, Filter, X, Plus, Sparkles, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  getOpportunities,
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
  applyOpportunity,
  getAppliedOpportunities,
  createOpportunity,
} from '../../services/opportunityService';
import { OPPORTUNITY_TYPES, WORK_MODES } from '../../utils/constants';
import { formatDate, timeAgo } from '../../utils/formatters';

const Opportunities = () => {
  const { currentUser, userProfile, userRole } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);

  // Post opportunity modal (Alumni & Admin)
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    company: '',
    type: 'Internship',
    workMode: 'Remote',
    location: '',
    description: '',
    skills: '',
    deadline: '',
    externalLink: '',
  });

  const canPost = userRole === 'alumni' || userRole === 'admin';

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const [opps, saved, applied] = await Promise.all([
        getOpportunities({ search, type: typeFilter, workMode: workModeFilter }),
        currentUser ? getSavedOpportunities(currentUser.uid) : Promise.resolve([]),
        currentUser ? getAppliedOpportunities(currentUser.uid) : Promise.resolve([]),
      ]);
      setOpportunities(opps);
      setSavedIds(new Set(saved));
      setAppliedIds(new Set(applied));
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

  const handleApply = async (opp) => {
    if (!currentUser) return;
    try {
      await applyOpportunity(currentUser.uid, opp.id, {
        studentName: userProfile?.fullName || 'Student',
        studentEmail: userProfile?.email || currentUser.email,
      });
      setAppliedIds((prev) => new Set(prev).add(opp.id));
      alert(`Application submitted for ${opp.title}!`);
    } catch (err) {
      alert('Failed to submit application');
    }
  };

  const handleOpenPostModal = () => {
    setPostForm({
      title: '',
      company: userProfile?.company || '',
      type: 'Internship',
      workMode: 'Remote',
      location: userProfile?.location || '',
      description: '',
      skills: '',
      deadline: '',
      externalLink: '',
    });
    setShowPostModal(true);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.company || !postForm.description) {
      alert('Please fill in required fields (Title, Company, and Description).');
      return;
    }
    setPosting(true);
    try {
      await createOpportunity(currentUser.uid, userProfile?.fullName || 'Alumni / Admin', postForm);
      setShowPostModal(false);
      await loadOpportunities();
      alert('Opportunity published successfully!');
    } catch (err) {
      alert('Failed to publish opportunity');
    } finally {
      setPosting(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (onlySaved && !savedIds.has(opp.id)) return false;
    return true;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Career Portal
          </span>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight mt-1.5">
            Jobs, Fellowships & Opportunities
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Explore verified career opportunities, referrals, and internships posted by distinguished alumni.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={onlySaved ? 'gold' : 'secondary'}
            size="sm"
            leftIcon={onlySaved ? BookmarkCheck : Bookmark}
            onClick={() => setOnlySaved((prev) => !prev)}
            className="text-xs"
          >
            {onlySaved ? 'Saved Vault' : 'Saved Vault'} ({savedIds.size})
          </Button>

          {canPost && (
            <Button size="sm" variant="gold" leftIcon={Plus} onClick={handleOpenPostModal} className="text-xs font-bold shadow-gold-glow">
              Post Opportunity
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-card">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, company, skills, hackathon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 shadow-xs"
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              placeholder="All Classifications"
              options={OPPORTUNITY_TYPES}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              placeholder="All Locations"
              options={WORK_MODES}
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
            />
          </div>
          <div className="sm:col-span-1">
            <Button type="submit" fullWidth size="md" className="text-xs font-bold">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Main Split Layout */}
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
          description={
            onlySaved
              ? "You haven't saved any opportunities yet. Click the bookmark icon to save."
              : 'Try adjusting your search criteria or check back later.'
          }
          action={onlySaved ? () => setOnlySaved(false) : null}
          actionLabel={onlySaved ? 'View All Opportunities' : null}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Opportunity List (Left) */}
          <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {filteredOpportunities.map((opp) => {
              const isSelected = selectedOpp?.id === opp.id;
              const isSaved = savedIds.has(opp.id);
              const isApplied = appliedIds.has(opp.id);
              const isHackathon = opp.type?.toLowerCase().includes('hackathon');
              const isVacancy = opp.type?.toLowerCase().includes('vacancy');

              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className={`bg-white rounded-2xl border p-4.5 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-600 ring-2 ring-primary-500/20 shadow-sm bg-primary-50/20'
                      : 'border-border hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-text-primary text-sm line-clamp-1">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-text-secondary font-medium mt-0.5">{opp.company}</p>
                    </div>
                    <button
                      onClick={(e) => toggleSave(opp.id, e)}
                      className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                        isSaved
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                    >
                      {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {opp.location || 'Remote'}
                    </span>
                    <span>•</span>
                    <span>{opp.workMode || 'Remote'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-border/80 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isHackathon
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : isVacancy
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-primary-50 text-primary-700 border-primary-200'
                        }`}
                      >
                        {opp.type}
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                    <span className="text-text-muted text-[11px]">{timeAgo(opp.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details View (Right) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-border p-6 sticky top-4 shadow-sm">
            {selectedOpp ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h2 className="text-xl font-heading font-bold text-text-primary">
                        {selectedOpp.title}
                      </h2>
                      <Badge variant="primary">{selectedOpp.type}</Badge>
                      {appliedIds.has(selectedOpp.id) && (
                        <Badge variant="success" className="text-xs">
                          ✓ Applied
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                      <Building2 size={16} className="text-primary-600" />
                      {selectedOpp.company}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={savedIds.has(selectedOpp.id) ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={(e) => toggleSave(selectedOpp.id, e)}
                    >
                      {savedIds.has(selectedOpp.id) ? (
                        <>
                          <BookmarkCheck size={16} className="text-primary-600" /> Saved
                        </>
                      ) : (
                        <>
                          <Bookmark size={16} /> Save
                        </>
                      )}
                    </Button>

                    {appliedIds.has(selectedOpp.id) ? (
                      <Button size="sm" variant="success" disabled>
                        <CheckCircle size={15} /> Application Sent
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApply(selectedOpp)}
                        leftIcon={Sparkles}
                      >
                        Apply Now
                      </Button>
                    )}

                    {selectedOpp.externalLink && (
                      <a
                        href={selectedOpp.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary btn-sm rounded-xl flex items-center gap-1.5"
                        title="External Link"
                      >
                        Website
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  <div>
                    <span className="text-text-muted block mb-0.5">Location</span>
                    <span className="font-semibold text-text-primary">
                      {selectedOpp.location || 'Remote'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-0.5">Work Mode</span>
                    <span className="font-semibold text-text-primary">
                      {selectedOpp.workMode || 'Full-time'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-0.5">Application Deadline</span>
                    <span className="font-semibold text-text-primary">
                      {selectedOpp.deadline ? formatDate(selectedOpp.deadline) : 'Rolling Basis'}
                    </span>
                  </div>
                  {selectedOpp.postedByName && (
                    <div className="col-span-full">
                      <span className="text-text-muted block mb-0.5">Posted by</span>
                      <span className="font-semibold text-primary-700">
                        {selectedOpp.postedByName}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-text-primary text-sm mb-2">
                    About the Opportunity
                  </h4>
                  <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                    {selectedOpp.description}
                  </p>
                </div>

                {selectedOpp.skills && selectedOpp.skills.length > 0 && (
                  <div>
                    <h4 className="font-bold text-text-primary text-sm mb-2">
                      Required Skills & Technologies
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOpp.skills.map((skill) => (
                        <span key={skill} className="tag bg-slate-100 text-slate-700 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-text-secondary py-12">
                Select an opportunity from the list to view full specifications.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Post Opportunity Modal (Alumni & Admin) */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="Post a New Career Opportunity"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setShowPostModal(false)}>
              Cancel
            </Button>
            <Button loading={posting} onClick={handleSavePost}>
              Publish Opportunity
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSavePost} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Opportunity Title *"
              placeholder="e.g. Full Stack Intern, Junior Vacancy, Hackathon"
              value={postForm.title}
              onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <Input
              label="Company / Organizer Name *"
              placeholder="e.g. Microsoft, Zoho, Google Cloud"
              value={postForm.company}
              onChange={(e) => setPostForm((f) => ({ ...f, company: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Opportunity Type"
              options={OPPORTUNITY_TYPES}
              value={postForm.type}
              onChange={(e) => setPostForm((f) => ({ ...f, type: e.target.value }))}
            />
            <Select
              label="Work Mode"
              options={WORK_MODES}
              value={postForm.workMode}
              onChange={(e) => setPostForm((f) => ({ ...f, workMode: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="e.g. Bangalore, Karnataka / Remote"
              value={postForm.location}
              onChange={(e) => setPostForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              label="Application Deadline"
              type="date"
              value={postForm.deadline}
              onChange={(e) => setPostForm((f) => ({ ...f, deadline: e.target.value }))}
            />
          </div>

          <Input
            label="Required Skills (comma-separated)"
            placeholder="e.g. React, Node.js, Python, SQL"
            value={postForm.skills}
            onChange={(e) => setPostForm((f) => ({ ...f, skills: e.target.value }))}
          />

          <Input
            label="Application / External URL"
            placeholder="https://careers.company.com/job/123"
            value={postForm.externalLink}
            onChange={(e) => setPostForm((f) => ({ ...f, externalLink: e.target.value }))}
          />

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Description & Requirements *
            </label>
            <textarea
              rows={4}
              value={postForm.description}
              onChange={(e) => setPostForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Provide a detailed overview of the role, eligibility, responsibilities, and benefits..."
              className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Opportunities;
