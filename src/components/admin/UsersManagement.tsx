'use client';

import { useState, useEffect } from 'react';
import { 
  FiEdit, FiTrash2, FiPlus, FiSearch, FiUser, FiMail, 
  FiKey, FiChevronLeft, FiChevronRight, FiShield, FiX, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    paymentId: string;
  } | string;
  createdAt: string;
  isActive: boolean;
}

export default function UsersManagement({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  // --- STATES ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  // --- UI MODAL STATES ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', subscription: 'free' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/admin/users?page=${currentPage}&limit=${usersPerPage}&search=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      setError(error.message || 'Failed to sync user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [currentPage, searchTerm, refreshTrigger]);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      subscription: typeof user.subscription === 'object' ? user.subscription.plan : (user.subscription || 'free'),
    });
    setShowEditModal(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* --- TOP BAR: BENTO HEADER --- */}
      <div className="bg-white dark:bg-[#121214] rounded-[32px] p-8 border border-black/5 dark:border-white/5 shadow-sm mb-6 transition-colors duration-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-[#1A1A1A] dark:text-white uppercase tracking-tighter leading-none">
              Identity <span className="opacity-30">Vault.</span>
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">NITMINER Member Directory</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Find member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F4F4F1] dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#FFD95A] outline-none text-sm font-bold dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#1A1A1A] dark:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center shrink-0"
            >
              <FiPlus className="mr-2" size={16} /> New User
            </button>
          </div>
        </div>
      </div>

      {/* --- DIRECTORY TABLE --- */}
      <div className="flex-1 overflow-x-auto no-scrollbar">
        {error ? (
          <div className="bg-white dark:bg-[#121214] rounded-[40px] h-full flex flex-col items-center justify-center p-10 text-center">
            <FiAlertCircle size={48} className="text-red-500 mb-4" />
            <h4 className="text-xl font-black uppercase tracking-tighter">Connection Error</h4>
            <button onClick={fetchUsers} className="mt-4 px-8 py-3 bg-[#1A1A1A] text-white rounded-2xl font-black text-xs uppercase">Retry Sync</button>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-[#1A1A1A] dark:border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-y-4 px-2">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
                <th className="px-8 pb-2">User Identity</th>
                <th className="px-8 pb-2">Access Level</th>
                <th className="px-8 pb-2">Subscription</th>
                <th className="px-8 pb-2">Status</th>
                <th className="px-8 pb-2">Join Date</th>
                <th className="px-8 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="group bg-white dark:bg-[#121214] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm border border-black/5 dark:border-white/5">
                  <td className="px-8 py-5 first:rounded-l-[32px]">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#F4F4F1] dark:bg-white/5 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                        <FiUser className="text-[#1A1A1A] dark:text-white" size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase truncate">{user.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-indigo-500">
                    {user.role}
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-[#F4F4F1] dark:bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-[#1A1A1A] dark:text-gray-400 uppercase tracking-widest">
                      {typeof user.subscription === 'object' ? user.subscription.plan : (user.subscription || 'Free')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {user.isActive ? 'Live' : 'Locked'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 last:rounded-r-[32px] text-right">
                    <div className="flex justify-end gap-3">
                       <button onClick={() => openEditModal(user)} className="p-2.5 bg-gray-50 dark:bg-white/5 text-[#1A1A1A] dark:text-white rounded-xl hover:bg-[#FFD95A] hover:text-black transition-all"><FiEdit /></button>
                       <button onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }} className="p-2.5 bg-gray-50 dark:bg-white/5 text-[#1A1A1A] dark:text-white rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><FiKey /></button>
                       <button className="p-2.5 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between px-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Segment <span className="text-[#1A1A1A] dark:text-white">{currentPage}</span> / {totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#121214] rounded-full shadow-sm border border-black/5 dark:border-white/5 disabled:opacity-20 hover:scale-110 transition-all"><FiChevronLeft /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#121214] rounded-full shadow-sm border border-black/5 dark:border-white/5 disabled:opacity-20 hover:scale-110 transition-all"><FiChevronRight /></button>
          </div>
        </div>
      )}

      {/* --- MODAL SYSTEM --- */}
      {showAddModal && <Modal title="New Identity" onClose={() => setShowAddModal(false)} onSubmit={() => {}}>
        <div className="space-y-6">
            <Input label="Name" value={formData.name} />
            <Input label="Email" type="email" value={formData.email} />
            <div className="grid grid-cols-2 gap-4">
                <Select label="Role" options={[{v:'user', l:'User'}]} />
                <Select label="License" options={[{v:'free', l:'Free'}]} />
            </div>
            <button className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Authorize Member</button>
        </div>
      </Modal>}
    </div>
  );
}

// --- REUSABLE UI COMPONENTS ---
const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-black/20 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
    <div className="relative w-full max-w-lg bg-white dark:bg-[#121214] rounded-[40px] p-10 border border-black/5 dark:border-white/5 shadow-2xl transition-colors duration-500">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-3xl font-black text-[#1A1A1A] dark:text-white uppercase tracking-tighter">{title}</h3>
        <button onClick={onClose} className="p-3 bg-[#F4F4F1] dark:bg-white/5 rounded-full"><FiX /></button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ label, value, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} defaultValue={value} className="w-full px-6 py-4 bg-[#F4F4F1] dark:bg-white/5 border-none rounded-2xl outline-none text-sm font-bold dark:text-white" />
  </div>
);

const Select = ({ label, options }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select className="w-full px-6 py-4 bg-[#F4F4F1] dark:bg-white/5 border-none rounded-2xl outline-none text-sm font-bold dark:text-white">
      {options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);