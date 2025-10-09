// Pricing Plans Configuration
export const pricingPlans = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started with basic scraping needs',
    features: [
      'Up to 100 requests per day',
      'Basic data extraction',
      'Standard support (email)',
      '5 concurrent scraping jobs',
      'Basic data export (CSV)',
      'Community forum access',
      'Basic analytics dashboard (Cyfe)',
      '1 dashboard access',
      'Basic widgets (usage stats, request timeline, error rates)',
      '1 user account',
      'Standard data retention (30 days)',
      'Basic rate limiting protection'
    ],
    limitations: [
      'No API access',
      'No custom headers',
      'No proxy rotation',
      'Limited to basic selectors',
      'No scheduled scraping',
      'No webhook notifications'
    ],
    stripePriceId: null, // Free plan
    upgradeTo: 'starter'
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Ideal for small projects and individual developers',
    features: [
      'Everything in Free',
      'Up to 1,000 requests per day',
      'Advanced data extraction',
      'API access with 1,000 calls/month',
      'Custom headers support',
      'Basic proxy rotation',
      '10 concurrent scraping jobs',
      'Scheduled scraping (daily)',
      'Email notifications',
      'Advanced data export (CSV, JSON, XML)',
      'Enhanced analytics dashboard (Cyfe)',
      '2 dashboard access',
      'Advanced widgets (API calls, scheduled jobs, performance metrics)',
      'API monitoring dashboard',
      'Real-time data updates',
      'Priority email support',
      '3 user accounts',
      'Extended data retention (90 days)',
      'Custom rate limiting',
      'Basic webhook notifications'
    ],
    limitations: [
      'No JavaScript rendering',
      'Limited to 5 custom selectors',
      'No team collaboration features',
      'No white-label options',
      'No dedicated support'
    ],
    stripePriceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    upgradeTo: 'pro'
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    period: 'month',
    description: 'Perfect for growing businesses and development teams',
    features: [
      'Everything in Starter',
      'Up to 10,000 requests per day',
      'JavaScript rendering support',
      'Advanced proxy rotation',
      'API access with 10,000 calls/month',
      'Unlimited custom selectors',
      '50 concurrent scraping jobs',
      'Flexible scheduling (hourly, daily, weekly)',
      'Advanced webhook notifications',
      'Team collaboration features',
      'Advanced analytics & reporting',
      'Priority support (24-48 hours)',
      '10 user accounts',
      'Full data retention (1 year)',
      'Custom data processing',
      'Integration with 3rd party tools',
      'Basic white-label options',
      'Dedicated account manager'
    ],
    limitations: [
      'No custom infrastructure',
      'No SLA guarantees',
      'Limited to standard regions',
      'No compliance certifications'
    ],
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    upgradeTo: 'enterprise'
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'custom',
    period: 'month',
    description: 'Tailored solutions for large organizations with advanced requirements',
    features: [
      'Everything in Pro',
      'Unlimited requests per day',
      'Custom infrastructure setup',
      'Dedicated proxy networks',
      'Unlimited API access',
      'Advanced JavaScript rendering',
      'Unlimited concurrent jobs',
      'Custom scheduling options',
      'Real-time webhook notifications',
      'Advanced team management',
      'Custom analytics & reporting',
      '24/7 priority support',
      'Unlimited user accounts',
      'Unlimited data retention',
      'Custom data processing pipelines',
      'Full white-label solution',
      'Dedicated account manager & success team',
      'SLA guarantees (99.9% uptime)',
      'Compliance certifications (SOC 2, GDPR)',
      'Custom integrations',
      'On-premise deployment options',
      'Advanced security features',
      'Custom rate limiting',
      'Multi-region support',
      'Training and onboarding'
    ],
    limitations: [],
    stripePriceId: null, // Custom pricing
    upgradeTo: null // Top tier
  }
};

// Feature comparison for upgrade prompts
export const upgradeFeatures = {
  freeToStarter: [
    '10x more requests (1,000/day)',
    'API access included',
    'Scheduled scraping',
    'Custom headers support',
    'Priority email support'
  ],
  starterToPro: [
    '10x more requests (10,000/day)',
    'JavaScript rendering',
    'Team collaboration',
    'Advanced analytics',
    'Dedicated account manager'
  ],
  proToEnterprise: [
    'Unlimited requests',
    'Custom infrastructure',
    '24/7 priority support',
    'SLA guarantees',
    'Compliance certifications'
  ]
};

// Stripe configuration
export const stripeConfig = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  successUrl: `${window.location.origin}/dashboard/success`,
  cancelUrl: `${window.location.origin}/dashboard`
};
