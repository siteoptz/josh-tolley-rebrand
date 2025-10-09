import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { pricingPlans, stripeConfig } from '../pricing-plans';

const StripeContext = createContext();

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const stripePromise = loadStripe(stripeConfig.publishableKey);

  const createCheckoutSession = async (priceId, planName) => {
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create checkout session on your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planName,
          successUrl: `${window.location.origin}/dashboard/success`,
          cancelUrl: `${window.location.origin}/dashboard/${planName.toLowerCase()}`
        }),
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error('Error redirecting to checkout:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const openUpgradeModal = async (targetPlan) => {
    try {
      const plan = pricingPlans[targetPlan];
      
      if (!plan || !plan.stripePriceId) {
        // Handle enterprise custom pricing
        window.open('/contact-sales', '_blank');
        return;
      }

      await createCheckoutSession(plan.stripePriceId, targetPlan);
    } catch (error) {
      console.error('Error opening upgrade modal:', error);
      // Fallback to contact sales
      window.open('/contact-sales', '_blank');
    }
  };

  const value = {
    stripePromise,
    createCheckoutSession,
    openUpgradeModal
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};
