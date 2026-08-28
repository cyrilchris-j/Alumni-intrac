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
  const [isDetailOpenMobile, setIsDetailOpenMobile] = useState(false);

  const [confirmModalOpp, setConfirmModalOpp] = useState(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

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

  const handleOpenConfirmModal = (opp) => {
    setConfirmModalOpp(opp);
    setConfirmInput('');
    setConfirmError('');
  };

  const handleConfirmSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!confirmModalOpp || !currentUser) return;

    if (confirmInput.trim().toLowerCase() !== 'confirm') {
      setConfirmError("Please type 'confirm' to verify your application.");
      return;
    }

    setConfirming(true);
    try {
      await applyOpportunity(currentUser.uid, confirmModalOpp.id, {
        studentName: userProfile?.fullName || 'Student',
        studentEmail: userProfile?.email || currentUser.email,
      });
      setAppliedIds((prev) => new Set(prev).add(confirmModalOpp.id));
      setConfirmModalOpp(null);
    } catch (err) {
      alert('Failed to submit application.');
    } finally {
      setConfirming(false);
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

  const renderDetails = (opp) => {
    if (!opp) return null;
    const isSaved = savedIds.has(opp.id);
    const isApplied = appliedIds.has(opp.id);

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h2 className="text-xl font-heading font-bold text-text-primary">
                {opp.title}
              </h2>
              <Badge variant="primary">{opp.type}</Badge>
              {isApplied && (
                <Badge variant="success" className="text-xs">
                  ✓ Applied
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-text-secondary flex items-center gap-2">
              <Building2 size={16} className="text-primary-600" />
              {opp.company}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="sm"
              onClick={(e) => toggleSave(opp.id, e)}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={16} className="text-primary-600" /> Saved
                </>
              ) : (
                <>
                  <Bookmark size={16} /> Save
                </>
              )}
            </Button>

            {isApplied ? (
              <Badge variant="emerald" className="px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700">
                <CheckCircle size={15} /> Applied
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleOpenConfirmModal(opp)}
                leftIcon={Sparkles}
              >
                Applied
              </Button>
            )}

            {(opp.externalLink || opp.registrationLink) && (
              <a
                href={opp.externalLink || opp.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-sm rounded-xl flex items-center gap-1.5"
                title="External Application / Website Link"
              >
                Website / Form Link
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-slate-100">
          <div>
            <span className="text-text-muted block mb-0.5">Location</span>
            <span className="font-semibold text-text-primary">
              {opp.location || 'Remote'}
            </span>
          </div>
          <div>
            <span className="text-text-muted block mb-0.5">Work Mode</span>
            <span className="font-semibold text-text-primary">
              {opp.workMode || 'Full-time'}
            </span>
          </div>
          <div>
            <span className="text-text-muted block mb-0.5">Application Deadline</span>
            <span className="font-semibold text-text-primary">
              {opp.deadline ? formatDate(opp.deadline) : 'Rolling Basis'}
            </span>
          </div>
          {opp.postedByName && (
            <div className="col-span-full">
              <span className="text-text-muted block mb-0.5">Posted by</span>
              <span className="font-semibold text-primary-700">
                {opp.postedByName}
              </span>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-bold text-text-primary text-sm mb-2">
            About the Opportunity
          </h4>
          <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
            {opp.description}
          </p>
        </div>

        {opp.skills && opp.skills.length > 0 && (
          <div>
            <h4 className="font-bold text-text-primary text-sm mb-2">
              Required Skills & Technologies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {opp.skills.map((skill) => (
                <span key={skill} className="tag bg-slate-100 text-slate-700 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
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
          <div className="lg:col-span-5 space-y-3 lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto pr-1">
            {filteredOpportunities.map((opp) => {
              const isSelected = selectedOpp?.id === opp.id;
              const isSaved = savedIds.has(opp.id);
              const isApplied = appliedIds.has(opp.id);
              const isHackathon = opp.type?.toLowerCase().includes('hackathon');
              const isVacancy = opp.type?.toLowerCase().includes('vacancy');

              return (
                <div
                  key={opp.id}
                  onClick={() => {
                    setSelectedOpp(opp);
                    setIsDetailOpenMobile(true);
                  }}
                  className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-card-hover ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">{opp.company}</p>
                    </div>
                    <button
                      onClick={(e) => toggleSave(opp.id, e)}
                      className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
                        isSaved
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                    >
                      {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={13} className="text-slate-400" />
                      {opp.location || 'Remote'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{opp.workMode || 'Remote'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          isHackathon
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : isVacancy
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {opp.type}
                      </span>
                      {isApplied && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px] font-medium">{timeAgo(opp.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details View (Right) - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-7 bg-white rounded-2xl border border-border p-6 sticky top-4 shadow-sm">
            {selectedOpp ? (
              renderDetails(selectedOpp)
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

      {/* Application Confirmation Modal */}
      <Modal
        isOpen={!!confirmModalOpp}
        onClose={() => setConfirmModalOpp(null)}
        title="Confirm Application Registration"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setConfirmModalOpp(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              loading={confirming}
              disabled={confirmInput.trim().toLowerCase() !== 'confirm' || confirming}
              onClick={handleConfirmSubmit}
            >
              Confirm Application
            </Button>
          </div>
        }
      >
        <form onSubmit={handleConfirmSubmit} className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Please confirm that you have submitted your application or completed registration for{' '}
            <strong className="text-text-primary">{confirmModalOpp?.title}</strong> ({confirmModalOpp?.company}).
          </p>

          {(confirmModalOpp?.externalLink || confirmModalOpp?.registrationLink) && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between gap-2">
              <span className="text-blue-900 font-medium">Google Form / External Link:</span>
              <a
                href={confirmModalOpp.externalLink || confirmModalOpp.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-bold hover:underline flex items-center gap-1 flex-shrink-0"
              >
                Open Link <ExternalLink size={13} />
              </a>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              To confirm registration, please type <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">confirm</code> below:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => {
                setConfirmInput(e.target.value);
                if (confirmError) setConfirmError('');
              }}
              placeholder="Type 'confirm' to verify"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              autoFocus
            />
             {confirmError && (
              <p className="text-xs text-red-600 font-medium mt-1">{confirmError}</p>
            )}
          </div>
        </form>
      </Modal>

      {/* Mobile Details Drawer/Modal */}
      <Modal
        isOpen={isDetailOpenMobile}
        onClose={() => setIsDetailOpenMobile(false)}
        title="Opportunity Details"
        size="lg"
      >
        {selectedOpp && renderDetails(selectedOpp)}
      </Modal>
    </DashboardLayout>
  );
};

export default Opportunities;
