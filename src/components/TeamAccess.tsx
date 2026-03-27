import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldAlert, UserPlus, Mail, Edit3, Trash2, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TeamMember {
  id: string;
  full_name: string;
  role: 'staff' | 'manager' | 'admin';
  avatar_url: string | null;
  email: string;
  created_at: string;
}

export default function TeamAccess() {
  const { role: currentUserRole } = useAuth();
  const isAdmin = currentUserRole === 'admin';
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_staff_with_emails');
      
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleDeleteMember = async () => {
    if (!selectedMember || !isAdmin) return;
    
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', selectedMember.id);
      
      if (error) throw error;
      
      setTeamMembers(prev => prev.filter(m => m.id !== selectedMember.id));
      setIsDeleteModalOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      alert('Error deleting member: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (newRole: 'staff' | 'manager' | 'admin') => {
    if (!selectedMember || !isAdmin) return;
    
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('staff')
        .update({ role: newRole })
        .eq('id', selectedMember.id);
      
      if (error) throw error;
      
      setTeamMembers(prev => prev.map(m => 
        m.id === selectedMember.id ? { ...m, role: newRole } : m
      ));
      setIsEditModalOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      alert('Error updating role: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team & Role Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage who has access to your system and what they can do.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 text-sm">
          Error: {error}
        </div>
      )}

      {/* Role Definitions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-gray-200 dark:border-gray-700 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-2">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Admin</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full access to dashboards, fleet, settings, and billing.</p>
        </div>
        <div className="p-6 text-center bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Manager</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Can manage bookings, view fleet, but restricted from system settings.</p>
        </div>
        <div className="p-6 text-center">
          <div className="flex justify-center mb-2">
            <Edit3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Staff</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Can manage bookings and basic inventory tasks.</p>
        </div>
      </div>

      {/* Team Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.full_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                        {member.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{member.full_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${member.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 
                      member.role === 'manager' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 
                      'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'}`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => {
                          setSelectedMember(member);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mx-2 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedMember(member);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Staff Role</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><X /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Update role for <span className="font-semibold text-gray-900 dark:text-white">{selectedMember.full_name}</span>
              </p>
              <div className="space-y-3">
                {(['staff', 'manager', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleUpdateRole(role)}
                    disabled={actionLoading}
                    className={`w-full text-left px-4 py-3 rounded-lg border flex items-center justify-between transition-all ${
                      selectedMember.role === role 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="capitalize font-medium">{role}</span>
                    {selectedMember.role === role && <Shield className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              {actionLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Modal */}
      {isDeleteModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-red-600">Remove Team Member</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><X /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to remove <span className="font-semibold text-gray-900 dark:text-white">{selectedMember.full_name}</span>? 
                This will revoke their access to the system. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <InviteMemberModal 
          onClose={() => setIsInviteModalOpen(false)} 
          onSuccess={() => {
            setIsInviteModalOpen(false);
            fetchTeamMembers();
          }}
        />
      )}
    </div>
  );
}

function InviteMemberModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'staff' | 'manager' | 'admin'>('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Since we can't easily use admin invite without an edge function reachable via client
      // We will try to call the edge function if it exists, otherwise we'll show an error
      // or implement a fallback which is to manually add them to staff if they exist in auth
      
      const { error } = await supabase.functions.invoke('invite-team-member', {
        body: { email, full_name: fullName, role }
      });

      if (error) {
        // Fallback: If edge function fails (not deployed), we'll inform the user
        // and offer to just add them to staff if they ALREADY have an account? 
        // No, let's keep it clean.
        throw new Error('Could not invite member. Edge function "invite-team-member" might not be deployed. Please use the Supabase Dashboard to invite users at this time.');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invite New Member</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><X /></button>
        </div>
        <form onSubmit={handleInvite} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
