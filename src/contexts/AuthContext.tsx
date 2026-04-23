import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  cpf: string | null;
  birth_date: string | null;
  phone: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  role_title: string | null;
  access_level: string;
  active: boolean;
  password_set: boolean;
  photo_url: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Ref para evitar buscas duplicadas do mesmo perfil simultaneamente
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef<boolean>(false);

  const fetchProfile = async (userId: string, force = false) => {
    // Se já estamos buscando ou se já temos esse perfil (e não é um force refresh), ignoramos
    if ((isFetching.current || lastFetchedUserId.current === userId) && !force) {
      return;
    }

    console.log('[AuthContext] Buscando perfil para:', userId);
    isFetching.current = true;
    lastFetchedUserId.current = userId;
    
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      console.log('[AuthContext] Perfil carregado com sucesso');
      setProfile(data);
    } catch (err) {
      console.error('[AuthContext] Erro ao buscar perfil:', err);
      // Se deu erro, permitimos tentar novamente na próxima
      lastFetchedUserId.current = null;
    } finally {
      isFetching.current = false;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, true);
  };

  useEffect(() => {
    let mounted = true;

    // Escuta mudanças de autenticação (inclui o estado inicial)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Evento Auth:', event);
      
      if (!mounted) return;

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Busca perfil se ainda não tivermos ou se o usuário mudou
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        lastFetchedUserId.current = null;
      }
      
      // Desativa o loading inicial
      setLoading(false);
    });

    // Fallback: garante que o loading termine mesmo se o evento demorar
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    lastFetchedUserId.current = null;
    setLoading(false);
  };

  const value = { session, user, profile, loading, signOut, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
