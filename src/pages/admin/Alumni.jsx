import { useState, useEffect } from 'react';
import {
  UserCheck, Search, Building2,
  GraduationCap, Mail, Eye, MapPin, Trash2, UserPlus
} from 'lucide-react';
import { LinkedInIcon } from '../../components/ui/Icons';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import { getAllAlumni, deleteUserAccount, adminAddAlumni } from '../../services/userService';
import { DEPARTMENTS, GRADUATION_YEARS } from '../../utils/constants';

const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [alumniToDelete, setAlumniToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Add Alumni State
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    password: 'password123',
    department: 'Computer Science and Engineering',
    graduationYear: '2024',
    company: '',
    jobRole: '',
    location: '',
    phone: '',
    skills: '',
    verificationStatus: 'verified',
  });

  const loadAlumni = async () => {
    setLoading(true);
    try {
      const data = await getAllAlumni();
      setAlumni(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlumni();
  }, []);

  const handleCreateAlumni = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await adminAddAlumni(addForm);
      await loadAlumni();
      setShowAddModal(false);
      setAddForm({
        fullName: '',
        email: '',
        password: 'password123',
        department: 'Computer Science and Engineering',
        graduationYear: '2024',
        company: '',
        jobRole: '',
        location: '',
        phone: '',
        skills: '',
        verificationStatus: 'verified',
      });
      alert('Alumni account provisioned successfully!');
    } catch (err) {
      alert(err.message || 'Failed to add alumni');
    } finally {
      setAdding(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!alumniToDelete) return;
    const targetUid = alumniToDelete.uid || alumniToDelete.id;
    setDeleting(true);
    try {
      await deleteUserAccount(targetUid);
      setAlumni((prev) => prev.filter((a) => (a.uid || a.id) !== targetUid));
      if (selectedAlumni && (selectedAlumni.uid || selectedAlumni.id) === targetUid) {
        setSelectedAlumni(null);
      }
      setAlumniToDelete(null);
    } catch (err) {
      alert('Failed to remove alumni user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredAlumni = alumni.filter((a) => {
    if (deptFilter !== 'all' && a.department !== deptFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.fullName?.toLowerCase().includes(q) ||
        a.company?.toLowerCase().includes(q) ||
        a.jobRole?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Alumni Management</h1>
          <p className="text-text-secondary text-sm mt-1">
            Provision, inspect, and manage verified alumni accounts for your college.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-text-secondary bg-white px-3 py-2 rounded-xl border border-border">
            Total Alumni: {alumni.length}
          </div>
          <Button leftIcon={UserPlus} onClick={() => setShowAddModal(true)}>
            Add New Alumni
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search alumni by name, company, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-text-secondary"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filteredAlumni.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No alumni found"
          description="Add a new alumni user or adjust search filters."
          action={() => setShowAddModal(true)}
          actionLabel="Add New Alumni"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-6 py-4 font-semibold">Alumni</th>
                  <th className="px-6 py-4 font-semibold">Company & Role</th>
                  <th className="px-6 py-4 font-semibold">Graduation</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAlumni.map((a) => {
                  return (
                    <tr key={a.id || a.uid} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={a.photoURL} name={a.fullName} size="sm" />
                          <div>
                            <p className="font-semibold text-text-primary text-sm">{a.fullName}</p>
                            <p className="text-xs text-text-secondary">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-text-primary text-sm">{a.jobRole}</p>
                        <p className="text-xs text-primary-600 font-semibold">{a.company}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-secondary">
                        <p className="font-semibold text-text-primary">Class of {a.graduationYear}</p>
                        <p className="text-text-muted">{a.department?.split(' ')[0]}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedAlumni(a)}
                          >
                            Inspect
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setAlumniToDelete(a)}
                            title="Remove Alumni"
                          >
                            <Trash2 size={15} />
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Alumni Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Provision New Alumni Account"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button loading={adding} onClick={handleCreateAlumni}>
              Provision Alumni
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateAlumni} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Priya Menon"
            value={addForm.fullName}
            onChange={(e) => setAddForm((f) => ({ ...f, fullName: e.target.value }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Alumni Email"
              type="email"
              placeholder="alumni@ksrce.ac.in"
              value={addForm.email}
              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Assigned Password"
              type="text"
              placeholder="password123"
              value={addForm.password}
              onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              options={DEPARTMENTS}
              value={addForm.department}
              onChange={(e) => setAddForm((f) => ({ ...f, department: e.target.value }))}
              required
            />
            <Select
              label="Graduation Year"
              options={GRADUATION_YEARS}
              value={addForm.graduationYear}
              onChange={(e) => setAddForm((f) => ({ ...f, graduationYear: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="Google, TCS, Microsoft..."
              value={addForm.company}
              onChange={(e) => setAddForm((f) => ({ ...f, company: e.target.value }))}
              required
            />
            <Input
              label="Job Role / Title"
              placeholder="Senior Software Engineer"
              value={addForm.jobRole}
              onChange={(e) => setAddForm((f) => ({ ...f, jobRole: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="Bangalore, Chennai..."
              value={addForm.location}
              onChange={(e) => setAddForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={addForm.phone}
              onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <Input
            label="Key Skills (Comma-separated)"
            placeholder="Cloud Solutions, System Design, Product Strategy"
            value={addForm.skills}
            onChange={(e) => setAddForm((f) => ({ ...f, skills: e.target.value }))}
          />
        </form>
      </Modal>

      {/* Inspect Modal */}
      <Modal
        isOpen={!!selectedAlumni}
        onClose={() => setSelectedAlumni(null)}
        title="Alumni Profile Credentials"
        size="md"
        footer={
          selectedAlumni ? (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setAlumniToDelete(selectedAlumni)}
              >
                <Trash2 size={15} />
                Remove Alumni
              </Button>
              <Button variant="secondary" onClick={() => setSelectedAlumni(null)}>
                Close
              </Button>
            </div>
          ) : null
        }
      >
        {selectedAlumni && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <Avatar src={selectedAlumni.photoURL} name={selectedAlumni.fullName} size="xl" />
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary">{selectedAlumni.fullName}</h3>
                <p className="text-sm font-medium text-text-primary">{selectedAlumni.jobRole} at {selectedAlumni.company}</p>
                <p className="text-xs text-text-secondary">Class of {selectedAlumni.graduationYear} • {selectedAlumni.department}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-text-muted">Email</span>
                <span className="font-medium text-text-primary">{selectedAlumni.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-text-muted">Location</span>
                <span className="font-medium text-text-primary">{selectedAlumni.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-text-muted">LinkedIn</span>
                {selectedAlumni.linkedinUrl ? (
                  <a href={selectedAlumni.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    View LinkedIn Profile
                  </a>
                ) : (
                  <span className="text-text-muted">Not provided</span>
                )}
              </div>
            </div>

            {selectedAlumni.experience && (
              <div>
                <p className="text-xs font-semibold text-text-secondary mb-1 uppercase">Experience</p>
                <p className="text-sm text-text-secondary bg-gray-50 p-3 rounded-xl">{selectedAlumni.experience}</p>
              </div>
            )}

            {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-secondary mb-1 uppercase">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAlumni.skills.map((sk) => (
                    <span key={sk} className="tag">{sk}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!alumniToDelete}
        onClose={() => setAlumniToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Alumni Account"
        itemName={`${alumniToDelete?.fullName || 'Alumni'} (${alumniToDelete?.email || ''})`}
        itemType="alumni account"
        requiredWord="confirm"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default Alumni;
