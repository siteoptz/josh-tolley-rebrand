import React, { useState } from 'react';
import { useStripe } from '../contexts/StripeContext';
import { pricingPlans, upgradeFeatures } from '../pricing-plans';
import './DashboardPage.css';

const ProDashboard = () => {
  const { openUpgradeModal } = useStripe();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await openUpgradeModal('enterprise');
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentPlan = pricingPlans.pro;
  const nextPlan = pricingPlans.enterprise;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Pro Dashboard</h1>
        <p>You're on the Pro plan. Access to advanced features and team collaboration tools.</p>
      </div>

      {/* Usage Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Daily Requests</h3>
          <div className="stat-value">2,847 / 10,000</div>
          <div className="stat-progress">
            <div className="progress-bar" style={{ width: '28.47%' }}></div>
          </div>
        </div>
        <div className="stat-card">
          <h3>API Calls</h3>
          <div className="stat-value">1,234 / 10,000</div>
          <div className="stat-progress">
            <div className="progress-bar" style={{ width: '12.34%' }}></div>
          </div>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <div className="stat-value">23 / 50</div>
        </div>
        <div className="stat-card">
          <h3>Team Members</h3>
          <div className="stat-value">7 / 10</div>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="upgrade-section">
        <div className="upgrade-card enterprise">
          <div className="upgrade-header">
            <h2>🏢 Upgrade to Enterprise</h2>
            <p>Get unlimited access and enterprise-grade features</p>
          </div>
          
          <div className="upgrade-content">
            <div className="upgrade-features">
              <h3>What you'll get:</h3>
              <ul>
                {upgradeFeatures.proToEnterprise.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="upgrade-pricing">
              <div className="price">
                <span className="amount">Custom Pricing</span>
              </div>
              <button 
                className="upgrade-button enterprise"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? 'Contacting Sales...' : 'Contact Sales'}
              </button>
              <p className="pricing-note">Volume discounts available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Suite Highlight */}
      <div className="analytics-suite-highlight" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>
          🚀 AI-Powered Analytics Suite (Pro Exclusive)
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Unlock powerful AI-driven SEO and analytics tools to supercharge your business growth.
        </p>
        <button 
          className="action-button primary"
          onClick={() => window.location.href = '/dashboard/pro/aiseo'}
          style={{ width: '100%' }}
        >
          Launch Analytics Suite
        </button>
      </div>

      {/* Advanced Features */}
      <div className="features-section">
        <h2>Your Pro Features</h2>
        <div className="features-grid">
          {currentPlan.features.slice(0, 10).map((feature, index) => (
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

      {/* Team Management */}
      <div className="team-section">
        <h2>Team Management</h2>
        <div className="team-stats">
          <div className="team-stat">
            <h3>Active Team Members</h3>
            <div className="team-value">7</div>
          </div>
          <div className="team-stat">
            <h3>Team Invitations</h3>
            <div className="team-value">2</div>
          </div>
          <div className="team-stat">
            <h3>Collaboration Projects</h3>
            <div className="team-value">12</div>
          </div>
        </div>
        <div className="team-actions">
          <button className="action-button primary">Invite Team Member</button>
          <button className="action-button secondary">Manage Permissions</button>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="analytics-section">
        <h2>Advanced Analytics</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Performance Metrics</h3>
            <div className="metric">
              <span className="metric-label">Success Rate</span>
              <span className="metric-value">98.7%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Response Time</span>
              <span className="metric-value">1.2s</span>
            </div>
          </div>
          <div className="analytics-card">
            <h3>Usage Trends</h3>
            <div className="metric">
              <span className="metric-label">Weekly Growth</span>
              <span className="metric-value">+23%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Peak Usage</span>
              <span className="metric-value">3,200 req/hr</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            className="action-button primary"
            onClick={() => window.location.href = '/dashboard/pro/aiseo'}
          >
            📊 Access Advanced Analytics
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Team Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">30 minutes ago</span>
            <span className="activity-text">Sarah completed JavaScript rendering job "Dynamic Content"</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">1 hour ago</span>
            <span className="activity-text">Team collaboration on "E-commerce Scraper" project</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">2 hours ago</span>
            <span className="activity-text">Custom webhook notification sent successfully</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">3 hours ago</span>
            <span className="activity-text">Advanced analytics report generated</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-button primary"
            onClick={() => window.location.href = '/ai-seo'}
          >
            🚀 Analytics Suite
          </button>
          <button className="action-button secondary">
            Create JavaScript Job
          </button>
          <button className="action-button secondary">
            Generate Analytics Report
          </button>
          <button className="action-button secondary">
            Configure Webhooks
          </button>
          <button className="action-button secondary">
            Manage Team Permissions
          </button>
          <button className="action-button secondary">
            Contact Account Manager
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProDashboard;
