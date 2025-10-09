// AI SEO Service Dashboard Component
// White-label dashboard for agencies to manage AI SEO services

import React, { useState, useEffect } from 'react';
import './AISEODashboard.css';
import AISEOService from '../services/AISEOService';

const AISEODashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [serviceResults, setServiceResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({});
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    // Load from localStorage (in production, fetch from API)
    const savedClients = JSON.parse(localStorage.getItem('seo_clients') || '[]');
    setClients(savedClients);
  };

  const saveClients = (updatedClients) => {
    localStorage.setItem('seo_clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
  };

  const addClient = (clientData) => {
    const newClient = {
      id: Date.now().toString(),
      ...clientData,
      addedAt: new Date().toISOString(),
      lastServiceRun: null,
      status: 'active'
    };
    
    const updatedClients = [...clients, newClient];
    saveClients(updatedClients);
    setShowAddClientModal(false);
  };

  const runSEOService = async (client) => {
    setIsProcessing(true);
    setSelectedClient(client);
    setProgress({ stage: 'Starting...', percent: 0 });

    try {
      // Simulate progress updates
      const stages = [
        { stage: 'Keyword Research', percent: 15 },
        { stage: 'Content Generation', percent: 40 },
        { stage: 'Technical Audit', percent: 60 },
        { stage: 'Competitor Analysis', percent: 75 },
        { stage: 'Link Building', percent: 85 },
        { stage: 'Generating Report', percent: 95 }
      ];

      for (const stage of stages) {
        setProgress(stage);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Run the actual service
      const results = await AISEOService.executeMonthlyService(client);
      
      setServiceResults(results);
      setProgress({ stage: 'Complete!', percent: 100 });

      // Update client last run
      const updatedClients = clients.map(c => 
        c.id === client.id 
          ? { ...c, lastServiceRun: new Date().toISOString() }
          : c
      );
      saveClients(updatedClients);

      // Save results
      saveServiceResults(client.id, results);

    } catch (error) {
      console.error('Error running SEO service:', error);
      alert('Error running SEO service. Please check your API keys and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveServiceResults = (clientId, results) => {
    const allResults = JSON.parse(localStorage.getItem('seo_results') || '{}');
    if (!allResults[clientId]) allResults[clientId] = [];
    allResults[clientId].unshift(results);
    localStorage.setItem('seo_results', JSON.stringify(allResults));
  };

  const loadClientResults = (clientId) => {
    const allResults = JSON.parse(localStorage.getItem('seo_results') || '{}');
    return allResults[clientId] || [];
  };

  const viewClientResults = (client) => {
    const results = loadClientResults(client.id);
    if (results.length > 0) {
      setSelectedClient(client);
      setServiceResults(results[0]);
      setActiveTab('results');
    } else {
      alert('No results yet. Run the service first.');
    }
  };

  const deleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      const updatedClients = clients.filter(c => c.id !== clientId);
      saveClients(updatedClients);
    }
  };

  return (
    <div className="ai-seo-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🤖 AI-Powered SEO Service</h1>
          <p className="tagline">White-Label SEO Automation for Agencies</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-value">{clients.length}</div>
            <div className="stat-label">Active Clients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${clients.length * 1200}</div>
            <div className="stat-label">Monthly Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{clients.length * 15}</div>
            <div className="stat-label">Articles/Month</div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'clients' ? 'active' : ''} 
          onClick={() => setActiveTab('clients')}
        >
          👥 Clients
        </button>
        <button 
          className={activeTab === 'pricing' ? 'active' : ''} 
          onClick={() => setActiveTab('pricing')}
        >
          💰 Pricing
        </button>
        <button 
          className={activeTab === 'results' ? 'active' : ''} 
          onClick={() => setActiveTab('results')}
          disabled={!serviceResults}
        >
          📈 Results
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            clients={clients}
            onRunService={runSEOService}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab 
            clients={clients}
            onAddClient={() => setShowAddClientModal(true)}
            onRunService={runSEOService}
            onViewResults={viewClientResults}
            onDeleteClient={deleteClient}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTab />
        )}

        {activeTab === 'results' && serviceResults && (
          <ResultsTab 
            client={selectedClient}
            results={serviceResults}
          />
        )}
      </div>

      {isProcessing && (
        <ProcessingModal 
          progress={progress}
          client={selectedClient}
        />
      )}

      {showAddClientModal && (
        <AddClientModal 
          onAdd={addClient}
          onClose={() => setShowAddClientModal(false)}
        />
      )}
    </div>
  );
};

// ========== TAB COMPONENTS ==========

const OverviewTab = ({ clients, onRunService }) => {
  return (
    <div className="overview-tab">
      <div className="welcome-section">
        <h2>Welcome to AI-Powered SEO</h2>
        <p>
          Deliver enterprise-grade SEO services to your clients with 90% AI automation.
          Generate 15+ blog posts, perform technical audits, build links, and create
          comprehensive reports—all with one click.
        </p>
      </div>

      <div className="service-features">
        <h3>What's Included in Each Service Run:</h3>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h4>Keyword Research</h4>
            <p>100+ researched keywords with clustering and prioritization</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✍️</span>
            <h4>Content Generation</h4>
            <p>15-20 SEO-optimized blog posts (1500-2000 words each)</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔧</span>
            <h4>Technical SEO Audit</h4>
            <p>Complete site audit with fix instructions</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h4>Competitor Analysis</h4>
            <p>Analyze top 3 competitors and find opportunities</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔗</span>
            <h4>Link Building</h4>
            <p>20 prospects + personalized outreach emails</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📍</span>
            <h4>Local SEO</h4>
            <p>Google Business Profile optimization + citations</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🏷️</span>
            <h4>Schema Markup</h4>
            <p>JSON-LD schema for better search visibility</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📈</span>
            <h4>Monthly Report</h4>
            <p>Comprehensive white-label report with insights</p>
          </div>
        </div>
      </div>

      <div className="pricing-summary">
        <h3>Your Profit Margins:</h3>
        <div className="margin-calculator">
          <div className="margin-row">
            <span>Your Cost (SiteOptz.ai):</span>
            <span className="cost">$200-300/client/month</span>
          </div>
          <div className="margin-row">
            <span>Charge Your Clients:</span>
            <span className="revenue">$800-1500/client/month</span>
          </div>
          <div className="margin-row profit">
            <span><strong>Your Profit Per Client:</strong></span>
            <span className="profit-amount"><strong>$500-1200/month (60-80% margin)</strong></span>
          </div>
        </div>
        <p className="margin-note">
          💡 With 10 clients at $1000/month average = $6,000 profit/month
        </p>
      </div>

      {clients.length > 0 && (
        <div className="quick-actions">
          <h3>Quick Actions:</h3>
          <div className="client-quick-list">
            {clients.map(client => (
              <div key={client.id} className="quick-client-card">
                <div className="client-info">
                  <h4>{client.businessName}</h4>
                  <p>{client.industry}</p>
                  <span className="last-run">
                    Last run: {client.lastServiceRun 
                      ? new Date(client.lastServiceRun).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
                <button 
                  className="run-button"
                  onClick={() => onRunService(client)}
                >
                  Run Service
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ClientsTab = ({ clients, onAddClient, onRunService, onViewResults, onDeleteClient }) => {
  return (
    <div className="clients-tab">
      <div className="clients-header">
        <h2>Manage Clients</h2>
        <button className="add-client-button" onClick={onAddClient}>
          + Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <h3>No clients yet</h3>
          <p>Add your first client to start delivering AI-powered SEO services.</p>
          <button className="add-first-client" onClick={onAddClient}>
            + Add Your First Client
          </button>
        </div>
      ) : (
        <div className="clients-grid">
          {clients.map(client => (
            <div key={client.id} className="client-card">
              <div className="client-card-header">
                <h3>{client.businessName}</h3>
                <div className="client-actions">
                  <button 
                    className="action-button view"
                    onClick={() => onViewResults(client)}
                    title="View Results"
                  >
                    📊
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => onDeleteClient(client.id)}
                    title="Delete Client"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="client-details">
                <div className="detail-row">
                  <span className="label">Industry:</span>
                  <span>{client.industry}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span>{client.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Website:</span>
                  <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer">
                    {client.websiteUrl}
                  </a>
                </div>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span>{client.localBusiness ? 'Local Business' : 'National/Online'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Service:</span>
                  <span>
                    {client.lastServiceRun 
                      ? new Date(client.lastServiceRun).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>

              <button 
                className="run-service-button"
                onClick={() => onRunService(client)}
              >
                🚀 Run Monthly Service
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PricingTab = () => {
  return (
    <div className="pricing-tab">
      <h2>Service Pricing & Profitability</h2>
      <p className="pricing-intro">
        Here's how you can price and profit from AI-powered SEO services for your clients.
      </p>

      <div className="pricing-tiers">
        <div className="pricing-card recommended">
          <div className="recommended-badge">MOST POPULAR</div>
          <h3>Standard Package</h3>
          <div className="price">$1,000/month</div>
          <div className="pricing-breakdown">
            <div className="breakdown-item">
              <span>Your Cost:</span>
              <span>$250/month</span>
            </div>
            <div className="breakdown-item profit">
              <span><strong>Your Profit:</strong></span>
              <span><strong>$750/month</strong></span>
            </div>
            <div className="breakdown-item margin">
              <span>Margin:</span>
              <span>75%</span>
            </div>
          </div>
          <div className="deliverables">
            <h4>What Client Gets:</h4>
            <ul>
              <li>15 SEO-optimized blog posts/month</li>
              <li>100+ keyword research</li>
              <li>Technical SEO audit</li>
              <li>Monthly competitor analysis</li>
              <li>Link building (10 prospects)</li>
              <li>Monthly performance report</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <h3>Basic Package</h3>
          <div className="price">$600/month</div>
          <div className="pricing-breakdown">
            <div className="breakdown-item">
              <span>Your Cost:</span>
              <span>$200/month</span>
            </div>
            <div className="breakdown-item profit">
              <span><strong>Your Profit:</strong></span>
              <span><strong>$400/month</strong></span>
            </div>
            <div className="breakdown-item margin">
              <span>Margin:</span>
              <span>67%</span>
            </div>
          </div>
          <div className="deliverables">
            <h4>What Client Gets:</h4>
            <ul>
              <li>8 blog posts/month</li>
              <li>50+ keyword research</li>
              <li>Basic technical audit</li>
              <li>Quarterly competitor analysis</li>
              <li>Monthly report</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card premium">
          <h3>Premium Package</h3>
          <div className="price">$1,500/month</div>
          <div className="pricing-breakdown">
            <div className="breakdown-item">
              <span>Your Cost:</span>
              <span>$300/month</span>
            </div>
            <div className="breakdown-item profit">
              <span><strong>Your Profit:</strong></span>
              <span><strong>$1,200/month</strong></span>
            </div>
            <div className="breakdown-item margin">
              <span>Margin:</span>
              <span>80%</span>
            </div>
          </div>
          <div className="deliverables">
            <h4>What Client Gets:</h4>
            <ul>
              <li>20 blog posts/month</li>
              <li>200+ keyword research</li>
              <li>Advanced technical audit</li>
              <li>Weekly competitor monitoring</li>
              <li>Aggressive link building (20 prospects)</li>
              <li>Local SEO optimization</li>
              <li>Custom schema markup</li>
              <li>Weekly reports</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="scaling-calculator">
        <h3>📈 Scale Your Agency</h3>
        <table className="scale-table">
          <thead>
            <tr>
              <th>Clients</th>
              <th>Avg Price</th>
              <th>Monthly Revenue</th>
              <th>Your Costs</th>
              <th>Monthly Profit</th>
              <th>Annual Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>5</td>
              <td>$1,000</td>
              <td>$5,000</td>
              <td>$1,250</td>
              <td className="profit">$3,750</td>
              <td className="profit">$45,000</td>
            </tr>
            <tr>
              <td>10</td>
              <td>$1,000</td>
              <td>$10,000</td>
              <td>$2,500</td>
              <td className="profit">$7,500</td>
              <td className="profit">$90,000</td>
            </tr>
            <tr className="highlight">
              <td>20</td>
              <td>$1,000</td>
              <td>$20,000</td>
              <td>$5,000</td>
              <td className="profit">$15,000</td>
              <td className="profit">$180,000</td>
            </tr>
            <tr>
              <td>50</td>
              <td>$1,000</td>
              <td>$50,000</td>
              <td>$12,500</td>
              <td className="profit">$37,500</td>
              <td className="profit">$450,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="competitive-comparison">
        <h3>🆚 vs Traditional SEO Agencies</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Factor</th>
              <th>Traditional Agency</th>
              <th>AI-Powered (You)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Delivery Time</td>
              <td>2-4 weeks</td>
              <td className="advantage">1-2 hours ✨</td>
            </tr>
            <tr>
              <td>Cost per Client</td>
              <td>$600-800/month</td>
              <td className="advantage">$200-300/month ✨</td>
            </tr>
            <tr>
              <td>Profit Margin</td>
              <td>30-40%</td>
              <td className="advantage">60-80% ✨</td>
            </tr>
            <tr>
              <td>Scalability</td>
              <td>Need to hire more staff</td>
              <td className="advantage">Unlimited with AI ✨</td>
            </tr>
            <tr>
              <td>Quality Consistency</td>
              <td>Varies by person</td>
              <td className="advantage">AI = consistent ✨</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ResultsTab = ({ client, results }) => {
  const [activeSection, setActiveSection] = useState('summary');

  if (!results) return null;

  return (
    <div className="results-tab">
      <div className="results-header">
        <h2>Results for {client.businessName}</h2>
        <p className="report-date">
          Generated: {new Date(results.timestamp).toLocaleDateString()}
        </p>
      </div>

      <div className="results-navigation">
        <button 
          className={activeSection === 'summary' ? 'active' : ''}
          onClick={() => setActiveSection('summary')}
        >
          📊 Summary
        </button>
        <button 
          className={activeSection === 'keywords' ? 'active' : ''}
          onClick={() => setActiveSection('keywords')}
        >
          🔑 Keywords
        </button>
        <button 
          className={activeSection === 'content' ? 'active' : ''}
          onClick={() => setActiveSection('content')}
        >
          ✍️ Content
        </button>
        <button 
          className={activeSection === 'technical' ? 'active' : ''}
          onClick={() => setActiveSection('technical')}
        >
          🔧 Technical
        </button>
        <button 
          className={activeSection === 'links' ? 'active' : ''}
          onClick={() => setActiveSection('links')}
        >
          🔗 Link Building
        </button>
      </div>

      <div className="results-content">
        {activeSection === 'summary' && (
          <SummarySection results={results} />
        )}
        {activeSection === 'keywords' && (
          <KeywordsSection keywords={results.deliverables.keywords} />
        )}
        {activeSection === 'content' && (
          <ContentSection content={results.deliverables.content} />
        )}
        {activeSection === 'technical' && (
          <TechnicalSection audit={results.deliverables.technicalAudit} />
        )}
        {activeSection === 'links' && (
          <LinkBuildingSection linkBuilding={results.deliverables.linkBuilding} />
        )}
      </div>
    </div>
  );
};

const SummarySection = ({ results }) => {
  const report = results.deliverables.report;
  
  return (
    <div className="summary-section">
      <div className="executive-summary">
        <h3>Executive Summary</h3>
        <p>{report?.executiveSummary || 'Generating summary...'}</p>
      </div>

      <div className="key-metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{report?.keyMetrics?.keywordsResearched || 0}</div>
          <div className="metric-label">Keywords Researched</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{report?.keyMetrics?.contentPieces || 0}</div>
          <div className="metric-label">Articles Created</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{report?.keyMetrics?.totalWords?.toLocaleString() || 0}</div>
          <div className="metric-label">Total Words</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{report?.keyMetrics?.technicalIssuesFound || 0}</div>
          <div className="metric-label">Issues Found</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{report?.keyMetrics?.linkProspects || 0}</div>
          <div className="metric-label">Link Prospects</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{report?.keyMetrics?.outreachEmailsSent || 0}</div>
          <div className="metric-label">Outreach Emails</div>
        </div>
      </div>

      {report?.nextMonthPlan && (
        <div className="next-month-plan">
          <h3>Next Month's Plan</h3>
          {report.nextMonthPlan.priorities && (
            <div className="plan-section">
              <h4>Priorities:</h4>
              <ul>
                {report.nextMonthPlan.priorities.map((priority, i) => (
                  <li key={i}>{priority}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const KeywordsSection = ({ keywords }) => {
  return (
    <div className="keywords-section">
      <h3>Keyword Research Results</h3>
      <p>Total Keywords: <strong>{keywords.totalKeywords}</strong></p>

      <div className="top-opportunities">
        <h4>🎯 Top Opportunities</h4>
        <table className="keywords-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Intent</th>
              <th>Search Volume</th>
              <th>Difficulty</th>
              <th>Priority Score</th>
            </tr>
          </thead>
          <tbody>
            {keywords.topOpportunities?.slice(0, 20).map((kw, i) => (
              <tr key={i}>
                <td>{kw.keyword}</td>
                <td><span className={`intent-badge ${kw.intent}`}>{kw.intent}</span></td>
                <td>{kw.searchVolume?.toLocaleString() || 'N/A'}</td>
                <td>{kw.difficulty || 'N/A'}</td>
                <td>{kw.priorityScore?.toFixed(2) || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {keywords.contentIdeas && keywords.contentIdeas.length > 0 && (
        <div className="content-ideas">
          <h4>💡 Content Ideas</h4>
          <div className="ideas-grid">
            {keywords.contentIdeas.map((idea, i) => (
              <div key={i} className="idea-card">
                <h5>{idea.title}</h5>
                <p><strong>Target:</strong> {idea.targetKeyword}</p>
                <span className="content-type">{idea.contentType}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ContentSection = ({ content }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="content-section">
      <h3>Generated Content</h3>
      <p>
        <strong>{content.totalArticles}</strong> articles generated 
        (<strong>{content.totalWords?.toLocaleString()}</strong> total words)
      </p>

      <div className="articles-list">
        {content.articles?.map((article, i) => (
          <div key={i} className="article-card">
            <div className="article-header">
              <h4>{article.title}</h4>
              <button 
                className="view-article-button"
                onClick={() => setSelectedArticle(article)}
              >
                View Full Article
              </button>
            </div>
            <div className="article-meta">
              <span>🎯 {article.targetKeyword}</span>
              <span>📝 {article.wordCount} words</span>
              <span>⏱️ {article.readTime} min read</span>
              <span>⭐ SEO Score: {article.seoScore}/100</span>
            </div>
            {article.metadata && (
              <div className="article-seo">
                <p><strong>Meta Title:</strong> {article.metadata.metaTitle}</p>
                <p><strong>Meta Description:</strong> {article.metadata.metaDescription}</p>
                <p><strong>Slug:</strong> /{article.metadata.slug}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedArticle && (
        <ArticleModal 
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};

const TechnicalSection = ({ audit }) => {
  return (
    <div className="technical-section">
      <h3>Technical SEO Audit</h3>
      <p>Audited: <strong>{audit.url}</strong></p>
      <p className="audit-date">Date: {new Date(audit.timestamp).toLocaleDateString()}</p>

      <div className="issues-summary">
        <h4>⚠️ Issues Found: {audit.issues?.length || 0}</h4>
        {audit.issues && audit.issues.length > 0 && (
          <div className="issues-list">
            {audit.issues.map((issue, i) => (
              <div key={i} className={`issue-card ${issue.severity}`}>
                <div className="issue-header">
                  <span className={`severity-badge ${issue.severity}`}>{issue.severity}</span>
                  <span className="issue-type">{issue.type}</span>
                </div>
                <p>{issue.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recommendations">
        <h4>✅ Recommendations</h4>
        <ul>
          {audit.recommendations?.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      {audit.fixes && audit.fixes.length > 0 && (
        <div className="fix-instructions">
          <h4>🔧 How to Fix</h4>
          {audit.fixes.map((fix, i) => (
            <div key={i} className="fix-card">
              <h5>{fix.issue}</h5>
              <span className={`priority-badge ${fix.priority}`}>{fix.priority} priority</span>
              <ol>
                {fix.steps?.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ol>
              <p><em>Estimated time: {fix.estimatedTime}</em></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LinkBuildingSection = ({ linkBuilding }) => {
  return (
    <div className="linkbuilding-section">
      <h3>Link Building Campaign</h3>

      <div className="prospects-section">
        <h4>🎯 Link Prospects ({linkBuilding.prospects?.length || 0})</h4>
        <table className="prospects-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Type</th>
              <th>DR</th>
              <th>Traffic</th>
              <th>Relevance</th>
            </tr>
          </thead>
          <tbody>
            {linkBuilding.prospects?.slice(0, 20).map((prospect, i) => (
              <tr key={i}>
                <td>{prospect.domain}</td>
                <td>{prospect.type}</td>
                <td>{prospect.domainRating}</td>
                <td>{prospect.traffic?.toLocaleString()}</td>
                <td>
                  <div className="relevance-bar">
                    <div 
                      className="relevance-fill" 
                      style={{width: `${prospect.relevance * 100}%`}}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="outreach-section">
        <h4>📧 Outreach Emails ({linkBuilding.outreachEmails?.length || 0})</h4>
        {linkBuilding.outreachEmails?.slice(0, 5).map((email, i) => (
          <div key={i} className="outreach-card">
            <div className="email-header">
              <strong>To:</strong> {email.prospect?.domain}
            </div>
            <div className="email-subject">
              <strong>Subject:</strong> {email.subject}
            </div>
            <div className="email-body">
              <pre>{email.body}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== MODAL COMPONENTS ==========

const ProcessingModal = ({ progress, client }) => {
  return (
    <div className="modal-overlay">
      <div className="processing-modal">
        <h3>🤖 AI Processing SEO Service</h3>
        <p>Client: <strong>{client?.businessName}</strong></p>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="progress-text">{progress.stage} ({progress.percent}%)</p>
        </div>

        <p className="processing-note">
          ⏱️ This may take 5-10 minutes. AI is working hard to generate your content!
        </p>
      </div>
    </div>
  );
};

const AddClientModal = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    location: '',
    websiteUrl: '',
    businessType: '',
    targetAudience: '',
    localBusiness: false,
    services: '',
    competitors: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const clientData = {
      ...formData,
      services: formData.services.split(',').map(s => s.trim()).filter(s => s),
      competitors: formData.competitors.split(',').map(c => c.trim()).filter(c => c)
    };
    
    onAdd(clientData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-client-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Client</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name *</label>
            <input 
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Industry *</label>
              <input 
                type="text"
                placeholder="e.g., Plumbing, Digital Marketing"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input 
                type="text"
                placeholder="e.g., Los Angeles, CA"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website URL *</label>
            <input 
              type="url"
              placeholder="https://example.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Business Type *</label>
              <input 
                type="text"
                placeholder="e.g., Service Business, E-commerce"
                value={formData.businessType}
                onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Target Audience *</label>
              <input 
                type="text"
                placeholder="e.g., Homeowners, Small businesses"
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Services (comma-separated)</label>
            <input 
              type="text"
              placeholder="e.g., Plumbing repair, Installation, Emergency service"
              value={formData.services}
              onChange={(e) => setFormData({...formData, services: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Competitors (comma-separated URLs)</label>
            <input 
              type="text"
              placeholder="e.g., competitor1.com, competitor2.com"
              value={formData.competitors}
              onChange={(e) => setFormData({...formData, competitors: e.target.value})}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input 
                type="checkbox"
                checked={formData.localBusiness}
                onChange={(e) => setFormData({...formData, localBusiness: e.target.checked})}
              />
              This is a local business (enables local SEO features)
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ArticleModal = ({ article, onClose }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(article.content);
    alert('Article copied to clipboard!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="article-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{article.title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="article-meta-bar">
          <span>🎯 {article.targetKeyword}</span>
          <span>📝 {article.wordCount} words</span>
          <span>⭐ SEO: {article.seoScore}/100</span>
          <button onClick={copyToClipboard} className="copy-button">
            📋 Copy to Clipboard
          </button>
        </div>

        <div className="article-content-display">
          <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
        </div>
      </div>
    </div>
  );
};

export default AISEODashboard;

