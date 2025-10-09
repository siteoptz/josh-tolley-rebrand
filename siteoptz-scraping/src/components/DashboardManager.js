import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import CyfeService from '../services/CyfeService';
import CyfeDashboard from './CyfeDashboard';
import './DashboardManager.css';

const DashboardManager = () => {
  const { currentPlan } = useUser();
  const [availableDashboards, setAvailableDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [dashboardLimits, setDashboardLimits] = useState({});
  const [upgradeSuggestions, setUpgradeSuggestions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [currentPlan]);

  const loadDashboardData = () => {
    // Get available dashboards for current plan
    const dashboards = CyfeService.getAvailableDashboards(currentPlan);
    setAvailableDashboards(dashboards);

    // Get dashboard limits
    const limits = CyfeService.getDashboardLimits(currentPlan);
    setDashboardLimits(limits);

    // Get upgrade suggestions based on usage
    const mockUsage = {
      dashboardCount: dashboards.length,
      userCount: 1, // This would come from your user management system
      requiresAdvancedFeatures: false
    };
    const suggestions = CyfeService.getUpgradeSuggestions(currentPlan, mockUsage);
    setUpgradeSuggestions(suggestions);

    // Set first dashboard as selected by default
    if (dashboards.length > 0 && !selectedDashboard) {
      setSelectedDashboard(dashboards[0]);
    }
  };

  const handleDashboardSelect = (dashboard) => {
    setSelectedDashboard(dashboard);
  };

  const handleUpgradeClick = () => {
    // This would trigger your upgrade flow
    window.location.href = `/dashboard/${currentPlan}#upgrade`;
  };

  return (
    <div className="dashboard-manager">
      <div className="dashboard-manager-header">
        <h2>Dashboard Center</h2>
        <div className="plan-info">
          <span className="current-plan">Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
          <span className="dashboard-count">
            {availableDashboards.length} / {dashboardLimits.maxDashboards === -1 ? '∞' : dashboardLimits.maxDashboards} dashboards
          </span>
        </div>
      </div>

      {upgradeSuggestions.length > 0 && (
        <div className="upgrade-suggestions">
          <h3>Upgrade Recommendations</h3>
          {upgradeSuggestions.map((suggestion, index) => (
            <div key={index} className={`suggestion-item ${suggestion.priority}`}>
              <span className="suggestion-icon">
                {suggestion.priority === 'high' ? '🚨' : '💡'}
              </span>
              <span className="suggestion-text">{suggestion.message}</span>
            </div>
          ))}
          <button className="upgrade-button" onClick={handleUpgradeClick}>
            View Upgrade Options
          </button>
        </div>
      )}

      <div className="dashboard-selector">
        <h3>Available Dashboards</h3>
        <div className="dashboard-grid">
          {availableDashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className={`dashboard-card ${selectedDashboard?.id === dashboard.id ? 'selected' : ''}`}
              onClick={() => handleDashboardSelect(dashboard)}
            >
              <div className="dashboard-card-header">
                <h4>{dashboard.name}</h4>
                <span className="dashboard-badge">{currentPlan}</span>
              </div>
              <p className="dashboard-description">{dashboard.description}</p>
              <div className="dashboard-widgets">
                <span className="widget-count">{dashboard.widgets.length} widgets</span>
                <div className="widget-list">
                  {dashboard.widgets.slice(0, 3).map((widget, index) => (
                    <span key={index} className="widget-tag">{widget}</span>
                  ))}
                  {dashboard.widgets.length > 3 && (
                    <span className="widget-more">+{dashboard.widgets.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDashboard && (
        <div className="dashboard-viewer">
          <h3>{selectedDashboard.name}</h3>
          <CyfeDashboard
            dashboardId={selectedDashboard.id}
            dashboardName={selectedDashboard.name}
            requiredPlan={currentPlan}
            height="700px"
            showControls={true}
          />
        </div>
      )}

      <div className="dashboard-features">
        <h3>Plan Features</h3>
        <div className="features-list">
          {dashboardLimits.features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">✓</span>
              <span>{feature.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
