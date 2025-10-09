# Installation Guide - AI SEO Service

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- OpenAI API key (required)
- Git (optional, for cloning)

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React and React Router
- Axios (for API calls)
- Stripe (for payments)
- All other required packages

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Then edit `.env` and add your API keys:

```bash
# REQUIRED - Get from https://platform.openai.com/api-keys
REACT_APP_OPENAI_API_KEY=sk-your_actual_key_here

# OPTIONAL (but recommended for best results)
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your_key_here
REACT_APP_PERPLEXITY_API_KEY=pplx-your_key_here

# OPTIONAL (for production features)
REACT_APP_AHREFS_API_KEY=your_key_here
REACT_APP_SEMRUSH_API_KEY=your_key_here

# Enable the AI SEO feature
REACT_APP_ENABLE_AI_SEO_SERVICE=true
```

### 3. Get Your API Keys

#### OpenAI (Required)

1. Go to https://platform.openai.com/signup
2. Create an account (or sign in)
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add billing method (pay as you go)
7. Costs: ~$10-30 per client per month

#### Anthropic Claude (Optional)

1. Go to https://console.anthropic.com/
2. Sign up for an account
3. Get API key from dashboard
4. Costs: ~$5-15 per client per month

#### Perplexity (Optional)

1. Go to https://www.perplexity.ai/
2. Sign up for API access
3. Get your API key
4. Costs: ~$3-10 per client per month

### 4. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 5. Access the AI SEO Dashboard

Navigate to: **http://localhost:3000/ai-seo**

You should see the AI SEO Dashboard!

## Testing Your Installation

### Quick Test

1. Go to http://localhost:3000/ai-seo
2. Click "Add Client"
3. Fill in test data:
   ```
   Business Name: Test Plumbing Co
   Industry: Plumbing
   Location: Los Angeles, CA
   Website: https://testplumbing.com
   Business Type: Service Business
   Target Audience: Homeowners
   Services: Plumbing repair, Installation
   [✓] This is a local business
   ```
4. Click "Add Client"
5. Click "Run Monthly Service"
6. Wait 5-10 minutes
7. Check results!

### Expected Results

If working correctly, you should see:
- ✅ 100+ keywords researched
- ✅ 15 blog posts generated
- ✅ Technical audit completed
- ✅ Competitor analysis done
- ✅ Link building prospects found
- ✅ Monthly report created

### If You Get Errors

**"Invalid API Key"**
- Check your `.env` file has the correct OpenAI key
- Make sure the key starts with `sk-`
- Restart the dev server: Stop (Ctrl+C) and `npm start` again

**"Rate limit exceeded"**
- You need to add billing to your OpenAI account
- Go to https://platform.openai.com/account/billing
- Add a payment method
- Set usage limits ($50/month is plenty)

**"Module not found"**
- Run `npm install` again
- Make sure all dependencies installed correctly

**"Network error"**
- Check your internet connection
- Verify API keys are active
- Check API provider status pages

## Building for Production

### 1. Build the app

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### 2. Deploy

You can deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag `build/` folder to Netlify
- **AWS S3**: Upload `build/` folder
- **Your own server**: Serve `build/` folder with nginx/apache

### 3. Environment Variables in Production

Make sure to set environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- AWS: Use Systems Manager Parameter Store

## Cost Breakdown

### Monthly Costs Per Client

- OpenAI GPT-4: $10-15
- Claude (optional): $3-8
- Perplexity (optional): $2-5
- Platform hosting: ~$5-10

**Total: $15-38 per client**

### At Scale (10 clients)

- AI costs: $150-380/month
- Hosting: $50-100/month
- **Total: $200-480/month**

If you charge $1000/client:
- Revenue: $10,000/month
- Costs: $480/month
- **Profit: $9,520/month (95% margin)**

Even with overhead, you're at 75%+ margins!

## Troubleshooting

### Common Issues

**1. CORS Errors**
- These are normal in development
- Use backend API routes in production
- Set up proper CORS headers

**2. Slow Performance**
- Normal: 5-10 minutes per client
- GPT-4 is thorough but not instant
- Run overnight for bulk processing

**3. High API Costs**
- Monitor usage in OpenAI dashboard
- Set usage limits ($50-100/month per client)
- Cache keyword research results
- Use GPT-3.5 for drafts, GPT-4 for finals

**4. Content Quality Issues**
- Review and edit AI output (10-15 min)
- Adjust temperature in service code (0.6-0.8)
- Provide more context in client profiles
- Add brand voice guidelines

### Need More Help?

1. Check the full guide: `AI_SEO_SERVICE_GUIDE.md`
2. Read the quick start: `AI_SEO_QUICKSTART.md`
3. Review the code: `src/services/AISEOService.js`
4. Check OpenAI docs: https://platform.openai.com/docs

## Security Best Practices

1. **Never commit .env file**
   - Already in `.gitignore`
   - API keys should stay private

2. **Use backend API routes in production**
   - Don't expose API keys in frontend
   - Implement rate limiting
   - Add authentication

3. **Set usage limits**
   - OpenAI: Set monthly limits
   - Monitor costs daily
   - Set up alerts

4. **Validate inputs**
   - Sanitize user inputs
   - Validate URLs
   - Rate limit requests

## Next Steps

1. ✅ Installation complete
2. ✅ Test with sample client
3. ✅ Review generated content
4. ✅ Customize prompts if needed
5. ✅ Set up white-label branding
6. ✅ Create pricing packages
7. ✅ Start marketing to clients!

---

**Ready to scale your agency with AI!** 🚀

For questions, check the documentation or review the codebase.

