# GoHighLevel Custom Actions Examples

These custom actions can be used in GHL workflows to integrate with your Cyfe SSO system.

## 1. Generate Dashboard Link (Custom Action)

### Setup in GHL

**Action Name:** Generate Dashboard Link

**Webhook URL:** `https://yourdomain.com/api/sso/generate-login`

**Method:** POST

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

**Body:**
```json
{
  "userId": "{{contact.id}}",
  "email": "{{contact.email}}",
  "name": "{{contact.name}}",
  "planId": "{{contact.tags}}"
}
```

**Response Handling:**
```javascript
// Store the dashboard URL in a custom field
{
  "dashboard_url": "{{response.loginUrl}}",
  "dashboard_expires": "{{response.expiresIn}}"
}
```

### Usage in Workflow

```
Trigger: Contact Created
↓
Action: Add Tag (starter-plan)
↓
Action: Generate Dashboard Link (Custom Action)
↓
Action: Update Custom Field (dashboard_url = {{response.loginUrl}})
↓
Action: Send Email with Dashboard Link
```

## 2. Provision User in Cyfe (Custom Action)

### Setup in GHL

**Action Name:** Provision Cyfe User

**Webhook URL:** `https://yourdomain.com/api/users/provision-cyfe`

**Method:** POST

**Body:**
```json
{
  "contactId": "{{contact.id}}",
  "email": "{{contact.email}}",
  "firstName": "{{contact.first_name}}",
  "lastName": "{{contact.last_name}}",
  "phone": "{{contact.phone}}",
  "tags": "{{contact.tags}}",
  "customFields": {
    "company": "{{contact.company}}",
    "website": "{{contact.website}}"
  }
}
```

### Usage in Workflow

```
Trigger: Tag Added (starter-plan)
↓
Action: Provision Cyfe User (Custom Action)
↓
Condition: If provision successful
  ↓ Yes
  Action: Send Welcome Email with Dashboard
  ↓ No
  Action: Send Admin Alert
```

## 3. Update User Plan (Custom Action)

### Setup in GHL

**Action Name:** Update User Plan

**Webhook URL:** `https://yourdomain.com/api/users/update-plan`

**Method:** PUT

**Body:**
```json
{
  "contactId": "{{contact.id}}",
  "oldPlan": "{{contact.tags.previous}}",
  "newPlan": "{{contact.tags.current}}",
  "upgradeDate": "{{workflow.timestamp}}"
}
```

### Usage in Workflow

```
Trigger: Tag Changed (Plan Tags)
↓
Action: Update User Plan (Custom Action)
↓
Action: Generate New Dashboard Link
↓
Action: Send Upgrade Confirmation Email
```

## 4. Revoke Dashboard Access (Custom Action)

### Setup in GHL

**Action Name:** Revoke Dashboard Access

**Webhook URL:** `https://yourdomain.com/api/users/revoke-access`

**Method:** POST

**Body:**
```json
{
  "contactId": "{{contact.id}}",
  "email": "{{contact.email}}",
  "reason": "plan_cancelled"
}
```

### Usage in Workflow

```
Trigger: Tag Added (cancelled)
OR
Trigger: Opportunity Lost
↓
Action: Revoke Dashboard Access (Custom Action)
↓
Action: Send Cancellation Email
```

## 5. Complete Workflow Examples

### Workflow 1: New User Onboarding

```yaml
Name: New User - Complete Onboarding with Dashboard

Trigger: Contact Created

Steps:
  1. Wait: 5 minutes (allow contact to be fully created)
  
  2. Condition: Check if email exists
     If NO: Stop workflow
  
  3. Add Tag: Based on form submission or default to "free-plan"
  
  4. Custom Action: Provision Cyfe User
     URL: /api/users/provision-cyfe
     Save response to: custom_field.cyfe_user_id
  
  5. Custom Action: Generate Dashboard Link
     URL: /api/sso/generate-login
     Save response to: custom_field.dashboard_url
  
  6. Update Custom Fields:
     - dashboard_url: {{response.loginUrl}}
     - dashboard_expires: {{response.expiresIn}}
     - onboarding_status: "completed"
  
  7. Send Email: Welcome Email
     Subject: Welcome! Your Dashboard is Ready
     Body: Includes {{custom_field.dashboard_url}}
  
  8. Wait: 3 days
  
  9. Condition: Has user accessed dashboard?
     If NO: Send reminder email
```

### Workflow 2: Plan Upgrade Automation

```yaml
Name: Handle Plan Upgrade

Trigger: Opportunity Status Changed to "Won"

Steps:
  1. Extract Plan from Opportunity Name
     Store in: workflow.plan_name
  
  2. Remove Old Plan Tags:
     - Remove: free-plan
     - Remove: starter-plan
     - Remove: pro-plan
  
  3. Add New Plan Tag:
     - Add: {{workflow.plan_name}}
  
  4. Custom Action: Update User Plan
     URL: /api/users/update-plan
     Body: {
       contactId: {{contact.id}},
       newPlan: {{workflow.plan_name}}
     }
  
  5. Custom Action: Generate New Dashboard Link
     URL: /api/sso/generate-login
     Save to: custom_field.dashboard_url
  
  6. Send Email: Upgrade Success
     Include: List of new features
     Include: New dashboard link
  
  7. Create Task: Follow-up in 7 days
     Assigned to: Account Manager
     Note: Check if user is using new features
```

### Workflow 3: Free Trial to Paid Conversion

```yaml
Name: Free Trial Expiration

Trigger: Contact Tag Added "trial-expired"

Steps:
  1. Check Current Plan Tag
     If: free-plan or trial-plan
  
  2. Custom Action: Revoke Advanced Dashboard Access
     URL: /api/users/limit-dashboards
     Body: { plan: "free" }
  
  3. Remove Tags:
     - trial-plan
     - starter-trial
  
  4. Add Tag: free-plan
  
  5. Send Email: Trial Expired - Upgrade Prompt
     Include: Comparison of plans
     Include: Upgrade links
  
  6. Create Opportunity: Upgrade to Starter
     Stage: New
     Value: $29/month
  
  7. Add to Campaign: Upgrade Nurture Campaign
  
  8. Wait: 7 days
  
  9. Condition: Has upgraded?
     If NO: Send follow-up email
     If YES: Stop workflow
```

### Workflow 4: Dashboard Access Link Refresh

```yaml
Name: Refresh Dashboard Access Link

Trigger: Custom Action Button Clicked "Refresh Dashboard Link"
OR
Trigger: Scheduled (Every 20 days)

Steps:
  1. Get Contact Details
  
  2. Custom Action: Generate New Dashboard Link
     URL: /api/sso/generate-login
     Body: {
       userId: {{contact.id}},
       email: {{contact.email}},
       planId: {{contact.tags}}
     }
  
  3. Update Custom Field:
     dashboard_url: {{response.loginUrl}}
     last_refreshed: {{workflow.timestamp}}
  
  4. Send Email: Updated Dashboard Link
     (Optional - only if user requested)
```

## GHL Email Template Examples

### Email 1: Welcome with Dashboard

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .button {
      background-color: #3b82f6;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h1>Welcome to SiteOptz, {{contact.first_name}}! 🎉</h1>
  
  <p>Your analytics dashboard is ready and waiting for you!</p>
  
  <p>
    <a href="{{custom_values.dashboard_url}}" class="button">
      Access Your Dashboard →
    </a>
  </p>
  
  <p><small>This link will automatically log you in - no password needed!</small></p>
  
  <h3>Your Plan: {{contact.tags}}</h3>
  
  <p>Need help getting started? Reply to this email or check our docs.</p>
  
  <p>Best,<br>The SiteOptz Team</p>
</body>
</html>
```

### Email 2: Plan Upgrade Confirmation

```html
<h1>🚀 You've Upgraded!</h1>

<p>Hi {{contact.first_name}},</p>

<p>Congratulations on upgrading to the <strong>{{contact.tags}}</strong> plan!</p>

<h3>New Features Now Available:</h3>
<ul>
  <li>✅ Advanced Analytics Dashboard</li>
  <li>✅ API Monitoring</li>
  <li>✅ Real-time Data Updates</li>
  <li>✅ Priority Support</li>
</ul>

<p>
  <a href="{{custom_values.dashboard_url}}" class="button">
    Access Your Upgraded Dashboard →
  </a>
</p>

<p>Your new dashboards are ready to use right now!</p>

<p>Questions? Reply to this email.</p>
```

## Custom Fields to Create in GHL

Create these custom fields in your GHL location:

1. **dashboard_url** (Text)
   - Purpose: Store the auto-login dashboard URL
   - Used in: Emails, SMS, workflows

2. **cyfe_user_id** (Text)
   - Purpose: Store Cyfe user ID for reference
   - Used in: API calls, troubleshooting

3. **dashboard_expires** (Date)
   - Purpose: Track when dashboard link expires
   - Used in: Refresh workflows

4. **plan_start_date** (Date)
   - Purpose: Track when current plan started
   - Used in: Billing, analytics

5. **last_dashboard_access** (Date)
   - Purpose: Track user engagement
   - Used in: Re-engagement campaigns

6. **onboarding_status** (Dropdown)
   - Options: pending, completed, skipped
   - Used in: Onboarding workflows

## Testing Custom Actions

Use this cURL command to test your endpoints:

```bash
# Test user provisioning
curl -X POST https://yourdomain.com/api/users/provision-cyfe \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "test_123",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "tags": ["starter-plan"]
  }'

# Test SSO link generation
curl -X POST https://yourdomain.com/api/sso/generate-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_123",
    "email": "test@example.com",
    "planId": "starter"
  }'
```

## Monitoring Dashboard Usage

Create this custom action to track dashboard usage:

```json
{
  "name": "Track Dashboard Access",
  "url": "https://yourdomain.com/api/analytics/track-access",
  "method": "POST",
  "body": {
    "contactId": "{{contact.id}}",
    "event": "dashboard_accessed",
    "timestamp": "{{workflow.timestamp}}"
  }
}
```

Use in workflow:
```
Trigger: Contact Clicks Email Link (Dashboard URL)
↓
Action: Track Dashboard Access (Custom Action)
↓
Action: Update Custom Field: last_dashboard_access
```
