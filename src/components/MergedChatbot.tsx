'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MessageSquare, X, ChevronLeft, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FiSend, FiPhone, FiClock, FiHeadphones, FiAlertCircle } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

// FAQ Data
const FAQ_DATA = [
  {
    section: 'What is TrustInn?',
    questions: [
      {
        q: 'What is TrustInn and what does it do?',
        a: 'TrustInn is a software verification and testing tool that uses advanced techniques like Dynamic Symbolic Execution (DSE), Bounded Model Checking, and Condition Coverage to mathematically verify that your code is safe and bug-free.'
      },
      {
        q: 'Why should I use TrustInn?',
        a: 'TrustInn finds bugs that traditional testing misses by exploring every possible execution path in your code mathematically. It\'s perfect for safety-critical systems where failures are not acceptable.'
      },
      {
        q: 'What programming languages does TrustInn support?',
        a: 'TrustInn supports C/C++, Java, and Python. Each language has specialized tools optimized for maximum code verification accuracy.'
      }
    ]
  },
  {
    section: 'Getting Started',
    questions: [
      {
        q: 'How do I get started with TrustInn?',
        a: 'Select your programming language (Java or Python), choose a verification tool, upload your code or write directly in the editor, and click Execute to analyze.'
      },
      {
        q: 'What file formats does TrustInn accept?',
        a: 'TrustInn accepts C/C++ source files (.c, .cpp), Java source files (.java), and Python scripts (.py) depending on your project type.'
      },
      {
        q: 'How long does analysis take?',
        a: 'Simple programs typically complete in seconds to minutes. Complex safety-critical systems may take hours. Most analyses run in the background while you work.'
      }
    ]
  }
];

interface Message {
  id: number;
  type: 'user' | 'agent' | 'system' | 'typing';
  text: string;
  agentName?: string;
  timestamp: Date;
}

export default function MergedChatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'faq' | 'live'>('faq');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentTimeout, setAgentTimeout] = useState(false);
  const [agentTimeoutMessage, setAgentTimeoutMessage] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter FAQ based on search
  const filteredFAQ = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_DATA;
    
    const query = searchQuery.toLowerCase();
    return FAQ_DATA.map(category => ({
      ...category,
      questions: category.questions.filter(q => 
        q.q.toLowerCase().includes(query) || 
        q.a.toLowerCase().includes(query)
      )
    })).filter(category => category.questions.length > 0);
  }, [searchQuery]);

  // Initialize Socket.IO when opening live chat
  useEffect(() => {
    if (mode === 'live' && !socketRef.current) {
      const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);
      
      socketRef.current = io(window.location.origin, {
        transports: ['websocket', 'polling'],
      });

      // Listen for agent connection
      socketRef.current.on('agent:connected', (data) => {
        setAgentConnected(true);
        setAgentName(data.agentName || 'Support Agent');
        setAgentTimeoutMessage(false);
        
        // Clear timeout if agent connected
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        toast.success(`Support Team has joined the chat`, {
          position: 'bottom-right',
          autoClose: 5000,
        });
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          text: `${data.agentName || 'Support Agent'} has connected`,
          timestamp: new Date()
        }]);
      });

      // Listen for incoming messages from agent
      socketRef.current.on('agent:message', (data) => {
        if (data.sessionId === sessionIdRef.current && data.sender === 'admin') {
          if (!agentConnected) {
            setAgentConnected(true);
            setAgentName('Support Team');
            setAgentTimeoutMessage(false);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }
          
          setMessages(prev => [...prev, {
            id: data.id,
            type: 'agent',
            text: data.message,
            agentName: data.agentName || 'Support Team',
            timestamp: new Date(data.timestamp)
          }]);
        }
      });

      // Listen for agent disconnection
      socketRef.current.on('agent:disconnected', () => {
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
    }

    return () => {
      if (socketRef.current && mode !== 'live') {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [mode, agentConnected]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRequestAgent = async () => {
    setLoading(true);
    setAgentTimeout(false);
    setAgentTimeoutMessage(false);
    setChatOpen(true);
    
    const userId = session?.user?.id || 'guest-' + Date.now();
    const userEmail = session?.user?.email || 'guest@example.com';
    const userName = session?.user?.name || 'Guest User';
    const currentSessionId = sessionIdRef.current;
    
    try {
      // Create chat session
      await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          userId,
          userEmail,
          userName,
        }),
      });

      // Emit connection request
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

      toast.info('Support team notified. Waiting for response...', {
        position: 'bottom-right',
        autoClose: 5000,
      });

      // Set 5-minute (300 seconds) timeout for agent connection
      timeoutRef.current = setTimeout(() => {
        if (!agentConnected) {
          setAgentTimeout(true);
          setAgentTimeoutMessage(true);
          toast.error('All agents are busy. Please try again later.', {
            position: 'bottom-right',
            autoClose: 5000,
          });
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            text: '⏱️ Our support team is currently busy. Please try again in a few moments.',
            timestamp: new Date()
          }]);
        }
      }, 5 * 60 * 1000); // 5 minutes

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
    
    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      text: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    socketRef.current.emit('user:message', {
      sessionId: sessionIdRef.current,
      message: messageText,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
    });

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

  const switchToLiveChat = () => {
    setMode('live');
    setSelectedQuestion(null);
    setSearchQuery('');
  };

  const switchToFAQ = () => {
    setMode('faq');
    setMessages([]);
    setAgentConnected(false);
    setAgentTimeout(false);
    setAgentTimeoutMessage(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-4 rounded-full shadow-2xl text-white hover:scale-110 transition-all flex items-center gap-2"
        >
          <MessageSquare size={24} />
          <span className="font-bold pr-1 text-sm">Chat</span>
        </button>
      ) : (
        <div className="bg-white w-96 max-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <MessageSquare size={22} />
              <div>
                <h3 className="font-bold text-sm">
                  {mode === 'faq' ? 'TrustInn Help Center' : 'Live Support'}
                </h3>
                {mode === 'live' && (
                  <p className="text-xs">
                    {agentConnected ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        {agentName} is online
                      </span>
                    ) : agentTimeoutMessage ? (
                      <span className="flex items-center gap-1 text-yellow-200">
                        <FiAlertCircle className="w-3 h-3" />
                        Agents are busy
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        Waiting for agent...
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={() => { 
                setIsOpen(false); 
                setSelectedQuestion(null);
                if (mode === 'live' && timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
              }} 
              className="hover:bg-white/10 p-1.5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* MODE TOGGLER */}
          <div className="flex border-b bg-gray-50 p-2">
            <button
              onClick={switchToFAQ}
              className={`flex-1 py-2 text-xs font-bold transition-all rounded ${
                mode === 'faq' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              📚 FAQ
            </button>
            <button
              onClick={switchToLiveChat}
              className={`flex-1 py-2 text-xs font-bold transition-all rounded ${
                mode === 'live' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              👤 Live Agent
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-4">
            {mode === 'faq' ? (
              <>
                {/* Search Bar */}
                {!selectedQuestion && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* FAQ Content */}
                {selectedQuestion ? (
                  <div className="space-y-4">
                    <button 
                      onClick={() => setSelectedQuestion(null)}
                      className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <h2 className="text-base font-bold text-gray-800 mb-3">{selectedQuestion.q}</h2>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedQuestion.a}</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700"><strong>💡 Need more help?</strong> Connect with a live agent for personalized assistance.</p>
                    </div>

                    <button
                      onClick={switchToLiveChat}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <FiHeadphones className="w-4 h-4" />
                      Talk to an Agent
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFAQ.map((category) => (
                      <div key={category.section} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedSection(expandedSection === category.section ? null : category.section)}
                          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                        >
                          <span className="font-semibold text-sm text-gray-800">{category.section}</span>
                          {expandedSection === category.section ? 
                            <ChevronUp size={18} className="text-blue-600" /> : 
                            <ChevronDown size={18} className="text-gray-600" />
                          }
                        </button>

                        {expandedSection === category.section && (
                          <div className="bg-white border-t border-gray-200">
                            {category.questions.map((question, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedQuestion(question)}
                                className="w-full text-left p-3 border-b border-gray-100 hover:bg-blue-50 transition-colors last:border-0 group"
                              >
                                <p className="text-xs font-medium text-gray-800 leading-relaxed group-hover:text-blue-600">
                                  {question.q}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {filteredFAQ.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">No questions found. Try different keywords.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // LIVE CHAT MODE
              <>
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <FiHeadphones className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium">Welcome to Live Support!</p>
                    <p className="text-xs mt-2">Click "Connect Agent" below to chat with our team</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : msg.type === 'system'
                          ? 'bg-gray-100 text-gray-600 text-xs'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
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
              </>
            )}
          </div>

          {/* FOOTER - Live Chat Input */}
          {mode === 'live' && (
            <>
              {agentTimeoutMessage ? (
                <div className="border-t bg-yellow-50 p-4">
                  <div className="flex gap-3 items-start">
                    <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-800">Our agents are busy</p>
                      <p className="text-xs text-yellow-700 mt-1">Please try again later or check our FAQ for quick answers.</p>
                    </div>
                  </div>
                  <button
                    onClick={switchToFAQ}
                    className="w-full mt-3 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-bold py-2 px-4 rounded-lg transition text-sm"
                  >
                    Back to FAQ
                  </button>
                </div>
              ) : agentConnected ? (
                <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:border-blue-500"
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
                <div className="border-t p-4">
                  <button
                    onClick={handleRequestAgent}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <FiPhone className="w-4 h-4" />
                    {loading ? 'Connecting...' : 'Connect to Agent'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
