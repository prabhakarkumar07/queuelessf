import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface ShopDto {
  id: string;
  slug: string;
  name: string;
  branchCode: string;
  category: string;
  city: string;
  active: boolean;
  verificationStatus: string;
  createdAt: string;
}

interface PageResponse {
  content: ShopDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export default function AdminShops() {
  const navigate = useNavigate();
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get('/api/internal/shops?size=50');
      setData(response.data);
    } catch (err) {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/admin/shops/${id}`);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Shops Directory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage and audit all registered businesses on the platform.</p>
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
              placeholder="Search by Shop Name, Slug, or Branch Code..."
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
                <th className="px-6 py-4 font-bold">Shop Info</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading directory...</td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No shops found.</td>
                </tr>
              ) : (
                data?.content.map(shop => (
                  <tr 
                    key={shop.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(shop.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {shop.name}
                            {shop.verificationStatus === 'VERIFIED' && <ShieldCheck size={14} className="text-blue-500" />}
                          </p>
                          <p className="text-xs font-mono text-slate-500 mt-0.5">{shop.slug} • {shop.branchCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-600">{shop.category.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {shop.city || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        shop.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {shop.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-end gap-1 w-full">
                        Audit <ArrowRight size={14} />
                      </button>
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
