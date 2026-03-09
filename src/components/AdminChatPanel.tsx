'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { FiX, FiSend, FiPhone, FiPhoneOff } from 'react-icons/fi';

export default function AdminChatPanel() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [adminName] = useState('Support Team');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(window.location.origin, {
        transports: ['websocket', 'polling'],
      });

      // When connected, register as admin
      socketRef.current.on('connect', () => {
        console.log('✅ Admin Socket.IO connected:', socketRef.current.id);
        socketRef.current.emit('admin:register', {
          adminName,
        });
      });

      // Listen for new user requests
      socketRef.current.on('admin:user-request', (data) => {
        console.log('🔔 Received admin:user-request event:', data);
        toast.info(`New chat request from ${data.userName}`, {
          position: 'top-right',
          autoClose: 5000,
        });

        setActiveSessions(prev => {
          const exists = prev.find(s => s.sessionId === data.sessionId);
          if (!exists) {
            return [...prev, {
              sessionId: data.sessionId,
              userId: data.userId,
              userName: data.userName,
              userEmail: data.userEmail,
              status: 'waiting',
              connectedAt: new Date(),
            }];
          }
          return prev;
        });

        setMessages(prev => ({
          ...prev,
          [data.sessionId]: [{
            id: 1,
            type: 'system',
            text: `${data.userName} started a chat`,
            timestamp: new Date(),
          }]
        }));
      });

      // Listen for user messages
      socketRef.current.on('admin:user-message', (data) => {
        console.log('💬 Received admin:user-message event:', data);
        setMessages(prev => ({
          ...prev,
          [data.sessionId]: [
            ...(prev[data.sessionId] || []),
            {
              id: data.id,
              type: 'user',
              text: data.message,
              userName: data.userName,
              timestamp: new Date(data.timestamp),
            }
          ]
        }));
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Admin Socket.IO disconnected');
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [adminName]);

  // Auto-scroll to latest message in chat container only
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, selectedSession]);

  const handleConnectSession = (sessionId) => {
    socketRef.current.emit('admin:accept-session', {
      sessionId,
      adminName,
    });

    setActiveSessions(prev =>
      prev.map(s =>
        s.sessionId === sessionId
          ? { ...s, status: 'connected', connectedAt: new Date() }
          : s
      )
    );

    setSelectedSession(sessionId);
    toast.success('Connected to user');
  };

  const handleDisconnectSession = (sessionId) => {
    socketRef.current.emit('admin:disconnect-session', {
      sessionId,
    });

    setActiveSessions(prev =>
      prev.filter(s => s.sessionId !== sessionId)
    );

    if (selectedSession === sessionId) {
      setSelectedSession(null);
    }

    toast.info('Chat session closed');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedSession) return;

    const messageText = inputValue.trim();

    // Add to local messages
    setMessages(prev => ({
      ...prev,
      [selectedSession]: [
        ...(prev[selectedSession] || []),
        {
          id: Date.now(),
          type: 'admin',
          text: messageText,
          adminName,
          timestamp: new Date(),
        }
      ]
    }));

    // Send through Socket.IO
    socketRef.current.emit('admin:message', {
      sessionId: selectedSession,
      message: messageText,
      adminName,
    });

    setInputValue('');
  };

  const currentSessionMessages = messages[selectedSession] || [];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sessions List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Chat Sessions
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {activeSessions.length} active
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No active sessions</p>
            </div>
          ) : (
            activeSessions.map(session => (
              <div
                key={session.sessionId}
                onClick={() => setSelectedSession(session.sessionId)}
                className={`p-4 border-b dark:border-gray-700 cursor-pointer transition ${
                  selectedSession === session.sessionId
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {session.userName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.userEmail}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    session.status === 'connected'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {session.status === 'connected' ? 'Active' : 'Waiting'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedSession ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {activeSessions.find(s => s.sessionId === selectedSession)?.userName}
              </h3>
              <p className="text-xs text-gray-500">
                {activeSessions.find(s => s.sessionId === selectedSession)?.userEmail}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleConnectSession(selectedSession)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
              >
                <FiPhone className="w-4 h-4" />
                Connect
              </button>
              <button
                onClick={() => handleDisconnectSession(selectedSession)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
              >
                <FiPhoneOff className="w-4 h-4" />
                End
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {currentSessionMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              currentSessionMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-lg ${
                    msg.type === 'admin'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.type === 'system'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border dark:border-gray-700'
                  }`}>
                    {msg.adminName && (
                      <p className="text-xs font-bold mb-1">{msg.adminName}</p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-semibold">Select a session to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}
