// Cyfe Single Sign-On (SSO) Middleware
// This middleware handles automatic authentication between GHL and Cyfe white-label dashboards

import CyfeService from '../services/CyfeService';

class CyfeSSOMiddleware {
  constructor() {
    this.cyfeWhiteLabelUrl = process.env.REACT_APP_CYFE_WHITELABEL_DOMAIN;
    this.cyfeApiKey = process.env.REACT_APP_CYFE_API_KEY;
    this.secretKey = process.env.REACT_APP_SSO_SECRET_KEY;
    this.ghlWebhookSecret = process.env.REACT_APP_GHL_WEBHOOK_SECRET;
  }

  /**
   * Generate SSO token for Cyfe authentication
   * This creates a signed token that Cyfe can validate
   */
  generateSSOToken(userData) {
    const payload = {
      email: userData.email,
      name: userData.name,
      userId: userData.id,
      planId: userData.planId,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      // Cyfe-specific fields
      cyfeUserId: userData.cyfeUserId || `user_${userData.id}`,
      returnUrl: userData.returnUrl || '/'
    };

    // Sign the payload with your secret key
    const signature = this.signPayload(payload);
    
    return {
      token: btoa(JSON.stringify(payload)),
      signature: signature
    };
  }

  /**
   * Sign payload with HMAC-SHA256 (you'll need crypto-js or similar)
   */
  signPayload(payload) {
    // In production, use proper HMAC signing
    // For now, using a simple signing mechanism
    const payloadString = JSON.stringify(payload);
    return btoa(`${payloadString}:${this.secretKey}`);
  }

  /**
   * Verify SSO token signature
   */
  verifySSOToken(token, signature) {
    try {
      const payload = JSON.parse(atob(token));
      const expectedSignature = this.signPayload(payload);
      
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      if (Date.now() > payload.expires) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Invalid token format' };
    }
  }

  /**
   * Handle GHL webhook for new user creation
   * This is triggered when a new user is created in GHL
   */
  async handleGHLWebhook(webhookData) {
    try {
      // Verify webhook signature from GHL
      if (!this.verifyGHLWebhook(webhookData)) {
        throw new Error('Invalid webhook signature');
      }

      const ghlUser = webhookData.contact || webhookData.user;
      
      // Map GHL user data to your system
      const userData = {
        id: ghlUser.id,
        email: ghlUser.email,
        name: ghlUser.name || `${ghlUser.firstName} ${ghlUser.lastName}`,
        phone: ghlUser.phone,
        planId: this.mapGHLTagToPlan(ghlUser.tags),
        ghlContactId: ghlUser.id,
        customFields: ghlUser.customFields || {}
      };

      // Create or update user in your system
      const user = await this.createOrUpdateUser(userData);

      // Provision Cyfe user account
      const cyfeUser = await this.provisionCyfeUser(user);

      // Return SSO credentials
      return {
        success: true,
        user: user,
        cyfeUser: cyfeUser,
        ssoToken: this.generateSSOToken({ ...user, cyfeUserId: cyfeUser.id })
      };
    } catch (error) {
      console.error('GHL webhook handling failed:', error);
      throw error;
    }
  }

  /**
   * Verify GHL webhook signature
   */
  verifyGHLWebhook(webhookData) {
    // GHL sends a signature in the headers
    // Implement proper signature verification
    const signature = webhookData.signature || webhookData.headers?.['x-ghl-signature'];
    
    if (!signature) {
      console.warn('No webhook signature provided');
      return false; // In production, return false
    }

    // Verify signature using your GHL webhook secret
    // This is a placeholder - implement actual verification
    return true;
  }

  /**
   * Map GHL tags to pricing plans
   */
  mapGHLTagToPlan(tags = []) {
    const tagToPlan = {
      'free-plan': 'free',
      'starter-plan': 'starter',
      'pro-plan': 'pro',
      'enterprise-plan': 'enterprise',
      // Alternative tag formats
      'tier-free': 'free',
      'tier-starter': 'starter',
      'tier-pro': 'pro',
      'tier-enterprise': 'enterprise'
    };

    for (const tag of tags) {
      const plan = tagToPlan[tag.toLowerCase()];
      if (plan) return plan;
    }

    return 'free'; // Default plan
  }

  /**
   * Provision user account in Cyfe white-label
   * This creates or updates the user in your Cyfe account
   */
  async provisionCyfeUser(userData) {
    try {
      const cyfeUserData = {
        email: userData.email,
        name: userData.name,
        userId: `user_${userData.id}`,
        plan: userData.planId,
        dashboards: this.getDashboardsForPlan(userData.planId)
      };

      // Call Cyfe API to create/update user
      const response = await fetch(`${this.cyfeWhiteLabelUrl}/api/users/provision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.cyfeApiKey}`,
          'X-Cyfe-API-Key': this.cyfeApiKey
        },
        body: JSON.stringify(cyfeUserData)
      });

      if (!response.ok) {
        throw new Error(`Cyfe provisioning failed: ${response.statusText}`);
      }

      const cyfeUser = await response.json();
      return cyfeUser;
    } catch (error) {
      console.error('Cyfe user provisioning failed:', error);
      throw error;
    }
  }

  /**
   * Get dashboards that should be assigned to user based on plan
   */
  getDashboardsForPlan(planId) {
    const availableDashboards = CyfeService.getAvailableDashboards(planId);
    return availableDashboards.map(d => d.id);
  }

  /**
   * Generate direct login URL for Cyfe dashboard (bypassing login)
   * This is the key method for SSO
   */
  generateCyfeLoginUrl(userData, dashboardId = null) {
    const ssoToken = this.generateSSOToken(userData);
    
    // Build the SSO URL with auto-login parameters
    const params = new URLSearchParams({
      sso_token: ssoToken.token,
      signature: ssoToken.signature,
      email: userData.email,
      user_id: userData.cyfeUserId || `user_${userData.id}`,
      return_to: dashboardId ? `/dashboards/${dashboardId}` : '/dashboards',
      auto_login: 'true'
    });

    return `${this.cyfeWhiteLabelUrl}/sso/login?${params.toString()}`;
  }

  /**
   * Generate iframe-embeddable URL with auto-authentication
   */
  generateEmbedUrlWithAuth(userData, dashboardId) {
    const ssoToken = this.generateSSOToken(userData);
    
    const params = new URLSearchParams({
      token: ssoToken.token,
      signature: ssoToken.signature,
      user: userData.cyfeUserId || `user_${userData.id}`,
      embed: 'true',
      hide_nav: 'true'
    });

    return `${this.cyfeWhiteLabelUrl}/embed/${dashboardId}?${params.toString()}`;
  }

  /**
   * Create or update user in your database
   */
  async createOrUpdateUser(userData) {
    try {
      // This would call your backend API
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('User sync failed');
      }

      return await response.json();
    } catch (error) {
      console.error('User creation/update failed:', error);
      throw error;
    }
  }

  /**
   * Handle user plan upgrade
   * Updates both your system and Cyfe
   */
  async handlePlanUpgrade(userId, newPlan) {
    try {
      // Update user plan in your system
      await fetch(`/api/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: newPlan })
      });

      // Update Cyfe user with new dashboard access
      const userData = await this.getUserData(userId);
      await this.provisionCyfeUser({ ...userData, planId: newPlan });

      return { success: true };
    } catch (error) {
      console.error('Plan upgrade failed:', error);
      throw error;
    }
  }

  /**
   * Get user data from your system
   */
  async getUserData(userId) {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get user data:', error);
      throw error;
    }
  }

  /**
   * Revoke user access (for downgrades or cancellations)
   */
  async revokeUserAccess(userId) {
    try {
      await fetch(`${this.cyfeWhiteLabelUrl}/api/users/${userId}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cyfeApiKey}`,
          'X-Cyfe-API-Key': this.cyfeApiKey
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to revoke user access:', error);
      throw error;
    }
  }
}

export default new CyfeSSOMiddleware();
