import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Link2, Users, BookOpen, Briefcase, Calendar,
  ArrowRight, CheckCircle2, Building2, GraduationCap, Menu, X
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Build Connections',
    description: 'Connect with alumni from your college who are working at leading companies across the world.',
  },
  {
    icon: BookOpen,
    title: 'Find Mentors',
    description: 'Get career guidance, resume reviews, and industry insights from experienced professionals.',
  },
  {
    icon: Briefcase,
    title: 'Discover Opportunities',
    description: 'Access exclusive internships, jobs, and referrals posted by your college alumni network.',
  },
];

const sampleAlumni = [
  { name: 'Priya Menon', role: 'Senior Product Manager', company: 'Google', year: '2019', dept: 'CSE', avatar: null },
  { name: 'Arjun Sharma', role: 'Software Engineer III', company: 'Microsoft', year: '2020', dept: 'IT', avatar: null },
  { name: 'Kavya Rajan', role: 'Data Scientist', company: 'Amazon', year: '2018', dept: 'CSE', avatar: null },
  { name: 'Rohit Nair', role: 'Cloud Architect', company: 'Infosys', year: '2017', dept: 'ECE', avatar: null },
];

const getInitials = (name) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

const colorPairs = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
];

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Link2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-text-primary">AlumLink</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#alumni" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Alumni</a>
            <a href="#events" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Events</a>
            <a href="#opportunities" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Opportunities</a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="btn-primary btn-md text-sm px-5 py-2 rounded-lg"
            >
              Join Network
            </Link>
          </div>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 text-text-secondary"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-4">
            <a href="#features" className="block text-sm text-text-secondary hover:text-text-primary">Features</a>
            <a href="#alumni" className="block text-sm text-text-secondary hover:text-text-primary">Alumni</a>
            <a href="#events" className="block text-sm text-text-secondary hover:text-text-primary">Events</a>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Link to="/login" className="btn-secondary btn-md w-full text-center rounded-lg">Login</Link>
              <Link to="/signup" className="btn-primary btn-md w-full text-center rounded-lg">Join Network</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-primary-100">
            <GraduationCap size={16} />
            Trusted by 50+ colleges across India
          </div>

          <h1 className="text-5xl sm:text-6xl font-heading font-bold text-text-primary leading-tight mb-6">
            Your college network,{' '}
            <span className="text-primary-600">beyond graduation.</span>
          </h1>

          <p className="text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto">
            Connect students, alumni, and your college community through meaningful mentorship,
            opportunities, events, and professional networking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="btn-primary btn-lg inline-flex items-center gap-2 rounded-xl"
            >
              Join the Network
              <ArrowRight size={18} />
            </Link>
            <a
              href="#alumni"
              className="btn-secondary btn-lg inline-flex items-center gap-2 rounded-xl"
            >
              Explore Alumni
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { label: 'Alumni', value: '10,000+' },
              { label: 'Students', value: '25,000+' },
              { label: 'Connections Made', value: '50,000+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-heading font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AlumLink */}
      <section id="features" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              Why AlumLink?
            </h2>
            <p className="text-lg text-text-secondary max-w-xl mx-auto">
              A trusted platform designed specifically for the college community to connect,
              grow, and give back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-2xl border border-border p-7 hover:shadow-card-hover transition-shadow duration-250">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-5">
                    <Icon size={24} className="text-primary-600" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-text-primary mb-3">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Students / Alumni / Colleges */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Students */}
          <div className="space-y-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <GraduationCap size={22} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-text-primary">For Students</h3>
            <ul className="space-y-3">
              {[
                'Connect with experienced alumni',
                'Get career guidance & mentorship',
                'Discover internships and jobs',
                'Register for alumni events',
                'Access exclusive resources',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-text-secondary text-sm">
                  <CheckCircle2 size={16} className="text-success-600 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Alumni */}
          <div className="space-y-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Users size={22} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-text-primary">For Alumni</h3>
            <ul className="space-y-3">
              {[
                'Give back to your alma mater',
                'Mentor the next generation',
                'Share job & internship opportunities',
                'Reconnect with classmates',
                'Build your professional network',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-text-secondary text-sm">
                  <CheckCircle2 size={16} className="text-success-600 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Colleges */}
          <div className="space-y-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-text-primary">For Colleges</h3>
            <ul className="space-y-3">
              {[
                'Strengthen alumni engagement',
                'Manage community effectively',
                'Organize events & webinars',
                'Track participation & analytics',
                'Publish announcements instantly',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-text-secondary text-sm">
                  <CheckCircle2 size={16} className="text-success-600 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Alumni */}
      <section id="alumni" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              Featured Alumni
            </h2>
            <p className="text-text-secondary">
              Successful professionals ready to guide the next generation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sampleAlumni.map((alumni, idx) => (
              <div
                key={alumni.name}
                className="bg-white rounded-2xl border border-border p-6 hover:shadow-card-hover transition-all duration-250 hover:-translate-y-0.5"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 ${colorPairs[idx % colorPairs.length]}`}>
                  {getInitials(alumni.name)}
                </div>
                <h4 className="font-semibold text-text-primary">{alumni.name}</h4>
                <p className="text-sm text-text-secondary mt-0.5">{alumni.role}</p>
                <p className="text-sm font-medium text-primary-600 mt-0.5">{alumni.company}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="badge-gray">{alumni.dept}</span>
                  <span className="badge-gray">Class of {alumni.year}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/signup" className="btn-primary btn-md inline-flex items-center gap-2 rounded-lg">
              Join to View All Alumni
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <section id="events" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              Upcoming Events
            </h2>
            <p className="text-text-secondary">
              Attend alumni meets, webinars, workshops, and networking events.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Annual Alumni Meet 2024', type: 'Alumni Meet', date: 'Sep 28, 2024', location: 'Campus Auditorium' },
              { title: 'Tech Industry Insights Webinar', type: 'Webinar', date: 'Oct 5, 2024', location: 'Online' },
              { title: 'Resume & Interview Workshop', type: 'Workshop', date: 'Oct 12, 2024', location: 'Seminar Hall B' },
            ].map((event) => (
              <div key={event.title} className="bg-white rounded-2xl border border-border p-6 hover:shadow-card-hover transition-shadow">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-full px-3 py-1 mb-4">
                  <Calendar size={12} />
                  {event.type}
                </div>
                <h4 className="font-semibold text-text-primary mb-2">{event.title}</h4>
                <p className="text-sm text-text-secondary">{event.date}</p>
                <p className="text-sm text-text-secondary">{event.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section id="opportunities" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              Featured Opportunities
            </h2>
            <p className="text-text-secondary">Internships and jobs shared by our alumni network.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Frontend Developer Intern', company: 'TCS', type: 'Internship', location: 'Chennai' },
              { title: 'Data Analyst', company: 'Wipro', type: 'Full-time', location: 'Bangalore' },
              { title: 'Product Design Intern', company: 'Zoho', type: 'Internship', location: 'Chennai' },
            ].map((opp) => (
              <div key={opp.title} className="bg-white rounded-2xl border border-border p-6 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Briefcase size={18} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{opp.company}</p>
                    <span className="badge-primary text-xs">{opp.type}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-text-primary mb-1">{opp.title}</h4>
                <p className="text-sm text-text-secondary">{opp.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-heading font-bold text-text-primary mb-5">
            Your next connection could shape your career.
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Students find guidance. Alumni give back. Colleges build stronger communities.
          </p>
          <Link
            to="/signup"
            className="btn-primary btn-lg inline-flex items-center gap-2 rounded-xl"
          >
            Join AlumLink Today
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <Link2 size={14} className="text-white" />
            </div>
            <span className="font-heading font-bold text-text-primary">AlumLink</span>
          </div>
          <p className="text-sm text-text-muted">© 2024 AlumLink. Connect. Collaborate. Grow.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
