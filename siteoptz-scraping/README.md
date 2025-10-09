# SiteOptz Scraping Platform

> ⚠️ **CRITICAL WARNING**: This is a React dashboard project. **NEVER deploy this to production websites like siteoptz.ai or siteoptz.com**. See [DEPLOYMENT_GUIDELINES.md](./DEPLOYMENT_GUIDELINES.md) for safe deployment instructions.

A comprehensive web scraping platform with tiered pricing plans and dashboard functionality integrated with Stripe checkout.

## 🚨 Deployment Warning

**DO NOT DEPLOY TO:**
- ❌ siteoptz.ai (main website)
- ❌ siteoptz.com (agency website)  
- ❌ Any customer/client production sites

**SAFE TO DEPLOY TO:**
- ✅ siteoptz-scraping (this project's dedicated Vercel project)
- ✅ Development/staging environments only

## Pricing Plans Overview

### 🆓 Free Plan - $0/month
**Perfect for getting started with basic scraping needs**

**Features:**
- Up to 100 requests per day
- Basic data extraction
- Standard support (email)
- 5 concurrent scraping jobs
- Basic data export (CSV)
- Community forum access
- Basic analytics dashboard
- 1 user account
- Standard data retention (30 days)
- Basic rate limiting protection

**Limitations:**
- No API access
- No custom headers
- No proxy rotation
- Limited to basic selectors
- No scheduled scraping
- No webhook notifications

**Upgrade Benefits:**
- 10x more requests (1,000/day)
- API access included
- Scheduled scraping
- Custom headers support
- Priority email support

---

### 🚀 Starter Plan - $29/month
**Ideal for small projects and individual developers**

**Features:**
- Everything in Free
- Up to 1,000 requests per day
- Advanced data extraction
- API access with 1,000 calls/month
- Custom headers support
- Basic proxy rotation
- 10 concurrent scraping jobs
- Scheduled scraping (daily)
- Email notifications
- Advanced data export (CSV, JSON, XML)
- Enhanced analytics dashboard
- Priority email support
- 3 user accounts
- Extended data retention (90 days)
- Custom rate limiting
- Basic webhook notifications

**Limitations:**
- No JavaScript rendering
- Limited to 5 custom selectors
- No team collaboration features
- No white-label options
- No dedicated support

**Upgrade Benefits:**
- 10x more requests (10,000/day)
- JavaScript rendering
- Team collaboration
- Advanced analytics
- Dedicated account manager

---

### 💼 Pro Plan - $99/month
**Perfect for growing businesses and development teams**

**Features:**
- Everything in Starter
- Up to 10,000 requests per day
- JavaScript rendering support
- Advanced proxy rotation
- API access with 10,000 calls/month
- Unlimited custom selectors
- 50 concurrent scraping jobs
- Flexible scheduling (hourly, daily, weekly)
- Advanced webhook notifications
- Team collaboration features
- Advanced analytics & reporting
- Priority support (24-48 hours)
- 10 user accounts
- Full data retention (1 year)
- Custom data processing
- Integration with 3rd party tools
- Basic white-label options
- Dedicated account manager

**Limitations:**
- No custom infrastructure
- No SLA guarantees
- Limited to standard regions
- No compliance certifications

**Upgrade Benefits:**
- Unlimited requests
- Custom infrastructure
- 24/7 priority support
- SLA guarantees
- Compliance certifications

---

### 🏢 Enterprise Plan - Custom Pricing
**Tailored solutions for large organizations with advanced requirements**

**Features:**
- Everything in Pro
- Unlimited requests per day
- Custom infrastructure setup
- Dedicated proxy networks
- Unlimited API access
- Advanced JavaScript rendering
- Unlimited concurrent jobs
- Custom scheduling options
- Real-time webhook notifications
- Advanced team management
- Custom analytics & reporting
- 24/7 priority support
- Unlimited user accounts
- Unlimited data retention
- Custom data processing pipelines
- Full white-label solution
- Dedicated account manager & success team
- SLA guarantees (99.9% uptime)
- Compliance certifications (SOC 2, GDPR)
- Custom integrations
- On-premise deployment options
- Advanced security features
- Custom rate limiting
- Multi-region support
- Training and onboarding

## Dashboard Structure

The platform includes dedicated dashboard pages for each plan tier:

- `/dashboard/free` - Free plan dashboard
- `/dashboard/starter` - Starter plan dashboard  
- `/dashboard/pro` - Pro plan dashboard
- `/dashboard/enterprise` - Enterprise plan dashboard

Each dashboard includes:
- Plan-specific usage statistics
- Feature overview and limitations
- Upgrade prompts with Stripe integration
- Quick action buttons
- Recent activity feeds
- Plan-specific analytics

## Stripe Integration

The platform integrates with Stripe Checkout for seamless upgrades:

- **Free → Starter**: $29/month via Stripe checkout
- **Starter → Pro**: $99/month via Stripe checkout  
- **Pro → Enterprise**: Custom pricing via contact sales
- **Success Page**: Confirmation and next steps after payment

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── DashboardLayout.js
│   └── DashboardLayout.css
├── contexts/
│   ├── StripeContext.js
│   └── UserContext.js
├── pages/
│   ├── FreeDashboard.js
│   ├── StarterDashboard.js
│   ├── ProDashboard.js
│   ├── EnterpriseDashboard.js
│   ├── SuccessPage.js
│   ├── DashboardPage.css
│   └── SuccessPage.css
├── App.js
├── App.css
├── index.js
└── index.css
```

## Key Features

- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile
- **Stripe Integration**: Secure payment processing with checkout modals
- **Plan-Specific Dashboards**: Tailored experience for each pricing tier
- **Upgrade Prompts**: Strategic placement of upgrade options
- **Real-time Statistics**: Usage tracking and analytics
- **Modern UI/UX**: Clean, professional design with smooth animations

## Customization

The pricing plans and features can be easily customized by modifying the `pricing-plans.js` file. This includes:

- Plan names and descriptions
- Feature lists and limitations
- Pricing and billing periods
- Upgrade flow configuration
- Stripe price IDs

## Support

For questions about the platform or customization needs, please contact our support team.
