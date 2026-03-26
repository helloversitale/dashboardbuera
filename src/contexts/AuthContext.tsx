import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    console.log('[AuthContext] Fetching role for user:', userId);
    
    // Try direct table query first
    const { data, error } = await supabase.from('staff').select('role').eq('id', userId).single();
    
    if (!error && data) {
      console.log('[AuthContext] Role fetched via table:', data.role);
      setRole(data.role);
      setLoading(false);
      return;
    }

    console.warn('[AuthContext] Table query failed, trying RPC fallback:', error?.message);
    
    // Fallback: use the SECURITY DEFINER function that bypasses RLS
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_role');
    
    if (!rpcError && rpcData) {
      console.log('[AuthContext] Role fetched via RPC:', rpcData);
      setRole(rpcData);
    } else {
      console.error('[AuthContext] RPC fallback also failed:', rpcError?.message);
    }
    
    setLoading(false);
  };

  return <AuthContext.Provider value={{ user, role, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
