
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user profile and role from the database
  const fetchUserProfile = async (userId: string) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Using maybeSingle instead of single to prevent errors if no profile exists

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profile) {
        console.log('No profile found for user:', userId);
        return null;
      }

      // Get user role using the get_primary_role function
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_primary_role', { _user_id: userId });

      if (roleError) {
        console.error('Error fetching role:', roleError);
        // Default to client role if there's an error getting role
        return {
          profile,
          role: 'client' as UserRole
        };
      }

      return {
        profile,
        role: roleData as UserRole
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Set up user data from session
  const setupUser = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const { id, email } = currentSession.user;
    
    try {
      // Create temporary user object with minimal data
      const tempUser: User = {
        id,
        email: email || "",
        name: email?.split('@')[0] || "User",
        role: 'client' // Default role until we fetch from DB
      };
      
      setUser(tempUser);
      
      // Fetch complete profile and role from database (this runs asynchronously)
      const userData = await fetchUserProfile(id);
      
      if (userData) {
        // Update with the database information
        setUser({
          id,
          email: email || "",
          name: userData.profile.name || email?.split('@')[0] || "User",
          role: userData.role,
          avatar: userData.profile.avatar
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting up user:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        // Use setTimeout to avoid Supabase auth deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            setupUser(currentSession);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession ? 'Session found' : 'No session');
      setSession(currentSession);
      
      // Use setTimeout here too for consistency
      setTimeout(() => {
        setupUser(currentSession);
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'There was a problem signing out.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
