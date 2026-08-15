import { useState, useEffect } from 'react';
import {
  UserCheck, Search, CheckCircle, XCircle, Building2,
  GraduationCap, Mail, Eye, MapPin
} from 'lucide-react';
import { LinkedInIcon } from '../../components/ui/Icons';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { getAllAlumni, updateAlumniVerification } from '../../services/userService';
import { createNotification } from '../../services/notificationService';
import { DEPARTMENTS, GRADUATION_YEARS, NOTIFICATION_TYPES } from '../../utils/constants';

const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [actioningId, setActioningId] = useState(null);
  const [selectedAlumni, setSelectedAlumni] = useState(null);

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

  const handleVerification = async (alumniUser, newStatus) => {
    setActioningId(alumniUser.id);
    try {
      await updateAlumniVerification(alumniUser.id, newStatus);
      setAlumni((prev) =>
        prev.map((a) => (a.id === alumniUser.id ? { ...a, verificationStatus: newStatus } : a))
      );

      // Notify alumni
      if (newStatus === 'verified') {
        await createNotification(alumniUser.id, {
          type: NOTIFICATION_TYPES.PROFILE_VERIFIED,
          title: 'Alumni Profile Verified',
          message: 'Your alumni profile has been verified by the college administration! You now have a verified badge.',
        });
      }
    } catch (err) {
      alert('Failed to update verification status.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredAlumni = alumni.filter((a) => {
    if (statusFilter !== 'all' && (a.verificationStatus || 'pending') !== statusFilter) return false;
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
            Review alumni registration credentials and assign verified badges.
          </p>
        </div>
        <div className="text-sm font-semibold text-text-secondary bg-white px-3 py-1.5 rounded-lg border border-border">
          Total Alumni: {alumni.length}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search alumni by name, company, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified Alumni</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          description="Try changing the verification status or department filter."
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
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAlumni.map((a) => {
                  const isVerified = a.verificationStatus === 'verified';
                  const isPending = a.verificationStatus === 'pending' || !a.verificationStatus;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={a.photoURL} name={a.fullName} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-text-primary text-sm">{a.fullName}</p>
                              {isVerified && (
                                <Badge variant="success" className="text-[10px] px-1 py-0">✓</Badge>
                              )}
                            </div>
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
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            isVerified ? 'success' :
                            isPending ? 'warning' : 'danger'
                          }
                          dot
                        >
                          {isVerified ? 'Verified' : isPending ? 'Pending Review' : 'Rejected'}
                        </Badge>
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
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                loading={actioningId === a.id}
                                onClick={() => handleVerification(a, 'verified')}
                              >
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleVerification(a, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
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

      {/* Inspect Modal */}
      <Modal
        isOpen={!!selectedAlumni}
        onClose={() => setSelectedAlumni(null)}
        title="Alumni Profile Credentials"
        size="md"
      >
        {selectedAlumni && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <Avatar src={selectedAlumni.photoURL} name={selectedAlumni.fullName} size="xl" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-lg text-text-primary">{selectedAlumni.fullName}</h3>
                  {selectedAlumni.verificationStatus === 'verified' && (
                    <Badge variant="success">Verified Alumni</Badge>
                  )}
                </div>
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
    </DashboardLayout>
  );
};

export default Alumni;
