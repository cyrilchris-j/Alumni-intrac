import { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Edit2, Trash2, Calendar,
  Users, Tag, ShieldCheck
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
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../services/announcementService';
import { ANNOUNCEMENT_CATEGORIES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const AdminAnnouncements = () => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'all',
  });

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenModal = (ann = null) => {
    if (ann) {
      setEditingAnn(ann);
      setForm({
        title: ann.title || '',
        content: ann.content || '',
        category: ann.category || 'General',
        targetAudience: ann.targetAudience || 'all',
      });
    } else {
      setEditingAnn(null);
      setForm({
        title: '',
        content: '',
        category: 'General',
        targetAudience: 'all',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAnn) {
        await updateAnnouncement(editingAnn.id, form);
      } else {
        await createAnnouncement(form, currentUser?.uid || 'admin');
      }
      setShowModal(false);
      await loadAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to publish announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    setDeletingId(id);
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Announcements</h1>
          <p className="text-text-secondary text-sm mt-1">
            Broadcast official college news, policy updates, and career notices to students and alumni.
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => handleOpenModal()}>
          New Announcement
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements published"
          description="Create and broadcast official updates to students and alumni."
          action={() => handleOpenModal()}
          actionLabel="Publish Announcement"
        />
      ) : (
        <div className="space-y-4 w-full">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={ann.category === 'Urgent' ? 'danger' : 'primary'}>
                    {ann.category}
                  </Badge>
                  <span className="text-xs text-text-muted">
                    Audience: {ann.targetAudience === 'all' ? 'All Users' : ann.targetAudience}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{formatDate(ann.createdAt)}</span>
                  <button
                    onClick={() => handleOpenModal(ann)}
                    className="p-1 text-text-secondary hover:text-primary-600 rounded"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    disabled={deletingId === ann.id}
                    className="p-1 text-text-secondary hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-heading font-bold text-text-primary mb-2">
                {ann.title}
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAnn ? 'Edit Announcement' : 'Publish Announcement'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave}>
              {editingAnn ? 'Update' : 'Broadcast Now'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Announcement Title"
            placeholder="e.g. Annual Alumni Meet Registrations Now Open"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={ANNOUNCEMENT_CATEGORIES}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              required
            />
            <div>
              <label className="form-label">Target Audience</label>
              <select
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={form.targetAudience}
                onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))}
              >
                <option value="all">Everyone (Students & Alumni)</option>
                <option value="student">Students Only</option>
                <option value="alumni">Alumni Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Announcement Content <span className="text-red-500">*</span></label>
            <textarea
              className="form-input h-32 resize-none"
              placeholder="Write the full announcement details..."
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminAnnouncements;
