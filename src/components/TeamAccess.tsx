import { useState } from 'react';
import { Shield, ShieldAlert, UserPlus, Mail, Edit3, Trash2 } from 'lucide-react';

export default function TeamAccess() {
  const [teamMembers] = useState([
    { id: 1, name: 'Alex Manager', email: 'alex@quickrental.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sam Frontdesk', email: 'sam@quickrental.com', role: 'Staff', status: 'Active' },
    { id: 3, name: 'Jordan Mechanic', email: 'jordan@quickrental.com', role: 'Mechanic', status: 'Offline' },
  ]);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team & Role Management</h2>
            <p className="text-sm text-gray-500">Manage who has access to your system and what they can do.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-gray-200 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Admin</h3>
          <p className="text-xs text-gray-500 mt-1">Full access to dashboards, fleet, settings, and billing.</p>
        </div>
        <div className="p-6 text-center bg-gray-50">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Staff</h3>
          <p className="text-xs text-gray-500 mt-1">Can manage bookings, view fleet calendar, but no settings access.</p>
        </div>
        <div className="p-6 text-center">
          <div className="flex justify-center mb-2">
            <Edit3 className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Mechanic</h3>
          <p className="text-xs text-gray-500 mt-1">Only updates vehicle statuses (repair, damaged, maintenance).</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${member.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 
                      member.role === 'Staff' ? 'bg-green-100 text-green-800' : 
                      'bg-orange-100 text-orange-800'}`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded hover:bg-blue-50 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors">
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
