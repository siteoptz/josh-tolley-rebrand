// GoHighLevel Webhook Handler
// Express.js endpoint to handle GHL webhooks for user provisioning

import express from 'express';
import CyfeSSOMiddleware from '../middleware/CyfeSSOMiddleware';

const router = express.Router();

/**
 * GHL Webhook endpoint for new contact creation
 * Triggered when a new contact is created in GHL
 */
router.post('/webhooks/ghl/contact-created', async (req, res) => {
  try {
    console.log('GHL webhook received:', req.body);

    // Verify webhook signature
    const signature = req.headers['x-ghl-signature'];
    if (!verifyGHLSignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Extract contact data from GHL webhook
    const contactData = req.body;

    // Process the webhook and provision user
    const result = await CyfeSSOMiddleware.handleGHLWebhook({
      contact: contactData,
      signature: signature,
      headers: req.headers
    });

    // Return success response with SSO token
    res.json({
      success: true,
      message: 'User provisioned successfully',
      userId: result.user.id,
      cyfeUserId: result.cyfeUser.id,
      ssoToken: result.ssoToken.token,
      dashboardUrl: CyfeSSOMiddleware.generateCyfeLoginUrl(result.user)
    });

  } catch (error) {
    console.error('GHL webhook processing failed:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

/**
 * GHL Webhook endpoint for contact updates
 * Triggered when a contact is updated (e.g., plan change)
 */
router.post('/webhooks/ghl/contact-updated', async (req, res) => {
  try {
    const contactData = req.body;
    
    // Check if plan-related tags changed
    const oldTags = contactData.oldTags || [];
    const newTags = contactData.tags || [];
    
    const planChanged = checkPlanChange(oldTags, newTags);
    
    if (planChanged) {
      const newPlan = CyfeSSOMiddleware.mapGHLTagToPlan(newTags);
      await CyfeSSOMiddleware.handlePlanUpgrade(contactData.id, newPlan);
    }

    res.json({
      success: true,
      message: 'Contact updated successfully'
    });

  } catch (error) {
    console.error('Contact update webhook failed:', error);
    res.status(500).json({
      error: 'Update processing failed',
      message: error.message
    });
  }
});

/**
 * GHL Webhook endpoint for opportunity updates
 * Triggered when an opportunity is won (e.g., upgrade purchase)
 */
router.post('/webhooks/ghl/opportunity-won', async (req, res) => {
  try {
    const opportunityData = req.body;
    
    // Extract plan information from opportunity
    const planInfo = extractPlanFromOpportunity(opportunityData);
    
    if (planInfo) {
      await CyfeSSOMiddleware.handlePlanUpgrade(
        opportunityData.contactId,
        planInfo.plan
      );
    }

    res.json({
      success: true,
      message: 'Opportunity processed successfully'
    });

  } catch (error) {
    console.error('Opportunity webhook failed:', error);
    res.status(500).json({
      error: 'Opportunity processing failed',
      message: error.message
    });
  }
});

/**
 * SSO endpoint - generates login URL for user
 * This can be called directly from GHL custom actions
 */
router.post('/api/sso/generate-login', async (req, res) => {
  try {
    const { userId, email, dashboardId } = req.body;

    // Get user data
    const userData = await CyfeSSOMiddleware.getUserData(userId);

    // Generate SSO login URL
    const loginUrl = CyfeSSOMiddleware.generateCyfeLoginUrl(userData, dashboardId);

    res.json({
      success: true,
      loginUrl: loginUrl,
      expiresIn: 86400 // 24 hours
    });

  } catch (error) {
    console.error('SSO generation failed:', error);
    res.status(500).json({
      error: 'SSO generation failed',
      message: error.message
    });
  }
});

/**
 * Verify GHL webhook signature
 */
function verifyGHLSignature(payload, signature) {
  // Implement proper HMAC verification
  // This is a placeholder
  const secretKey = process.env.REACT_APP_GHL_WEBHOOK_SECRET;
  
  if (!secretKey || !signature) {
    console.warn('Missing signature or secret key');
    return true; // For development only
  }

  // In production, verify with crypto
  // const crypto = require('crypto');
  // const hmac = crypto.createHmac('sha256', secretKey);
  // const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  // return digest === signature;

  return true; // Placeholder
}

/**
 * Check if plan-related tags changed
 */
function checkPlanChange(oldTags, newTags) {
  const planTags = ['free-plan', 'starter-plan', 'pro-plan', 'enterprise-plan'];
  
  const oldPlanTags = oldTags.filter(tag => 
    planTags.includes(tag.toLowerCase())
  );
  
  const newPlanTags = newTags.filter(tag => 
    planTags.includes(tag.toLowerCase())
  );
  
  return JSON.stringify(oldPlanTags) !== JSON.stringify(newPlanTags);
}

/**
 * Extract plan information from opportunity data
 */
function extractPlanFromOpportunity(opportunityData) {
  // Check opportunity name or custom fields for plan info
  const name = opportunityData.name?.toLowerCase() || '';
  const customFields = opportunityData.customFields || {};
  
  if (name.includes('starter') || customFields.plan === 'starter') {
    return { plan: 'starter', price: 29 };
  } else if (name.includes('pro') || customFields.plan === 'pro') {
    return { plan: 'pro', price: 99 };
  } else if (name.includes('enterprise') || customFields.plan === 'enterprise') {
    return { plan: 'enterprise', price: 'custom' };
  }
  
  return null;
}

export default router;
