import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import './SuccessPage.css';

const SuccessPage = () => {
  const { currentPlan, setCurrentPlan } = useUser();
  const navigate = useNavigate();

  const handleContinue = () => {
    // Redirect to the appropriate dashboard based on current plan
    navigate(`/dashboard/${currentPlan}`);
  };

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10b981"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Your subscription has been activated successfully. Welcome to your new plan!
        </p>
        
        <div className="success-details">
          <div className="detail-item">
            <span className="detail-label">New Plan:</span>
            <span className="detail-value">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Activation Date:</span>
            <span className="detail-value">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value active">Active</span>
          </div>
        </div>
        
        <div className="next-steps">
          <h2>What's Next?</h2>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Explore New Features</h3>
                <p>Discover all the powerful features available in your new plan</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Set Up Your First Project</h3>
                <p>Create your first scraping job and start collecting data</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Invite Your Team</h3>
                <p>Add team members and start collaborating on projects</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="primary-button" onClick={handleContinue}>
            Go to Dashboard
          </button>
          <button className="secondary-button" onClick={() => window.open('/documentation', '_blank')}>
            View Documentation
          </button>
        </div>
        
        <div className="support-info">
          <p>
            Need help getting started? 
            <a href="/support" className="support-link">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
