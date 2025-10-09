import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import CyfeService from '../services/CyfeService';
import './DashboardAuth.css';

const DashboardAuth = ({ children, dashboardId, requiredPlan }) => {
  const { user, currentPlan } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkDashboardAccess();
  }, [dashboardId, currentPlan]);

  const checkDashboardAccess = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user has access to the dashboard
      const access = CyfeService.hasDashboardAccess(user?.id, currentPlan, dashboardId);
      
      // Check if user's plan meets requirements
      const planHierarchy = ['free', 'starter', 'pro', 'enterprise'];
      const currentPlanIndex = planHierarchy.indexOf(currentPlan);
      const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
      
      const planAccess = currentPlanIndex >= requiredPlanIndex;
      
      setHasAccess(access && planAccess);
      
      if (!access) {
        setError('Dashboard not available for your current plan');
      } else if (!planAccess) {
        setError(`This dashboard requires ${requiredPlan} plan or higher`);
      }
    } catch (err) {
      setError('Error checking dashboard access');
      console.error('Dashboard access check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking dashboard access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-auth-error">
        <div className="error-icon">⚠️</div>
        <h3>Access Restricted</h3>
        <p>{error}</p>
        <button 
          className="upgrade-button"
          onClick={() => window.location.href = `/dashboard/${currentPlan}#upgrade`}
        >
          Upgrade Plan
        </button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="dashboard-auth-denied">
        <div className="denied-icon">🔒</div>
        <h3>Dashboard Not Available</h3>
        <p>This dashboard is not included in your current plan.</p>
        <button 
          className="upgrade-button"
          onClick={() => window.location.href = `/dashboard/${currentPlan}#upgrade`}
        >
          View Upgrade Options
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default DashboardAuth;
