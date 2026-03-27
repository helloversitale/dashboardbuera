import { useState } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, role } = useAuth();
  const [firstName, setFirstName] = useState('');

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'CB';
    return email.substring(0, 2).toUpperCase();
  };

  const handleSave = () => {
    // Save logic placeholder
    console.log('Saved:', { firstName });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-full flex items-center justify-center text-3xl font-semibold">
          {getInitials(user?.email)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
            {getUserName()}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {user?.email || 'No email provided'}
          </p>
          {role && (
            <div className="flex items-center gap-1.5 mt-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider w-fit border border-orange-500/20">
              <Shield className="w-3.5 h-3.5" />
              {role}
            </div>
          )}
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal information and account settings.
          </p>
        </div>

        <div className="space-y-6">
          {/* First Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white block">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors sm:text-sm"
              />
            </div>
          </div>

          {/* Email Address Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 sm:text-sm opacity-80 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Email cannot be changed currently.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
