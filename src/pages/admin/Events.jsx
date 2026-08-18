import { useState, useEffect } from 'react';
import {
  Calendar, Plus, Edit2, Trash2, Video, MapPin,
  Users, ExternalLink, Clock
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
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
} from '../../services/eventService';
import { EVENT_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const AdminEvents = () => {
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [registrationsModalEvent, setRegistrationsModalEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Alumni Meet',
    date: '',
    time: '',
    location: '',
    meetingLink: '',
    registrationLink: '',
    organizer: 'Alumni Relations Cell',
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleOpenModal = (ev = null) => {
    if (ev) {
      setEditingEvent(ev);
      setForm({
        title: ev.title || '',
        description: ev.description || '',
        type: ev.type || 'Alumni Meet',
        date: ev.date || '',
        time: ev.time || '',
        location: ev.location || '',
        meetingLink: ev.meetingLink || '',
        registrationLink: ev.registrationLink || '',
        organizer: ev.organizer || 'Alumni Relations Cell',
      });
    } else {
      setEditingEvent(null);
      setForm({
        title: '',
        description: '',
        type: 'Alumni Meet',
        date: '',
        time: '',
        location: '',
        meetingLink: '',
        registrationLink: '',
        organizer: 'Alumni Relations Cell',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, form);
      } else {
        await createEvent(form, currentUser.uid);
      }
      setShowModal(false);
      await loadEvents();
    } catch (err) {
      alert(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setDeletingId(id);
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert('Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewRegistrations = async (ev) => {
    setRegistrationsModalEvent(ev);
    setLoadingRegs(true);
    try {
      const data = await getEventRegistrations(ev.id);
      setRegistrations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRegs(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Event Management</h1>
          <p className="text-text-secondary text-sm mt-1">
            Organize alumni meets, career webinars, and campus workshops.
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => handleOpenModal()}>
          Create New Event
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events created yet"
          description="Create your first alumni meet or webinar to bring the community together."
          action={() => handleOpenModal()}
          actionLabel="Create Event"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between hover:shadow-card-hover transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="primary">{ev.type}</Badge>
                  <button
                    onClick={() => handleViewRegistrations(ev)}
                    className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Users size={13} />
                    {ev.registrationCount || 0} Registered
                  </button>
                </div>

                <h3 className="text-lg font-heading font-bold text-text-primary mb-2 line-clamp-2">
                  {ev.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">
                  {ev.description}
                </p>

                <div className="space-y-1.5 text-xs text-text-muted border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-primary-600" />
                    <span>{formatDate(ev.date)} {ev.time && `• ${ev.time}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ev.meetingLink ? (
                      <>
                        <Video size={13} className="text-primary-600" />
                        <span className="truncate">Online Video Conference</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={13} className="text-primary-600" />
                        <span className="truncate">{ev.location || 'College Campus'}</span>
                      </>
                    )}
                  </div>
                  {ev.registrationLink && (
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                      <ExternalLink size={13} className="text-blue-600 flex-shrink-0" />
                      <span className="truncate">Google Form / External Registration</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(ev)}
                  className="p-2 text-text-secondary hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  title="Edit Event"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  disabled={deletingId === ev.id}
                  className="p-2 text-text-secondary hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave}>
              {editingEvent ? 'Update Event' : 'Publish Event'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Event Title"
            placeholder="e.g. Annual Alumni Reunion 2024"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Event Type"
              options={EVENT_TYPES}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              required
            />
            <Input
              label="Organizer / Host"
              placeholder="e.g. Alumni Relations Cell"
              value={form.organizer}
              onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
            <Input
              label="Time"
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Campus Location (if in-person)"
              placeholder="e.g. Main Auditorium"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              label="Online Meeting Link (if webinar)"
              placeholder="https://meet.google.com/xyz"
              value={form.meetingLink}
              onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
            />
          </div>

          <Input
            label="Registration Link (Google Form / Website Link)"
            placeholder="https://forms.google.com/your-form-link or https://website.com/register"
            value={form.registrationLink}
            onChange={(e) => setForm((f) => ({ ...f, registrationLink: e.target.value }))}
            hint="Students clicking 'Register' will open this Google Form or website link."
          />

          <div>
            <label className="form-label">Event Description <span className="text-red-500">*</span></label>
            <textarea
              className="form-input h-28 resize-none"
              placeholder="Provide agenda, key speakers, and details for participants..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Registrations List Modal */}
      <Modal
        isOpen={!!registrationsModalEvent}
        onClose={() => setRegistrationsModalEvent(null)}
        title={`Registrations: ${registrationsModalEvent?.title}`}
        size="md"
      >
        {loadingRegs ? (
          <p className="text-sm text-text-muted py-4">Loading attendee list...</p>
        ) : registrations.length === 0 ? (
          <p className="text-sm text-text-secondary py-6 text-center">No students or alumni registered yet.</p>
        ) : (
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {registrations.map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-medium text-text-primary">{r.userName || 'Attendee'}</span>
                <span className="text-xs text-text-muted">{formatDate(r.registeredAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminEvents;
