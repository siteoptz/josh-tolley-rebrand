// API Routes for AI SEO Service
// Backend endpoints for handling AI SEO service requests

import express from 'express';
import AISEOService from '../services/AISEOService.js';

const router = express.Router();

/**
 * POST /api/seo/run-service
 * Run the complete monthly SEO service for a client
 */
router.post('/run-service', async (req, res) => {
  try {
    const clientData = req.body;

    // Validate required fields
    if (!clientData.businessName || !clientData.industry || !clientData.websiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, industry, websiteUrl'
      });
    }

    console.log(`Starting AI SEO service for: ${clientData.businessName}`);

    // Run the service
    const results = await AISEOService.executeMonthlyService(clientData);

    // Return results
    res.json({
      success: true,
      data: results,
      message: 'SEO service completed successfully'
    });

  } catch (error) {
    console.error('Error running SEO service:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run SEO service'
    });
  }
});

/**
 * POST /api/seo/keyword-research
 * Run only keyword research for a client
 */
router.post('/keyword-research', async (req, res) => {
  try {
    const clientData = req.body;

    if (!clientData.industry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: industry'
      });
    }

    const keywords = await AISEOService.performKeywordResearch(clientData);

    res.json({
      success: true,
      data: keywords
    });

  } catch (error) {
    console.error('Error in keyword research:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/generate-content
 * Generate content for specific keywords
 */
router.post('/generate-content', async (req, res) => {
  try {
    const { clientData, keywords } = req.body;

    if (!clientData || !keywords) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientData, keywords'
      });
    }

    const content = await AISEOService.generateMonthlyContent(clientData, keywords);

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/technical-audit
 * Run technical SEO audit for a website
 */
router.post('/technical-audit', async (req, res) => {
  try {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: websiteUrl'
      });
    }

    const audit = await AISEOService.performTechnicalAudit(websiteUrl);

    res.json({
      success: true,
      data: audit
    });

  } catch (error) {
    console.error('Error in technical audit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/competitor-analysis
 * Analyze competitors for a client
 */
router.post('/competitor-analysis', async (req, res) => {
  try {
    const { industry, competitors } = req.body;

    if (!industry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: industry'
      });
    }

    const analysis = await AISEOService.analyzeCompetitors(
      industry,
      competitors || []
    );

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Error in competitor analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/link-building
 * Generate link building campaign
 */
router.post('/link-building', async (req, res) => {
  try {
    const { clientData, keywords } = req.body;

    if (!clientData || !keywords) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientData, keywords'
      });
    }

    const campaign = await AISEOService.generateLinkBuildingCampaign(
      clientData,
      keywords
    );

    res.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('Error in link building:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/local-optimization
 * Optimize local SEO for a business
 */
router.post('/local-optimization', async (req, res) => {
  try {
    const clientData = req.body;

    if (!clientData.businessName || !clientData.location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, location'
      });
    }

    const localSEO = await AISEOService.optimizeLocalSEO(clientData);

    res.json({
      success: true,
      data: localSEO
    });

  } catch (error) {
    console.error('Error in local SEO:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/schema-markup
 * Generate schema markup for a website
 */
router.post('/schema-markup', async (req, res) => {
  try {
    const clientData = req.body;

    if (!clientData.businessName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: businessName'
      });
    }

    const schema = await AISEOService.generateSchemaMarkup(clientData);

    res.json({
      success: true,
      data: schema
    });

  } catch (error) {
    console.error('Error generating schema:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/pricing
 * Get pricing information for the service
 */
router.get('/pricing', (req, res) => {
  res.json({
    success: true,
    data: {
      tiers: [
        {
          name: 'Basic',
          price: 600,
          features: [
            '8 blog posts/month',
            '50 keywords researched',
            'Basic technical audit',
            'Quarterly competitor analysis',
            'Monthly report'
          ],
          yourCost: 200,
          yourProfit: 400,
          margin: 67
        },
        {
          name: 'Standard',
          price: 1000,
          recommended: true,
          features: [
            '15 blog posts/month',
            '100 keywords researched',
            'Full technical audit',
            'Monthly competitor analysis',
            'Link building (10 prospects)',
            'Monthly report'
          ],
          yourCost: 250,
          yourProfit: 750,
          margin: 75
        },
        {
          name: 'Premium',
          price: 1500,
          features: [
            '20 blog posts/month',
            '200 keywords researched',
            'Advanced technical audit',
            'Weekly competitor monitoring',
            'Aggressive link building (20 prospects)',
            'Local SEO optimization',
            'Custom schema markup',
            'Weekly reports'
          ],
          yourCost: 300,
          yourProfit: 1200,
          margin: 80
        }
      ],
      costs: {
        openai: 10,
        claude: 5,
        perplexity: 3,
        total: 18,
        description: 'Average AI API costs per client per month'
      }
    }
  });
});

/**
 * GET /api/seo/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI SEO Service API is running',
    version: '1.0.0'
  });
});

/**
 * Webhook handler for scheduled monthly runs
 * POST /api/seo/webhook/monthly-run
 */
router.post('/webhook/monthly-run', async (req, res) => {
  try {
    const { clients } = req.body;

    if (!clients || !Array.isArray(clients)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: clients array required'
      });
    }

    console.log(`Running monthly SEO service for ${clients.length} clients...`);

    const results = [];

    // Run service for each client (in production, use queue)
    for (const client of clients) {
      try {
        const result = await AISEOService.executeMonthlyService(client);
        results.push({
          clientId: client.id,
          success: true,
          data: result
        });
      } catch (error) {
        console.error(`Error for client ${client.id}:`, error);
        results.push({
          clientId: client.id,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        totalClients: clients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });

  } catch (error) {
    console.error('Error in monthly run webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

