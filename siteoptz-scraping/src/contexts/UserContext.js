import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for SSO token in URL to get user plan
    const loadUser = async () => {
      try {
        // Check URL for SSO token
        const urlParams = new URLSearchParams(window.location.search);
        const ssoToken = urlParams.get('sso_token');
        
        let userData = {
          id: 'user_123',
          email: 'user@example.com',
          name: 'John Doe',
          plan: 'free',
          subscription: null
        };
        
        if (ssoToken) {
          try {
            // Decode the SSO token to get user info
            const tokenData = JSON.parse(atob(ssoToken.split('.')[0]));
            userData = {
              id: tokenData.userId || 'user_123',
              email: tokenData.email || 'user@example.com',
              name: tokenData.name || 'John Doe',
              plan: tokenData.plan || 'pro', // Default to pro if they have SSO token
              subscription: null
            };
            
            // Store in localStorage for persistence
            localStorage.setItem('userPlan', userData.plan);
            localStorage.setItem('userEmail', userData.email);
          } catch (e) {
            console.log('Could not parse SSO token:', e);
          }
        } else {
          // Check localStorage for saved plan
          const savedPlan = localStorage.getItem('userPlan');
          const savedEmail = localStorage.getItem('userEmail');
          if (savedPlan) {
            userData.plan = savedPlan;
            userData.email = savedEmail || userData.email;
          }
        }
        
        setUser(userData);
        setCurrentPlan(userData.plan);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const upgradePlan = async (newPlan) => {
    try {
      setCurrentPlan(newPlan);
      // Update user plan in backend
      if (user) {
        setUser({ ...user, plan: newPlan });
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      throw error;
    }
  };

  const value = {
    user,
    currentPlan,
    loading,
    upgradePlan,
    setCurrentPlan
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
