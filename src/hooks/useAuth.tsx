import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | any | null;
  session: Session | null;
  loading: boolean;
  isSimulationMode: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  useEffect(() => {
    // Check for simulation mode first
    const simulationMode = localStorage.getItem('simulationMode');
    const simulationUser = localStorage.getItem('simulationUser');
    
    if (simulationMode === 'true' && simulationUser) {
      const parsedUser = JSON.parse(simulationUser);
      setUser(parsedUser);
      setIsSimulationMode(true);
      setLoading(false);
      return;
    }

    // Set up auth state listener for real authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsSimulationMode(false);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsSimulationMode(false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    if (!error && data.user) {
      // Create a profile in the 'profiles' table
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: userData.full_name,
        role: userData.role,
        phone_number: userData.phone_number,
        student_id: userData.student_id,
        department: userData.department,
        faculty: userData.faculty
      });
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    // Clear simulation mode
    localStorage.removeItem('simulationMode');
    localStorage.removeItem('simulationUser');
    setIsSimulationMode(false);
    
    // Sign out from Supabase
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isSimulationMode,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
