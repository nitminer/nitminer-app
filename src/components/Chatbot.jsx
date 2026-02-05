'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '**Hello!** I\'m your **TrustInn assistant**. I can help you with information about our security analysis platform, pricing, tools, and more.\n\n**How can I assist you today?**' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const trustInnContext = `# TrustInn - Security Analysis Platform

## What We Offer
TrustInn provides 9 NASA-grade verification tools in one unified platform:

**C/C++ Tools:**
- CBMC (Condition Satisfiability Analysis)
- KLEEMA (DSE-based Mutation Analyzer)
- KLEE (Dynamic Symbolic Execution)
- TX (Pruned Dynamic Symbolic Execution)
- gMCov (Coverage Profiler)
- gMutant (Mutation Testing Profiler)

**Java Tools:**
- JBMC (Java Bounded Model Checker)

**Python Tools:**
- Python Analyzer (Condition Coverage with Fuzzing)

**Blockchain Tools:**
- VeriSol (Smart Contract Verifier)

## Pricing Plans

### Free Trial Plan
**Price:** Free
**Executions:** 5 executions (per tool)
**Duration:** 7 days
**Features:**
- Access to all 9 tools
- Basic visualizations (pie charts)
- Download results as ZIP
- Terminal output viewing
- Community support

### Starter Plan
**Price:** ₹499/month or ₹4,990/year
**Executions:** 50 monthly executions
**Duration:** 30 days
**Features:**
- Access to all 9 tools
- Interactive visualizations (pie + bar charts)
- Download results as ZIP
- Download as PDF
- Copy-to-clipboard functionality
- Dark mode UI
- Email support

### Professional Plan
**Price:** ₹2,499/month or ₹24,990/year
**Executions:** 500 monthly executions
**Duration:** 365 days
**Features:**
- Access to all 9 tools
- Advanced visualizations with comparisons
- Batch file upload (up to 10 files)
- Batch download all results
- HTML report generation
- Admin dashboard access (team view)
- 5 team member slots
- Email + chat support
- Priority processing queue
- 30-day results retention
- Custom tool parameters

### Enterprise Plan
**Price:** Custom pricing (starting at ₹9,999/month)
**Executions:** Unlimited
**Duration:** 365 days
**Features:**
- All Professional Plan features
- Full API access with webhooks
- CI/CD integration (GitHub, GitLab, Jenkins)
- Dedicated account manager
- 24/7 phone + email + chat support
- Custom integrations
- Unlimited team member slots
- Lifetime results retention
- Custom tool configurations
- On-premise deployment option
- SLA guarantee (99.9% uptime)
- White-label capability
- Training & onboarding

## Key Platform Features
- **Unified Web Dashboard:** Single interface for all 9 tools
- **One-Click Tool Execution:** Standardized results format
- **Real-Time Terminal Output:** Live execution feedback
- **Interactive Visualizations:** Charts and graphs for instant insights
- **Bulk File Processing:** Analyze multiple files simultaneously
- **Smart Download:** Export results as ZIP with all analysis data
- **Secure File Storage:** Cloud-based encrypted file management
- **API Integration:** Integrate with your CI/CD pipeline
- **Admin Analytics Dashboard:** Real-time platform metrics
- **Dark Mode Interface:** Modern, eye-friendly UI

## Special Offers
- **Student/Educational Plan:** ₹99/month (200 executions)
- **Open Source Contributor Plan:** Free (250 executions)
- **Annual Loyalty Discount:** Pay for 10 months, get 12 months

## Contact Information
- **Website:** https://trustinn.com
- **Sales Email:** sales@trustinn.com
- **Support Email:** support@trustinn.com
- **Phone:** +91-7013306805

## Company
**NITMiner Technologies Pvt Ltd**
- Pioneering innovation in Blockchain, AI, and Cloud Solutions
- Developing cutting-edge security analysis tools
- Location: India

## Vision & Mission
**Vision:** To revolutionize the blockchain ecosystem by becoming the leader in smart contract testing automation, ensuring security, efficiency, and trust in decentralized applications.

**Mission:** At NITMINER, we empower blockchain developers and enterprises by delivering cutting-edge automated testing solutions for smart contracts, enhancing reliability and performance through seamless, scalable, and highly secure testing processes.`;

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: `You are a TrustInn assistant. You ONLY answer questions about TrustInn's security analysis platform, products, pricing, tools, and services. 

STRICT RULES:
- If the question is NOT about TrustInn, politely say you can only help with TrustInn topics and redirect to asking about our platform
- Do NOT answer questions about other companies, social media, or unrelated topics
- Only use the provided TrustInn context to answer questions
- Be helpful and informative about TrustInn only

FORMATTING RULES (CRITICAL - ALWAYS FOLLOW):
- ALWAYS use proper Markdown formatting for ALL responses
- Use **bold text** for important terms, prices, plan names, and key information
- Use proper headings (##, ###) for sections and subsections
- Use bullet points (- or *) for feature lists
- Use numbered lists (1., 2., 3.) for steps or ordered information
- Add line breaks between sections for better readability
- Format prices with currency symbol: **₹499/month**
- Use > for important notes or callouts
- Never output plain unformatted text - always structure your response

EXAMPLE FORMATTING:
When asked about pricing, format like this:

## TrustInn Pricing Plans

### Free Trial Plan
**Price:** Free  
**Executions:** 5 executions  
**Duration:** 7 days

**Key Features:**
- Access to all 9 tools
- Basic visualizations
- Download results as ZIP

---

### Starter Plan
**Price:** ₹499/month or ₹4,990/year  
**Executions:** 50 monthly executions  
**Duration:** 30 days

**Key Features:**
- All 9 tools
- Interactive visualizations
- PDF downloads
- Email support

---

> **💡 Tip:** Annual plans save you 2 months free!

**Ready to get started?**
- Visit: **trustinn.com**
- Email: **sales@trustinn.com**
- Phone: **+91-7013306805**

TrustInn Context:
${trustInnContext}`
            },
            ...messages.slice(1),
            userMessage
          ],
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `API error: ${response.status}`);
      }
      
      let assistantContent = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        assistantContent = data.choices[0].message.content;
      } else if (data.choices && data.choices[0] && data.choices[0].text) {
        assistantContent = data.choices[0].text;
      } else if (data.content) {
        assistantContent = data.content;
      } else if (data.message) {
        assistantContent = data.message;
      } else {
        throw new Error('Unexpected response format from API');
      }
      
      const assistantMessage = { role: 'assistant', content: assistantContent };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: `**Sorry, I encountered an error:** ${error.message}\n\nPlease try again or contact support if the problem persists.\n\n**Support Email:** support@trustinn.com` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        /* Custom markdown styling for chatbot */
        .chatbot-markdown h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 900;
          font-size: 1.25rem;
          margin-top: 1rem;
          margin-bottom: 0.75rem;
          color: inherit;
        }
        
        .chatbot-markdown h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          margin-top: 0.875rem;
          margin-bottom: 0.5rem;
          color: inherit;
        }
        
        .chatbot-markdown strong {
          font-weight: 800;
          font-family: 'Space Grotesk', sans-serif;
        }
        
        .chatbot-markdown ul, .chatbot-markdown ol {
          margin-left: 1.25rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .chatbot-markdown li {
          margin-bottom: 0.375rem;
        }
        
        .chatbot-markdown p {
          margin-bottom: 0.75rem;
        }
        
        .chatbot-markdown blockquote {
          border-left: 3px solid #a855f7;
          padding-left: 0.75rem;
          margin: 0.75rem 0;
          font-style: italic;
          opacity: 0.9;
        }

        .chatbot-markdown a {
          color: #a855f7;
          font-weight: 600;
          hover: underline;
          transition: color 0.2s;
        }

        .chatbot-markdown a:hover {
          color: #d946ef;
          text-decoration: underline;
        }
        
        .chatbot-markdown hr {
          margin: 1rem 0;
          border: none;
          border-top: 2px solid rgba(0, 0, 0, 0.1);
        }
        
        .dark .chatbot-markdown hr {
          border-top-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      {/* Chatbot Toggle Button with Popup Animation */}
      <style>{`
        @keyframes buttonPopup {
          0%, 49%, 100% {
            transform: scale(0.7);
          }
          50%, 99% {
            transform: scale(0.8);
          }
        }
        
        .chatbot-button-popup {
          animation: buttonPopup 1s infinite;
        }
      `}</style>
      
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 z-50 hover:scale-110 chatbot-button-popup"
          aria-label="Open chat"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <FiMessageSquare size={28} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-gray-200 dark:border-zinc-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div>
              <h3 className="text-lg font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                TrustInn Assistant
              </h3>
              <p className="text-xs font-semibold opacity-90">Always here to help</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                aria-label="Minimize"
              >
                <FiMinimize2 size={20} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-black">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="text-sm font-medium leading-relaxed chatbot-markdown">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 bg-white dark:bg-zinc-900 border-t-2 border-gray-200 dark:border-zinc-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about TrustInn..."
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none dark:text-white font-medium border-2 border-gray-200 dark:border-zinc-700"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <FiSend size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}