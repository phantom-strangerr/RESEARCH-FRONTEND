import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'super_admin' | 'security_admin' | 'network_operator' | 'security_analyst';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded users for demo (in production, this comes from backend)
const DEMO_USERS: { [key: string]: { password: string; user: User } } = {
  admin: {
    password: 'admin123',
    user: {
      id: 'usr-001',
      username: 'admin',
      email: 'admin@iotsoc.local',
      fullName: 'System Administrator',
      role: 'super_admin',
      department: 'IT Security',
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: undefined,
    },
  },
  secadmin: {
    password: 'sec123',
    user: {
      id: 'usr-002',
      username: 'secadmin',
      email: 'security@iotsoc.local',
      fullName: 'Security Administrator',
      role: 'security_admin',
      department: 'Security Operations',
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: undefined,
    },
  },
  operator: {
    password: 'op123',
    user: {
      id: 'usr-003',
      username: 'operator',
      email: 'netops@iotsoc.local',
      fullName: 'Network Operator',
      role: 'network_operator',
      department: 'Network Operations',
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: undefined,
    },
  },
  analyst: {
    password: 'analyst123',
    user: {
      id: 'usr-004',
      username: 'analyst',
      email: 'analyst@iotsoc.local',
      fullName: 'Security Analyst',
      role: 'security_analyst',
      department: 'Security Analysis',
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: undefined,
    },
  },
};

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: { [key in UserRole]: number } = {
  super_admin: 4,
  security_admin: 3,
  network_operator: 2,
  security_analyst: 1,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('iot_soc_user');
    const storedToken = localStorage.getItem('iot_soc_token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('iot_soc_user');
        localStorage.removeItem('iot_soc_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userCredentials = DEMO_USERS[username.toLowerCase()];

    if (!userCredentials) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (userCredentials.password !== password) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Update last login
    const loggedInUser = {
      ...userCredentials.user,
      lastLogin: new Date().toISOString(),
    };

    // In production, this would be a JWT token from the backend
    const mockToken = btoa(JSON.stringify({ userId: loggedInUser.id, exp: Date.now() + 86400000 }));

    // Store in localStorage
    localStorage.setItem('iot_soc_user', JSON.stringify(loggedInUser));
    localStorage.setItem('iot_soc_token', mockToken);

    setUser(loggedInUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('iot_soc_user');
    localStorage.removeItem('iot_soc_token');
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Check if user's role is in the required roles
    if (requiredRoles.includes(user.role)) return true;

    // Check role hierarchy - if user's role level >= any required role level
    const userLevel = ROLE_HIERARCHY[user.role];
    return requiredRoles.some((role) => userLevel >= ROLE_HIERARCHY[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
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
