import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import CyfeSSOMiddleware from '../middleware/CyfeSSOMiddleware';
import './AutoLoginDashboard.css';

/**
 * Auto-Login Dashboard Component
 * Automatically authenticates user and loads Cyfe dashboard without requiring login
 */
const AutoLoginDashboard = ({ dashboardId, height = '600px' }) => {
  const { user, currentPlan } = useUser();
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      initializeDashboard();
    }
  }, [user, dashboardId]);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate auto-login URL with embedded authentication
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        planId: currentPlan,
        cyfeUserId: user.cyfeUserId || `user_${user.id}`
      };

      // Generate embed URL with authentication token
      const embedUrl = CyfeSSOMiddleware.generateEmbedUrlWithAuth(userData, dashboardId);
      
      setDashboardUrl(embedUrl);
      
      // Optionally, ping the backend to ensure user is provisioned
      await ensureUserProvisioned(userData);
      
    } catch (err) {
      console.error('Dashboard initialization failed:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ensureUserProvisioned = async (userData) => {
    try {
      // Call backend to ensure user is provisioned in Cyfe
      const response = await fetch('/api/users/ensure-cyfe-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        console.warn('User provisioning check failed');
      }
    } catch (error) {
      console.warn('Failed to verify user provisioning:', error);
      // Don't throw - dashboard might still work
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Dashboard failed to load. Please refresh the page.');
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="auto-login-dashboard loading">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auto-login-dashboard error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Dashboard Load Error</h3>
          <p>{error}</p>
          <button onClick={initializeDashboard} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auto-login-dashboard">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Authenticating and loading dashboard...</p>
        </div>
      )}
      
      <iframe
        src={dashboardUrl}
        className="dashboard-iframe"
        style={{ 
          height,
          display: isLoading ? 'none' : 'block'
        }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Analytics Dashboard"
        sandbox="allow-scripts allow-same-origin allow-forms"
        frameBorder="0"
      />
    </div>
  );
};

export default AutoLoginDashboard;
