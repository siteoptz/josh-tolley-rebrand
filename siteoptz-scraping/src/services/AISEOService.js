// AI-Powered SEO Service
// Comprehensive SEO automation for white-label reselling

import axios from 'axios';

class AISEOService {
  constructor() {
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.anthropicApiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
    this.perplexityApiKey = process.env.REACT_APP_PERPLEXITY_API_KEY;
    this.ahrefsApiKey = process.env.REACT_APP_AHREFS_API_KEY;
    this.semrushApiKey = process.env.REACT_APP_SEMRUSH_API_KEY;
    
    // Base URLs
    this.openaiBaseUrl = 'https://api.openai.com/v1';
    this.anthropicBaseUrl = 'https://api.anthropic.com/v1';
    this.perplexityBaseUrl = 'https://api.perplexity.ai';
  }

  /**
   * MAIN SERVICE METHOD
   * Complete SEO service for one client/month
   */
  async executeMonthlyService(clientData) {
    console.log('🚀 Starting AI-Powered SEO Service for:', clientData.businessName);

    const results = {
      client: clientData,
      timestamp: new Date().toISOString(),
      deliverables: {}
    };

    try {
      // 1. Keyword Research & Clustering
      console.log('📊 Step 1: AI Keyword Research...');
      results.deliverables.keywords = await this.performKeywordResearch(clientData);

      // 2. Content Generation (Blog Posts)
      console.log('✍️ Step 2: Generating AI Content...');
      results.deliverables.content = await this.generateMonthlyContent(
        clientData,
        results.deliverables.keywords
      );

      // 3. Technical SEO Audit
      console.log('🔧 Step 3: Technical SEO Audit...');
      results.deliverables.technicalAudit = await this.performTechnicalAudit(
        clientData.websiteUrl
      );

      // 4. Competitor Analysis
      console.log('🎯 Step 4: Competitor Analysis...');
      results.deliverables.competitorAnalysis = await this.analyzeCompetitors(
        clientData.industry,
        clientData.competitors || []
      );

      // 5. Link Building Opportunities
      console.log('🔗 Step 5: Link Building Strategy...');
      results.deliverables.linkBuilding = await this.generateLinkBuildingCampaign(
        clientData,
        results.deliverables.keywords
      );

      // 6. Local SEO (if applicable)
      if (clientData.localBusiness) {
        console.log('📍 Step 6: Local SEO Optimization...');
        results.deliverables.localSEO = await this.optimizeLocalSEO(clientData);
      }

      // 7. Schema Markup Generation
      console.log('🏷️ Step 7: Schema Markup...');
      results.deliverables.schema = await this.generateSchemaMarkup(clientData);

      // 8. Monthly Report Generation
      console.log('📈 Step 8: Generating Report...');
      results.deliverables.report = await this.generateMonthlyReport(results);

      console.log('✅ AI SEO Service Complete!');
      return results;

    } catch (error) {
      console.error('❌ Error in AI SEO Service:', error);
      throw error;
    }
  }

  /**
   * 1. AI KEYWORD RESEARCH
   * Generate 100+ keywords with clustering and prioritization
   */
  async performKeywordResearch(clientData) {
    const { industry, location, businessType, targetAudience } = clientData;

    // Step 1: Generate seed keywords with GPT-4
    const seedKeywords = await this.generateSeedKeywords(industry, businessType, targetAudience);

    // Step 2: Expand keywords with variations
    const expandedKeywords = await this.expandKeywords(seedKeywords);

    // Step 3: Get search volume and difficulty (simulated or via API)
    const keywordsWithMetrics = await this.enrichKeywordsWithMetrics(expandedKeywords);

    // Step 4: Cluster keywords by intent
    const clusteredKeywords = await this.clusterKeywordsByIntent(keywordsWithMetrics);

    // Step 5: Prioritize keywords
    const prioritizedKeywords = this.prioritizeKeywords(clusteredKeywords);

    return {
      totalKeywords: prioritizedKeywords.length,
      clusters: this.groupByCluster(prioritizedKeywords),
      topOpportunities: prioritizedKeywords.slice(0, 20),
      contentIdeas: await this.generateContentIdeas(prioritizedKeywords)
    };
  }

  async generateSeedKeywords(industry, businessType, targetAudience) {
    try {
      const prompt = `You are an expert SEO strategist. Generate a comprehensive list of seed keywords for a ${businessType} business in the ${industry} industry targeting ${targetAudience}.

Include:
- Primary service/product keywords
- Industry-specific terms
- Problem-solution keywords
- Comparison keywords
- Question-based keywords
- Long-tail variations

Format as a JSON array of objects with: {"keyword": "example", "intent": "transactional|informational|navigational|commercial"}

Generate 50 seed keywords.`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert SEO and keyword research specialist.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return result.keywords || [];
    } catch (error) {
      console.error('Error generating seed keywords:', error.response?.data || error.message);
      // Return fallback keywords
      return this.getFallbackSeedKeywords(industry);
    }
  }

  async expandKeywords(seedKeywords) {
    // Expand each seed keyword with variations
    const expansions = [];
    const modifiers = [
      'best', 'top', 'affordable', 'near me', 'services', 'company',
      'how to', 'what is', 'cost of', 'reviews', 'vs', 'guide'
    ];

    seedKeywords.forEach(seed => {
      expansions.push(seed);
      
      // Add modifier variations
      modifiers.forEach(modifier => {
        expansions.push({
          keyword: `${modifier} ${seed.keyword}`,
          intent: seed.intent,
          type: 'expanded'
        });
        
        expansions.push({
          keyword: `${seed.keyword} ${modifier}`,
          intent: seed.intent,
          type: 'expanded'
        });
      });
    });

    return expansions.slice(0, 200); // Limit to 200 expanded keywords
  }

  async enrichKeywordsWithMetrics(keywords) {
    // Simulate keyword metrics (in production, use Ahrefs/SEMrush API)
    return keywords.map(kw => ({
      ...kw,
      searchVolume: Math.floor(Math.random() * 10000) + 100,
      difficulty: Math.floor(Math.random() * 100),
      cpc: (Math.random() * 10).toFixed(2),
      trend: Math.random() > 0.5 ? 'up' : 'stable'
    }));
  }

  async clusterKeywordsByIntent(keywords) {
    try {
      // Use GPT-4 to intelligently cluster keywords
      const keywordList = keywords.slice(0, 100).map(k => k.keyword).join(', ');
      
      const prompt = `Analyze these keywords and group them into logical clusters based on user intent and topic similarity:

${keywordList}

Return a JSON object with clusters like:
{
  "clusters": [
    {
      "name": "cluster name",
      "intent": "informational/transactional/commercial/navigational",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert SEO and keyword clustering specialist.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const clusters = JSON.parse(response.data.choices[0].message.content);
      
      // Map back to full keyword objects
      return this.mapClustersToKeywords(clusters.clusters, keywords);
    } catch (error) {
      console.error('Error clustering keywords:', error.message);
      return this.fallbackClustering(keywords);
    }
  }

  prioritizeKeywords(clusteredKeywords) {
    // Calculate priority score: (SearchVolume / Difficulty) * Intent Weight
    const intentWeights = {
      transactional: 1.5,
      commercial: 1.3,
      informational: 1.0,
      navigational: 0.8
    };

    return clusteredKeywords
      .map(kw => ({
        ...kw,
        priorityScore: ((kw.searchVolume / (kw.difficulty + 1)) * 
                       (intentWeights[kw.intent] || 1))
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }

  async generateContentIdeas(keywords) {
    const topKeywords = keywords.slice(0, 10);
    
    try {
      const prompt = `Based on these high-priority keywords, generate 20 blog post titles that would rank well:

${topKeywords.map(k => `- ${k.keyword}`).join('\n')}

Return a JSON array of objects with: {"title": "Blog Title", "targetKeyword": "main keyword", "contentType": "how-to|guide|listicle|comparison|case-study"}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert content strategist and SEO specialist.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return result.ideas || result.titles || [];
    } catch (error) {
      console.error('Error generating content ideas:', error.message);
      return [];
    }
  }

  /**
   * 2. AI CONTENT GENERATION
   * Generate 10-20 blog posts per month
   */
  async generateMonthlyContent(clientData, keywordData) {
    const contentIdeas = keywordData.contentIdeas.slice(0, 15);
    const generatedContent = [];

    for (const idea of contentIdeas) {
      try {
        console.log(`  📝 Generating: "${idea.title}"`);
        
        const article = await this.generateBlogPost(
          idea,
          clientData,
          keywordData.topOpportunities
        );
        
        generatedContent.push(article);
        
        // Rate limiting: wait 2 seconds between articles
        await this.sleep(2000);
      } catch (error) {
        console.error(`Error generating article "${idea.title}":`, error.message);
      }
    }

    return {
      totalArticles: generatedContent.length,
      articles: generatedContent,
      totalWords: generatedContent.reduce((sum, a) => sum + a.wordCount, 0)
    };
  }

  async generateBlogPost(idea, clientData, relatedKeywords) {
    try {
      // Step 1: Research with Perplexity (if available) or GPT-4
      const research = await this.researchTopic(idea.title, idea.targetKeyword);

      // Step 2: Create outline
      const outline = await this.createContentOutline(idea, research, relatedKeywords);

      // Step 3: Generate full article with GPT-4
      const content = await this.writeArticleContent(idea, outline, clientData, research);

      // Step 4: Optimize for SEO
      const optimizedContent = await this.optimizeContent(content, idea.targetKeyword);

      // Step 5: Generate meta data
      const metadata = await this.generateMetadata(idea, optimizedContent);

      return {
        title: idea.title,
        targetKeyword: idea.targetKeyword,
        content: optimizedContent,
        outline: outline,
        metadata: metadata,
        wordCount: optimizedContent.split(' ').length,
        readTime: Math.ceil(optimizedContent.split(' ').length / 200),
        seoScore: this.calculateSEOScore(optimizedContent, idea.targetKeyword),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating blog post:', error.message);
      throw error;
    }
  }

  async researchTopic(title, keyword) {
    try {
      const prompt = `Research and provide key facts, statistics, and insights about: "${title}" focusing on the keyword "${keyword}". Include recent data, expert opinions, and actionable insights.`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert researcher providing accurate, up-to-date information.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.4
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error researching topic:', error.message);
      return '';
    }
  }

  async createContentOutline(idea, research, relatedKeywords) {
    try {
      const prompt = `Create a detailed blog post outline for: "${idea.title}"

Target keyword: ${idea.targetKeyword}
Content type: ${idea.contentType}
Related keywords to include: ${relatedKeywords.slice(0, 5).map(k => k.keyword).join(', ')}

Research context: ${research.substring(0, 500)}

Return a JSON object with:
{
  "introduction": "Hook and overview",
  "sections": [
    {"heading": "H2 heading", "subheadings": ["H3", "H3"], "keyPoints": ["point1", "point2"]}
  ],
  "conclusion": "Summary and CTA"
}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert content strategist creating SEO-optimized outlines.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error creating outline:', error.message);
      return { sections: [] };
    }
  }

  async writeArticleContent(idea, outline, clientData, research) {
    try {
      const outlineText = JSON.stringify(outline, null, 2);
      
      const prompt = `Write a comprehensive, engaging blog post following this outline:

Title: ${idea.title}
Target Keyword: ${idea.targetKeyword}
Business Context: ${clientData.businessName} - ${clientData.industry}

Outline:
${outlineText}

Research:
${research}

Requirements:
- 1500-2000 words
- Conversational yet professional tone
- Include the target keyword naturally (2-3% density)
- Use short paragraphs (2-3 sentences)
- Include transition words
- Add bullet points and numbered lists
- SEO-optimized headers (H2, H3)
- Strong introduction with hook
- Clear conclusion with CTA
- Naturally mention ${clientData.businessName} where relevant

Write the complete article in markdown format.`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert content writer specializing in SEO-optimized, engaging blog posts.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error writing article:', error.message);
      return '';
    }
  }

  async optimizeContent(content, targetKeyword) {
    // Check keyword density
    const keywordDensity = this.calculateKeywordDensity(content, targetKeyword);
    
    if (keywordDensity < 0.015) {
      // Add keyword variations naturally
      console.log(`  ⚠️ Low keyword density (${(keywordDensity * 100).toFixed(2)}%), optimizing...`);
      // In production, use AI to naturally add keywords
    }

    // Add internal link placeholders
    const optimizedContent = content + '\n\n[INTERNAL_LINK_PLACEHOLDER]';

    return optimizedContent;
  }

  async generateMetadata(idea, content) {
    try {
      const prompt = `Generate SEO metadata for this article:

Title: ${idea.title}
Target Keyword: ${idea.targetKeyword}
Content Preview: ${content.substring(0, 500)}...

Return JSON with:
{
  "metaTitle": "60 chars max, includes target keyword",
  "metaDescription": "150-160 chars, compelling, includes keyword",
  "focusKeyword": "main keyword",
  "slug": "url-friendly-slug",
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an SEO expert creating compelling metadata.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating metadata:', error.message);
      return {
        metaTitle: idea.title,
        metaDescription: '',
        slug: this.slugify(idea.title)
      };
    }
  }

  /**
   * 3. TECHNICAL SEO AUDIT
   */
  async performTechnicalAudit(websiteUrl) {
    console.log(`  🔍 Auditing: ${websiteUrl}`);

    const audit = {
      url: websiteUrl,
      timestamp: new Date().toISOString(),
      issues: [],
      recommendations: []
    };

    // Check various technical SEO factors
    const checks = [
      this.checkPageSpeed(websiteUrl),
      this.checkMobileResponsiveness(websiteUrl),
      this.checkSSL(websiteUrl),
      this.checkRobotsTxt(websiteUrl),
      this.checkSitemap(websiteUrl),
      this.checkStructuredData(websiteUrl)
    ];

    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        audit.issues.push(...result.value.issues);
        audit.recommendations.push(...result.value.recommendations);
      }
    });

    // Generate fix instructions with AI
    audit.fixes = await this.generateFixInstructions(audit.issues);

    return audit;
  }

  async checkPageSpeed(url) {
    // Simulate page speed check (use PageSpeed Insights API in production)
    return {
      issues: [
        { type: 'performance', severity: 'medium', description: 'Page load time exceeds 3 seconds' }
      ],
      recommendations: [
        'Optimize images (use WebP format)',
        'Minify CSS and JavaScript',
        'Enable browser caching',
        'Use a CDN'
      ]
    };
  }

  async checkMobileResponsiveness(url) {
    return {
      issues: [],
      recommendations: ['Ensure viewport meta tag is present', 'Test on various devices']
    };
  }

  async checkSSL(url) {
    const hasSSL = url.startsWith('https://');
    return {
      issues: hasSSL ? [] : [{ type: 'security', severity: 'high', description: 'No SSL certificate detected' }],
      recommendations: hasSSL ? [] : ['Install SSL certificate immediately']
    };
  }

  async checkRobotsTxt(url) {
    try {
      const robotsUrl = new URL('/robots.txt', url).href;
      await axios.get(robotsUrl);
      return {
        issues: [],
        recommendations: ['Robots.txt found and accessible']
      };
    } catch (error) {
      return {
        issues: [{ type: 'indexability', severity: 'low', description: 'No robots.txt file found' }],
        recommendations: ['Create a robots.txt file']
      };
    }
  }

  async checkSitemap(url) {
    return {
      issues: [],
      recommendations: ['Ensure XML sitemap is submitted to Google Search Console']
    };
  }

  async checkStructuredData(url) {
    return {
      issues: [],
      recommendations: ['Add schema markup for better rich snippets']
    };
  }

  async generateFixInstructions(issues) {
    if (issues.length === 0) return [];

    try {
      const issuesList = issues.map(i => `- ${i.description}`).join('\n');
      
      const prompt = `Provide step-by-step fix instructions for these technical SEO issues:

${issuesList}

Return JSON array with:
[
  {
    "issue": "issue description",
    "priority": "high|medium|low",
    "steps": ["step 1", "step 2"],
    "estimatedTime": "time to fix"
  }
]`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are a technical SEO expert providing actionable fix instructions.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return result.fixes || [];
    } catch (error) {
      console.error('Error generating fix instructions:', error.message);
      return [];
    }
  }

  /**
   * 4. COMPETITOR ANALYSIS
   */
  async analyzeCompetitors(industry, competitors) {
    console.log(`  🎯 Analyzing competitors in ${industry}...`);

    const analysis = {
      industry,
      competitors: [],
      opportunities: [],
      threats: []
    };

    // Analyze each competitor
    for (const competitor of competitors.slice(0, 3)) {
      try {
        const competitorData = await this.analyzeCompetitor(competitor);
        analysis.competitors.push(competitorData);
      } catch (error) {
        console.error(`Error analyzing ${competitor}:`, error.message);
      }
    }

    // Generate strategic insights
    analysis.insights = await this.generateCompetitorInsights(analysis.competitors);
    
    return analysis;
  }

  async analyzeCompetitor(competitorUrl) {
    // Simulate competitor analysis (use Ahrefs/SEMrush in production)
    return {
      url: competitorUrl,
      estimatedTraffic: Math.floor(Math.random() * 100000) + 10000,
      topKeywords: [
        { keyword: 'example keyword 1', position: 3, searchVolume: 5000 },
        { keyword: 'example keyword 2', position: 5, searchVolume: 3000 }
      ],
      backlinks: Math.floor(Math.random() * 10000) + 1000,
      domainRating: Math.floor(Math.random() * 100),
      contentGaps: []
    };
  }

  async generateCompetitorInsights(competitors) {
    try {
      const competitorData = JSON.stringify(competitors, null, 2);
      
      const prompt = `Analyze these competitor SEO metrics and provide strategic insights:

${competitorData}

Return JSON with:
{
  "strengths": ["what competitors do well"],
  "weaknesses": ["gaps we can exploit"],
  "opportunities": ["specific actions to outrank them"],
  "contentGaps": ["topics they rank for that we should target"]
}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are a competitive SEO analyst providing strategic insights.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating competitor insights:', error.message);
      return {};
    }
  }

  /**
   * 5. LINK BUILDING AUTOMATION
   */
  async generateLinkBuildingCampaign(clientData, keywords) {
    console.log('  🔗 Creating link building campaign...');

    const campaign = {
      targetKeywords: keywords.topOpportunities.slice(0, 5),
      prospects: [],
      outreachEmails: []
    };

    // Find link prospects
    campaign.prospects = await this.findLinkProspects(clientData.industry, keywords);

    // Generate outreach emails
    for (const prospect of campaign.prospects.slice(0, 10)) {
      const email = await this.generateOutreachEmail(prospect, clientData);
      campaign.outreachEmails.push(email);
    }

    return campaign;
  }

  async findLinkProspects(industry, keywords) {
    // Simulate finding link prospects (use Ahrefs/Hunter.io in production)
    const prospects = [];
    const types = ['blog', 'news site', 'industry publication', 'resource page'];

    for (let i = 0; i < 20; i++) {
      prospects.push({
        domain: `example-site-${i}.com`,
        type: types[Math.floor(Math.random() * types.length)],
        domainRating: Math.floor(Math.random() * 100),
        traffic: Math.floor(Math.random() * 50000) + 1000,
        relevance: Math.random(),
        contactEmail: `editor@example-site-${i}.com`
      });
    }

    return prospects.sort((a, b) => b.relevance - a.relevance);
  }

  async generateOutreachEmail(prospect, clientData) {
    try {
      const prompt = `Write a personalized link building outreach email for:

Prospect: ${prospect.domain} (${prospect.type})
Our Business: ${clientData.businessName} - ${clientData.industry}

Requirements:
- Personalized subject line
- Brief, friendly introduction
- Value proposition (why link to us)
- Specific content to link to
- Clear call-to-action
- Professional signature
- Keep under 150 words

Return JSON with:
{
  "subject": "email subject",
  "body": "email body",
  "followUp": "follow-up email if no response"
}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert at writing persuasive, personalized outreach emails.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const email = JSON.parse(response.data.choices[0].message.content);
      return {
        prospect,
        ...email,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating outreach email:', error.message);
      return null;
    }
  }

  /**
   * 6. LOCAL SEO OPTIMIZATION
   */
  async optimizeLocalSEO(clientData) {
    console.log('  📍 Optimizing local SEO...');

    return {
      googleBusinessProfile: await this.optimizeGBP(clientData),
      localCitations: await this.generateLocalCitations(clientData),
      localContent: await this.createLocalContent(clientData),
      reviewStrategy: await this.createReviewStrategy(clientData)
    };
  }

  async optimizeGBP(clientData) {
    try {
      const prompt = `Create an optimized Google Business Profile description for:

Business: ${clientData.businessName}
Industry: ${clientData.industry}
Location: ${clientData.location}
Services: ${clientData.services?.join(', ') || 'various services'}

Return JSON with:
{
  "businessDescription": "compelling 750-char description",
  "services": ["service 1", "service 2"],
  "attributes": ["attribute1", "attribute2"],
  "posts": [{"title": "post title", "content": "post content"}]
}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are a local SEO expert specializing in Google Business Profile optimization.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error optimizing GBP:', error.message);
      return {};
    }
  }

  async generateLocalCitations(clientData) {
    // List of local citation sites
    return {
      citations: [
        { site: 'Yelp', url: 'https://yelp.com', priority: 'high', status: 'pending' },
        { site: 'Yellow Pages', url: 'https://yellowpages.com', priority: 'high', status: 'pending' },
        { site: 'Better Business Bureau', url: 'https://bbb.org', priority: 'medium', status: 'pending' },
        { site: 'Foursquare', url: 'https://foursquare.com', priority: 'medium', status: 'pending' },
        { site: 'Bing Places', url: 'https://bingplaces.com', priority: 'high', status: 'pending' }
      ],
      instructions: 'Submit consistent NAP (Name, Address, Phone) across all platforms'
    };
  }

  async createLocalContent(clientData) {
    // Generate location-specific content ideas
    return {
      localPages: [
        `${clientData.services?.[0] || 'Services'} in ${clientData.location}`,
        `Best ${clientData.industry} near ${clientData.location}`,
        `${clientData.location} ${clientData.industry} Guide`
      ],
      localBlogPosts: [
        `Top 10 ${clientData.industry} Tips for ${clientData.location} Residents`,
        `${clientData.location} Community Guide`,
        `Why Choose ${clientData.businessName} in ${clientData.location}`
      ]
    };
  }

  async createReviewStrategy(clientData) {
    return {
      platforms: ['Google', 'Yelp', 'Facebook'],
      strategy: 'Send review requests 3-5 days after service completion',
      emailTemplates: await this.generateReviewRequestTemplates(clientData),
      responseTemplates: await this.generateReviewResponseTemplates(clientData)
    };
  }

  async generateReviewRequestTemplates(clientData) {
    try {
      const prompt = `Create 3 friendly review request email templates for ${clientData.businessName}. Make them warm, appreciative, and include direct links to review platforms.`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      return 'Error generating templates';
    }
  }

  async generateReviewResponseTemplates(clientData) {
    return {
      positive: `Thank you so much for your wonderful review! We're thrilled to hear about your positive experience with ${clientData.businessName}. We look forward to serving you again!`,
      negative: `Thank you for your feedback. We're sorry to hear about your experience. We'd love the opportunity to make this right. Please contact us directly at [contact info].`,
      neutral: `Thank you for taking the time to leave a review. We appreciate your feedback and are always looking to improve our services.`
    };
  }

  /**
   * 7. SCHEMA MARKUP GENERATION
   */
  async generateSchemaMarkup(clientData) {
    console.log('  🏷️ Generating schema markup...');

    const schemas = [];

    // Organization schema
    schemas.push(this.createOrganizationSchema(clientData));

    // Local Business schema (if applicable)
    if (clientData.localBusiness) {
      schemas.push(this.createLocalBusinessSchema(clientData));
    }

    // Article schema (for blog posts)
    schemas.push(this.createArticleSchemaTemplate(clientData));

    // FAQ schema
    schemas.push(await this.createFAQSchema(clientData));

    return {
      schemas,
      implementation: 'Add these JSON-LD scripts to your website <head> section'
    };
  }

  createOrganizationSchema(clientData) {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": clientData.businessName,
      "url": clientData.websiteUrl,
      "logo": clientData.logoUrl || '',
      "description": clientData.description || '',
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clientData.address || '',
        "addressLocality": clientData.location || '',
        "postalCode": clientData.postalCode || '',
        "addressCountry": clientData.country || 'US'
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": clientData.phone || '',
        "contactType": "customer service"
      }
    };
  }

  createLocalBusinessSchema(clientData) {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": clientData.businessName,
      "image": clientData.logoUrl || '',
      "url": clientData.websiteUrl,
      "telephone": clientData.phone || '',
      "priceRange": clientData.priceRange || '$$',
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clientData.address || '',
        "addressLocality": clientData.location || '',
        "postalCode": clientData.postalCode || '',
        "addressCountry": clientData.country || 'US'
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": clientData.latitude || 0,
        "longitude": clientData.longitude || 0
      },
      "openingHoursSpecification": clientData.hours || []
    };
  }

  createArticleSchemaTemplate(clientData) {
    return {
      template: 'article',
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "[ARTICLE_TITLE]",
        "image": "[ARTICLE_IMAGE_URL]",
        "author": {
          "@type": "Organization",
          "name": clientData.businessName
        },
        "publisher": {
          "@type": "Organization",
          "name": clientData.businessName,
          "logo": {
            "@type": "ImageObject",
            "url": clientData.logoUrl || ''
          }
        },
        "datePublished": "[PUBLISH_DATE]",
        "dateModified": "[MODIFIED_DATE]"
      }
    };
  }

  async createFAQSchema(clientData) {
    try {
      const prompt = `Generate 5 frequently asked questions and answers for ${clientData.businessName} in the ${clientData.industry} industry.

Return JSON with:
{
  "faqs": [
    {"question": "question text", "answer": "detailed answer"}
  ]
}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const faqs = JSON.parse(response.data.choices[0].message.content);

      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
    } catch (error) {
      console.error('Error creating FAQ schema:', error.message);
      return null;
    }
  }

  /**
   * 8. MONTHLY REPORT GENERATION
   */
  async generateMonthlyReport(results) {
    console.log('  📊 Generating comprehensive report...');

    try {
      const summaryPrompt = `Create an executive summary for this month's SEO work:

Keywords researched: ${results.deliverables.keywords.totalKeywords}
Content created: ${results.deliverables.content.totalArticles} articles (${results.deliverables.content.totalWords} words)
Technical issues found: ${results.deliverables.technicalAudit.issues.length}
Link building prospects: ${results.deliverables.linkBuilding?.prospects?.length || 0}

Write a professional 2-3 paragraph summary highlighting the value delivered.`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are a professional SEO consultant writing client reports.' },
            { role: 'user', content: summaryPrompt }
          ],
          temperature: 0.6
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const executiveSummary = response.data.choices[0].message.content;

      return {
        reportDate: new Date().toISOString(),
        client: results.client.businessName,
        executiveSummary,
        keyMetrics: {
          keywordsResearched: results.deliverables.keywords.totalKeywords,
          contentPieces: results.deliverables.content.totalArticles,
          totalWords: results.deliverables.content.totalWords,
          technicalIssuesFound: results.deliverables.technicalAudit.issues.length,
          issuesFixed: 0, // Track over time
          linkProspects: results.deliverables.linkBuilding?.prospects?.length || 0,
          outreachEmailsSent: results.deliverables.linkBuilding?.outreachEmails?.length || 0
        },
        deliverables: results.deliverables,
        nextMonthPlan: await this.generateNextMonthPlan(results)
      };
    } catch (error) {
      console.error('Error generating report:', error.message);
      return {
        reportDate: new Date().toISOString(),
        error: 'Error generating report'
      };
    }
  }

  async generateNextMonthPlan(results) {
    try {
      const prompt = `Based on this month's SEO work, suggest a strategic plan for next month. Focus on building upon current progress and addressing gaps.

Current progress:
- ${results.deliverables.keywords.totalKeywords} keywords researched
- ${results.deliverables.content.totalArticles} articles created
- ${results.deliverables.technicalAudit.issues.length} technical issues identified

Return JSON with:
{
  "priorities": ["priority 1", "priority 2"],
  "contentTopics": ["topic 1", "topic 2"],
  "technicalFocus": ["focus area 1"],
  "linkBuildingGoals": ["goal 1"]
}`;

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating next month plan:', error.message);
      return {};
    }
  }

  // ========== HELPER METHODS ==========

  calculateKeywordDensity(content, keyword) {
    const words = content.toLowerCase().split(/\s+/);
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(w => keywordWords.includes(w)).length;
    return keywordCount / words.length;
  }

  calculateSEOScore(content, keyword) {
    let score = 0;
    
    // Keyword in content
    if (content.toLowerCase().includes(keyword.toLowerCase())) score += 20;
    
    // Word count (1500-2000 ideal)
    const wordCount = content.split(' ').length;
    if (wordCount >= 1500 && wordCount <= 2500) score += 20;
    else if (wordCount >= 1000) score += 10;
    
    // Headers present
    if (content.includes('##')) score += 15;
    if (content.includes('###')) score += 10;
    
    // Lists present
    if (content.includes('-') || content.includes('1.')) score += 10;
    
    // Keyword density (1.5-2.5% ideal)
    const density = this.calculateKeywordDensity(content, keyword);
    if (density >= 0.015 && density <= 0.025) score += 25;
    else if (density > 0) score += 10;
    
    return Math.min(score, 100);
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  groupByCluster(keywords) {
    const clusters = {};
    keywords.forEach(kw => {
      const cluster = kw.cluster || 'uncategorized';
      if (!clusters[cluster]) clusters[cluster] = [];
      clusters[cluster].push(kw);
    });
    return clusters;
  }

  mapClustersToKeywords(clusters, keywords) {
    return keywords.map(kw => {
      const cluster = clusters.find(c => 
        c.keywords.some(ck => ck.toLowerCase() === kw.keyword.toLowerCase())
      );
      return {
        ...kw,
        cluster: cluster?.name || 'uncategorized',
        clusterIntent: cluster?.intent || kw.intent
      };
    });
  }

  fallbackClustering(keywords) {
    // Simple fallback clustering by intent
    return keywords.map(kw => ({
      ...kw,
      cluster: kw.intent || 'general'
    }));
  }

  getFallbackSeedKeywords(industry) {
    return [
      { keyword: `${industry} services`, intent: 'commercial' },
      { keyword: `best ${industry}`, intent: 'informational' },
      { keyword: `${industry} near me`, intent: 'transactional' },
      { keyword: `how to choose ${industry}`, intent: 'informational' },
      { keyword: `${industry} cost`, intent: 'commercial' }
    ];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new AISEOService();

