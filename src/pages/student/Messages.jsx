import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Send, Search, MessageSquare, ArrowLeft, Plus, Check, CheckCheck,
  Building2, GraduationCap, Sparkles, Mail, MapPin, ExternalLink, UserCheck,
  PanelRightClose, PanelRightOpen, Smile, X, Copy, Calendar, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import {
  getOrCreateConversation,
  listenToConversations,
  listenToMessages,
  sendMessage,
  markConversationAsRead,
} from '../../services/messageService';
import { getUserConnections } from '../../services/connectionService';
import { getAlumniProfile, getStudentProfile } from '../../services/userService';
import { formatTime, formatDate, timeAgo, getConversationId } from '../../utils/formatters';

const QUICK_ICEBREAKERS = [
  {
    icon: '☕',
    label: '15-min Coffee Chat',
    text: 'Hi! I would love to connect for a quick 15-minute chat to hear about your journey and experience.',
  },
  {
    icon: '📄',
    label: 'Resume Review',
    text: 'Hello! I am preparing for upcoming internship/job applications. Could you share quick feedback on my resume?',
  },
  {
    icon: '💼',
    label: 'Career Guidance',
    text: 'Hi! What key skills and projects do you recommend focusing on to break into your industry?',
  },
  {
    icon: '👋',
    label: 'Say Hello',
    text: 'Hello! Thank you for connecting with me on AlumLink. Looking forward to staying in touch!',
  },
];

const QUICK_EMOJIS = ['👍', '❤️', '👏', '💡', '🔥', '🙌', '🚀', '✨'];

const Messages = () => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserProfiles, setOtherUserProfiles] = useState({});
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread' | 'alumni' | 'students'
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const [showRightPanel, setShowRightPanel] = useState(false); // Collapsible context drawer
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [connectionProfiles, setConnectionProfiles] = useState({});
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Real-time conversations listener
  useEffect(() => {
    if (!currentUser) return;
    const unsub = listenToConversations(currentUser.uid, async (convs) => {
      setConversations(convs || []);

      // Load other user profiles
      const profileMap = {};
      await Promise.all(
        (convs || []).map(async (conv) => {
          const otherId = conv.participants?.find((p) => p !== currentUser.uid);
          if (otherId && !otherUserProfiles[otherId]) {
            try {
              const alumniP = await getAlumniProfile(otherId).catch(() => null);
              const studentP = alumniP ? null : await getStudentProfile(otherId).catch(() => null);
              if (alumniP || studentP) profileMap[otherId] = alumniP || studentP;
            } catch (e) {
              /* skip */
            }
          }
        })
      );
      if (Object.keys(profileMap).length > 0) {
        setOtherUserProfiles((prev) => ({ ...prev, ...profileMap }));
      }
    });
    return () => unsub();
  }, [currentUser]);

  // Handle initial conversation from navigation state
  useEffect(() => {
    if (location.state?.conversationWith && currentUser) {
      const otherId = location.state.conversationWith;
      const convId = getConversationId(currentUser.uid, otherId);
      setSelectedConvId(convId);
      setMobileView('chat');
    }
  }, [location.state, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Real-time messages listener
  useEffect(() => {
    if (!selectedConvId || !currentUser) return;
    const unsub = listenToMessages(selectedConvId, (msgs) => {
      setMessages(msgs || []);
      scrollToBottom();
    });
    markConversationAsRead(selectedConvId, currentUser.uid);
    return () => unsub();
  }, [selectedConvId, currentUser]);

  // Auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setSelectedConvId(conv.id);
    setMobileView('chat');
    markConversationAsRead(conv.id, currentUser.uid);
  };

  const handleSendMessage = async (e, textOverride = null) => {
    e?.preventDefault();
    const textToSend = (textOverride || newMessage).trim();
    if (!textToSend || !selectedConvId || sending) return;

    setNewMessage('');
    setShowEmojiPicker(false);
    setSending(true);

    try {
      const conv = conversations.find((c) => c.id === selectedConvId);
      const receiverId =
        conv?.participants?.find((p) => p !== currentUser.uid) ||
        selectedConvId.replace(currentUser.uid, '').replace('_', '');
      if (!receiverId) return;

      await sendMessage(selectedConvId, currentUser.uid, receiverId, textToSend);
    } catch (e) {
      console.error('Failed to send message:', e);
      if (!textOverride) setNewMessage(textToSend);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenNewChatModal = async () => {
    setShowNewChatModal(true);
    setLoadingConnections(true);
    try {
      const conns = await getUserConnections(currentUser.uid);
      setAcceptedConnections(conns || []);

      const otherIds = (conns || []).map((c) =>
        c.senderId === currentUser.uid ? c.receiverId : c.senderId
      );
      const profileMap = {};
      await Promise.all(
        otherIds.map(async (uid) => {
          const alumniP = await getAlumniProfile(uid).catch(() => null);
          const studentP = alumniP ? null : await getStudentProfile(uid).catch(() => null);
          if (alumniP || studentP) profileMap[uid] = alumniP || studentP;
        })
      );
      setConnectionProfiles(profileMap);
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleStartNewChatWith = async (targetId, targetName) => {
    try {
      const convId = await getOrCreateConversation(currentUser.uid, targetId, {
        [currentUser.uid]: userProfile?.fullName || 'User',
        [targetId]: targetName || 'User',
      });
      setSelectedConvId(convId);
      setShowNewChatModal(false);
      setMobileView('chat');
    } catch (err) {
      alert('Failed to start conversation');
    }
  };

  const getOtherUser = (conv) => {
    const otherId = conv.participants?.find((p) => p !== currentUser.uid);
    return { id: otherId, profile: otherUserProfiles[otherId] };
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return (conversations || []).filter((conv) => {
      const { profile } = getOtherUser(conv);
      const nameMatch = !search || profile?.fullName?.toLowerCase().includes(search.toLowerCase());
      if (!nameMatch) return false;

      const hasUnread = conv.unreadCount?.[currentUser?.uid] > 0;
      const isAlumni = Boolean(profile?.graduationYear || profile?.company);

      if (filterTab === 'unread') return hasUnread;
      if (filterTab === 'alumni') return isAlumni;
      if (filterTab === 'students') return !isAlumni;
      return true;
    });
  }, [conversations, search, filterTab, otherUserProfiles, currentUser]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const selectedOther = selectedConv
    ? getOtherUser(selectedConv)
    : location.state?.conversationWith
    ? {
        id: location.state.conversationWith,
        profile: otherUserProfiles[location.state.conversationWith],
      }
    : null;

  const isSelectedOtherAlumni = Boolean(
    selectedOther?.profile?.graduationYear || selectedOther?.profile?.company
  );

  const filteredNewChatConnections = acceptedConnections.filter((conn) => {
    const otherId = conn.senderId === currentUser.uid ? conn.receiverId : conn.senderId;
    const profile = connectionProfiles[otherId];
    if (!newChatSearch) return true;
    const lower = newChatSearch.toLowerCase();
    return (
      profile?.fullName?.toLowerCase().includes(lower) ||
      profile?.company?.toLowerCase().includes(lower) ||
      profile?.department?.toLowerCase().includes(lower)
    );
  });

  // Calculate unread counts
  const totalUnreadCount = (conversations || []).filter(
    (c) => c.unreadCount?.[currentUser?.uid] > 0
  ).length;

  // Group messages by date for clean separators
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const msgDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : 'Recent';
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msgDate, rawDate: msg.createdAt });
      }
      groups.push({ type: 'message', ...msg });
    });

    return groups;
  }, [messages]);

  const formatMessageDateHeader = (rawDate) => {
    if (!rawDate) return 'Today';
    const date = new Date(rawDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return formatDate(rawDate, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div
        className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden flex flex-col transition-all"
        style={{ height: 'calc(100vh - 7.5rem)' }}
      >
        <div className="flex h-full min-h-0">
          {/* ========================================================================= */}
          {/* LEFT PANEL: Professional Conversation List */}
          {/* ========================================================================= */}
          <div
            className={`w-full sm:w-72 md:w-80 border-r border-slate-200/90 flex flex-col flex-shrink-0 bg-slate-50/50 ${
              mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Top Toolbar */}
            <div className="p-4 border-b border-slate-200/80 bg-white flex-shrink-0">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading font-bold text-slate-900 text-base tracking-tight">
                        Messages
                      </h2>
                      {totalUnreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                          {totalUnreadCount} new
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Alumni & Student Network</p>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="primary"
                  leftIcon={Plus}
                  onClick={handleOpenNewChatModal}
                  className="rounded-xl shadow-xs text-xs font-semibold px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  New Chat
                </Button>
              </div>

              {/* Search Bar with Clear Button */}
              <div className="relative mb-3">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by name, company, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 font-medium text-slate-800"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-semibold">
                {[
                  { id: 'all', label: 'All', count: conversations.length },
                  { id: 'unread', label: 'Unread', count: totalUnreadCount },
                  { id: 'alumni', label: 'Alumni' },
                  { id: 'students', label: 'Students' },
                ].map((tab) => {
                  const isActive = filterTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTab(tab.id)}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversations Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60">
              {filteredConversations.length === 0 ? (
                <div className="py-14 px-4 text-center">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-indigo-100">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-800 mb-1">
                    {search ? 'No conversations found' : 'No conversations yet'}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
                    {search
                      ? `No contacts match "${search}". Try clearing search.`
                      : 'Connect with mentors and peers to begin instant direct chats.'}
                  </p>
                  {search ? (
                    <Button size="xs" variant="secondary" onClick={() => setSearch('')}>
                      Clear Search
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={handleOpenNewChatModal}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Start a New Chat
                    </Button>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const { profile } = getOtherUser(conv);
                  const isSelected = conv.id === selectedConvId;
                  const hasUnread = conv.unreadCount?.[currentUser?.uid] > 0;
                  const isAlumni = Boolean(profile?.graduationYear || profile?.company);

                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full flex items-center gap-3 p-3.5 transition-all text-left group relative ${
                        isSelected
                          ? 'bg-indigo-50/70 border-l-[3.5px] border-indigo-600 pl-3'
                          : 'hover:bg-slate-100/70 bg-white/40'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar src={profile?.photoURL} name={profile?.fullName} size="md" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-500/20" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p
                              className={`text-sm truncate ${
                                hasUnread
                                  ? 'font-bold text-slate-900'
                                  : isSelected
                                  ? 'font-bold text-indigo-950'
                                  : 'font-semibold text-slate-800'
                              }`}
                            >
                              {profile?.fullName || 'Network Contact'}
                            </p>
                            {profile?.verificationStatus === 'verified' && (
                              <span
                                title="Verified"
                                className="text-emerald-600 flex-shrink-0 text-xs"
                              >
                                ✓
                              </span>
                            )}
                          </div>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-slate-400 font-medium ml-2 flex-shrink-0">
                              {timeAgo(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs truncate ${
                              hasUnread
                                ? 'text-indigo-900 font-bold'
                                : 'text-slate-500 group-hover:text-slate-700'
                            }`}
                          >
                            {conv.lastMessage || 'Start conversation...'}
                          </p>
                          {hasUnread && (
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 ring-4 ring-indigo-100 animate-pulse" />
                          )}
                        </div>

                        {/* Professional Tagline */}
                        <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                          {isAlumni ? (
                            <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold truncate bg-indigo-50/90 px-1.5 py-0.2 rounded-md">
                              <Building2 size={11} className="flex-shrink-0 text-indigo-600" />
                              <span className="truncate">{profile?.company || 'Alumni Mentor'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-600 font-medium truncate bg-slate-100 px-1.5 py-0.2 rounded-md">
                              <GraduationCap size={11} className="flex-shrink-0 text-slate-500" />
                              <span className="truncate">{profile?.department || 'Student'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER PANEL: Professional Chat Stream & Composer */}
          {/* ========================================================================= */}
          <div
            className={`flex-1 flex flex-col min-w-0 bg-slate-50/40 relative ${
              mobileView === 'list' ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {!selectedConvId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white via-slate-50/30 to-slate-100/30">
                <div className="w-18 h-18 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                  <MessageSquare size={34} />
                </div>
                <h3 className="text-xl font-heading font-bold text-slate-900 mb-2 tracking-tight">
                  Welcome to AlumLink Network Chat
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                  Connect 1-on-1 with industry mentors, alumni leaders, and peers. Select an ongoing
                  chat from the list or initiate a new conversation.
                </p>
                <Button
                  onClick={handleOpenNewChatModal}
                  leftIcon={Plus}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Start a Conversation
                </Button>
              </div>
            ) : (
              <>
                {/* Modern Executive Chat Header */}
                <div className="px-4 py-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between flex-shrink-0 shadow-2xs z-10 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => setMobileView('list')}
                      className="sm:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={19} />
                    </button>

                    {/* Contact Profile Summary (Clickable) */}
                    <div
                      onClick={() => setShowProfileModal(true)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer hover:bg-slate-50/80 p-1 rounded-xl transition-all group flex-1"
                      title="Click to view full profile"
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={selectedOther?.profile?.photoURL}
                          name={selectedOther?.profile?.fullName}
                          size="md"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-500/20" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base leading-tight truncate group-hover:text-indigo-600 transition-colors">
                            {selectedOther?.profile?.fullName || 'Contact'}
                          </h3>
                          {selectedOther?.profile?.verificationStatus === 'verified' && (
                            <span
                              title="Verified Network Member"
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200 flex-shrink-0"
                            >
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                          <span className="text-emerald-700 font-semibold flex-shrink-0">Active now</span>
                          <span className="text-slate-300">•</span>
                          <span className="truncate">
                            {selectedOther?.profile?.jobRole || selectedOther?.profile?.department}
                            {selectedOther?.profile?.company
                              ? ` at ${selectedOther?.profile?.company}`
                              : ''}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Mentorship shortcut if alumni */}
                    {isSelectedOtherAlumni && (
                      <button
                        onClick={() => navigate('/student/mentorship')}
                        className="hidden lg:inline-flex text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-all items-center gap-1.5 shadow-2xs"
                        title="Book a 1-on-1 mentorship session"
                      >
                        <Calendar size={13} />
                        <span>Book Session</span>
                      </button>
                    )}

                    {/* View Profile Button */}
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <UserCheck size={14} />
                      <span className="hidden sm:inline">Profile</span>
                    </button>

                    {/* Toggle Desktop Right Panel */}
                    <button
                      onClick={() => setShowRightPanel((prev) => !prev)}
                      className={`hidden xl:flex p-1.5 rounded-xl border transition-all ${
                        showRightPanel
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-white text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                      }`}
                      title={showRightPanel ? 'Hide Contact Info' : 'Show Contact Info'}
                    >
                      {showRightPanel ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                    </button>
                  </div>
                </div>

                {/* Messages Body Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50/50 via-white/50 to-slate-50/50">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
                        <Sparkles size={28} />
                      </div>
                      <h4 className="text-base font-heading font-bold text-slate-900">
                        Start a conversation with {selectedOther?.profile?.fullName || 'your contact'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                        Say hello, request a mentorship chat, or discuss shared interests and career
                        paths. Pick a quick prompt below:
                      </p>

                      {/* Quick Icebreakers List */}
                      <div className="w-full space-y-2">
                        {QUICK_ICEBREAKERS.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(null, item.text)}
                            className="w-full text-left p-3 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-300 text-xs transition-all shadow-2xs group flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-base flex-shrink-0">{item.icon}</span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 group-hover:text-indigo-900">
                                  {item.label}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">{item.text}</p>
                              </div>
                            </div>
                            <Send
                              size={13}
                              className="text-slate-300 group-hover:text-indigo-600 flex-shrink-0 transition-colors ml-2"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    groupedMessages.map((item, index) => {
                      if (item.type === 'date') {
                        return (
                          <div key={`date_${index}`} className="flex items-center justify-center my-4">
                            <div className="border-t border-slate-200/80 flex-grow" />
                            <span className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-500 rounded-full shadow-2xs uppercase tracking-wider mx-3">
                              {formatMessageDateHeader(item.rawDate)}
                            </span>
                            <div className="border-t border-slate-200/80 flex-grow" />
                          </div>
                        );
                      }

                      const msg = item;
                      const isOwn = msg.senderId === currentUser.uid;

                      return (
                        <div
                          key={msg.id || `msg_${index}`}
                          className={`flex items-end gap-2.5 ${
                            isOwn ? 'justify-end' : 'justify-start'
                          } group animate-in fade-in duration-150`}
                        >
                          {/* Incoming sender avatar */}
                          {!isOwn && (
                            <Avatar
                              src={selectedOther?.profile?.photoURL}
                              name={selectedOther?.profile?.fullName}
                              size="xs"
                              className="mb-1"
                            />
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-[72%] flex flex-col ${
                              isOwn ? 'items-end' : 'items-start'
                            }`}
                          >
                            {/* Message Bubble */}
                            <div
                              className={`relative px-4 py-2.5 text-sm leading-relaxed ${
                                isOwn
                                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-medium rounded-2xl rounded-tr-xs shadow-2xs'
                                  : 'bg-white text-slate-800 border border-slate-200/90 font-medium rounded-2xl rounded-tl-xs shadow-2xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            </div>

                            {/* Meta & Status */}
                            <div
                              className={`flex items-center gap-1 mt-1 text-[10px] font-medium px-1 text-slate-400 ${
                                isOwn ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <span>{msg.createdAt ? formatTime(msg.createdAt) : ''}</span>
                              {isOwn && (
                                <span className="text-indigo-600 ml-0.5" title={msg.read ? 'Read' : 'Sent'}>
                                  {msg.read ? (
                                    <CheckCheck size={13} className="text-indigo-600" />
                                  ) : (
                                    <Check size={13} className="text-slate-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Ribbon (Always available above composer) */}
                {messages.length > 0 && (
                  <div className="px-4 py-1.5 bg-white/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
                      <Sparkles size={11} className="text-indigo-500" /> Suggestions:
                    </span>
                    {QUICK_ICEBREAKERS.slice(0, 3).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNewMessage(item.text)}
                        className="text-[11px] font-medium text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 rounded-full px-2.5 py-0.5 transition-all flex-shrink-0 cursor-pointer"
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Modern Executive Composer */}
                <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200/80 flex-shrink-0 shadow-2xs relative">
                  {/* Emoji Picker Popover */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-18 left-4 bg-white rounded-2xl border border-slate-200 shadow-luxury p-2.5 z-20 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddEmoji(emoji)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-lg flex items-center justify-center transition-transform hover:scale-115 active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-500/15 transition-all"
                  >
                    {/* Tool Icons */}
                    <div className="flex items-center gap-0.5 pl-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Add emoji"
                      >
                        <Smile size={18} />
                      </button>
                    </div>

                    {/* Text Input */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${
                        selectedOther?.profile?.fullName
                          ? selectedOther.profile.fullName.split(' ')[0]
                          : 'your contact'
                      }...`}
                      className="flex-1 bg-transparent border-none py-2 px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                      disabled={sending}
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs transition-all ${
                        newMessage.trim() && !sending
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer active:scale-95 shadow-sm'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      aria-label="Send message"
                      title="Send message (Enter)"
                    >
                      <Send size={15} className="translate-x-0.5" />
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 mt-1.5 ml-1 hidden sm:block">
                    Press <span className="font-semibold text-slate-500">Enter ↵</span> to send
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: Desktop Context Workspace & Member Profile Drawer */}
          {/* ========================================================================= */}
          {selectedConvId && showRightPanel && (
            <div className="hidden xl:flex w-76 2xl:w-80 border-l border-slate-200/90 flex-col bg-white flex-shrink-0 overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact Details
                </span>
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Close details panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Profile Overview Card */}
              <div className="p-5 text-center border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/50 via-white to-white">
                <div className="relative inline-block mb-3">
                  <Avatar
                    src={selectedOther?.profile?.photoURL}
                    name={selectedOther?.profile?.fullName}
                    size="xl"
                    className="w-20 h-20 shadow-md ring-4 ring-white"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <h3 className="font-heading font-bold text-slate-900 text-base leading-snug">
                  {selectedOther?.profile?.fullName || 'Network Contact'}
                </h3>

                <p className="text-xs font-semibold text-indigo-700 mt-1">
                  {selectedOther?.profile?.jobRole || selectedOther?.profile?.department || 'Alumni Member'}
                </p>
                {selectedOther?.profile?.company && (
                  <p className="text-xs text-slate-600 font-medium">
                    at {selectedOther.profile.company}
                  </p>
                )}

                {selectedOther?.profile?.verificationStatus === 'verified' && (
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck size={13} />
                      Verified Alumni
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Info Sections */}
              <div className="p-5 space-y-4 text-xs">
                {/* Email */}
                {selectedOther?.profile?.email && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Email Address
                    </span>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="font-medium text-slate-800 truncate pr-2">
                        {selectedOther.profile.email}
                      </span>
                      <button
                        onClick={() => handleCopyEmail(selectedOther.profile.email)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                        title="Copy email"
                      >
                        {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Organization / College */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isSelectedOtherAlumni ? 'Organization' : 'Institution'}
                  </span>
                  <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <Building2 size={16} className="text-indigo-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">
                      {selectedOther?.profile?.company ||
                        selectedOther?.profile?.college ||
                        'PSG College of Technology'}
                    </span>
                  </div>
                </div>

                {/* Department & Batch */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Academic Background
                  </span>
                  <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <GraduationCap size={16} className="text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {selectedOther?.profile?.department || 'Computer Science'}
                      </p>
                      {selectedOther?.profile?.graduationYear && (
                        <p className="text-[10px] text-slate-500">
                          Class of {selectedOther.profile.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {selectedOther?.profile?.location && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Location
                    </span>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <MapPin size={15} className="text-amber-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800">
                        {selectedOther.profile.location}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedOther?.profile?.bio && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      About
                    </span>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-600 leading-relaxed italic text-[11px]">
                      "{selectedOther.profile.bio}"
                    </p>
                  </div>
                )}

                {/* Skills Chips */}
                {selectedOther?.profile?.skills?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Skills & Topics
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOther.profile.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 bg-indigo-50/70 text-indigo-800 font-semibold rounded-lg text-[11px] border border-indigo-200/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  {isSelectedOtherAlumni && (
                    <Button
                      variant="primary"
                      className="w-full text-xs font-bold py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                      leftIcon={Calendar}
                      onClick={() => navigate('/student/mentorship')}
                    >
                      Schedule Mentorship
                    </Button>
                  )}

                  {selectedOther?.id && (
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold py-2"
                      leftIcon={ExternalLink}
                      onClick={() => navigate(`/student/alumni/${selectedOther.id}`)}
                    >
                      View Full Profile Page
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Start New Chat with Accepted Connections */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="Start New Conversation"
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setShowNewChatModal(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Select any connected alumni mentor or scholar to launch an instant 1-on-1 dialogue:
          </p>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, or department..."
              value={newChatSearch}
              onChange={(e) => setNewChatSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {loadingConnections ? (
              <p className="text-center py-6 text-xs text-slate-400">Loading your connections...</p>
            ) : filteredNewChatConnections.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No accepted connections found"
                description="Once your connection requests are accepted, you can initiate chats with them here."
              />
            ) : (
              filteredNewChatConnections.map((conn) => {
                const otherId =
                  conn.senderId === currentUser.uid ? conn.receiverId : conn.senderId;
                const profile = connectionProfiles[otherId];
                const isAlumni = Boolean(profile?.graduationYear || profile?.company);
                return (
                  <div
                    key={conn.id}
                    onClick={() => handleStartNewChatWith(otherId, profile?.fullName)}
                    className="p-3 rounded-xl border border-slate-200/90 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={profile?.photoURL} name={profile?.fullName} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {profile?.fullName || 'Contact'}
                          </p>
                          {profile?.verificationStatus === 'verified' && (
                            <Badge variant="success" className="text-[9px] px-1.5 py-0.2">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {isAlumni
                            ? `${profile?.jobRole || 'Alumni'} • ${profile?.company || ''}`
                            : `${profile?.department || 'Student'} • ${profile?.year || ''}`}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="xs"
                      variant="primary"
                      className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      Chat
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: Full Member Profile Details (Modal View) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Member Profile Details"
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            {selectedOther?.id ? (
              <Button
                variant="outline"
                leftIcon={ExternalLink}
                onClick={() => {
                  setShowProfileModal(false);
                  navigate(`/student/alumni/${selectedOther?.id}`);
                }}
                className="text-xs font-bold"
              >
                View Full Page
              </Button>
            ) : <div />}
            <Button
              variant="primary"
              onClick={() => setShowProfileModal(false)}
              className="text-xs font-bold px-5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedOther?.profile ? (
          <div className="space-y-5">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-5 text-white shadow-md">
              <div className="flex items-center gap-4 relative z-10">
                <Avatar
                  src={selectedOther.profile.photoURL}
                  name={selectedOther.profile.fullName}
                  size="xl"
                  ring
                  className="w-18 h-18 border-4 border-white/30 shadow-lg flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-heading font-bold tracking-tight text-white truncate">
                      {selectedOther.profile.fullName}
                    </h3>
                    {selectedOther.profile.verificationStatus === 'verified' && (
                      <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs backdrop-blur-xs">
                        ✓ Verified Alumni
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-indigo-100 mt-1 truncate">
                    {selectedOther.profile.jobRole ||
                      selectedOther.profile.department ||
                      'Alumni Network Member'}
                    {selectedOther.profile.company && ` at ${selectedOther.profile.company}`}
                  </p>
                  <p className="text-xs text-indigo-200/90 mt-0.5 truncate">
                    {selectedOther.profile.graduationYear &&
                      `Class of ${selectedOther.profile.graduationYear}`}
                    {selectedOther.profile.department && ` • ${selectedOther.profile.department}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {selectedOther.profile.email || 'Private'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Organization / Company
                  </p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {selectedOther.profile.company ||
                      selectedOther.profile.college ||
                      'Alumni Network'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Department / Program
                  </p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {selectedOther.profile.department || 'Computer Science'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {selectedOther.profile.location || 'Tamil Nadu, India'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {selectedOther.profile.bio && (
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  About / Bio
                </p>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  {selectedOther.profile.bio}
                </p>
              </div>
            )}

            {/* Skills & Focus Areas */}
            {selectedOther.profile.skills?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Skills & Expertise
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOther.profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200/80 px-2.5 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500">
            Profile details for this user are loading or private.
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Messages;
