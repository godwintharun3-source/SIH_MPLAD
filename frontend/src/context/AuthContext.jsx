import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { notificationService } from '../services/notificationService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState('guest'); // 'admin' | 'employee' | 'public' | 'guest'
  const [registeredState, setRegisteredState] = useState('All India');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedHouse, setSelectedHouse] = useState('All'); // 'All' | 'Lok Sabha' | 'Rajya Sabha'
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('mplad_auth_session');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.token && parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token);
          setUserRole(parsed.user.role || 'public');
          setRegisteredState(parsed.user.state || 'All India');
          setSelectedState(parsed.selectedState || parsed.user.state || 'All');
          setSelectedHouse(parsed.selectedHouse || 'All');
        }
      }
    } catch (e) {
      console.warn('Could not restore auth session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save changes to localStorage
  const saveSession = (userData, sessionToken, role, stateVal, houseVal) => {
    const payload = {
      user: userData,
      token: sessionToken,
      role: role,
      selectedState: stateVal,
      selectedHouse: houseVal
    };
    localStorage.setItem('mplad_auth_session', JSON.stringify(payload));
  };

  const login = async (usernameOrEmail, password) => {
    const res = await api.login({
      username_or_email: usernameOrEmail,
      password: password
    });

    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token);
      setUserRole(res.user.role);
      
      const userState = res.user.state || 'All India';
      setRegisteredState(userState);
      
      // Default view: if public user, set selected state to their registered state; else 'All'
      const initialSelectedState = res.user.role === 'public' && userState !== 'All India' ? userState : 'All';
      setSelectedState(initialSelectedState);
      setSelectedHouse('All');
      
      saveSession(res.user, res.token, res.user.role, initialSelectedState, 'All');

      // Dispatch welcome notification
      notificationService.sendNotification(`🇮🇳 Welcome, ${res.user.username}!`, {
        body: `Logged in as ${res.user.role.toUpperCase()}. Scoped to: ${initialSelectedState}`,
        type: 'SUCCESS'
      });

      return res;
    }
    throw new Error(res.detail || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.register({
      username: formData.username,
      phone_number: formData.phoneNumber,
      mailid: formData.mailid,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      state: formData.state
    });

    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token);
      setUserRole('public');
      setRegisteredState(res.user.state);
      setSelectedState(res.user.state);
      setSelectedHouse('All');

      saveSession(res.user, res.token, 'public', res.user.state, 'All');

      // Trigger desktop notification
      notificationService.sendNotification('🏛️ Registration Successful & Admin Alerted', {
        body: `Welcome ${res.user.username}! Admin notified at admin777444555@gmail.com. Data scoped to ${res.user.state}.`,
        type: 'SUCCESS'
      });

      return res;
    }
    throw new Error(res.detail || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserRole('guest');
    setRegisteredState('All India');
    setSelectedState('All');
    setSelectedHouse('All');
    localStorage.removeItem('mplad_auth_session');

    notificationService.sendNotification('🔒 Signed Out', {
      body: 'You have been safely signed out. System returned to Public Guest Mode.',
      type: 'INFO'
    });
  };

  const changeState = (newState) => {
    setSelectedState(newState);
    if (user && token) {
      saveSession(user, token, userRole, newState, selectedHouse);
    }
  };

  const changeHouse = (newHouse) => {
    setSelectedHouse(newHouse);
    if (user && token) {
      saveSession(user, token, userRole, selectedState, newHouse);
    }
  };

  const setGuestMode = () => {
    setUser({ username: 'Guest Citizen', role: 'guest', state: 'All India' });
    setUserRole('guest');
    setSelectedState('All');
    setSelectedHouse('All');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userRole,
        registeredState,
        selectedState,
        selectedHouse,
        loading,
        login,
        register,
        logout,
        setSelectedState: changeState,
        setSelectedHouse: changeHouse,
        setGuestMode,
        isAuthenticated: !!user && userRole !== 'guest'
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

export default AuthContext;
