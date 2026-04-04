import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  role: string | null;
  avatarUrl: string | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  role: null, 
  avatarUrl: null, 
  loading: true,
  refreshProfile: async () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async (userId: string) => {
    console.log('[AuthContext] Fetching profile data for user:', userId);
    
    // Fetch role and avatar_url from the staff table
    const { data, error } = await supabase
      .from('staff')
      .select('role, avatar_url')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      console.log('[AuthContext] Profile data fetched:', data);
      setRole(data.role);
      setAvatarUrl(data.avatar_url);
      setLoading(false);
      return;
    }

    console.warn('[AuthContext] Profile table query failed, trying RPC fallback for role:', error?.message);
    
    // Fallback: use the SECURITY DEFINER function that bypasses RLS for role only
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_role');
    
    if (!rpcError && rpcData) {
      console.log('[AuthContext] Role fetched via RPC:', rpcData);
      setRole(rpcData);
    } else {
      console.error('[AuthContext] RPC fallback also failed:', rpcError?.message);
    }
    
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileData(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth event:', event);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (event === 'SIGNED_IN') {
           await supabase.from('audit_logs').insert({
             action_type: 'SIGNED_IN',
             staff_id: session.user.id,
             details: { method: 'auth.onAuthStateChange' }
           });
        }
        fetchProfileData(session.user.id);
      } else {
        if (event === 'SIGNED_OUT') {
           // Since user is null, we can't easily record which exact staff logged out 
           // here unless we track it in local state before nulling it out.
        }
        setRole(null);
        setAvatarUrl(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, avatarUrl, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
