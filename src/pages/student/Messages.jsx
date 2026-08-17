import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send, Search, MessageSquare, ArrowLeft, Plus, Check, CheckCheck,
  Building2, GraduationCap, Sparkles
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
import { formatTime, timeAgo, getConversationId } from '../../utils/formatters';

const Messages = () => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserProfiles, setOtherUserProfiles] = useState({});
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  // New Chat Modal state
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (conv) => {
    setSelectedConvId(conv.id);
    setMobileView('chat');
    markConversationAsRead(conv.id, currentUser.uid);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sending) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const conv = conversations.find((c) => c.id === selectedConvId);
      const receiverId =
        conv?.participants?.find((p) => p !== currentUser.uid) ||
        selectedConvId.replace(currentUser.uid, '').replace('_', '');
      if (!receiverId) return;

      await sendMessage(selectedConvId, currentUser.uid, receiverId, text);
    } catch (e) {
      console.error('Failed to send message:', e);
      setNewMessage(text);
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

  const filteredConversations = (conversations || []).filter((conv) => {
    if (!search) return true;
    const { profile } = getOtherUser(conv);
    return profile?.fullName?.toLowerCase().includes(search.toLowerCase());
  });

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const selectedOther = selectedConv
    ? getOtherUser(selectedConv)
    : location.state?.conversationWith
    ? {
        id: location.state.conversationWith,
        profile: otherUserProfiles[location.state.conversationWith],
      }
    : null;

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

  return (
    <DashboardLayout>
      <div
        className="bg-white rounded-2xl border border-border shadow-md overflow-hidden flex flex-col"
        style={{ height: 'calc(100vh - 8rem)' }}
      >
        <div className="flex h-full min-h-0">
          {/* Conversation List Panel (Left) */}
          <div
            className={`w-full sm:w-80 md:w-92 border-r border-border flex flex-col flex-shrink-0 bg-slate-50/50 ${
              mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Header & New Chat Button */}
            <div className="p-4 border-b border-border bg-white flex-shrink-0">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold">
                    <MessageSquare size={17} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-text-primary text-base">Messages</h2>
                    <p className="text-[11px] text-text-muted">Connected Network Chat</p>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="primary"
                  leftIcon={Plus}
                  onClick={handleOpenNewChatModal}
                  className="rounded-xl shadow-xs"
                >
                  New Chat
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-100/80 border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Conversations Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {filteredConversations.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={22} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-text-primary mb-1">
                    No conversations yet
                  </h4>
                  <p className="text-xs text-text-muted mb-4 max-w-xs mx-auto">
                    Start a chat with any of your accepted alumni or student connections.
                  </p>
                  <Button size="xs" variant="secondary" onClick={handleOpenNewChatModal}>
                    Start a New Chat
                  </Button>
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
                      className={`w-full flex items-center gap-3 p-3.5 transition-all text-left group ${
                        isSelected
                          ? 'bg-primary-50/80 border-l-4 border-primary-600 pl-2.5'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar src={profile?.photoURL} name={profile?.fullName} size="md" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p
                            className={`text-sm truncate ${
                              hasUnread ? 'font-bold text-text-primary' : 'font-semibold text-text-primary'
                            }`}
                          >
                            {profile?.fullName || 'Network Contact'}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-text-muted font-medium ml-2 flex-shrink-0">
                              {timeAgo(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              hasUnread
                                ? 'text-primary-700 font-semibold'
                                : 'text-text-secondary group-hover:text-text-primary'
                            }`}
                          >
                            {conv.lastMessage || 'Say hello...'}
                          </p>
                          {hasUnread && (
                            <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-[10px] text-text-muted">
                          {isAlumni ? (
                            <span className="flex items-center gap-0.5 truncate text-primary-700 font-medium">
                              <Building2 size={10} />
                              {profile?.company || 'Alumni'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 truncate text-purple-700 font-medium">
                              <GraduationCap size={10} />
                              {profile?.department || 'Student'}
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

          {/* Active Chat Window (Right Panel) */}
          <div
            className={`flex-1 flex flex-col min-w-0 bg-slate-50/30 ${
              mobileView === 'list' ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {!selectedConvId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white to-slate-50/50">
                <div className="w-16 h-16 rounded-3xl bg-primary-100/70 text-primary-700 flex items-center justify-center mb-4 shadow-sm">
                  <MessageSquare size={30} />
                </div>
                <h3 className="text-xl font-heading font-bold text-text-primary mb-1">
                  Classical & Secure Network Chat
                </h3>
                <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
                  Select a conversation from the left or start a new chat with any accepted alumni or peer connection.
                </p>
                <Button onClick={handleOpenNewChatModal} leftIcon={Plus}>
                  Start a Conversation
                </Button>
              </div>
            ) : (
              <>
                {/* Classical Chat Header */}
                <div className="h-16 px-5 border-b border-border bg-white flex items-center justify-between flex-shrink-0 shadow-xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => setMobileView('list')}
                      className="sm:hidden p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={selectedOther?.profile?.photoURL}
                        name={selectedOther?.profile?.fullName}
                        size="md"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-heading font-bold text-text-primary text-sm truncate">
                          {selectedOther?.profile?.fullName || 'Contact'}
                        </h3>
                        {selectedOther?.profile?.verificationStatus === 'verified' && (
                          <Badge variant="success" className="text-[9px] px-1 py-0.2">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary truncate flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-emerald-700 font-medium">Online</span>
                        <span className="text-text-muted">•</span>
                        <span>
                          {selectedOther?.profile?.jobRole ||
                            selectedOther?.profile?.department ||
                            'Connected'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                      Direct Chat
                    </span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-2">
                        <Sparkles size={20} />
                      </div>
                      <p className="text-sm font-semibold text-text-primary">
                        Say hello to {selectedOther?.profile?.fullName || 'your connection'}!
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Send a message to collaborate or seek career guidance.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === currentUser.uid;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-[65%] flex flex-col ${
                              isOwn ? 'items-end' : 'items-start'
                            }`}
                          >
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                                isOwn
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-br-xs font-normal'
                                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs font-normal shadow-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            </div>

                            <div
                              className={`flex items-center gap-1 mt-1 text-[10px] text-text-muted px-1 ${
                                isOwn ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <span>{msg.createdAt ? formatTime(msg.createdAt) : ''}</span>
                              {isOwn && (
                                <span className="text-primary-600">
                                  {msg.read ? <CheckCheck size={13} /> : <Check size={13} />}
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

                {/* Classical Message Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3.5 bg-white border-t border-border flex items-center gap-3 flex-shrink-0 shadow-lg"
                >
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${selectedOther?.profile?.fullName || '...'}`}
                      className="w-full pl-4 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-text-muted"
                      disabled={sending}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center flex-shrink-0"
                  >
                    <Send size={17} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal: Select Accepted Connection */}
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
          <p className="text-xs text-text-secondary">
            Select any of your accepted alumni or student connections to start an instant 1-on-1 text chat:
          </p>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search your accepted connections..."
              value={newChatSearch}
              onChange={(e) => setNewChatSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {loadingConnections ? (
              <p className="text-center py-6 text-xs text-text-muted">Loading connections...</p>
            ) : filteredNewChatConnections.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No accepted connections found"
                description="Once your connection requests are accepted, you can chat with them here."
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
                    className="p-3 rounded-xl border border-border hover:border-primary-500 hover:bg-primary-50/40 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={profile?.photoURL} name={profile?.fullName} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-text-primary truncate">
                            {profile?.fullName || 'Contact'}
                          </p>
                          {profile?.verificationStatus === 'verified' && (
                            <Badge variant="success" className="text-[9px] px-1 py-0.2">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate">
                          {isAlumni
                            ? `${profile?.jobRole || 'Alumni'} • ${profile?.company || ''}`
                            : `${profile?.department || 'Student'} • ${profile?.year || ''}`}
                        </p>
                      </div>
                    </div>

                    <Button size="xs" variant="primary" className="flex-shrink-0">
                      Chat
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Messages;
