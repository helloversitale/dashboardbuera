import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, User, Calendar, Info, Search, ShieldCheck, UserPlus, LogIn, LogOut, Trash2, Edit, Save } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action_type: string;
  staff_id: string;
  target_id: string | null;
  details: any;
  created_at: string;
  staff?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          staff:staff_id(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'SIGNED_IN': return <LogIn className="w-4 h-4 text-green-500" />;
      case 'SIGNED_OUT': return <LogOut className="w-4 h-4 text-red-500" />;
      case 'NEW_CLIENT_ADDED': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'CLIENT_ASSIGNED': return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      case 'BOOKING_CREATED': return <Save className="w-4 h-4 text-green-600" />;
      case 'BOOKING_UPDATED': return <Edit className="w-4 h-4 text-amber-500" />;
      case 'VEHICLE_ADDED': return <Activity className="w-4 h-4 text-indigo-500" />;
      case 'VEHICLE_DELETED': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'BLACKLIST_ADDED': return <User className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDetails = (log: AuditLog) => {
    const d = log.details;
    if (!d) return 'No details available';

    switch (log.action_type) {
      case 'SIGNED_IN':
        return 'Signed into the dashboard';
      case 'SIGNED_OUT':
        return 'Signed out of the system';
      case 'NEW_CLIENT_ADDED':
        return `Added new client: ${d.name || 'Unknown'} (${d.phone || 'No phone'})`;
      case 'CLIENT_ASSIGNED':
        return `Assigned client to staff member`;
      case 'BOOKING_CREATED':
        return `Created a new reservation`;
      case 'BOOKING_UPDATED':
        return `Updated booking status to ${d.status || 'unknown'}`;
      case 'VEHICLE_ADDED':
        return `Added new vehicle to fleet`;
      case 'VEHICLE_DELETED':
        return `Removed vehicle from active inventory`;
      case 'BLACKLIST_ADDED':
        return `Added person to blacklist`;
      default:
        return typeof d === 'string' ? d : JSON.stringify(d);
    }
  };

  const filteredLogs = logs.filter(log => {
      const staffName = log.staff?.full_name || '';
      const detailsStr = JSON.stringify(log.details || {});
      
      const matchesSearch = 
        staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detailsStr.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterAction === 'all' || log.action_type === filterAction;
      
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Activity Log
          </h2>
          <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
            Monitor all system activity for maximum supervision.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search & Filter */}
        <div className="col-span-full flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by staff name or details..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
            </div>
            <select 
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            >
                <option value="all">All Actions</option>
                <option value="SIGNED_IN">Sign Ins</option>
                <option value="SIGNED_OUT">Sign Outs</option>
                <option value="NEW_CLIENT_ADDED">New Clients</option>
                <option value="CLIENT_ASSIGNED">Assignments</option>
                <option value="BOOKING_CREATED">Bookings</option>
                <option value="BLACKLIST_ADDED">Blacklist Events</option>
            </select>
        </div>

        {/* Log List */}
        <div className="col-span-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Action</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Staff Member</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Details</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <p>Loading activity logs...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    No activity logs found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getActionIcon(log.action_type)}
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 italic">
                                                {getActionLabel(log.action_type)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {log.staff?.avatar_url ? (
                                                <img src={log.staff.avatar_url} className="w-7 h-7 rounded-full object-cover border border-gray-100 dark:border-gray-700" alt="" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{log.staff?.full_name || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            {formatDetails(log)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(log.created_at), 'PPPp')}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
