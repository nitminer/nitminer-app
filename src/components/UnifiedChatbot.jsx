'use client';

import { useState, useRef, useEffect } from 'react';
import { FiHelpCircle, FiX, FiSend, FiMinimize2, FiPhone, FiClock, FiAlertCircle, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { io } from 'socket.io-client';

const FAQ_DATA = [
  {
    id: 1,
    question: 'What is NitMiner?',
    answer: 'NitMiner is an innovation hub incubated at NIT Warangal (NITW). We specialize in Blockchain development, Artificial Intelligence/Machine Learning, and Software Solutions. We bridge academic research with industrial applications through cutting-edge technology and sustainable innovation.'
  },
  {
    id: 2,
    question: 'What are your main areas of expertise?',
    answer: 'Our core expertise includes:\n\n- Blockchain development and Web3 consulting\n- Smart contract auditing and security\n- AI/ML solutions and data analytics\n- Code verification tools (C, Java, Python, Solidity)\n- Mobile app development\n- Full-stack web development\n- Cloud solutions'
  },
  {
    id: 3,
    question: 'What tools does NitMiner offer?',
    answer: 'We provide research-based tools for code and smart contract verification including:\n\n- C/Java verification tools with bounded model checking\n- Solidity smart contract verification (VeriSol)\n- Condition coverage and fuzzing tools\n- Mutation testing frameworks\n- Comprehensive analysis and reporting\n\nTools support execution-based plans with varying limits.'
  },
  {
    id: 4,
    question: 'What are your pricing plans?',
    answer: 'NitMiner offers three main pricing tiers:\n\n- Free: ₹0 - 5 executions (free trial)\n- 1 Year: ₹5000 - Unlimited executions\n- 2 Years: ₹10000 - Unlimited executions\n\nEach plan includes storage and support. Contact us for enterprise custom pricing.'
  },
  {
    id: 5,
    question: 'Do you offer paid internships?',
    answer: 'Yes! NitMiner offers paid internship programs for students interested in Blockchain, AI/ML, and Software Development. We provide hands-on experience, mentorship, and competitive compensation. Check our "Paid Internships" page or contact us for current openings and application details.'
  },
  {
    id: 6,
    question: 'How do I get started with NitMiner tools?',
    answer: 'Simply sign up for our Free Trial plan to get started:\n\n1. Create an account on our platform\n2. Access the tools dashboard\n3. Choose your programming language (C, Java, Python, Solidity)\n4. Upload your code or smart contracts\n5. Run verification and analysis\n6. Download detailed reports\n\nNo credit card required for the free trial!'
  },
  {
    id: 7,
    question: 'Can I upgrade my plan anytime?',
    answer: 'Yes! You can upgrade your plan anytime from your account dashboard. Upgrades take effect immediately. We also offer flexible billing periods (monthly, yearly, and 2-year options) to suit your needs.'
  },
  {
    id: 8,
    question: 'What services does NitMiner provide to enterprises?',
    answer: 'For enterprises, we offer custom solutions including:\n\n- Custom blockchain development\n- Smart contract security audits\n- API development and integration\n- AI/ML model development\n- Full-stack application development\n- Web3 and DeFi consulting\n- Technical support and maintenance\n\nContact our team for personalized enterprise solutions.'
  },
  {
    id: 9,
    question: 'How can I contact NitMiner support?',
    answer: 'You can reach our support team through:\n\n- Email: sanghu@nitw.ac.in\n- Phone: +91-7013306805\n- Live Agent Chat: Use the "Live Agent" option above\n- Contact Form: Visit our Contact page\n\nWe respond during business hours.'
  },
  {
    id: 10,
    question: 'Does NitMiner hire for permanent positions?',
    answer: 'Yes! NitMiner regularly hires talented software developers, blockchain engineers, AI/ML specialists, and technical consultants. Visit our Careers page to see current openings, or contact us with your resume and experience. We value innovation and excellence in our team.'
  },
  {
    id: 11,
    question: 'What research does NitMiner focus on?',
    answer: 'NitMiner has published 100+ research papers and holds 30+ patents in areas including:\n\n- Blockchain and cryptography\n- Smart contract verification\n- AI/ML applications\n- Code analysis and verification\n- Mining optimization\n- Sustainable technology solutions\n\nOur research section showcases our publications.'
  },
  {
    id: 12,
    question: 'What payment methods do you accept?',
    answer: 'We accept multiple payment methods including:\n\n- Credit cards (Visa, Mastercard, Amex)\n- Debit cards\n- UPI and digital wallets\n- Bank transfers\n\nAll payments are processed securely through Razorpay. Invoices are generated immediately after successful payment.'
  }
];


export default function UnifiedChatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('faq'); // 'faq' or 'live'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentTimeout, setAgentTimeout] = useState(false);
  const [requestingAgent, setRequestingAgent] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const sessionIdRef = useRef('');
  const agentTimeoutRef = useRef(null);

  // Initialize Socket.IO for live chat
  useEffect(() => {
    if (!socketRef.current && typeof window !== 'undefined') {
      const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionIdRef.current = newSessionId;

      socketRef.current = io(window.location.origin, {
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('agent:connected', (data) => {
        setAgentConnected(true);
        setAgentName(data.agentName || 'Support Agent');
        clearTimeout(agentTimeoutRef.current);
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          text: `✅ ${data.agentName || 'Support Agent'} has joined the chat`,
          timestamp: new Date()
        }]);
      });

      socketRef.current.on('agent:message', (data) => {
        if (data.sessionId === sessionIdRef.current && data.sender === 'admin') {
          setMessages(prev => [...prev, {
            id: data.id,
            type: 'agent',
            text: data.message,
            agentName: data.agentName || 'Support Team',
            timestamp: new Date(data.timestamp)
          }]);
        }
      });

      socketRef.current.on('agent:disconnected', () => {
        setAgentConnected(false);
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          text: '❌ Agent has disconnected',
          timestamp: new Date()
        }]);
      });
    }

    return () => {
      if (agentTimeoutRef.current) {
        clearTimeout(agentTimeoutRef.current);
      }
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const requestAgent = async () => {
    setRequestingAgent(true);
    setMode('live');
    setAgentTimeout(false);
    
    try {
      const userId = session?.user?.id || 'anonymous';
      const userEmail = session?.user?.email || '';
      const userName = session?.user?.name || 'Guest';

      // Create chat session
      await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId,
          userEmail,
          userName,
        }),
      }).catch(() => {});

      // Request agent
      socketRef.current?.emit('user:request-agent', {
        sessionId: sessionIdRef.current,
        userId,
        userEmail,
        userName,
      });

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        text: '🔄 Connecting you with a support agent...',
        timestamp: new Date()
      }]);

      // Set 5-minute timeout
      agentTimeoutRef.current = setTimeout(() => {
        if (!agentConnected) {
          setAgentTimeout(true);
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            text: '⏱️ Our agents are currently busy. Please try again later or use the AI Assistant.',
            timestamp: new Date()
          }]);
        }
      }, 5 * 60 * 1000); // 5 minutes
    } catch (error) {
      console.error('Error requesting agent:', error);
    } finally {
      setRequestingAgent(false);
    }
  };

  const selectFAQ = (faq) => {
    setSelectedFAQ(faq.id);
    setMessages([{
      id: faq.id,
      type: 'faq',
      question: faq.question,
      answer: faq.answer,
      timestamp: new Date()
    }]);
  };

  const sendLiveMessage = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue;
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date()
    }]);
    setInputValue('');

    socketRef.current?.emit('user:message', {
      sessionId: sessionIdRef.current,
      message: messageText,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
    });

    // Save to DB
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
      }).catch(() => {});
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = () => {
    sendLiveMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 z-50 hover:scale-110"
          aria-label="Open chat"
        >
          <FiHelpCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[650px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-blue-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {mode === 'faq' ? (
                    <>
                      <FiHelpCircle className="w-5 h-5" />
                      FAQ
                    </>
                  ) : (
                    <>
                      <FiPhone className="w-5 h-5" />
                      Live Support
                    </>
                  )}
                </h3>
                <p className="text-xs font-semibold opacity-90">
                  {mode === 'live' && agentConnected && (
                    <span className="flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      {agentName} is online
                    </span>
                  )}
                  {mode === 'live' && !agentConnected && !agentTimeout && (
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3 animate-spin" />
                      Waiting for agent...
                    </span>
                  )}
                  {agentTimeout && (
                    <span className="flex items-center gap-1 text-yellow-300">
                      <FiAlertCircle className="w-3 h-3" />
                      Agents are busy
                    </span>
                  )}
                  {mode === 'faq' && 'Browse common questions'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => { setMode('faq'); setAgentTimeout(false); setSelectedFAQ(null); setMessages([]); }}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  mode === 'faq' ? 'bg-white/25' : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <FiHelpCircle className="w-4 h-4" />
                FAQ
              </button>
              <button
                onClick={requestAgent}
                disabled={requestingAgent || agentConnected}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  mode === 'live' ? 'bg-white/25' : 'bg-white/10 hover:bg-white/15'
                } disabled:opacity-50`}
              >
                <FiPhone className="w-4 h-4" />
                Live Agent
              </button>
            </div>
          </div>

          {/* Messages / Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50">
            {mode === 'faq' ? (
              <>
                {/* FAQ Mode */}
                {selectedFAQ === null ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-semibold mb-4">Select a question below:</p>
                    {FAQ_DATA.map((faq) => (
                      <button
                        key={faq.id}
                        onClick={() => selectFAQ(faq)}
                        className="w-full text-left p-3 bg-white rounded-xl hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 transition-all flex items-start justify-between gap-3 group"
                      >
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{faq.question}</span>
                        <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedFAQ(null)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 mb-2"
                    >
                      ← Back to Questions
                    </button>
                    {messages.map((msg, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border-2 border-blue-200">
                        <h3 className="font-bold text-blue-600 text-sm mb-2">{msg.question}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Live Chat Mode */}
                {messages.map((message, idx) => {
                  if (message.type === 'system') {
                    return (
                      <div key={idx} className="flex justify-center">
                        <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-full">
                          {message.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl shadow-md ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        {message.agentName && (
                          <p className="text-xs font-bold mb-2 opacity-75">{message.agentName}</p>
                        )}
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 bg-white border-t-2 border-gray-200">
            {agentTimeout && mode === 'live' ? (
              <button
                onClick={() => { setMode('faq'); setSelectedFAQ(null); setMessages([]); }}
                className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FiAlertCircle className="w-5 h-5" />
                Back to FAQ
              </button>
            ) : (
              <>
                {mode === 'live' && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none text-gray-900 font-medium border-2 border-gray-200"
                      disabled={!agentConnected && !agentTimeout}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || (!agentConnected && !agentTimeout)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Send message"
                    >
                      <FiSend size={22} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
    </>
  );
}
