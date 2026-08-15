import { useState, useEffect } from 'react';
import {
  Briefcase, Plus, Edit2, Trash2, MapPin, Building2,
  ExternalLink, Calendar, Users, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  getAlumniOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../../services/opportunityService';
import { OPPORTUNITY_TYPES, WORK_MODES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const Opportunities = () => {
  const { currentUser, userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
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

  const loadOpportunities = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getAlumniOpportunities(currentUser.uid);
      setOpportunities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [currentUser]);

  const handleOpenModal = (opp = null) => {
    if (opp) {
      setEditingOpp(opp);
      setForm({
        title: opp.title || '',
        company: opp.company || '',
        type: opp.type || 'Internship',
        workMode: opp.workMode || 'Remote',
        location: opp.location || '',
        description: opp.description || '',
        skills: Array.isArray(opp.skills) ? opp.skills.join(', ') : (opp.skills || ''),
        deadline: opp.deadline || '',
        externalLink: opp.externalLink || '',
      });
    } else {
      setEditingOpp(null);
      setForm({
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
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    try {
      if (editingOpp) {
        await updateOpportunity(editingOpp.id, {
          ...form,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        });
      } else {
        await createOpportunity(currentUser.uid, userProfile?.fullName || 'Alumni', {
          ...form,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        });
      }
      setShowModal(false);
      await loadOpportunities();
    } catch (err) {
      alert(err.message || 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    setDeletingId(id);
    try {
      await deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      alert('Failed to delete opportunity');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Manage Opportunities</h1>
          <p className="text-text-secondary text-sm mt-1">
            Post job openings, internships, and referral opportunities for current students.
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => handleOpenModal()}>
          Post New Opportunity
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities posted yet"
          description="Share job or internship openings with students from your college."
          action={() => handleOpenModal()}
          actionLabel="Post an Opportunity"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between hover:shadow-card-hover transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="primary">{opp.type}</Badge>
                  <span className="text-xs text-text-muted">{opp.workMode}</span>
                </div>

                <h3 className="text-lg font-heading font-bold text-text-primary mb-1 line-clamp-1">
                  {opp.title}
                </h3>
                <p className="text-sm text-text-secondary font-medium mb-3 flex items-center gap-1.5">
                  <Building2 size={15} />
                  {opp.company}
                </p>

                <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">
                  {opp.description}
                </p>

                {opp.skills && opp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {opp.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="tag text-[11px]">{skill}</span>
                    ))}
                    {opp.skills.length > 3 && (
                      <span className="tag text-[11px] text-text-muted">+{opp.skills.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs text-text-muted">
                  {opp.deadline ? `Deadline: ${formatDate(opp.deadline)}` : 'No deadline'}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(opp)}
                    className="p-1.5 text-text-secondary hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(opp.id)}
                    disabled={deletingId === opp.id}
                    className="p-1.5 text-text-secondary hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Modal (Create / Edit) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingOpp ? 'Edit Opportunity' : 'Post a New Opportunity'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave}>
              {editingOpp ? 'Update Posting' : 'Publish Opportunity'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Opportunity Title"
              placeholder="e.g. Frontend Developer Intern"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <Input
              label="Company Name"
              placeholder="e.g. Microsoft, Infosys"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Opportunity Type"
              options={OPPORTUNITY_TYPES}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              required
            />
            <Select
              label="Work Mode"
              options={WORK_MODES}
              value={form.workMode}
              onChange={(e) => setForm((f) => ({ ...f, workMode: e.target.value }))}
              required
            />
            <Input
              label="Location"
              placeholder="e.g. Chennai, Bangalore"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>

          <div>
            <label className="form-label">Description <span className="text-red-500">*</span></label>
            <textarea
              className="form-input h-28 resize-none"
              placeholder="Detailed description of responsibilities, eligibility criteria, and requirements..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Required Skills (Comma-separated)"
              placeholder="React, JavaScript, Tailwind"
              value={form.skills}
              onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            />
            <Input
              label="Application Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            />
          </div>

          <Input
            label="Application Link / Form URL"
            placeholder="https://company.com/careers/job123"
            value={form.externalLink}
            onChange={(e) => setForm((f) => ({ ...f, externalLink: e.target.value }))}
            hint="Students will be directed to this URL to apply."
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Opportunities;
