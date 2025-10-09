# GoHighLevel to Cyfe SSO Implementation Guide

This guide explains how to bypass Cyfe login and automatically authenticate users from GoHighLevel (GHL) using Single Sign-On (SSO).

## 🎯 Overview

The SSO implementation allows:
- **Automatic user provisioning** from GHL to Cyfe
- **Seamless authentication** without manual login
- **Plan-based dashboard access** based on GHL tags
- **Real-time sync** when users upgrade/downgrade
- **Embedded dashboards** with no login required

## 🔧 Architecture

```
GHL Contact Created → Webhook → Your Backend → Provision Cyfe User → Generate SSO Token → Auto-login to Dashboard
```

## 📋 Prerequisites

### 1. Cyfe White-Label Account Setup
- Active Cyfe White-Label subscription
- API access enabled
- Custom domain configured (e.g., `dashboards.yourdomain.com`)
- Client provisioning enabled

### 2. GoHighLevel Setup
- GHL location/account with API access
- Webhook configuration permissions
- Custom fields for plan tracking (optional)

### 3. Backend Requirements
- Node.js/Express server (or similar)
- Database for user management
- SSL certificate for webhook endpoints

## 🚀 Implementation Steps

### Step 1: Configure Environment Variables

```bash
# Cyfe Configuration
REACT_APP_CYFE_BASE_URL=https://app.cyfe.com
REACT_APP_CYFE_API_KEY=your_cyfe_api_key
REACT_APP_CYFE_WHITELABEL_DOMAIN=https://dashboards.yourdomain.com

# SSO Configuration
REACT_APP_SSO_SECRET_KEY=generate_strong_secret_key
REACT_APP_SSO_TOKEN_EXPIRY=86400

# GHL Configuration
REACT_APP_GHL_API_KEY=your_ghl_api_key
REACT_APP_GHL_WEBHOOK_SECRET=your_webhook_secret
REACT_APP_GHL_LOCATION_ID=your_location_id
```

### Step 2: Set Up GHL Webhooks

In your GoHighLevel account:

1. **Navigate to Settings → Integrations → Webhooks**

2. **Create Webhook for Contact Created:**
   - **URL:** `https://yourdomain.com/webhooks/ghl/contact-created`
   - **Events:** Contact Created
   - **Headers:** Add your webhook secret for verification

3. **Create Webhook for Contact Updated:**
   - **URL:** `https://yourdomain.com/webhooks/ghl/contact-updated`
   - **Events:** Contact Updated
   - **Trigger:** Tag changes (for plan updates)

4. **Create Webhook for Opportunity Won:**
   - **URL:** `https://yourdomain.com/webhooks/ghl/opportunity-won`
   - **Events:** Opportunity Status Change → Won
   - **Purpose:** Handle plan upgrades

### Step 3: Configure GHL Tags for Plans

Create tags in GHL to map to your pricing plans:

```
free-plan       → Free Plan
starter-plan    → Starter Plan ($29/mo)
pro-plan        → Pro Plan ($99/mo)
enterprise-plan → Enterprise Plan (Custom)
```

### Step 4: Configure Cyfe White-Label Domain

In Cyfe:

1. **Settings → White Label → Custom Domain**
   - Add your custom domain (e.g., `dashboards.yourdomain.com`)
   - Configure DNS records as instructed
   - Enable SSL

2. **Settings → API Access**
   - Generate API key
   - Enable client provisioning
   - Configure SSO settings

3. **Settings → User Management**
   - Enable automatic user creation
   - Configure default dashboard assignments

### Step 5: Deploy Backend Webhook Handler

Deploy the Express.js webhook handler:

```javascript
// server.js
import express from 'express';
import ghlWebhookHandler from './src/api/ghl-webhook-handler.js';

const app = express();

app.use(express.json());
app.use('/api', ghlWebhookHandler);

app.listen(3001, () => {
  console.log('Webhook server running on port 3001');
});
```

## 🔐 Authentication Flow

### New User Creation Flow

1. **Contact Created in GHL**
   ```
   User signs up → GHL creates contact → Webhook triggers
   ```

2. **Backend Processes Webhook**
   ```javascript
   {
     "contact": {
       "id": "contact_123",
       "email": "user@example.com",
       "name": "John Doe",
       "tags": ["starter-plan"]
     }
   }
   ```

3. **User Provisioning**
   ```javascript
   // Middleware provisions user in:
   // 1. Your database
   // 2. Cyfe white-label account
   // 3. Assigns appropriate dashboards
   ```

4. **SSO Token Generation**
   ```javascript
   const ssoToken = {
     email: "user@example.com",
     userId: "user_123",
     planId: "starter",
     cyfeUserId: "cyfe_user_123",
     expires: Date.now() + 86400000
   };
   ```

5. **Auto-Login URL Creation**
   ```
   https://dashboards.yourdomain.com/sso/login?
     sso_token=eyJlbWFpbCI6InVzZXJAZXhhbXBs...
     &signature=abc123...
     &auto_login=true
   ```

### Dashboard Access Flow

**Without SSO (Traditional - NOT recommended):**
```
User clicks link → Cyfe login page → Enter credentials → Dashboard
```

**With SSO (Our Implementation):**
```
User clicks link → Auto-authenticated → Dashboard loads immediately
```

## 🎨 Frontend Implementation

### Option 1: Using AutoLoginDashboard Component

```jsx
import AutoLoginDashboard from '../components/AutoLoginDashboard';

function DashboardPage() {
  return (
    <div>
      <h1>Your Analytics</h1>
      <AutoLoginDashboard 
        dashboardId="advanced_analytics"
        height="700px"
      />
    </div>
  );
}
```

### Option 2: Direct SSO Link

```jsx
import CyfeSSOMiddleware from '../middleware/CyfeSSOMiddleware';

function DashboardRedirect() {
  const handleViewDashboard = async () => {
    const userData = getCurrentUser();
    const loginUrl = CyfeSSOMiddleware.generateCyfeLoginUrl(userData);
    window.open(loginUrl, '_blank');
  };

  return (
    <button onClick={handleViewDashboard}>
      Open Dashboard
    </button>
  );
}
```

### Option 3: Embedded with Authentication

```jsx
function EmbeddedDashboard({ dashboardId }) {
  const user = useUser();
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    const url = CyfeSSOMiddleware.generateEmbedUrlWithAuth(
      user, 
      dashboardId
    );
    setEmbedUrl(url);
  }, [user, dashboardId]);

  return (
    <iframe 
      src={embedUrl}
      width="100%"
      height="600px"
      frameBorder="0"
    />
  );
}
```

## 🔄 User Lifecycle Management

### 1. New User Signup (from GHL)

```javascript
// GHL Workflow/Automation:
// 1. Contact created
// 2. Tag added (e.g., "starter-plan")
// 3. Webhook triggers
// 4. Backend creates user + Cyfe account
// 5. Email sent with dashboard link
```

### 2. Plan Upgrade

```javascript
// GHL Workflow/Automation:
// 1. Opportunity won OR tag changed
// 2. Webhook triggers with new plan
// 3. Backend updates user plan
// 4. Cyfe dashboards updated
// 5. User sees new dashboards immediately
```

### 3. Plan Downgrade

```javascript
// GHL Workflow/Automation:
// 1. Tag removed or changed
// 2. Webhook triggers
// 3. Backend revokes access to premium dashboards
// 4. User sees only allowed dashboards
```

### 4. Account Cancellation

```javascript
// GHL Workflow/Automation:
// 1. Tag "cancelled" or "inactive" added
// 2. Webhook triggers
// 3. Backend revokes all Cyfe access
// 4. User login disabled
```

## 📧 Email Templates for GHL

### Welcome Email with Dashboard Access

```html
Subject: Welcome to SiteOptz! Your Dashboard is Ready

Hi {{contact.first_name}},

Your analytics dashboard is now ready! Click the link below to access:

{{custom_values.dashboard_url}}

This link will automatically log you in - no password needed!

Your Plan: {{contact.tags}}
Features: [List based on plan]

Need help? Reply to this email.

Best,
SiteOptz Team
```

### Plan Upgrade Email

```html
Subject: You've Upgraded! New Dashboards Available

Hi {{contact.first_name}},

Congratulations on upgrading to the {{contact.tags}} plan!

New dashboards now available:
• Advanced Analytics
• API Monitoring
• Team Collaboration

Access your upgraded dashboard:
{{custom_values.dashboard_url}}

Enjoy your new features!

Best,
SiteOptz Team
```

## 🔒 Security Best Practices

### 1. Token Security
```javascript
// Use strong secret keys
const secretKey = crypto.randomBytes(32).toString('hex');

// Implement token expiration
const expires = Date.now() + (24 * 60 * 60 * 1000);

// Sign tokens with HMAC
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### 2. Webhook Verification
```javascript
// Always verify GHL webhook signatures
function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### 3. Rate Limiting
```javascript
// Implement rate limiting on webhook endpoints
app.use('/webhooks', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🧪 Testing the Integration

### 1. Test Contact Creation

```bash
# Simulate GHL webhook
curl -X POST https://yourdomain.com/webhooks/ghl/contact-created \
  -H "Content-Type: application/json" \
  -H "x-ghl-signature: your_test_signature" \
  -d '{
    "id": "test_contact_123",
    "email": "test@example.com",
    "name": "Test User",
    "tags": ["starter-plan"]
  }'
```

### 2. Test SSO Token Generation

```javascript
// In your console/API testing tool
const testUser = {
  id: 'test_user_123',
  email: 'test@example.com',
  name: 'Test User',
  planId: 'starter'
};

const token = CyfeSSOMiddleware.generateSSOToken(testUser);
console.log('SSO Token:', token);

const loginUrl = CyfeSSOMiddleware.generateCyfeLoginUrl(testUser);
console.log('Login URL:', loginUrl);
```

### 3. Test Dashboard Access

```javascript
// Navigate to generated URL
// Should auto-login without credentials
// Dashboard should load immediately
```

## 🐛 Troubleshooting

### Issue: Dashboard Not Loading

**Solutions:**
- Verify Cyfe domain is whitelisted
- Check SSO token is not expired
- Ensure user exists in Cyfe
- Verify API key permissions

### Issue: Webhook Not Triggering

**Solutions:**
- Check webhook URL is accessible (public)
- Verify SSL certificate is valid
- Check GHL webhook logs
- Test with manual webhook trigger

### Issue: Wrong Plan/Dashboards

**Solutions:**
- Verify GHL tag mapping
- Check tag names match exactly
- Review webhook payload
- Check plan update logic

### Issue: Authentication Failed

**Solutions:**
- Verify SSO secret key
- Check token signature
- Ensure token not expired
- Verify user credentials in Cyfe

## 📊 Monitoring & Analytics

Track these metrics:

```javascript
// Log important events
analytics.track('user_provisioned', { userId, planId });
analytics.track('dashboard_accessed', { userId, dashboardId });
analytics.track('plan_upgraded', { userId, oldPlan, newPlan });
analytics.track('sso_token_generated', { userId });
analytics.track('sso_login_success', { userId });
analytics.track('sso_login_failed', { userId, reason });
```

## 🎯 Next Steps

1. **Set up GHL webhooks** for your location
2. **Configure Cyfe white-label** domain and API
3. **Deploy backend webhook handler** to production
4. **Test with a sample contact** in GHL
5. **Monitor logs and errors** for first few users
6. **Gradually roll out** to all contacts
7. **Implement email automation** in GHL

## 📞 Support Resources

- **GHL API Documentation:** https://highlevel.stoplight.io/
- **Cyfe API Documentation:** https://www.cyfe.com/api/
- **Your Backend Logs:** Check for webhook processing errors
- **Cyfe Support:** For white-label configuration issues

---

**Implementation Status Checklist:**

- [ ] Environment variables configured
- [ ] GHL webhooks created
- [ ] GHL tags configured
- [ ] Cyfe white-label domain set up
- [ ] Cyfe API access enabled
- [ ] Backend webhook handler deployed
- [ ] SSO middleware implemented
- [ ] Frontend components integrated
- [ ] Email templates created in GHL
- [ ] Testing completed
- [ ] Production deployment
- [ ] Monitoring enabled
