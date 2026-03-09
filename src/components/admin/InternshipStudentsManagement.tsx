'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiFilter, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface InternshipStudent {
  id: string;
  name: string;
  email: string;
  paymentId: string;
  amount: number;
  receiptUrl: string;
  date: string;
  internshipTitle: string;
  status: string;
}

export default function InternshipStudentsManagement({ refreshTrigger }: { refreshTrigger: number }) {
  const [students, setStudents] = useState<InternshipStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/internship-students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      } else {
        toast.error('Failed to fetch internship students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching internship students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  const handleViewReceipt = (receiptUrl: string) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    } else {
      toast.error('Receipt not available');
    }
  };

  const handleDownloadReceipt = (receiptUrl: string, studentName: string) => {
    if (receiptUrl) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `internship-receipt-${studentName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Receipt not available for download');
    }
  };

  const filteredStudents = students.filter(student => {
    // Safely handle potentially null/undefined values by falling back to an empty string
    const name = student.name?.toLowerCase() || '';
    const email = student.email?.toLowerCase() || '';
    const paymentId = student.paymentId?.toLowerCase() || '';
    const status = student.status?.toLowerCase() || '';
    
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) ||
                         email.includes(search) ||
                         paymentId.includes(search);

    const matchesStatus = filterStatus === 'all' || status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Payment ID', 'Amount', 'Date', 'Status'],
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        student.paymentId,
        student.amount,
        new Date(student.date).toLocaleDateString(),
        student.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'internship-students.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white font-heading">
              Internship Students
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and view internship program enrollments
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <FiDownload size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {students.length === 0 ? 'No internship students found' : 'No students match your filters'}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.paymentId}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{student.amount}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(student.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReceipt(student.receiptUrl)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        title="View Receipt"
                      >
                        <FiEye size={16} />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(student.receiptUrl, student.name)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1"
                        title="Download Receipt"
                      >
                        <FiDownload size={16} />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {/* Replace the Summary section at the bottom of your TSX */}
<div className="px-6 py-6 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-white/5">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Enrolled</p>
      <p className="text-2xl font-black text-[#3F3351] dark:text-white uppercase leading-none">
        {filteredStudents.length} <span className="text-xs text-slate-400 font-bold tracking-normal">Students</span>
      </p>
    </div>
    <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Net Revenue</p>
      <p className="text-2xl font-black text-[#3F3351] dark:text-white uppercase leading-none">
        ₹{students.reduce((sum, student) => sum + (student.amount || 0), 0).toLocaleString()}
      </p>
    </div>
  </div>
</div>
    </div>
  );
}