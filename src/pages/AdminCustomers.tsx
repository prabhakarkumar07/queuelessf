import { useState, useEffect } from 'react';
import {
  Search,
  UserX,
  UserCheck,
  Smartphone,
  Mail,
  Filter
} from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface UserDto {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  active: boolean;
  createdAt: string;
}

interface PageResponse {
  content: UserDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export default function AdminCustomers() {
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/internal/users?size=50');
      setData(response.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await api.put(`/api/internal/users/${id}/toggle-status`);
      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Users Directory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage platform access for customers, staff, and admins.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="border-b border-slate-100 bg-slate-50/50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by Name, Phone, or Email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading directory...</td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                data?.content.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {user.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Smartphone size={14} className="text-slate-400" />
                          <span className="font-mono">{user.phone}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <Mail size={12} className="text-slate-400" />
                            {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        user.role === 'SHOP_OWNER' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        user.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {user.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <button 
                          onClick={() => toggleStatus(user.id, user.active)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                            user.active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {user.active ? <><UserX size={14} /> Suspend</> : <><UserCheck size={14} /> Activate</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 p-4 flex items-center justify-between text-sm text-slate-500">
          <span>Showing {data?.content.length || 0} of {data?.totalElements || 0} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
