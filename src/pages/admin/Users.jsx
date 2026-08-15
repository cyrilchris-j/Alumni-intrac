import { useState, useEffect } from 'react';
import {
  Users, Search, Shield, UserX, UserCheck, Lock,
  MoreVertical, CheckCircle, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { getAllUsers, updateUserAccountStatus } from '../../services/userService';
import { formatDate } from '../../utils/formatters';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actioningId, setActioningId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.accountStatus === 'suspended' ? 'active' : 'suspended';
    if (!window.confirm(`Are you sure you want to change this user status to ${newStatus}?`)) return;

    setActioningId(user.id);
    try {
      await updateUserAccountStatus(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, accountStatus: newStatus } : u))
      );
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setActioningId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && (u.accountStatus || 'active') !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary text-sm mt-1">
            Search, inspect, and manage accounts across Students, Alumni, and Staff.
          </p>
        </div>
        <div className="text-sm font-semibold text-text-secondary bg-white px-3 py-1.5 rounded-lg border border-border">
          Total Users: {users.length}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search or filter options."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const isSuspended = user.accountStatus === 'suspended';
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.photoURL} name={user.displayName || user.email} size="sm" />
                          <div>
                            <p className="font-semibold text-text-primary text-sm">
                              {user.displayName || 'No Name'}
                            </p>
                            <p className="text-xs text-text-secondary">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            user.role === 'admin' ? 'purple' :
                            user.role === 'alumni' ? 'success' : 'primary'
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={isSuspended ? 'danger' : 'success'} dot>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                          <Button
                            variant={isSuspended ? 'success' : 'ghost'}
                            size="sm"
                            loading={actioningId === user.id}
                            onClick={() => handleToggleStatus(user)}
                            className={isSuspended ? '' : 'text-red-600 hover:bg-red-50'}
                          >
                            {isSuspended ? 'Activate User' : 'Suspend'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersPage;
