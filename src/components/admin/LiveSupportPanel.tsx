'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { FiX, FiSend, FiMessageSquare, FiTrash2, FiClock, FiUser, FiMenu, FiChevronLeft } from 'react-icons/fi';

interface ChatSession {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'waiting' | 'active' | 'closed';
  connectedAt: Date;
  messages: any[];
  lastMessage?: string;
  lastMessageTime?: Date;
}

export default function LiveSupportPanel() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messagesList, setMessagesList] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [showSessionsList, setShowSessionsList] = useState(true); // For mobile toggle
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectTimeoutRef = useRef<any>(null);

  // Initialize Socket.IO
  useEffect(() => {
    let mounted = true;

    const initSocket = () => {
      if (!mounted || socketRef.current?.connected) return;

      console.log('🔌 Creating new Socket.IO connection for admin...');
      
      socketRef.current = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
      });

      socketRef.current.on('connect', () => {
        if (!mounted) return;
        
        console.log('✅ Admin Socket.IO connected:', socketRef.current.id);
        
        socketRef.current.emit('admin:register', {
          adminName: 'Support Team',
        });
        
        toast.success('Connected to support server', {
          position: 'top-right',
          autoClose: 3000,
        });
      });

      socketRef.current.on('admin:user-request', (data: any) => {
        if (!mounted) return;
        console.log('🔔 User support request received:', data);
        
        const newSession: ChatSession = {
          sessionId: data.sessionId,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          status: 'waiting',
          connectedAt: new Date(),
          messages: [{
            id: Date.now(),
            type: 'system',
            text: `${data.userName} requested support`,
            timestamp: new Date()
          }],
        };

        setSessions(prev => {
          const exists = prev.find(s => s.sessionId === data.sessionId);
          return exists ? prev : [newSession, ...prev];
        });

        setMessagesList(prev => ({
          ...prev,
          [data.sessionId]: newSession.messages
        }));

        toast.info(`New support request from ${data.userName}`, {
          position: 'top-right',
          autoClose: 5000,
        });
      });

      socketRef.current.on('admin:user-message', (data: any) => {
        if (!mounted) return;
        console.log('💬 User message received:', data);
        
        const newMessage = {
          id: data.id || Date.now(),
          type: 'user',
          text: data.message,
          userName: data.userName,
          timestamp: new Date(data.timestamp)
        };

        setMessagesList(prev => ({
          ...prev,
          [data.sessionId]: [...(prev[data.sessionId] || []), newMessage]
        }));

        setSessions(prev =>
          prev.map(session =>
            session.sessionId === data.sessionId
              ? {
                  ...session,
                  lastMessage: data.message,
                  lastMessageTime: new Date()
                }
              : session
          )
        );
      });

      socketRef.current.on('disconnect', () => {
        if (!mounted) return;
        console.log('❌ Admin Socket.IO disconnected');
        toast.warning('Disconnected from support server', {
          position: 'top-right',
          autoClose: 3000,
        });
      });

      socketRef.current.on('error', (error: any) => {
        console.error('❌ Socket.IO error:', error);
      });
    };

    initSocket();

    return () => {
      mounted = false;
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }
    };
  }, []);

  // Load existing chat sessions
  useEffect(() => {
    const loadExistingSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chat/sessions/list');
        
        if (!response.ok) {
          console.error('Failed to load sessions:', response.statusText);
          return;
        }

        const data = await response.json();
        console.log('📥 Loaded existing chat sessions:', data.sessions.length);

        const formattedSessions: ChatSession[] = data.sessions.map((dbSession: any) => ({
          sessionId: dbSession.sessionId,
          userId: dbSession.userId,
          userName: dbSession.userName || 'Unknown User',
          userEmail: dbSession.userEmail || '',
          status: dbSession.status || 'waiting',
          connectedAt: new Date(dbSession.startedAt),
          messages: [],
          lastMessage: dbSession.lastMessage,
          lastMessageTime: dbSession.lastMessageTime ? new Date(dbSession.lastMessageTime) : new Date(dbSession.startedAt),
        }));

        setSessions(prev => {
          if (prev.length === 0) {
            return formattedSessions;
          }
          const existingIds = new Set(prev.map(s => s.sessionId));
          const newSessions = formattedSessions.filter(s => !existingIds.has(s.sessionId));
          return [...prev, ...newSessions];
        });
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingSessions();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesList, selectedSession]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSession(sessionId);
    setShowSessionsList(false); // Hide sessions list on mobile when chat is selected
    setSessions(prev =>
      prev.map(session =>
        session.sessionId === sessionId
          ? { ...session, status: 'active' }
          : session
      )
    );
  };

  const handleBackToSessions = () => {
    setShowSessionsList(true);
    setSelectedSession(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedSession) return;

    const adminMessage = {
      id: Date.now(),
      type: 'admin',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    try {
      setMessagesList(prev => ({
        ...prev,
        [selectedSession]: [...(prev[selectedSession] || []), adminMessage]
      }));

      socketRef.current.emit('admin:message', {
        sessionId: selectedSession,
        message: inputValue.trim(),
        adminName: 'Support Team',
      });

      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    try {
      setDeletingSessionId(sessionId);

      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to close session');
      }

      console.log('Chat session deleted:', sessionId);

      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      setMessagesList(prev => {
        const newList = { ...prev };
        delete newList[sessionId];
        return newList;
      });

      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setShowSessionsList(true);
      }

      socketRef.current.emit('admin:close-session', {
        sessionId,
      });

      toast.success('Chat session closed and data deleted');
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Failed to close session');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const selectedSessionData = sessions.find(s => s.sessionId === selectedSession);
  const currentMessages = selectedSession ? (messagesList[selectedSession] || []) : [];

  return (
    <div className="flex flex-col lg:flex-row h-[500px] sm:h-[600px] lg:h-[700px] bg-white dark:bg-zinc-900 rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
      
      {/* Sessions List - Responsive */}
      <div className={`
        ${showSessionsList ? 'flex' : 'hidden lg:flex'}
        w-full lg:w-80 xl:w-96
        border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-zinc-700
        flex-col bg-gray-50 dark:bg-zinc-950
      `}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
              <FiMessageSquare className="text-blue-600 dark:text-blue-400" size={18} />
              Support Requests
            </h3>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
              {sessions.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {sessions.filter(s => s.status === 'active').length} active chats
          </p>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center">
              <FiMessageSquare size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No support requests yet</p>
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => handleSelectSession(session.sessionId)}
                className={`
                  w-full text-left p-3 sm:p-4 border-b border-gray-200 dark:border-zinc-800
                  transition-colors duration-200
                  hover:bg-gray-100 dark:hover:bg-zinc-800
                  ${selectedSession === session.sessionId
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-600'
                    : ''
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-blue-600 dark:text-blue-400" size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {session.userName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {session.userEmail}
                        </p>
                      </div>
                    </div>
                    
                    {session.lastMessage && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2 ml-10">
                        {session.lastMessage}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 ml-10">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <FiClock size={12} />
                        {formatTime(session.lastMessageTime || session.connectedAt)}
                      </div>
                      <span
                        className={`
                          px-2 py-0.5 text-xs font-semibold rounded-full
                          ${session.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : session.status === 'waiting'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }
                        `}
                      >
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Responsive */}
      <div className={`
        ${!showSessionsList || selectedSession ? 'flex' : 'hidden lg:flex'}
        flex-1 flex-col min-w-0
      `}>
        {selectedSessionData ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex justify-between items-center gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Back button for mobile */}
                <button
                  onClick={handleBackToSessions}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                >
                  <FiChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-blue-600 dark:text-blue-400" size={16} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                    {selectedSessionData.userName}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {selectedSessionData.userEmail}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleCloseSession(selectedSessionData.sessionId)}
                disabled={deletingSessionId === selectedSessionData.sessionId}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title={deletingSessionId === selectedSessionData.sessionId ? "Closing chat..." : "Close and delete chat"}
              >
                {deletingSessionId === selectedSessionData.sessionId ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FiTrash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                )}
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50 dark:bg-zinc-950">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'admin' || msg.type === 'system' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] sm:max-w-xs md:max-w-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm
                      ${msg.type === 'admin'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                        : msg.type === 'system'
                        ? 'bg-gray-300 dark:bg-zinc-700 text-gray-900 dark:text-gray-300 text-xs italic px-3 py-1.5'
                        : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm border border-gray-200 dark:border-zinc-700'
                      }
                    `}
                  >
                    {msg.type !== 'system' && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {msg.type === 'user' ? msg.userName || 'User' : 'You'}
                      </p>
                    )}
                    <p className="break-words">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.type === 'admin'
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-zinc-800 dark:text-white text-sm transition-shadow"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <FiSend size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline text-sm font-medium">Send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 p-4">
            <div className="text-center">
              <FiMessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Select a support request to start chatting</p>
              <button
                onClick={() => setShowSessionsList(true)}
                className="lg:hidden mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}