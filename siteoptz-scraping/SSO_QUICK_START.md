# Cyfe SSO Quick Start Guide

## 🚀 5-Minute Setup Checklist

### Prerequisites (5 minutes)
- [ ] Cyfe White-Label account active
- [ ] GHL location with API access
- [ ] Domain for webhook endpoints
- [ ] SSL certificate installed

### Step 1: Environment Setup (2 minutes)

1. Copy `env.example` to `.env`
2. Fill in the required values:

```bash
# Required - Get from Cyfe
REACT_APP_CYFE_API_KEY=your_cyfe_api_key
REACT_APP_CYFE_WHITELABEL_DOMAIN=https://dashboards.yourdomain.com

# Required - Generate strong secret
REACT_APP_SSO_SECRET_KEY=$(openssl rand -hex 32)

# Required - Get from GHL
REACT_APP_GHL_API_KEY=your_ghl_api_key
REACT_APP_GHL_WEBHOOK_SECRET=$(openssl rand -hex 32)
REACT_APP_GHL_LOCATION_ID=your_location_id
```

### Step 2: GHL Configuration (5 minutes)

**Create Tags:**
```
free-plan
starter-plan
pro-plan
enterprise-plan
```

**Create Custom Fields:**
```
dashboard_url (Text)
cyfe_user_id (Text)
dashboard_expires (Date)
```

**Create Webhooks:**
1. Contact Created → `https://yourdomain.com/webhooks/ghl/contact-created`
2. Contact Updated → `https://yourdomain.com/webhooks/ghl/contact-updated`
3. Opportunity Won → `https://yourdomain.com/webhooks/ghl/opportunity-won`

### Step 3: Deploy Backend (10 minutes)

```bash
# Install dependencies
npm install express crypto-js

# Deploy webhook handler
# Copy src/api/ghl-webhook-handler.js to your server
# Copy src/middleware/CyfeSSOMiddleware.js to your server

# Start server
node server.js
```

### Step 4: Test Integration (5 minutes)

1. **Test Webhook:**
```bash
curl -X POST https://yourdomain.com/webhooks/ghl/contact-created \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_123",
    "email": "test@example.com",
    "name": "Test User",
    "tags": ["starter-plan"]
  }'
```

2. **Test SSO Token:**
```bash
curl -X POST https://yourdomain.com/api/sso/generate-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_123",
    "email": "test@example.com",
    "planId": "starter"
  }'
```

3. **Test Dashboard Access:**
   - Copy the `loginUrl` from response
   - Open in browser
   - Should auto-login to dashboard

### Step 5: Create GHL Workflow (10 minutes)

**Simple Onboarding Workflow:**

```
Trigger: Contact Created
↓
Wait: 2 minutes
↓
Add Tag: free-plan (or based on form)
↓
Custom Action: Generate Dashboard Link
  URL: /api/sso/generate-login
  Body: { userId: {{contact.id}}, email: {{contact.email}} }
↓
Update Custom Field: dashboard_url = {{response.loginUrl}}
↓
Send Email: Welcome with dashboard link
```

### Step 6: Frontend Integration (5 minutes)

Use the `AutoLoginDashboard` component:

```jsx
import AutoLoginDashboard from './components/AutoLoginDashboard';

function Dashboard() {
  return (
    <div>
      <h1>Your Analytics</h1>
      <AutoLoginDashboard 
        dashboardId="basic_analytics"
        height="600px"
      />
    </div>
  );
}
```

## ✅ Verification Checklist

Test these scenarios:

- [ ] New contact in GHL creates user in your system
- [ ] User receives email with dashboard link
- [ ] Dashboard link auto-logs user in (no credentials needed)
- [ ] User sees correct dashboards for their plan
- [ ] Plan upgrade gives access to new dashboards
- [ ] Plan downgrade removes premium dashboards

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Check API keys are correct and active

### Issue: Dashboard shows login page
**Solution:** Verify SSO token is being generated and included in URL

### Issue: Webhook not triggering
**Solution:** Check webhook URL is publicly accessible and HTTPS

### Issue: Wrong dashboards showing
**Solution:** Verify tag mapping in `mapGHLTagToPlan()` function

## 📊 Monitor These Metrics

Track in your analytics:
- New users provisioned per day
- Dashboard access rate
- SSO token generation failures
- Webhook processing errors
- Plan upgrade/downgrade rate

## 🎯 Next Steps

After basic setup works:

1. **Enhance Email Templates**
   - Add branding
   - Include screenshots
   - Add quick start guide

2. **Add More Workflows**
   - Trial expiration
   - Re-engagement
   - Upgrade prompts

3. **Implement Analytics**
   - Track dashboard usage
   - Monitor user engagement
   - Measure conversion rates

4. **Security Hardening**
   - Implement rate limiting
   - Add IP whitelisting
   - Enable audit logging

## 📞 Support

- **Technical Issues:** Check `GHL_CYFE_SSO_IMPLEMENTATION.md`
- **GHL Questions:** https://highlevel.stoplight.io/
- **Cyfe Questions:** https://www.cyfe.com/support/

## 🔐 Security Notes

⚠️ **Important:**
- Never commit `.env` file to git
- Rotate secrets regularly (every 90 days)
- Use different secrets for dev/staging/production
- Implement webhook signature verification
- Monitor for suspicious access patterns

## 📝 Quick Reference

**Generate SSO Link:**
```javascript
const loginUrl = CyfeSSOMiddleware.generateCyfeLoginUrl(userData);
```

**Provision User:**
```javascript
await CyfeSSOMiddleware.provisionCyfeUser(userData);
```

**Handle Plan Upgrade:**
```javascript
await CyfeSSOMiddleware.handlePlanUpgrade(userId, newPlan);
```

**Check Dashboard Access:**
```javascript
const hasAccess = CyfeService.hasDashboardAccess(userId, planId, dashboardId);
```

---

**Total Setup Time:** ~40 minutes
**Complexity:** Medium
**Prerequisites:** GHL + Cyfe White-Label accounts

Ready to launch! 🚀
