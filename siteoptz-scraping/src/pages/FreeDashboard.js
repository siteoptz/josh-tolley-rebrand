import React, { useState } from 'react';
import { useStripe } from '../contexts/StripeContext';
import { pricingPlans, upgradeFeatures } from '../pricing-plans';
import CyfeDashboard from '../components/CyfeDashboard';
import CyfeService from '../services/CyfeService';
import './DashboardPage.css';

const FreeDashboard = () => {
  const { openUpgradeModal } = useStripe();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await openUpgradeModal('starter');
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentPlan = pricingPlans.free;
  const nextPlan = pricingPlans.starter;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Free Dashboard</h1>
        <p>Welcome to your free scraping dashboard. Get started with basic scraping features.</p>
      </div>

      {/* Usage Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Daily Requests</h3>
          <div className="stat-value">47 / 100</div>
          <div className="stat-progress">
            <div className="progress-bar" style={{ width: '47%' }}></div>
          </div>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <div className="stat-value">2 / 5</div>
        </div>
        <div className="stat-card">
          <h3>Data Retention</h3>
          <div className="stat-value">15 days</div>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="upgrade-section">
        <div className="upgrade-card">
          <div className="upgrade-header">
            <h2>🚀 Upgrade to Starter</h2>
            <p>Unlock more powerful features and higher limits</p>
          </div>
          
          <div className="upgrade-content">
            <div className="upgrade-features">
              <h3>What you'll get:</h3>
              <ul>
                {upgradeFeatures.freeToStarter.map((feature, index) => (
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
                {isUpgrading ? 'Processing...' : 'Upgrade to Starter'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Features */}
      <div className="features-section">
        <h2>Your Current Features</h2>
        <div className="features-grid">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="limitations-section">
        <h2>Current Limitations</h2>
        <div className="limitations-grid">
          {currentPlan.limitations.map((limitation, index) => (
            <div key={index} className="limitation-item">
              <span className="limitation-icon">⚠️</span>
              <span>{limitation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cyfe Dashboard Integration */}
      <div className="dashboard-section">
        <h2>Analytics Dashboard</h2>
        <CyfeDashboard 
          dashboardId="basic_analytics"
          dashboardName="Basic Analytics"
          requiredPlan="free"
          height="500px"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-button primary">
            Create New Scraping Job
          </button>
          <button className="action-button secondary">
            View Documentation
          </button>
          <button className="action-button secondary">
            Join Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeDashboard;
