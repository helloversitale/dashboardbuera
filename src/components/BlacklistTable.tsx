import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserX, Search, Plus, Edit2, Trash2, Filter, Loader2, Phone, AlertCircle } from 'lucide-react';
import BlacklistForm from './BlacklistForm';

interface BlacklistedPerson {
  id: string;
  full_name: string;
  phone_number: string;
  reason?: string;
  created_at: string;
}

export default function BlacklistTable() {
  const [loading, setLoading] = useState(true);
  const [blacklist, setBlacklist] = useState<BlacklistedPerson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<BlacklistedPerson | null>(null);

  useEffect(() => {
    fetchBlacklist();
  }, []);

  async function fetchBlacklist() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blacklisted_persons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlacklist(data || []);
    } catch (error) {
      console.error('Error fetching blacklist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this person from the blacklist?')) return;
    try {
      const { error } = await supabase
        .from('blacklisted_persons')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchBlacklist();
    } catch (error) {
      console.error('Error deleting person from blacklist:', error);
      alert('Failed to delete person from blacklist');
    }
  }

  const filteredBlacklist = blacklist.filter(person => 
    person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone_number.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserX className="w-6 h-6 text-red-600" />
            Blacklist
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage restricted/blacklisted individuals</p>
        </div>
        <button
          onClick={() => { setSelectedPerson(null); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg shadow-red-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Blacklist Person</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Person Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Added On</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                      <span className="text-gray-500 dark:text-gray-400">Loading blacklist...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBlacklist.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>No persons found in blacklist</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBlacklist.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{person.full_name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            {person.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                          {person.reason || 'No reason provided'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(person.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedPerson(person); setIsFormOpen(true); }}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(person.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <BlacklistForm
          person={selectedPerson || undefined}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchBlacklist();
          }}
        />
      )}
    </div>
  );
}
