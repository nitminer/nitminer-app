'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { FiSearch, FiSend, FiX, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import { toast } from '@/lib/toast';
import { useSocket } from '@/hooks/useSocket';

interface ConversationMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  message: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  userId: string;
  userEmail: string;
  adminId?: string;
  subject: string;
  status: 'open' | 'closed';
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  unreadByAdmin: number;
  unreadByUser: number;
  createdAt: string;
  updatedAt: string;
}



interface InboxProps {
  role?: 'user' | 'admin';
}

export default function Inbox({ role = 'user' }: InboxProps) {
  const { data: session } = useSession();
  const { socket, isConnected, emit, on } = useSocket(session?.user?.email);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // New conversation modal state
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConvSubject, setNewConvSubject] = useState('');
  const [newConvMessage, setNewConvMessage] = useState('');
  const [creatingConversation, setCreatingConversation] = useState(false);

  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const response = await fetch(`/api/conversations?role=${role}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        setConversations(data.data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoadingConversations(false);
      }
    };

    if (session?.user?.email) {
      fetchConversations();
      
      // Join Socket.io room
      if (isConnected && socket) {
        socket.emit('join', session.user.email);
      }
    }
  }, [session?.user?.email, isConnected, socket]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        setLoadingMessages(true);
        const response = await fetch(
          `/api/conversations/${selectedConversation._id}/messages`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.data || []);
        
        // Join conversation room for real-time updates
        if (isConnected && socket) {
          socket.emit('conversation:join', selectedConversation._id);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, isConnected, socket]);

  // Listen for real-time messages
  useEffect(() => {
    if (!isConnected || !socket) return;

    const handleNewMessage = (data: any) => {
      if (data.conversationId === selectedConversation?._id) {
        const newMsg: ConversationMessage = {
          _id: data._id || Date.now().toString(),
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderEmail: data.senderEmail,
          senderName: data.senderName,
          senderRole: data.senderRole,
          message: data.message,
          read: false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    };

    // Subscribe to message events
    const unsubscribe = on('message:received', handleNewMessage);
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isConnected, socket, selectedConversation?._id, on]);

  // Filter conversations
  useEffect(() => {
    let filtered = conversations;

    if (searchTerm) {
      filtered = filtered.filter(
        (conv) =>
          conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((conv) => conv.status === statusFilter);
    }

    setConversations(filtered);
  }, [searchTerm, statusFilter]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) {
      toast.error('Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ message: newMessage }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add message locally
      setMessages([...messages, data.data]);
      setNewMessage('');
      
      // Emit via Socket.io for real-time update
      if (socket) {
        emit('message:new', {
          conversationId: selectedConversation._id,
          senderEmail: session?.user?.email,
          message: newMessage,
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error('Message error:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: 'closed' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to close conversation');
      }

      const updated = { ...selectedConversation, status: 'closed' as const };
      setConversations(
        conversations.map((conv) =>
          conv._id === selectedConversation._id ? updated : conv
        )
      );
      setSelectedConversation(updated);
      toast.success('Conversation closed');
    } catch (error) {
      console.error('Close error:', error);
      toast.error('Failed to close conversation');
    }
  };

  const handleCreateNewConversation = async () => {
    if (!newConvSubject.trim() || !newConvMessage.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setCreatingConversation(true);

    try {
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: newConvSubject,
          message: newConvMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      
      // Refresh conversations
      const conversationsResponse = await fetch(`/api/conversations?role=${role}`, {
        credentials: 'include',
      });

      if (conversationsResponse.ok) {
        const convData = await conversationsResponse.json();
        setConversations(convData.data || []);
        
        // Select the new conversation
        const newConv = convData.data?.[0];
        if (newConv) {
          setSelectedConversation(newConv);
        }
      }

      setShowNewConversationModal(false);
      setNewConvSubject('');
      setNewConvMessage('');
      toast.success('Conversation started! Admin has been notified.');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    } finally {
      setCreatingConversation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inbox</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {role === 'admin'
              ? 'Communicate with users about their requests'
              : 'Talk to support team'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Conversations</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Conversations */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loadingConversations ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading conversations...
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedConversation?._id === conversation._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {conversation.subject}
                        </h4>
                        {conversation.unreadByAdmin > 0 && role === 'admin' && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                            {conversation.unreadByAdmin}
                          </span>
                        )}
                        {conversation.unreadByUser > 0 && role === 'user' && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                            {conversation.unreadByUser}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {conversation.userEmail}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(conversation.lastMessageAt).toLocaleTimeString()}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                          conversation.status === 'open'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {conversation.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No conversations found
              </div>
            )}
          </div>

          {/* Chat with Support Team Button (for users) */}
          {role === 'user' && (
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              <FiMessageSquare className="w-5 h-5" />
              Chat with Support Team
            </button>
          )}
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.subject}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedConversation.userEmail}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {selectedConversation.status === 'open' ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs font-medium text-green-800 dark:text-green-400">
                        Open
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium text-gray-800 dark:text-gray-300">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
                {selectedConversation.status === 'open' && (
                  <button
                    onClick={handleCloseConversation}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close conversation"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50 dark:bg-gray-900/50 ">
                {loadingMessages ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading messages...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderEmail === session?.user?.email ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderEmail === session?.user?.email
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                        }`}
                      >
                        <p className="text-xs font-medium mb-1 opacity-75">
                          {msg.senderName}
                          {msg.senderRole && (
                            <span className="ml-2 text-xs bg-black/20 px-1 rounded">
                              {msg.senderRole}
                            </span>
                          )}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedConversation.status === 'open' && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sendingMessage}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <FiSend size={16} />
                      Send
                    </button>
                  </div>
                </div>
              )}

              {selectedConversation.status === 'closed' && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                    <FiCheckCircle className="text-green-600 dark:text-green-400" />
                    This conversation is closed
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center h-full">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Select a conversation to view messages
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiMessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Chat with Support Team
                </h3>
              </div>
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newConvSubject}
                  onChange={(e) => setNewConvSubject(e.target.value)}
                  placeholder="What is your message about?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={newConvMessage}
                  onChange={(e) => setNewConvMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewConversationModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewConversation}
                  disabled={creatingConversation}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {creatingConversation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Our support team will respond as soon as possible
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
