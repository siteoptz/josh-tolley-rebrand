// Firecrawl Hail Storm Targeting Service
// Strategy for scraping and targeting car owners in hail-affected zip codes

import FirecrawlApp from '@mendable/firecrawl-js';

class FirecrawlHailStormService {
  constructor() {
    this.firecrawl = new FirecrawlApp({ 
      apiKey: process.env.REACT_APP_FIRECRAWL_API_KEY 
    });
    this.hailReportApi = process.env.REACT_APP_HAIL_REPORT_API;
  }

  /**
   * Main strategy: Scrape data from multiple sources for hail-affected areas
   */
  async executeHailStormStrategy(config) {
    const {
      zipCodes,
      hailDate,
      radius = 5, // miles
      targetSources = ['public_records', 'social_media', 'local_news', 'weather_reports']
    } = config;

    console.log(`🌩️ Starting hail storm targeting strategy for ${zipCodes.length} zip codes`);

    const strategy = {
      step1_identifyAffectedAreas: await this.identifyAffectedAreas(zipCodes, hailDate),
      step2_scrapeWeatherReports: await this.scrapeWeatherReports(zipCodes, hailDate),
      step3_findLocalBusinesses: await this.findLocalBusinessesInZipCodes(zipCodes),
      step4_scrapePublicRecords: await this.scrapePublicPropertyData(zipCodes),
      step5_monitorSocialMedia: await this.monitorSocialMediaPosts(zipCodes, hailDate),
      step6_scrapeInsuranceClaimData: await this.scrapeInsuranceClaimIndicators(zipCodes),
      step7_compileTargetList: await this.compileTargetingList(zipCodes)
    };

    return strategy;
  }

  /**
   * Step 1: Identify hail-affected areas using weather data
   */
  async identifyAffectedAreas(zipCodes, hailDate) {
    const affectedAreas = [];

    for (const zipCode of zipCodes) {
      try {
        // Scrape NOAA/Weather.gov for hail reports
        const weatherData = await this.firecrawl.scrapeUrl({
          url: `https://www.weather.gov/search?q=${zipCode}+hail+${hailDate}`,
          formats: ['markdown', 'html'],
          onlyMainContent: true
        });

        // Scrape Storm Prediction Center
        const stormData = await this.firecrawl.scrapeUrl({
          url: `https://www.spc.noaa.gov/climo/reports/today_filtered.html`,
          formats: ['markdown', 'html']
        });

        affectedAreas.push({
          zipCode,
          hailConfirmed: this.detectHailMention(weatherData.data.markdown),
          severity: this.estimateHailSeverity(weatherData.data.markdown),
          sources: ['NOAA', 'SPC']
        });

        console.log(`✓ Checked ${zipCode} for hail activity`);
      } catch (error) {
        console.error(`Error checking ${zipCode}:`, error);
      }
    }

    return affectedAreas;
  }

  /**
   * Step 2: Scrape comprehensive weather reports
   */
  async scrapeWeatherReports(zipCodes, hailDate) {
    const weatherReports = [];

    // Sources to scrape
    const weatherSources = [
      {
        name: 'Weather.gov',
        urlTemplate: (zip) => `https://www.weather.gov/search?q=${zip}+severe+weather`
      },
      {
        name: 'Local News',
        urlTemplate: (zip) => `https://news.google.com/search?q=${zip}+hail+storm`
      },
      {
        name: 'Weather Underground',
        urlTemplate: (zip) => `https://www.wunderground.com/history/daily/${zip}/date/${hailDate}`
      }
    ];

    for (const zipCode of zipCodes) {
      for (const source of weatherSources) {
        try {
          const result = await this.firecrawl.scrapeUrl({
            url: source.urlTemplate(zipCode),
            formats: ['markdown'],
            onlyMainContent: true
          });

          weatherReports.push({
            zipCode,
            source: source.name,
            content: result.data.markdown,
            hailSize: this.extractHailSize(result.data.markdown),
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error scraping ${source.name} for ${zipCode}:`, error);
        }
      }
    }

    return weatherReports;
  }

  /**
   * Step 3: Find local businesses and residential areas
   */
  async findLocalBusinessesInZipCodes(zipCodes) {
    const businesses = [];

    for (const zipCode of zipCodes) {
      try {
        // Scrape Yellow Pages for area
        const yellowPages = await this.firecrawl.scrapeUrl({
          url: `https://www.yellowpages.com/search?search_terms=&geo_location_terms=${zipCode}`,
          formats: ['markdown'],
          onlyMainContent: true
        });

        // Scrape Google Maps business listings (public data)
        const mapsData = await this.firecrawl.crawlUrl({
          url: `https://www.google.com/maps/search/businesses+near+${zipCode}`,
          limit: 50,
          scrapeOptions: {
            formats: ['markdown']
          }
        });

        businesses.push({
          zipCode,
          businessCount: this.countBusinesses(yellowPages.data.markdown),
          areas: this.extractNeighborhoods(yellowPages.data.markdown)
        });
      } catch (error) {
        console.error(`Error finding businesses in ${zipCode}:`, error);
      }
    }

    return businesses;
  }

  /**
   * Step 4: Scrape public property records
   */
  async scrapePublicPropertyData(zipCodes) {
    const propertyData = [];

    for (const zipCode of zipCodes) {
      try {
        // Scrape public property records (county assessor websites)
        // Note: This varies by county - customize URLs accordingly
        const countyData = await this.firecrawl.scrapeUrl({
          url: `https://www.countyassessor.com/property-search/${zipCode}`,
          formats: ['markdown', 'html'],
          onlyMainContent: true
        });

        // Extract residential property counts
        const residentialCount = this.extractPropertyCount(countyData.data.markdown);

        propertyData.push({
          zipCode,
          residentialProperties: residentialCount,
          dataSource: 'Public Records'
        });
      } catch (error) {
        console.error(`Error scraping property data for ${zipCode}:`, error);
      }
    }

    return propertyData;
  }

  /**
   * Step 5: Monitor social media for hail damage posts
   */
  async monitorSocialMediaPosts(zipCodes, hailDate) {
    const socialPosts = [];

    for (const zipCode of zipCodes) {
      try {
        // Scrape public social media mentions (Twitter/X, Nextdoor public posts)
        const twitterSearch = await this.firecrawl.scrapeUrl({
          url: `https://twitter.com/search?q=${zipCode}+hail+damage&f=live`,
          formats: ['markdown'],
          onlyMainContent: true
        });

        // Scrape public Facebook posts (community pages)
        const facebookSearch = await this.firecrawl.scrapeUrl({
          url: `https://www.facebook.com/public?query=${zipCode}%20hail%20storm`,
          formats: ['markdown'],
          onlyMainContent: true
        });

        socialPosts.push({
          zipCode,
          mentions: this.countHailMentions(twitterSearch.data.markdown + facebookSearch.data.markdown),
          urgency: this.assessUrgency(twitterSearch.data.markdown),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error monitoring social media for ${zipCode}:`, error);
      }
    }

    return socialPosts;
  }

  /**
   * Step 6: Scrape insurance claim indicators
   */
  async scrapeInsuranceClaimIndicators(zipCodes) {
    const claimData = [];

    for (const zipCode of zipCodes) {
      try {
        // Scrape public insurance claim data (if available)
        const claimReports = await this.firecrawl.scrapeUrl({
          url: `https://www.iii.org/fact-statistic/facts-statistics-hail`,
          formats: ['markdown']
        });

        claimData.push({
          zipCode,
          claimIndicators: this.extractClaimIndicators(claimReports.data.markdown)
        });
      } catch (error) {
        console.error(`Error scraping claim data for ${zipCode}:`, error);
      }
    }

    return claimData;
  }

  /**
   * Step 7: Compile comprehensive targeting list
   */
  async compileTargetingList(zipCodes) {
    const targetList = {
      metadata: {
        totalZipCodes: zipCodes.length,
        scrapingDate: new Date().toISOString(),
        dataCompliance: 'TCPA_COMPLIANT'
      },
      targetingStrategy: {
        directMail: await this.getDirectMailAddresses(zipCodes),
        digitalAds: await this.getDigitalAdTargeting(zipCodes),
        doorToDoor: await this.getDoorToDoorRoutes(zipCodes),
        localAdvertising: await this.getLocalAdOpportunities(zipCodes)
      }
    };

    return targetList;
  }

  /**
   * Get addresses for direct mail campaigns (from public records)
   */
  async getDirectMailAddresses(zipCodes) {
    const addresses = [];

    for (const zipCode of zipCodes) {
      try {
        // Scrape public white pages
        const whitePagesData = await this.firecrawl.scrapeUrl({
          url: `https://www.whitepages.com/postal_code/${zipCode}`,
          formats: ['markdown'],
          onlyMainContent: true
        });

        addresses.push({
          zipCode,
          estimatedHouseholds: this.extractHouseholdCount(whitePagesData.data.markdown),
          mailingListSource: 'Public Records'
        });
      } catch (error) {
        console.error(`Error getting addresses for ${zipCode}:`, error);
      }
    }

    return addresses;
  }

  /**
   * Get digital ad targeting parameters
   */
  async getDigitalAdTargeting(zipCodes) {
    return {
      platforms: ['Google Ads', 'Facebook Ads', 'Nextdoor Ads'],
      targeting: {
        zipCodes: zipCodes,
        keywords: [
          'hail damage repair',
          'auto body shop near me',
          'car dent repair',
          'hail damage insurance claim',
          'paintless dent repair'
        ],
        demographics: {
          interests: ['automotive', 'car maintenance', 'insurance'],
          behaviors: ['recently affected by weather event']
        }
      },
      budget: {
        recommended: '$50-100 per zip code',
        duration: '2-4 weeks post-storm'
      }
    };
  }

  /**
   * Get door-to-door canvassing routes
   */
  async getDoorToDoorRoutes(zipCodes) {
    const routes = [];

    for (const zipCode of zipCodes) {
      try {
        // Scrape neighborhood data
        const neighborhoodData = await this.firecrawl.scrapeUrl({
          url: `https://www.city-data.com/zips/${zipCode}.html`,
          formats: ['markdown'],
          onlyMainContent: true
        });

        routes.push({
          zipCode,
          neighborhoods: this.extractNeighborhoods(neighborhoodData.data.markdown),
          routeOptimization: 'Start with most affected areas'
        });
      } catch (error) {
        console.error(`Error planning routes for ${zipCode}:`, error);
      }
    }

    return routes;
  }

  /**
   * Get local advertising opportunities
   */
  async getLocalAdOpportunities(zipCodes) {
    const opportunities = [];

    for (const zipCode of zipCodes) {
      try {
        // Scrape local news sites
        const localNews = await this.firecrawl.scrapeUrl({
          url: `https://www.localnewspapers.com/zip/${zipCode}`,
          formats: ['markdown']
        });

        opportunities.push({
          zipCode,
          localMedia: this.extractLocalMedia(localNews.data.markdown),
          recommendedChannels: [
            'Local newspaper ads',
            'Community bulletin boards',
            'Local radio spots',
            'Nextdoor sponsored posts'
          ]
        });
      } catch (error) {
        console.error(`Error finding ad opportunities for ${zipCode}:`, error);
      }
    }

    return opportunities;
  }

  // Helper methods for data extraction and analysis

  detectHailMention(text) {
    const hailKeywords = ['hail', 'hailstorm', 'severe weather', 'storm damage'];
    return hailKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  estimateHailSeverity(text) {
    const severityIndicators = {
      severe: ['golf ball', 'baseball', 'tennis ball', 'severe'],
      moderate: ['quarter', 'nickel', 'dime', 'pea'],
      minor: ['small', 'light', 'brief']
    };

    const textLower = text.toLowerCase();
    
    if (Object.values(severityIndicators.severe).some(ind => textLower.includes(ind))) {
      return 'SEVERE';
    } else if (Object.values(severityIndicators.moderate).some(ind => textLower.includes(ind))) {
      return 'MODERATE';
    } else if (Object.values(severityIndicators.minor).some(ind => textLower.includes(ind))) {
      return 'MINOR';
    }
    
    return 'UNKNOWN';
  }

  extractHailSize(text) {
    const sizePattern = /(\d+\.?\d*)\s*(inch|in|cm|centimeter)/gi;
    const matches = text.match(sizePattern);
    return matches ? matches[0] : 'Not specified';
  }

  countBusinesses(text) {
    const businessLines = text.split('\n').filter(line => 
      line.includes('Address') || line.includes('Phone') || line.includes('Business')
    );
    return businessLines.length;
  }

  extractNeighborhoods(text) {
    // Extract neighborhood names from text
    const neighborhoodPattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(neighborhood|area|district)/gi;
    const matches = text.matchAll(neighborhoodPattern);
    return Array.from(matches, m => m[1]);
  }

  extractPropertyCount(text) {
    const countPattern = /(\d+,?\d*)\s*(properties|homes|residences)/gi;
    const match = text.match(countPattern);
    return match ? parseInt(match[0].replace(/\D/g, '')) : 0;
  }

  countHailMentions(text) {
    const mentions = (text.match(/hail/gi) || []).length;
    return mentions;
  }

  assessUrgency(text) {
    const urgentKeywords = ['emergency', 'severe', 'urgent', 'immediate', 'help'];
    const urgencyScore = urgentKeywords.reduce((score, keyword) => {
      return score + (text.toLowerCase().split(keyword).length - 1);
    }, 0);
    
    return urgencyScore > 5 ? 'HIGH' : urgencyScore > 2 ? 'MEDIUM' : 'LOW';
  }

  extractClaimIndicators(text) {
    return {
      claimVolume: this.extractPropertyCount(text),
      averageClaimAmount: '$3,000-$7,000 (typical hail damage)',
      processingTime: '2-4 weeks'
    };
  }

  extractHouseholdCount(text) {
    const countPattern = /(\d+,?\d*)\s*(households|homes)/gi;
    const match = text.match(countPattern);
    return match ? parseInt(match[0].replace(/\D/g, '')) : 0;
  }

  extractLocalMedia(text) {
    return ['Local newspaper', 'Community radio', 'Regional TV'];
  }
}

export default new FirecrawlHailStormService();

