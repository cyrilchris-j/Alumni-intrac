import { useState, useEffect } from 'react';
import {
  GraduationCap, Search, Mail, Phone, Building2,
  BookOpen, Eye, X, Trash2
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';
import { getAllStudents, deleteUserAccount } from '../../services/userService';
import { DEPARTMENTS, STUDENT_YEARS } from '../../utils/constants';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    const targetUid = studentToDelete.uid || studentToDelete.id;
    setDeleting(true);
    try {
      await deleteUserAccount(targetUid);
      setStudents((prev) => prev.filter((s) => (s.uid || s.id) !== targetUid));
      if (selectedStudent && (selectedStudent.uid || selectedStudent.id) === targetUid) {
        setSelectedStudent(null);
      }
      setStudentToDelete(null);
    } catch (err) {
      alert('Failed to remove student');
    } finally {
      setDeleting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (deptFilter !== 'all' && s.department !== deptFilter) return false;
    if (yearFilter !== 'all' && s.year !== yearFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.fullName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Students Directory</h1>
          <p className="text-text-secondary text-sm mt-1">
            Browse and inspect all registered college students.
          </p>
        </div>
        <div className="text-sm font-semibold text-text-secondary bg-white px-3 py-1.5 rounded-lg border border-border">
          Total Students: {students.length}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search student by name, department, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
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
        <div className="sm:col-span-3">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Years</option>
            {STUDENT_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Try changing the department or year filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Year & Sec</th>
                  <th className="px-6 py-4 font-semibold">Skills / Focus</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={s.photoURL} name={s.fullName} size="sm" />
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{s.fullName}</p>
                          <p className="text-xs text-text-secondary">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary font-medium">
                      {s.department}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <Badge variant="primary">{s.year || 'Student'}</Badge>
                      {s.section && <span className="ml-1.5 text-text-muted">Sec {s.section}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {s.skills?.slice(0, 2).map((sk) => (
                          <span key={sk} className="tag text-[10px]">{sk}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedStudent(s)}
                        >
                          Inspect
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setStudentToDelete(s)}
                          title="Remove Student"
                        >
                          <Trash2 size={15} />
                          Remove
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

      {/* Inspect Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Details"
        size="md"
        footer={
          selectedStudent ? (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setStudentToDelete(selectedStudent)}
              >
                <Trash2 size={15} />
                Remove Student
              </Button>
              <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          ) : null
        }
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <Avatar src={selectedStudent.photoURL} name={selectedStudent.fullName} size="xl" />
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary">{selectedStudent.fullName}</h3>
                <p className="text-sm text-text-secondary">{selectedStudent.department}</p>
                <p className="text-xs text-primary-600 font-medium">{selectedStudent.year} (Sec {selectedStudent.section || 'N/A'})</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-text-muted">Email</span>
                <span className="font-medium text-text-primary">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-text-muted">Phone</span>
                <span className="font-medium text-text-primary">{selectedStudent.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-text-muted">College</span>
                <span className="font-medium text-text-primary">{selectedStudent.college || 'PSG College of Technology'}</span>
              </div>
            </div>

            {selectedStudent.skills && selectedStudent.skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-secondary mb-1 uppercase">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.skills.map((sk) => (
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
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Student Account"
        itemName={`${studentToDelete?.fullName || 'Student'} (${studentToDelete?.email || ''})`}
        itemType="student account"
        requiredWord="confirm"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default Students;
