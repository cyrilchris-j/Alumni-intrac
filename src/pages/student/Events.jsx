import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Clock, Users, Video, CheckCircle,
  ExternalLink, ArrowRight, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  getEvents,
  registerForEvent,
  cancelEventRegistration,
  getUserEventRegistrations,
} from '../../services/eventService';
import { formatDate } from '../../utils/formatters';

const Events = () => {
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'registered'

  // Modal states
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [confirmModalEvent, setConfirmModalEvent] = useState(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const loadEventsData = async () => {
    setLoading(true);
    try {
      const [allEvents, userRegs] = await Promise.all([
        getEvents(),
        currentUser ? getUserEventRegistrations(currentUser.uid) : Promise.resolve([]),
      ]);
      setEvents(allEvents);
      setRegisteredEventIds(new Set(userRegs));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventsData();
  }, [currentUser]);

  const handleOpenConfirmModal = (event) => {
    setConfirmModalEvent(event);
    setConfirmInput('');
    setConfirmError('');
  };

  const handleConfirmRegistration = async (e) => {
    if (e) e.preventDefault();
    if (!confirmModalEvent || !currentUser) return;

    if (confirmInput.trim().toLowerCase() !== 'confirm') {
      setConfirmError("Please type 'confirm' to verify your registration.");
      return;
    }

    setConfirming(true);
    try {
      await registerForEvent(confirmModalEvent.id, currentUser.uid, userProfile?.fullName || 'Student');
      setRegisteredEventIds((prev) => new Set(prev).add(confirmModalEvent.id));

      const extLink = confirmModalEvent.registrationLink || confirmModalEvent.externalLink;
      if (extLink) {
        window.open(extLink, '_blank', 'noopener,noreferrer');
      }

      setConfirmModalEvent(null);
      if (selectedEventModal?.id === confirmModalEvent.id) {
        setSelectedEventModal(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to register for event.');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelRegistration = async (event) => {
    if (!currentUser) return;
    setActioningId(event.id);
    try {
      await cancelEventRegistration(event.id, currentUser.uid);
      setRegisteredEventIds((prev) => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
      if (selectedEventModal?.id === event.id) {
        setSelectedEventModal(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel registration.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (activeFilter === 'registered') {
      return registeredEventIds.has(ev.id);
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Colloquiums, Meets & Workshops
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Participate in webinars, networking meets, and skill workshops hosted by industry leaders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className="text-xs font-semibold"
          >
            All Events
          </Button>
          <Button
            variant={activeFilter === 'registered' ? 'gold' : 'secondary'}
            size="sm"
            leftIcon={CheckCircle}
            onClick={() => setActiveFilter('registered')}
            className="text-xs font-semibold"
          >
            My Registrations ({registeredEventIds.size})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={activeFilter === 'registered' ? "No active registrations" : "No scheduled events"}
          description={activeFilter === 'registered' ? "You haven't reserved seating for any upcoming gatherings." : "New colloquiums and keynote sessions will be published here."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const isRegistered = registeredEventIds.has(event.id);
            const extLink = event.registrationLink || event.externalLink;

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-card-hover hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group shadow-xs min-h-[300px]"
              >
                {/* Upper Section */}
                <div className="p-7 sm:p-8 space-y-4 flex-1">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {event.title}
                    </h3>

                    {event.organizer && (
                      <p className="text-sm font-medium text-slate-500 mt-1 truncate">
                        {event.organizer}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium py-1 border-y border-slate-100/80">
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Calendar size={14} className="text-blue-600 flex-shrink-0" />
                      {formatDate(event.date)} {event.time && `• ${event.time}`}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                      {event.meetingLink ? (
                        <>
                          <Video size={14} className="text-blue-600 flex-shrink-0" />
                          <span>Online Meeting</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                          <span className="truncate">{event.location || 'College Campus'}</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-sans">
                    {event.description}
                  </p>
                </div>

                {/* Divider Line & Bottom Section */}
                <div className="px-7 py-5 sm:px-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 mt-auto">
                  <Badge variant="primary" className="font-semibold text-xs px-3 py-1">
                    {event.type || 'Colloquium'}
                  </Badge>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedEventModal(event)}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Info →
                    </button>

                    {isRegistered ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle size={14} className="text-emerald-600" />
                        Registered
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenConfirmModal(event)}
                        className="text-xs font-bold px-4 py-2"
                      >
                        Register
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details / View Info Modal */}
      <Modal
        isOpen={!!selectedEventModal}
        onClose={() => setSelectedEventModal(null)}
        title={selectedEventModal?.title}
        size="lg"
      >
        {selectedEventModal && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-100">
              <Badge variant="primary">{selectedEventModal.type || 'Colloquium'}</Badge>
              {registeredEventIds.has(selectedEventModal.id) && (
                <Badge variant="emerald" dot>Registered</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Date & Time</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary-600" />
                  {formatDate(selectedEventModal.date)} {selectedEventModal.time && `• ${selectedEventModal.time}`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Venue / Platform</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                  {selectedEventModal.meetingLink ? (
                    <>
                      <Video size={13} className="text-primary-600" />
                      Online Meeting
                    </>
                  ) : (
                    <>
                      <MapPin size={13} className="text-primary-600" />
                      {selectedEventModal.location || 'College Campus'}
                    </>
                  )}
                </span>
              </div>
              {selectedEventModal.organizer && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block mb-0.5 font-medium">Host / Organizer</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Users size={13} className="text-primary-600" />
                    {selectedEventModal.organizer}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Event Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {selectedEventModal.description}
              </p>
            </div>

            {/* Google Form / External Registration Link Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <ExternalLink size={15} className="text-blue-600 flex-shrink-0" />
                  Official Google Form / Registration Link
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  Click below to open the official registration form or event portal website.
                </p>
              </div>
              <a
                href={selectedEventModal.registrationLink || selectedEventModal.externalLink || 'https://forms.google.com/demo-event-registration'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-sm text-xs px-3.5 py-2 flex items-center gap-1.5 flex-shrink-0 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                Open Link <ExternalLink size={13} />
              </a>
            </div>

            {selectedEventModal.meetingLink && registeredEventIds.has(selectedEventModal.id) && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-emerald-900">Online Meeting Link</p>
                  <p className="text-emerald-700 text-[11px] mt-0.5">Use this link to join the live virtual session.</p>
                </div>
                <a
                  href={selectedEventModal.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-emerald btn-sm text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Join Meeting <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Registration Confirmation Modal */}
      <Modal
        isOpen={!!confirmModalEvent}
        onClose={() => setConfirmModalEvent(null)}
        title="Confirm Event Registration"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setConfirmModalEvent(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              loading={confirming}
              disabled={confirmInput.trim().toLowerCase() !== 'confirm' || confirming}
              onClick={handleConfirmRegistration}
            >
              Confirm Registration
            </Button>
          </div>
        }
      >
        <form onSubmit={handleConfirmRegistration} className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Please confirm your registration for{' '}
            <strong className="text-slate-900">{confirmModalEvent?.title}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              To confirm registration, please type <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">confirm</code> below:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => {
                setConfirmInput(e.target.value);
                if (confirmError) setConfirmError('');
              }}
              placeholder="Type 'confirm' to verify"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              autoFocus
            />
            {confirmError && (
              <p className="text-xs text-red-600 font-medium mt-1">{confirmError}</p>
            )}
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Events;
