import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import CyfeService from '../services/CyfeService';
import DashboardAuth from './DashboardAuth';
import './CyfeDashboard.css';

const CyfeDashboard = ({ 
  dashboardId, 
  dashboardName, 
  requiredPlan = 'free',
  className = '',
  height = '600px',
  showControls = true 
}) => {
  const { user, currentPlan } = useUser();
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    generateDashboardUrl();
  }, [dashboardId, user?.id, currentPlan]);

  const generateDashboardUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate authenticated dashboard URL
      const url = CyfeService.generateDashboardUrl(dashboardId, user?.id, currentPlan);
      setDashboardUrl(url);
    } catch (err) {
      setError(err.message);
      console.error('Error generating dashboard URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load dashboard');
    setIsLoading(false);
  };

  const refreshDashboard = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const openInNewTab = () => {
    window.open(dashboardUrl, '_blank');
  };

  if (error) {
    return (
      <div className={`cyfe-dashboard-error ${className}`}>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={generateDashboardUrl} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardAuth dashboardId={dashboardId} requiredPlan={requiredPlan}>
      <div className={`cyfe-dashboard ${className}`}>
        {showControls && (
          <div className="dashboard-header">
            <div className="dashboard-info">
              <h3>{dashboardName}</h3>
              <span className="plan-badge">{requiredPlan}</span>
            </div>
            <div className="dashboard-controls">
              <button 
                onClick={refreshDashboard}
                className="control-button"
                title="Refresh Dashboard"
              >
                🔄
              </button>
              <button 
                onClick={openInNewTab}
                className="control-button"
                title="Open in New Tab"
              >
                🔗
              </button>
            </div>
          </div>
        )}
        
        <div className="dashboard-container" style={{ height }}>
          {isLoading && (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={dashboardUrl}
            title={dashboardName}
            className="dashboard-iframe"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ display: isLoading ? 'none' : 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </DashboardAuth>
  );
};

export default CyfeDashboard;
