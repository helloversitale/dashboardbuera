import { useState, useRef, useEffect } from 'react';
import { User, Mail, Shield, Save, Camera, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, role, avatarUrl, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize fullName when user/metadata is available
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    } else if (user?.email) {
      // Fallback: extract name from email if no full_name in metadata yet
      const extractedName = user.email.split('@')[0];
      setFullName(extractedName.charAt(0).toUpperCase() + extractedName.slice(1));
    }
  }, [user]);

  const getUserName = () => {
    if (fullName) return fullName;
    return 'User';
  };

  const getInitials = (email: string|undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const folderPath = `avatars/${user.id}`;
      const filePath = `${folderPath}/profile.${fileExt}`;

      // Clean up existing files in this user's folder to ensure only one file exists
      // We use plural 'avatars/' as originally configured
      const { data: existingFiles } = await supabase.storage
        .from('profiles')
        .list(folderPath);

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(f => `${folderPath}/${f.name}`);
        
        if (filesToRemove.length > 0) {
          // This requires the DELETE policy to be enabled on storage.objects
          await supabase.storage
            .from('profiles')
            .remove(filesToRemove);
        }
      }

      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { 
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update the staff table with the new avatar_url
      const finalUrl = `${publicUrl}?t=${Date.now()}`;
      
      const { error: updateError } = await supabase
        .from('staff')
        .update({ avatar_url: finalUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update auth user metadata for consistency if needed (optional)
      await supabase.auth.updateUser({
        data: { avatar_url: finalUrl }
      });

      // Refresh global auth state
      await refreshProfile();
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message);
      alert('Failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      // Update the staff table with the new full_name
      const { error: updateError } = await supabase
        .from('staff')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update name also in auth metadata so it shows correctly in layout immediately
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      triggerSuccess();
      refreshProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error.message);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in text-left">
      {/* Feedback Message */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div className="bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 overflow-hidden rounded-full border-2 border-orange-500/20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl font-semibold shadow-inner transition-colors group-hover:border-orange-500/40">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-orange-500">
                {getInitials(user?.email)}
              </div>
            )}
            
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              title="Change picture"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-left">
            Manage your personal information and account settings.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-gray-900 dark:text-white block">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Lloyd Sivo"
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
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

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
