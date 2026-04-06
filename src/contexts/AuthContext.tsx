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
    
    try {
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
    } catch (err) {
      console.error('[AuthContext] Error in fetchProfileData:', err);
    } finally {
      setLoading(false);
    }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth event:', event);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Only log SIGNED_IN if we haven't already marked this session as logged
        const sessionMarker = sessionStorage.getItem(`last_login_${session.user.id}`);
        const now = Date.now();
        
        // If event is SIGNED_IN and we haven't logged it in the last 24 hours in THIS browser session
        if (event === 'SIGNED_IN' && !sessionMarker) {
          sessionStorage.setItem(`last_login_${session.user.id}`, now.toString());
          supabase.from('audit_logs').insert({
            action_type: 'SIGNED_IN',
            staff_id: session.user.id,
            details: { method: 'auth.onAuthStateChange', refresh: false }
          }).then(({ error }) => {
            if (error) console.warn('[AuthContext] Failed to log SIGNED_IN event:', error);
          });
        }
        fetchProfileData(session.user.id);
      } else {
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
