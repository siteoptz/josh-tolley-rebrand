// Cyfe Dashboard Integration Service
import { pricingPlans } from '../pricing-plans';

class CyfeService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_CYFE_BASE_URL || 'https://app.cyfe.com';
    this.apiKey = process.env.REACT_APP_CYFE_API_KEY;
    this.whiteLabelDomain = process.env.REACT_APP_CYFE_WHITELABEL_DOMAIN;
  }

  // Dashboard configuration for each plan tier
  getDashboardConfig(planId) {
    const planConfigs = {
      free: {
        dashboards: [
          {
            id: 'basic_analytics',
            name: 'Basic Analytics',
            url: `${this.baseUrl}/dashboards/basic_analytics`,
            description: 'Basic usage statistics and performance metrics',
            widgets: ['usage_stats', 'request_timeline', 'error_rates']
          }
        ],
        maxDashboards: 1,
        maxUsers: 1,
        features: ['basic_widgets', 'standard_refresh']
      },
      starter: {
        dashboards: [
          {
            id: 'advanced_analytics',
            name: 'Advanced Analytics',
            url: `${this.baseUrl}/dashboards/advanced_analytics`,
            description: 'Detailed analytics with API usage and scheduling',
            widgets: ['usage_stats', 'api_calls', 'scheduled_jobs', 'performance_metrics']
          },
          {
            id: 'api_monitoring',
            name: 'API Monitoring',
            url: `${this.baseUrl}/dashboards/api_monitoring`,
            description: 'Monitor API calls, response times, and errors',
            widgets: ['api_requests', 'response_times', 'error_tracking', 'rate_limits']
          }
        ],
        maxDashboards: 2,
        maxUsers: 3,
        features: ['custom_widgets', 'real_time_data', 'data_export']
      },
      pro: {
        dashboards: [
          {
            id: 'comprehensive_analytics',
            name: 'Comprehensive Analytics',
            url: `${this.baseUrl}/dashboards/comprehensive_analytics`,
            description: 'Full analytics suite with team collaboration',
            widgets: ['usage_stats', 'team_activity', 'project_metrics', 'cost_analysis']
          },
          {
            id: 'team_dashboard',
            name: 'Team Dashboard',
            url: `${this.baseUrl}/dashboards/team_dashboard`,
            description: 'Team collaboration and project management',
            widgets: ['team_performance', 'project_status', 'collaboration_metrics']
          },
          {
            id: 'advanced_monitoring',
            name: 'Advanced Monitoring',
            url: `${this.baseUrl}/dashboards/advanced_monitoring`,
            description: 'Advanced system monitoring and alerts',
            widgets: ['system_health', 'alert_management', 'performance_trends']
          },
          {
            id: 'custom_reports',
            name: 'Custom Reports',
            url: `${this.baseUrl}/dashboards/custom_reports`,
            description: 'Custom reporting and data visualization',
            widgets: ['custom_charts', 'report_builder', 'data_export']
          }
        ],
        maxDashboards: 4,
        maxUsers: 10,
        features: ['custom_dashboards', 'advanced_widgets', 'scheduled_reports', 'team_collaboration']
      },
      enterprise: {
        dashboards: [
          {
            id: 'enterprise_overview',
            name: 'Enterprise Overview',
            url: `${this.baseUrl}/dashboards/enterprise_overview`,
            description: 'Executive dashboard with key performance indicators',
            widgets: ['kpi_overview', 'business_metrics', 'executive_summary']
          },
          {
            id: 'operational_dashboard',
            name: 'Operational Dashboard',
            url: `${this.baseUrl}/dashboards/operational_dashboard`,
            description: 'Real-time operational monitoring and management',
            widgets: ['system_status', 'alert_center', 'performance_monitoring']
          },
          {
            id: 'compliance_dashboard',
            name: 'Compliance Dashboard',
            url: `${this.baseUrl}/dashboards/compliance_dashboard`,
            description: 'Compliance monitoring and audit trails',
            widgets: ['compliance_status', 'audit_logs', 'security_metrics']
          },
          {
            id: 'custom_business_dashboard',
            name: 'Custom Business Dashboard',
            url: `${this.baseUrl}/dashboards/custom_business`,
            description: 'Custom dashboard tailored to business needs',
            widgets: ['custom_kpis', 'business_intelligence', 'custom_analytics']
          },
          {
            id: 'multi_region_dashboard',
            name: 'Multi-Region Dashboard',
            url: `${this.baseUrl}/dashboards/multi_region`,
            description: 'Global performance and regional analytics',
            widgets: ['regional_performance', 'global_metrics', 'latency_monitoring']
          }
        ],
        maxDashboards: -1, // Unlimited
        maxUsers: -1, // Unlimited
        features: ['unlimited_dashboards', 'custom_branding', 'sla_monitoring', 'compliance_tools', 'multi_region_support']
      }
    };

    return planConfigs[planId] || planConfigs.free;
  }

  // Generate authenticated dashboard URL
  generateDashboardUrl(dashboardId, userId, planId) {
    const config = this.getDashboardConfig(planId);
    const dashboard = config.dashboards.find(d => d.id === dashboardId);
    
    if (!dashboard) {
      throw new Error(`Dashboard ${dashboardId} not available for plan ${planId}`);
    }

    // For white-label setup, use your custom domain
    const baseUrl = this.whiteLabelDomain || this.baseUrl;
    
    // Generate secure token for dashboard access
    const token = this.generateAccessToken(userId, planId, dashboardId);
    
    return `${baseUrl}/embed/${dashboardId}?token=${token}&user=${userId}&plan=${planId}`;
  }

  // Generate access token for dashboard authentication
  generateAccessToken(userId, planId, dashboardId) {
    // In a real implementation, this would be generated on your backend
    // and validated by Cyfe's white-label system
    const payload = {
      userId,
      planId,
      dashboardId,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // This should be signed with your secret key
    return btoa(JSON.stringify(payload));
  }

  // Check if user has access to a specific dashboard
  hasDashboardAccess(userId, planId, dashboardId) {
    const config = this.getDashboardConfig(planId);
    return config.dashboards.some(dashboard => dashboard.id === dashboardId);
  }

  // Get available dashboards for a plan
  getAvailableDashboards(planId) {
    const config = this.getDashboardConfig(planId);
    return config.dashboards;
  }

  // Get dashboard limits for a plan
  getDashboardLimits(planId) {
    const config = this.getDashboardConfig(planId);
    return {
      maxDashboards: config.maxDashboards,
      maxUsers: config.maxUsers,
      features: config.features
    };
  }

  // Push data to Cyfe dashboard (using Cyfe Push API)
  async pushDataToDashboard(dashboardId, widgetId, data) {
    const endpoint = `${this.baseUrl}/api/push/${dashboardId}/${widgetId}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          data: data,
          onduplicate: 'update',
          color: '#3b82f6',
          type: 'line'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to push data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error pushing data to Cyfe:', error);
      throw error;
    }
  }

  // Get upgrade suggestions based on current usage
  getUpgradeSuggestions(currentPlan, usage) {
    const suggestions = [];
    const config = this.getDashboardConfig(currentPlan);
    const nextPlan = pricingPlans[currentPlan]?.upgradeTo;

    if (!nextPlan) return suggestions;

    // Check dashboard usage
    if (config.maxDashboards > 0 && usage.dashboardCount >= config.maxDashboards) {
      suggestions.push({
        type: 'dashboard_limit',
        message: `You've reached your dashboard limit (${config.maxDashboards}). Upgrade to ${nextPlan} for more dashboards.`,
        priority: 'high'
      });
    }

    // Check user limit
    if (config.maxUsers > 0 && usage.userCount >= config.maxUsers) {
      suggestions.push({
        type: 'user_limit',
        message: `You've reached your user limit (${config.maxUsers}). Upgrade to ${nextPlan} for more users.`,
        priority: 'high'
      });
    }

    // Check feature usage
    if (usage.requiresAdvancedFeatures && !config.features.includes('custom_dashboards')) {
      suggestions.push({
        type: 'feature_limit',
        message: 'You need advanced features like custom dashboards. Upgrade to access more capabilities.',
        priority: 'medium'
      });
    }

    return suggestions;
  }

  // Validate dashboard access token
  validateAccessToken(token) {
    try {
      const payload = JSON.parse(atob(token));
      
      // Check if token is expired
      if (Date.now() > payload.expires) {
        return { valid: false, reason: 'expired' };
      }

      return { 
        valid: true, 
        userId: payload.userId,
        planId: payload.planId,
        dashboardId: payload.dashboardId
      };
    } catch (error) {
      return { valid: false, reason: 'invalid' };
    }
  }
}

export default new CyfeService();
