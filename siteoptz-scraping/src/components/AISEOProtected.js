import React from 'react';
import { useUser } from '../contexts/UserContext';
import AISEODashboard from './AISEODashboard';
import { useNavigate } from 'react-router-dom';

const AISEOProtected = () => {
  const { currentPlan, user } = useUser();
  const navigate = useNavigate();

  // Check for SSO token in URL - if present, user is authenticated
  const urlParams = new URLSearchParams(window.location.search);
  const hasSSOToken = urlParams.has('sso_token');
  
  // Check if user has access (Pro or Enterprise plan OR has SSO token)
  const hasAccess = currentPlan === 'pro' || currentPlan === 'enterprise' || hasSSOToken;

  if (!hasAccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #000000, #1a1a1a, #000000)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '600px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Pro Plan Required
          </h1>
          <p style={{
            color: '#9ca3af',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            lineHeight: '1.8'
          }}>
            The AI-Powered Analytics Suite is exclusively available for Pro and Enterprise plan users.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/dashboard/upgrade')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'rgba(55, 65, 81, 0.9)',
                color: '#d1d5db',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(75, 85, 99, 0.9)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(55, 65, 81, 0.9)';
              }}
            >
              Back to Dashboard
            </button>
          </div>
          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h3 style={{
              color: '#10b981',
              marginBottom: '1rem'
            }}>
              What's included in the Analytics Suite:
            </h3>
            <ul style={{
              textAlign: 'left',
              color: '#d1d5db',
              lineHeight: '2',
              listStyle: 'none',
              padding: 0
            }}>
              <li>✅ AI-Powered SEO Analysis</li>
              <li>✅ Automated Content Generation</li>
              <li>✅ Competitor Intelligence</li>
              <li>✅ Keyword Research & Tracking</li>
              <li>✅ Technical SEO Audits</li>
              <li>✅ Link Building Opportunities</li>
              <li>✅ Monthly Performance Reports</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // User has access, show the AI SEO Dashboard
  return <AISEODashboard />;
};

export default AISEOProtected;