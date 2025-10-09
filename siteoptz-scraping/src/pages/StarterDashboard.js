import React, { useState } from 'react';
import { useStripe } from '../contexts/StripeContext';
import { pricingPlans, upgradeFeatures } from '../pricing-plans';
import CyfeDashboard from '../components/CyfeDashboard';
import CyfeService from '../services/CyfeService';
import './DashboardPage.css';

const StarterDashboard = () => {
  const { openUpgradeModal } = useStripe();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await openUpgradeModal('pro');
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentPlan = pricingPlans.starter;
  const nextPlan = pricingPlans.pro;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Starter Dashboard</h1>
        <p>You're on the Starter plan. Enjoy enhanced features and higher limits.</p>
      </div>

      {/* Usage Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Daily Requests</h3>
          <div className="stat-value">324 / 1,000</div>
          <div className="stat-progress">
            <div className="progress-bar" style={{ width: '32.4%' }}></div>
          </div>
        </div>
        <div className="stat-card">
          <h3>API Calls</h3>
          <div className="stat-value">89 / 1,000</div>
          <div className="stat-progress">
            <div className="progress-bar" style={{ width: '8.9%' }}></div>
          </div>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <div className="stat-value">7 / 10</div>
        </div>
        <div className="stat-card">
          <h3>Data Retention</h3>
          <div className="stat-value">45 days</div>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="upgrade-section">
        <div className="upgrade-card">
          <div className="upgrade-header">
            <h2>🚀 Upgrade to Pro</h2>
            <p>Unlock advanced features for growing teams</p>
          </div>
          
          <div className="upgrade-content">
            <div className="upgrade-features">
              <h3>What you'll get:</h3>
              <ul>
                {upgradeFeatures.starterToPro.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="upgrade-pricing">
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{nextPlan.price}</span>
                <span className="period">/{nextPlan.period}</span>
              </div>
              <button 
                className="upgrade-button"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="features-section">
        <h2>Your Advanced Features</h2>
        <div className="features-grid">
          {currentPlan.features.slice(0, 8).map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <div className="show-more">
          <button className="show-more-button">
            Show All Features ({currentPlan.features.length})
          </button>
        </div>
      </div>

      {/* API Usage */}
      <div className="api-usage-section">
        <h2>API Usage</h2>
        <div className="api-stats">
          <div className="api-stat">
            <h3>Requests Today</h3>
            <div className="api-value">324</div>
          </div>
          <div className="api-stat">
            <h3>API Calls This Month</h3>
            <div className="api-value">89</div>
          </div>
          <div className="api-stat">
            <h3>Scheduled Jobs</h3>
            <div className="api-value">3</div>
          </div>
        </div>
      </div>

      {/* Cyfe Dashboard Integration */}
      <div className="dashboard-section">
        <h2>Advanced Analytics Dashboard</h2>
        <CyfeDashboard 
          dashboardId="advanced_analytics"
          dashboardName="Advanced Analytics"
          requiredPlan="starter"
          height="600px"
        />
      </div>

      <div className="dashboard-section">
        <h2>API Monitoring Dashboard</h2>
        <CyfeDashboard 
          dashboardId="api_monitoring"
          dashboardName="API Monitoring"
          requiredPlan="starter"
          height="500px"
        />
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">2 hours ago</span>
            <span className="activity-text">Scraping job "Product Catalog" completed successfully</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">5 hours ago</span>
            <span className="activity-text">New scheduled job created for daily data collection</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">1 day ago</span>
            <span className="activity-text">API key generated for external integrations</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-button primary">
            Create Scheduled Job
          </button>
          <button className="action-button secondary">
            View API Documentation
          </button>
          <button className="action-button secondary">
            Manage API Keys
          </button>
          <button className="action-button secondary">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default StarterDashboard;
