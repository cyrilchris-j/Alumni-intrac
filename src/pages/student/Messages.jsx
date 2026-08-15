import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import {
  getOrCreateConversation,
  listenToConversations,
  listenToMessages,
  sendMessage,
  markConversationAsRead,
} from '../../services/messageService';
import { getAlumniProfile, getStudentProfile } from '../../services/userService';
import { formatTime, timeAgo, getConversationId } from '../../utils/formatters';
import { useAuth as useAuthHook } from '../../context/AuthContext';

const Messages = () => {
  const { currentUser, userProfile, userRole } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserProfiles, setOtherUserProfiles] = useState({});
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Real-time conversations listener
  useEffect(() => {
    if (!currentUser) return;
    const unsub = listenToConversations(currentUser.uid, async (convs) => {
      setConversations(convs);

      // Load other user profiles
      const profileMap = {};
      await Promise.all(
        convs.map(async (conv) => {
          const otherId = conv.participants.find((p) => p !== currentUser.uid);
          if (otherId && !otherUserProfiles[otherId]) {
            try {
              const profile = userRole === 'student'
                ? await getAlumniProfile(otherId)
                : await getStudentProfile(otherId);
              if (profile) profileMap[otherId] = profile;
            } catch (e) { /* skip */ }
          }
        })
      );
      if (Object.keys(profileMap).length > 0) {
        setOtherUserProfiles((prev) => ({ ...prev, ...profileMap }));
      }
    });
    return () => unsub();
  }, [currentUser, userRole]);

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
    if (!selectedConvId) return;
    const unsub = listenToMessages(selectedConvId, (msgs) => {
      setMessages(msgs);
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
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sending) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Find receiver
      const conv = conversations.find((c) => c.id === selectedConvId);
      const receiverId = conv?.participants.find((p) => p !== currentUser.uid);
      if (!receiverId) return;

      await sendMessage(selectedConvId, currentUser.uid, receiverId, text);
    } catch (e) {
      console.error('Failed to send message:', e);
      setNewMessage(text); // restore
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const getOtherUser = (conv) => {
    const otherId = conv.participants.find((p) => p !== currentUser.uid);
    return { id: otherId, profile: otherUserProfiles[otherId] };
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!search) return true;
    const { profile } = getOtherUser(conv);
    return profile?.fullName?.toLowerCase().includes(search.toLowerCase());
  });

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const selectedOther = selectedConv ? getOtherUser(selectedConv) : null;

  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl border border-border overflow-hidden" style={{ height: 'calc(100vh - 10rem)' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`w-full sm:w-80 border-r border-border flex flex-col flex-shrink-0 ${mobileView === 'chat' ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-heading font-semibold text-text-primary mb-3">Messages</h2>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations"
                  description="Your conversations will appear here."
                  className="py-12"
                />
              ) : (
                filteredConversations.map((conv) => {
                  const { id: otherId, profile } = getOtherUser(conv);
                  const isSelected = conv.id === selectedConvId;
                  const hasUnread = conv.unreadCount?.[currentUser.uid];
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full flex items-center gap-3 p-4 border-b border-border transition-colors text-left ${
                        isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Avatar src={profile?.photoURL} name={profile?.fullName} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'}`}>
                            {profile?.fullName || 'Unknown User'}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-[11px] text-text-muted flex-shrink-0 ml-2">
                              {timeAgo(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                          {conv.lastMessage || 'Start a conversation'}
                        </p>
                      </div>
                      {hasUnread && (
                        <div className="w-2.5 h-2.5 bg-primary-600 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}>
            {!selectedConvId ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={MessageSquare}
                  title="Select a conversation"
                  description="Choose a conversation from the list to start messaging."
                />
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="h-16 px-4 border-b border-border flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => setMobileView('list')}
                    className="sm:hidden p-1 text-text-secondary hover:text-text-primary"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <Avatar
                    src={selectedOther?.profile?.photoURL}
                    name={selectedOther?.profile?.fullName}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-text-primary text-sm">
                      {selectedOther?.profile?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {selectedOther?.profile?.jobRole}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-text-muted">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === currentUser.uid;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isOwn
                                  ? 'bg-primary-600 text-white rounded-br-sm'
                                  : 'bg-gray-100 text-text-primary rounded-bl-sm'
                              }`}
                            >
                              {msg.text}
                            </div>
                            <p className={`text-[11px] text-text-muted mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {msg.createdAt ? formatTime(msg.createdAt) : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-border flex gap-3 flex-shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
