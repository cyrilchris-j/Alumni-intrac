import { useState, useEffect } from 'react';
import {
  Briefcase, Search, Trash2, Edit2, Plus, Building2, MapPin,
  ExternalLink, UserCheck, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} from '../../services/opportunityService';
import { OPPORTUNITY_TYPES, WORK_MODES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const AdminOpportunities = () => {
  const { currentUser, userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
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
    setLoading(true);
    try {
      const data = await getOpportunities();
      setOpportunities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

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
        company: '',
        type: 'Internship',
        workMode: 'Remote',
        location: '',
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
    if (!form.title || !form.company || !form.description) {
      alert('Please fill in all required fields (Title, Company, and Description).');
      return;
    }

    setSaving(true);
    try {
      if (editingOpp) {
        await updateOpportunity(editingOpp.id, {
          ...form,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        });
      } else {
        await createOpportunity(
          currentUser?.uid || 'admin',
          userProfile?.fullName || 'College Administration',
          {
            ...form,
            skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          }
        );
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
    if (!window.confirm('Delete this opportunity listing?')) return;
    setDeletingId(id);
    try {
      await deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      alert('Failed to delete opportunity');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = opportunities.filter((o) => {
    const matchesType = typeFilter === 'all' || o.type === typeFilter;
    if (!matchesType) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.title?.toLowerCase().includes(q) ||
      o.company?.toLowerCase().includes(q) ||
      o.postedByName?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Opportunities Management</h1>
          <p className="text-text-secondary text-sm mt-1">
            Create, manage, and moderate jobs, internships, and referral opportunities on AlumLink.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-text-secondary bg-white px-3 py-2 rounded-lg border border-border hidden sm:block">
            Total Listings: {opportunities.length}
          </div>
          <Button leftIcon={Plus} onClick={() => handleOpenModal()}>
            Post Opportunity
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search opportunities by title, company, or poster name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-secondary font-medium"
        >
          <option value="all">All Types</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description="There are currently no opportunity listings matching your search or filters."
          action={() => handleOpenModal()}
          actionLabel="Post New Opportunity"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title & Company</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Work Mode</th>
                  <th className="px-6 py-4 font-semibold">Posted By</th>
                  <th className="px-6 py-4 font-semibold">Deadline</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary text-sm">{opp.title}</p>
                        {opp.externalLink && (
                          <a
                            href={opp.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                            title="Open external link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                        <Building2 size={12} className="text-text-muted" />
                        {opp.company}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{opp.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary">
                      {opp.workMode} {opp.location && `(${opp.location})`}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-medium text-primary-700">
                        {opp.postedByName || 'Alumni'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">
                      {opp.deadline ? formatDate(opp.deadline) : 'Ongoing'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-text-secondary hover:text-primary-600 hover:bg-primary-50"
                          onClick={() => handleOpenModal(opp)}
                          title="Edit Opportunity"
                        >
                          <Edit2 size={15} />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          loading={deletingId === opp.id}
                          onClick={() => handleDelete(opp.id)}
                          title="Delete Opportunity"
                        >
                          <Trash2 size={15} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Opportunity Modal (Create / Edit by Admin) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingOpp ? 'Edit Opportunity' : 'Post New Opportunity (Admin)'}
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
              placeholder="e.g. Associate Software Engineer"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <Input
              label="Company Name"
              placeholder="e.g. Google, Microsoft, TCS"
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
              placeholder="React, Python, AWS"
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

export default AdminOpportunities;
