import React from 'react';
import { pricingPlans } from '../pricing-plans';
import './DashboardPage.css';

const EnterpriseDashboard = () => {
  const currentPlan = pricingPlans.enterprise;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Enterprise Dashboard</h1>
        <p>Welcome to your enterprise dashboard. You have access to all features and unlimited resources.</p>
      </div>

      {/* Usage Stats */}
      <div className="stats-grid">
        <div className="stat-card enterprise">
          <h3>Daily Requests</h3>
          <div className="stat-value unlimited">Unlimited</div>
          <div className="stat-subtitle">No restrictions</div>
        </div>
        <div className="stat-card enterprise">
          <h3>API Calls</h3>
          <div className="stat-value unlimited">Unlimited</div>
          <div className="stat-subtitle">Full access</div>
        </div>
        <div className="stat-card enterprise">
          <h3>Active Jobs</h3>
          <div className="stat-value unlimited">Unlimited</div>
          <div className="stat-subtitle">No limits</div>
        </div>
        <div className="stat-card enterprise">
          <h3>Team Members</h3>
          <div className="stat-value unlimited">Unlimited</div>
          <div className="stat-subtitle">Full team</div>
        </div>
      </div>

      {/* Enterprise Features */}
      <div className="features-section">
        <h2>Your Enterprise Features</h2>
        <div className="features-grid enterprise">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="feature-item enterprise">
              <span className="feature-icon">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Services */}
      <div className="enterprise-services">
        <h2>Enterprise Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>🎯 Dedicated Account Manager</h3>
            <p>John Smith</p>
            <p>john.smith@siteoptz.com</p>
            <button className="contact-button">Contact Manager</button>
          </div>
          <div className="service-card">
            <h3>🛡️ Security & Compliance</h3>
            <p>SOC 2 Type II Certified</p>
            <p>GDPR Compliant</p>
            <button className="contact-button">View Certificates</button>
          </div>
          <div className="service-card">
            <h3>📊 Custom Analytics</h3>
            <p>Real-time dashboards</p>
            <p>Custom reporting</p>
            <button className="contact-button">Access Analytics</button>
          </div>
          <div className="service-card">
            <h3>🔧 Custom Integrations</h3>
            <p>API integrations</p>
            <p>Webhook configurations</p>
            <button className="contact-button">Manage Integrations</button>
          </div>
        </div>
      </div>

      {/* SLA Status */}
      <div className="sla-section">
        <h2>Service Level Agreement</h2>
        <div className="sla-grid">
          <div className="sla-card">
            <h3>Uptime Guarantee</h3>
            <div className="sla-value">99.9%</div>
            <div className="sla-status good">✓ Exceeding SLA</div>
          </div>
          <div className="sla-card">
            <h3>Response Time</h3>
            <div className="sla-value">&lt; 100ms</div>
            <div className="sla-status good">✓ Meeting SLA</div>
          </div>
          <div className="sla-card">
            <h3>Support Response</h3>
            <div className="sla-value">24/7</div>
            <div className="sla-status good">✓ Active</div>
          </div>
        </div>
      </div>

      {/* Team Management */}
      <div className="team-section enterprise">
        <h2>Team Management</h2>
        <div className="team-stats">
          <div className="team-stat">
            <h3>Total Team Members</h3>
            <div className="team-value">47</div>
          </div>
          <div className="team-stat">
            <h3>Admin Users</h3>
            <div className="team-value">8</div>
          </div>
          <div className="team-stat">
            <h3>Active Projects</h3>
            <div className="team-value">23</div>
          </div>
          <div className="team-stat">
            <h3>Custom Integrations</h3>
            <div className="team-value">12</div>
          </div>
        </div>
        <div className="team-actions">
          <button className="action-button primary">Manage All Users</button>
          <button className="action-button secondary">Configure SSO</button>
          <button className="action-button secondary">Set Permissions</button>
          <button className="action-button secondary">View Audit Logs</button>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="analytics-section enterprise">
        <h2>Enterprise Analytics</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Performance Metrics</h3>
            <div className="metric">
              <span className="metric-label">Success Rate</span>
              <span className="metric-value">99.8%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Response Time</span>
              <span className="metric-value">45ms</span>
            </div>
            <div className="metric">
              <span className="metric-label">Peak Throughput</span>
              <span className="metric-value">50K req/min</span>
            </div>
          </div>
          <div className="analytics-card">
            <h3>Business Intelligence</h3>
            <div className="metric">
              <span className="metric-label">Cost per Request</span>
              <span className="metric-value">$0.001</span>
            </div>
            <div className="metric">
              <span className="metric-label">ROI</span>
              <span className="metric-value">+340%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Data Quality Score</span>
              <span className="metric-value">98.5%</span>
            </div>
          </div>
          <div className="analytics-card">
            <h3>Custom Reports</h3>
            <div className="metric">
              <span className="metric-label">Reports Generated</span>
              <span className="metric-value">156</span>
            </div>
            <div className="metric">
              <span className="metric-label">Scheduled Reports</span>
              <span className="metric-value">23</span>
            </div>
            <div className="metric">
              <span className="metric-label">API Exports</span>
              <span className="metric-value">2.4M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section enterprise">
        <h2>Enterprise Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">5 minutes ago</span>
            <span className="activity-text">Custom infrastructure scaling completed successfully</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">15 minutes ago</span>
            <span className="activity-text">New compliance report generated for Q4 audit</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">1 hour ago</span>
            <span className="activity-text">Multi-region deployment completed in EU region</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">2 hours ago</span>
            <span className="activity-text">Custom webhook integration with Salesforce completed</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">3 hours ago</span>
            <span className="activity-text">SLA performance review meeting with account manager</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions enterprise">
        <h2>Enterprise Actions</h2>
        <div className="actions-grid">
          <button className="action-button primary">
            Scale Infrastructure
          </button>
          <button className="action-button secondary">
            Generate Compliance Report
          </button>
          <button className="action-button secondary">
            Configure Custom Webhooks
          </button>
          <button className="action-button secondary">
            Manage SSO Settings
          </button>
          <button className="action-button secondary">
            Schedule SLA Review
          </button>
          <button className="action-button secondary">
            Access White-label Portal
          </button>
        </div>
      </div>

      {/* Enterprise Support */}
      <div className="support-section">
        <h2>24/7 Enterprise Support</h2>
        <div className="support-grid">
          <div className="support-card">
            <h3>📞 Priority Phone Support</h3>
            <p>+1 (555) 123-4567</p>
            <p>Available 24/7</p>
          </div>
          <div className="support-card">
            <h3>💬 Slack Integration</h3>
            <p>#enterprise-support</p>
            <p>Direct team access</p>
          </div>
          <div className="support-card">
            <h3>🎫 Dedicated Ticket System</h3>
            <p>enterprise@siteoptz.com</p>
            <p>Guaranteed 1-hour response</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
