import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  activeRole: UserRole;
  switchDemoRole: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Permission checks
  canEditRecords: boolean;
  canDeleteRecords: boolean;
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canManageSystem: boolean;
}

const DEFAULT_PROFILES: Record<UserRole, UserProfile> = {
  owner: {
    uid: 'owner-001',
    email: 'k.m.d.unreal@gmail.com',
    displayName: 'حاجی محمد رفیق (مالک / Owner)',
    role: 'owner',
    phone: '0300-8451920',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  munshi: {
    uid: 'munshi-001',
    email: 'munshi.baraka@godown.pk',
    displayName: 'محمد صابر (منشی / Accountant)',
    role: 'munshi',
    phone: '0321-4198273',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  employee: {
    uid: 'worker-001',
    email: 'gatekeeper.baraka@godown.pk',
    displayName: 'علی احمد (کانٹا انچارج / Gatekeeper)',
    role: 'employee',
    phone: '0345-9182736',
    status: 'active',
    createdAt: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('owner');
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILES.owner);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        // Create or update user profile from auth
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || 'user@godown.pk',
          displayName: user.displayName || 'Godown User',
          role: activeRole,
          phone: user.phoneNumber || '',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        setUserProfile(profile);
      } else {
        setCurrentUser(null);
        // Use default role profile for interactive preview
        setUserProfile(DEFAULT_PROFILES[activeRole]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeRole]);

  const switchDemoRole = (role: UserRole) => {
    setActiveRole(role);
    setUserProfile(DEFAULT_PROFILES[role]);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(DEFAULT_PROFILES[activeRole]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Permission Logic
  const isOwner = userProfile?.role === 'owner';
  const isMunshi = userProfile?.role === 'munshi' || isOwner;

  const canEditRecords = isMunshi;
  const canDeleteRecords = isOwner;
  const canViewFinancials = isOwner || isMunshi;
  const canManageUsers = isOwner;
  const canManageSystem = isOwner;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        activeRole,
        switchDemoRole,
        signInWithGoogle,
        logout,
        canEditRecords,
        canDeleteRecords,
        canViewFinancials,
        canManageUsers,
        canManageSystem
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
