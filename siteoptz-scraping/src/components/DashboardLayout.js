import React from 'react';
import { useUser } from '../contexts/UserContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children, plan }) => {
  const { user, currentPlan, setCurrentPlan } = useUser();
  
  // Set the plan based on the route
  React.useEffect(() => {
    if (plan && plan !== currentPlan) {
      setCurrentPlan(plan);
    }
  }, [plan, currentPlan, setCurrentPlan]);

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <h1>SiteOptz Scraping</h1>
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`plan-badge plan-${plan}`}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            </span>
          </div>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="nav-links">
            <a href={`/dashboard/${plan}`} className="nav-link active">
              Dashboard
            </a>
            <a href={`/dashboard/${plan}/scraping`} className="nav-link">
              Scraping Jobs
            </a>
            <a href={`/dashboard/${plan}/analytics`} className="nav-link">
              Analytics
            </a>
            <a href={`/dashboard/${plan}/settings`} className="nav-link">
              Settings
            </a>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
