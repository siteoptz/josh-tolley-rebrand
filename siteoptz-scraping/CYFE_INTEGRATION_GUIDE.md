# Cyfe White-Label Dashboard Integration Guide

This guide explains how to integrate Cyfe white-label dashboards with your tiered pricing system for SiteOptz Scraping.

## Overview

The integration provides:
- **Plan-based dashboard access control**
- **White-label dashboard embedding**
- **Real-time data synchronization**
- **Upgrade prompts based on usage**
- **Secure authentication and authorization**

## Setup Requirements

### 1. Cyfe White-Label Account

You need a Cyfe White-Label plan that includes:
- Custom branding and domain
- Client management and provisioning
- API access for data pushing
- Embedded dashboard capabilities

### 2. Environment Configuration

Set up the following environment variables:

```bash
# Cyfe Configuration
REACT_APP_CYFE_BASE_URL=https://app.cyfe.com
REACT_APP_CYFE_API_KEY=your_cyfe_api_key_here
REACT_APP_CYFE_WHITELABEL_DOMAIN=https://dashboards.yourdomain.com

# Optional: Dashboard limits per plan
REACT_APP_MAX_FREE_DASHBOARDS=1
REACT_APP_MAX_STARTER_DASHBOARDS=2
REACT_APP_MAX_PRO_DASHBOARDS=4
REACT_APP_MAX_ENTERPRISE_DASHBOARDS=-1
```

## Dashboard Configuration by Plan

### Free Plan
- **Dashboards**: 1 (Basic Analytics)
- **Widgets**: Usage stats, request timeline, error rates
- **Features**: Standard refresh, basic widgets

### Starter Plan
- **Dashboards**: 2 (Advanced Analytics, API Monitoring)
- **Widgets**: API calls, scheduled jobs, performance metrics
- **Features**: Real-time data, custom widgets, data export

### Pro Plan
- **Dashboards**: 4 (Comprehensive Analytics, Team Dashboard, Advanced Monitoring, Custom Reports)
- **Widgets**: Team collaboration, custom charts, system health
- **Features**: Custom dashboards, advanced widgets, scheduled reports

### Enterprise Plan
- **Dashboards**: Unlimited
- **Widgets**: Custom KPI, compliance monitoring, multi-region support
- **Features**: Full white-label, custom branding, SLA monitoring

## Implementation Steps

### 1. Dashboard Creation in Cyfe

Create dashboards in your Cyfe white-label account:

```javascript
// Example dashboard configuration
const dashboardConfig = {
  id: 'basic_analytics',
  name: 'Basic Analytics',
  widgets: [
    {
      id: 'usage_stats',
      type: 'Push API',
      endpoint: 'https://app.cyfe.com/api/push/basic_analytics/usage_stats'
    },
    {
      id: 'request_timeline',
      type: 'Push API',
      endpoint: 'https://app.cyfe.com/api/push/basic_analytics/request_timeline'
    }
  ]
};
```

### 2. Data Integration

Use Cyfe's Push API to send data from your application:

```javascript
// Example: Push usage data to Cyfe
const pushDataToCyfe = async (dashboardId, widgetId, data) => {
  const response = await fetch(`/api/push/${dashboardId}/${widgetId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CYFE_API_KEY}`
    },
    body: JSON.stringify({
      data: data,
      onduplicate: 'update',
      color: '#3b82f6',
      type: 'line'
    })
  });
  return response.json();
};
```

### 3. Authentication & Authorization

Implement secure dashboard access:

```javascript
// Generate secure dashboard URL with token
const generateDashboardUrl = (dashboardId, userId, planId) => {
  const token = generateAccessToken(userId, planId, dashboardId);
  return `${CYFE_WHITELABEL_DOMAIN}/embed/${dashboardId}?token=${token}`;
};
```

### 4. Component Integration

Use the provided React components:

```jsx
import CyfeDashboard from '../components/CyfeDashboard';

// In your dashboard page
<CyfeDashboard
  dashboardId="basic_analytics"
  dashboardName="Basic Analytics"
  requiredPlan="free"
  height="600px"
/>
```

## Security Considerations

### 1. Token-Based Authentication
- Generate time-limited access tokens
- Include user ID, plan ID, and dashboard ID in tokens
- Validate tokens on dashboard access

### 2. Domain Whitelisting
- Whititelist your domain in Cyfe settings
- Use HTTPS for all dashboard URLs
- Implement CORS policies

### 3. Access Control
- Verify user plan before dashboard access
- Check dashboard availability for plan
- Implement rate limiting

## Usage Monitoring & Upgrade Prompts

### 1. Track Dashboard Usage
```javascript
const trackDashboardUsage = (userId, dashboardId, action) => {
  // Track usage for upgrade suggestions
  analytics.track('dashboard_usage', {
    userId,
    dashboardId,
    action,
    timestamp: Date.now()
  });
};
```

### 2. Generate Upgrade Suggestions
```javascript
const getUpgradeSuggestions = (currentPlan, usage) => {
  const suggestions = [];
  
  if (usage.dashboardCount >= getPlanLimit(currentPlan)) {
    suggestions.push({
      type: 'dashboard_limit',
      message: 'You\'ve reached your dashboard limit. Upgrade for more dashboards.',
      priority: 'high'
    });
  }
  
  return suggestions;
};
```

## Best Practices

### 1. Dashboard Design
- Keep dashboards focused and relevant to each plan
- Use consistent branding across all dashboards
- Ensure mobile responsiveness

### 2. Data Management
- Push data in real-time for better user experience
- Implement data caching for performance
- Handle API rate limits gracefully

### 3. User Experience
- Show loading states while dashboards load
- Provide fallback content for errors
- Include upgrade prompts at strategic locations

### 4. Performance Optimization
- Lazy load dashboards
- Implement dashboard caching
- Monitor dashboard load times

## Troubleshooting

### Common Issues

1. **Dashboard Not Loading**
   - Check if domain is whitelisted in Cyfe
   - Verify access token is valid
   - Ensure user has correct plan access

2. **Data Not Updating**
   - Check Push API endpoint configuration
   - Verify API key permissions
   - Monitor API rate limits

3. **Authentication Errors**
   - Validate token generation logic
   - Check token expiration times
   - Verify user plan assignments

### Debug Tools

```javascript
// Enable debug mode
const DEBUG_CYFE = process.env.NODE_ENV === 'development';

if (DEBUG_CYFE) {
  console.log('Dashboard URL:', dashboardUrl);
  console.log('User Plan:', currentPlan);
  console.log('Available Dashboards:', availableDashboards);
}
```

## Support & Resources

- [Cyfe White-Label Documentation](https://www.cyfe.com/white-label-dashboard/)
- [Cyfe Push API Documentation](https://www.cyfe.com/api/)
- [Cyfe Support Center](https://www.cyfe.com/support/)

For technical support with this integration, contact your development team or Cyfe support.
