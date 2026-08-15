import { useState, useEffect } from 'react';
import {
  Briefcase, Search, Trash2, Building2, MapPin,
  ExternalLink, UserCheck
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { getOpportunities, deleteOpportunity } from '../../services/opportunityService';
import { formatDate } from '../../utils/formatters';

const AdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opportunity listing?')) return;
    setDeletingId(id);
    try {
      await deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      alert('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = opportunities.filter((o) => {
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
          <h1 className="text-2xl font-heading font-bold text-text-primary">Opportunities Moderation</h1>
          <p className="text-text-secondary text-sm mt-1">
            Review and moderate all jobs, internships, and referral listings posted on AlumLink.
          </p>
        </div>
        <div className="text-sm font-semibold text-text-secondary bg-white px-3 py-1.5 rounded-lg border border-border">
          Total Listings: {opportunities.length}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4 mb-6 relative">
        <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search opportunities by title, company, or poster name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description="There are currently no opportunity listings matching your search."
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
                      <p className="font-semibold text-text-primary text-sm">{opp.title}</p>
                      <p className="text-xs text-text-secondary">{opp.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{opp.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary">
                      {opp.workMode} {opp.location && `(${opp.location})`}
                    </td>
                    <td className="px-6 py-4 text-xs text-primary-700 font-medium">
                      {opp.postedByName || 'Alumni'}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">
                      {opp.deadline ? formatDate(opp.deadline) : 'Ongoing'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        loading={deletingId === opp.id}
                        onClick={() => handleDelete(opp.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminOpportunities;
