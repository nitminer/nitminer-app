'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { FiSearch, FiFilter, FiClock, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import { toast } from '@/lib/toast';
import { useSocket } from '@/hooks/useSocket';

interface RefundRequest {
  _id: string;
  userEmail: string;
  paymentId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RefundChat {
  _id: string;
  refundRequestId: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  message: string;
  read: boolean;
  createdAt: string;
}



export default function RefundRequestsManagement() {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket(session?.user?.email);
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RefundRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [messages, setMessages] = useState<RefundChat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch refund requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoadingRequests(true);
        const response = await fetch('/api/refund-requests?role=admin', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }

        const data = await response.json();
        setRequests(data.data || []);
        setFilteredRequests(data.data || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load refund requests');
      } finally {
        setLoadingRequests(false);
      }
    };

    if (session?.user?.email) {
      fetchRequests();
      
      // Join Socket.io for real-time updates
      if (isConnected && socket) {
        socket.emit('join', session.user.email);
      }
    }
  }, [session?.user?.email, isConnected, socket]);

  // Fetch messages for selected request
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedRequest) return;

      try {
        setLoadingMessages(true);
        const response = await fetch(`/api/refunds/${selectedRequest._id}/chat`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.data || []);
        setAdminNotes(selectedRequest.adminNotes || '');
        setTimeout(() => scrollToBottom(), 100);
        
        // Join refund room for real-time updates
        if (isConnected && socket) {
          socket.emit('refund:join', selectedRequest._id);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedRequest, isConnected, socket]);

  // Listen for real-time messages
  useEffect(() => {
    if (!isConnected || !socket || !selectedRequest) return;

    const handleNewMessage = (data: RefundChat) => {
      if (data.refundRequestId === selectedRequest._id) {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      }
    };

    socket.on('refund:message', handleNewMessage);
    return () => {
      socket.off('refund:message', handleNewMessage);
    };
  }, [isConnected, socket, selectedRequest?._id]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) {
      toast.error('Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch(`/api/refunds/${selectedRequest._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages([...messages, data.data]);
      setNewMessage('');
      toast.success('Message sent successfully!');
      
      // Emit via Socket.io
      if (socket) {
        socket.emit('refund:chat', {
          refundRequestId: selectedRequest._id,
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

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setProcessingRequest(true);
    try {
      const response = await fetch(`/api/refund-requests/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      const data = await response.json();
      const updated = data.data;

      setRequests(
        requests.map((req) => (req._id === selectedRequest._id ? updated : req))
      );
      setSelectedRequest(updated);
      toast.success(`Request ${newStatus}!`);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setProcessingRequest(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-yellow-600 dark:text-yellow-400" />;
      case 'approved':
      case 'completed':
        return <FiCheckCircle className="text-green-600 dark:text-green-400" />;
      case 'rejected':
        return <FiXCircle className="text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Refund Requests</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage refund requests from premium users
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FiFilter size={16} /> Status
              </p>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loadingRequests ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading refund requests...
              </div>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <button
                  key={request._id}
                  onClick={() => setSelectedRequest(request)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedRequest?._id === request._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        ₹{(request.amount / 100).toLocaleString()}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {request.userEmail}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                        {request.reason}
                      </p>
                    </div>
                    <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No requests found
              </div>
            )}
          </div>
        </div>

        {/* Chat and Details Panel */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col">
              {/* Header */}
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.userEmail}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{(selectedRequest.amount / 100).toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Reason */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Refund Reason:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRequest.reason}</p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                {loadingMessages ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading messages...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.senderEmail === session?.user?.email ? 'justify-end' : 'justify-start'
                      }`}
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
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {/* Admin Notes */}
                {selectedRequest.status !== 'rejected' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Admin Notes:
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      disabled={processingRequest}
                      placeholder="Add internal notes..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sendingMessage}
                    placeholder="Write a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>

                {/* Status Buttons */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus('approved')}
                      disabled={processingRequest}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {processingRequest ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('rejected')}
                      disabled={processingRequest}
                      className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {processingRequest ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center h-full">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Select a refund request to view details and chat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
