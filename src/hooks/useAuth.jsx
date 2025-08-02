import { useState, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    try {
      setLoading(true);
      // Simular login
      if (username && password) {
        const mockUser = { id: 1, username, email: `${username}@example.com` };
        setUser(mockUser);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, user: mockUser };
      } else {
        setLoading(false);
        return { success: false, error: 'Credenciais inválidas' };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

