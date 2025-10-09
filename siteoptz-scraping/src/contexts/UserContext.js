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
    // Simulate loading user data
    const loadUser = async () => {
      try {
        // In a real app, this would fetch from your API
        const userData = {
          id: 'user_123',
          email: 'user@example.com',
          name: 'John Doe',
          plan: currentPlan,
          subscription: null
        };
        
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
