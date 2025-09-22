import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'lecturer' | 'admin';
  phone_number?: string;
  student_id?: string;
  department?: string;
  faculty?: string;
  year_of_study?: number;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const useUserData = () => {
  const { user, isSimulationMode } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user && !isSimulationMode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isSimulationMode) {
          // Redirect to login if in simulation mode
          setError('Simulation mode not supported. Please log in with real credentials.');
          setProfile(null);
        } else {
          // Fetch real user profile from database
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            setError('Failed to fetch user profile');
            setProfile(null);
          } else {
            setProfile(data);
          }
        }
      } catch (err) {
        console.error('Error in useUserData:', err);
        setError('An unexpected error occurred');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, isSimulationMode]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || isSimulationMode) {
      return { error: new Error('Cannot update profile in simulation mode') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (err) {
      return { error: err };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
}; 