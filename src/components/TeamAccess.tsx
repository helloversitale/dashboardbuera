import { useState } from 'react';
import { Shield, ShieldAlert, UserPlus, Mail, Edit3, Trash2 } from 'lucide-react';

export default function TeamAccess() {
  const [teamMembers] = useState([
    { id: 1, name: 'Alex Manager', email: 'alex@quickrental.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sam Frontdesk', email: 'sam@quickrental.com', role: 'Staff', status: 'Active' },
    { id: 3, name: 'Jordan Mechanic', email: 'jordan@quickrental.com', role: 'Mechanic', status: 'Offline' },
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team & Role Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage who has access to your system and what they can do.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Role Cards */}
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
          <h3 className="font-semibold text-gray-900 dark:text-white">Staff</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Can manage bookings, view fleet calendar, but no settings access.</p>
        </div>
        <div className="p-6 text-center">
          <div className="flex justify-center mb-2">
            <Edit3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Mechanic</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Only updates vehicle statuses (repair, damaged, maintenance).</p>
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
                Status
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
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${member.role === 'Admin' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 
                      member.role === 'Staff' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 
                      'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'}`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mx-2 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
