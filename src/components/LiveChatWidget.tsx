'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { FiMessageSquare, FiX, FiSend, FiPhone, FiClock, FiHeadphones } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

export default function LiveChatWidget() {
  const { data: session } = useSession();
  const [chatOpen, setChatOpen] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [agentName, setAgentName] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(''); // Use ref for consistent sessionId

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!socketRef.current) {
      // Generate unique session ID for this chat (store in ref and state)
      const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);
      
      socketRef.current = io(window.location.origin, {
        transports: ['websocket', 'polling'],
      });

      console.log('🔗 User Socket.IO instance created, sessionId:', newSessionId);

      // Log connection status
      socketRef.current.on('connect', () => {
        console.log('✅ User Socket.IO connected:', socketRef.current.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ User Socket.IO disconnected');
      });

      // Listen for agent connection
      socketRef.current.on('agent:connected', (data) => {
        console.log('✅ Agent connected event received:', data);
        setAgentConnected(true);
        setAgentName(data.agentName || 'Support Agent');
        
        // Show toast notification
        toast.success(`Support Team has joined the chat`, {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Add system message
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          text: `${data.agentName || 'Support Agent'} has connected`,
          timestamp: new Date()
        }]);
      });

      // Listen for incoming messages from agent
      socketRef.current.on('agent:message', (data) => {
        console.log('💬 Agent message received:', data);
        console.log('📋 Comparing sessionIds - Data:', data.sessionId, 'Local:', sessionIdRef.current, 'Match:', data.sessionId === sessionIdRef.current);
        
        // Only add messages from admin, not user's own messages echoed back
        if (data.sessionId === sessionIdRef.current && data.sender === 'admin') {
          console.log('✅ Admin message - adding to chat');
          
          // Auto-enable agent connected when first message is received
          if (!agentConnected) {
            console.log('🟢 First message received - enabling input');
            setAgentConnected(true);
            setAgentName('Support Team');
          }
          
          setMessages(prev => [...prev, {
            id: data.id,
            type: 'agent',
            text: data.message,
            agentName: data.agentName || 'Support Team',
            timestamp: new Date(data.timestamp)
          }]);
        } else if (data.sessionId === sessionIdRef.current && data.sender === 'user') {
          console.log('👤 User message echo - ignoring (already added locally)');
        } else {
          console.warn('❌ SessionId mismatch - message ignored');
        }
      });

      // Listen for agent disconnection
      socketRef.current.on('agent:disconnected', () => {
        console.log('❌ Agent disconnected');
        setAgentConnected(false);
        toast.warning('Support agent has disconnected', {
          position: 'bottom-right',
          autoClose: 5000,
        });
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          text: 'Support agent has disconnected',
          timestamp: new Date()
        }]);
      });

      // Listen for typing indicator
      socketRef.current.on('agent:typing', () => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'typing',
          text: 'Support agent is typing...',
          timestamp: new Date()
        }]);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRequestAgent = async () => {
    setLoading(true);
    setChatOpen(true);
    
    // Use session data or fallback to defaults
    const userId = session?.user?.id || 'guest-' + Date.now();
    const userEmail = session?.user?.email || 'guest@example.com';
    const userName = session?.user?.name || 'Guest User';
    
    // Use ref for consistent sessionId
    const currentSessionId = sessionIdRef.current;
    
    try {
      // First, create the chat session in the database
      console.log('📝 Creating chat session in database...');
      const createSessionResponse = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          userId,
          userEmail,
          userName,
        }),
      });

      if (!createSessionResponse.ok) {
        console.warn('⚠️ Failed to create session in DB, but continuing:', await createSessionResponse.text());
      } else {
        const sessionData = await createSessionResponse.json();
        console.log('✅ Chat session created:', sessionData);
      }

      console.log('📤 Emitting user:request-agent with:', {
        sessionId: currentSessionId,
        userId,
        userEmail,
        userName,
      });
      
      // Emit event to connect to an available agent
      socketRef.current.emit('user:request-agent', {
        sessionId: currentSessionId,
        userId,
        userEmail,
        userName,
      });

      // Add welcome message
      setMessages([{
        id: 1,
        type: 'system',
        text: 'Connecting you with a support agent...',
        timestamp: new Date()
      }]);

      // Show notification with proper positioning
      toast.info('Support team notified. Waiting for response...', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error requesting agent:', error);
      toast.error('Failed to connect to support');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Send message through Socket.IO
    socketRef.current.emit('user:message', {
      sessionId: sessionIdRef.current,
      message: messageText,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
    });

    // Save message to database
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: messageText,
          sender: 'user',
          userId: session?.user?.id,
        })
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-30 left-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col h-[600px] z-40">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div>
              <h3 className="font-bold">Live Support</h3>
              <p className="text-xs">
                {agentConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {agentName} is online
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    Waiting for agent...
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="hover:bg-white/20 p-1 rounded"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-sm">Welcome to Live Support!</p>
                <p className="text-xs mt-2">Click "Connect Agent" to chat with our team</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' || msg.type === 'typing' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.type === 'system'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs'
                      : msg.type === 'typing'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs italic'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                  }`}>
                    {msg.agentName && (
                      <p className="text-xs font-bold mb-1">{msg.agentName}</p>
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

          {/* Input Area */}
          {agentConnected ? (
            <form onSubmit={handleSendMessage} className="border-t dark:border-gray-700 p-4 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="border-t dark:border-gray-700 p-4">
              <button
                onClick={handleRequestAgent}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <FiPhone className="w-4 h-4" />
                {loading ? 'Connecting...' : 'Connect to Agent'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition z-40"
        title="Open live support chat"
      >
        <FiHeadphones className="w-6 h-6" />
        {agentConnected && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
        )}
      </button>
    </>
  );
}
