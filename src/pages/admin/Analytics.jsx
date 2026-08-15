import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Users, GraduationCap, UserCheck, Calendar,
  Briefcase, Download
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';

const monthlyGrowth = [
  { month: 'Jan', students: 45, alumni: 22, connections: 80 },
  { month: 'Feb', students: 70, alumni: 38, connections: 140 },
  { month: 'Mar', students: 110, alumni: 55, connections: 230 },
  { month: 'Apr', students: 160, alumni: 82, connections: 340 },
  { month: 'May', students: 220, alumni: 110, connections: 490 },
  { month: 'Jun', students: 310, alumni: 145, connections: 680 },
];

const departmentDist = [
  { name: 'CSE', count: 120 },
  { name: 'ECE', count: 85 },
  { name: 'IT', count: 70 },
  { name: 'Mech', count: 50 },
  { name: 'Civil', count: 35 },
  { name: 'BioTech', count: 25 },
];

const mentorshipTopics = [
  { name: 'Career Guidance', value: 40 },
  { name: 'Resume Review', value: 25 },
  { name: 'Technical Skills', value: 20 },
  { name: 'Higher Studies', value: 15 },
];

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#9333EA', '#EC4899', '#06B6D4'];

const AdminAnalytics = () => {
  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Reports & Analytics</h1>
          <p className="text-text-secondary text-sm mt-1">
            Deep dive into student engagement, alumni mentorship metrics, and college growth trends.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={Download}
          onClick={() => alert('Analytics export downloaded (CSV)')}
        >
          Export Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase mb-1">Growth Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-primary-600">+38%</span>
            <span className="text-xs text-green-600 font-medium">vs last quarter</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">Active student and alumni participation</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase mb-1">Mentorship Requests</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-success-600">89%</span>
            <span className="text-xs text-green-600 font-medium">Acceptance Rate</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">Average response time: &lt; 24 hours</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase mb-1">Opportunity Conversions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-purple-600">142</span>
            <span className="text-xs text-purple-600 font-medium">Applications</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">Across 24 active alumni postings</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Growth & Connections */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-text-primary mb-1">
            Platform Growth & Networking
          </h2>
          <p className="text-xs text-text-secondary mb-4">Total students, alumni, and connections made</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyGrowth} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={2} name="Students" />
                <Line type="monotone" dataKey="alumni" stroke="#16A34A" strokeWidth={2} name="Alumni" />
                <Line type="monotone" dataKey="connections" stroke="#F59E0B" strokeWidth={2} name="Connections" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mentorship Focus Areas */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-text-primary mb-1">
              Mentorship Areas
            </h2>
            <p className="text-xs text-text-secondary mb-4">Distribution by requested topic</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mentorshipTopics}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {mentorshipTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-heading font-bold text-text-primary mb-1">
          Engagement by Academic Department
        </h2>
        <p className="text-xs text-text-secondary mb-4">Student & alumni distribution across colleges</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentDist} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} name="Active Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
