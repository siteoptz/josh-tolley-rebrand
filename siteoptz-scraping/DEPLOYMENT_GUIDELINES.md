# 🚨 CRITICAL DEPLOYMENT GUIDELINES 🚨

## ⛔ NEVER DEPLOY THIS PROJECT TO PRODUCTION SITES

This is a development/dashboard project that should **NEVER** be deployed to production website domains.

---

## 🎯 CORRECT PROJECT MAPPINGS

### Production Websites (DO NOT DEPLOY DASHBOARDS HERE):
- **siteoptz.ai** → Main SiteOptz website (Next.js)
- **siteoptz.com** → Agency website (Next.js)
- **cubansoultx.com** → Cuban Soul TX website
- **restorationsenterprisetx.com** → Restorations Enterprise website
- **cummingsmiledentistry.com** → Cumming Smile Dentistry website

### Dashboard/Development Projects (SAFE TO DEPLOY):
- **siteoptz-scraping** → This React dashboard project
- **optz-bi** → Business Intelligence dashboard
- **siteoptz-v5** → Development version

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### BEFORE ANY DEPLOYMENT, YOU MUST:

1. **VERIFY PROJECT NAME**
   ```bash
   # Check current linked project
   cat .vercel/project.json
   
   # Expected output for this project:
   # {"projectId":"...", "orgId":"...", "settings":{"framework":"create-react-app"}}
   ```

2. **CONFIRM PROJECT TYPE**
   - Is this a dashboard/admin panel? ✅ Safe to deploy to development projects
   - Is this a public website? ⛔ DO NOT deploy to production domains

3. **CHECK DEPLOYMENT TARGET**
   ```bash
   # List current project deployments
   vercel ls
   
   # VERIFY the project name matches expected target
   ```

4. **USE PREVIEW DEPLOYMENTS FIRST**
   ```bash
   # Always deploy to preview first
   vercel
   
   # Only deploy to production after verification
   vercel --prod
   ```

---

## 🛡️ SAFETY RULES

### RULE 1: Project Isolation
- **NEVER** link dashboard projects to production website projects
- **ALWAYS** maintain separate Vercel projects for:
  - Production websites
  - Development dashboards
  - Testing environments

### RULE 2: Explicit Project Linking
```bash
# WRONG - Don't use generic commands
vercel --prod

# RIGHT - Always specify project explicitly
vercel link --project siteoptz-scraping --yes
vercel --prod
```

### RULE 3: Rollback Procedure
If you accidentally deploy to the wrong project:
```bash
# 1. List recent deployments
vercel ls --prod

# 2. Find the last working deployment
# Look for the last "Ready" deployment before your mistake

# 3. Rollback immediately
vercel rollback [deployment-url] --yes
```

---

## 📝 PROJECT CONFIGURATION

### This Project Should Use:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app"
}
```

### Production Sites Typically Use:
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next"
}
```

---

## ⚠️ WARNING SIGNS

### STOP if you see:
- Deployment to a domain ending in `.com`, `.ai`, or other production TLDs
- Project names without "dev", "staging", or "dashboard" indicators
- Deployment replacing a Next.js site with a React app
- Any deployment to customer/client websites

### SAFE to proceed if:
- Deploying to `*-scraping.vercel.app`
- Deploying to development/staging projects
- Project name clearly indicates it's for development

---

## 🔒 ENVIRONMENT VARIABLES

### NEVER commit:
- API keys in `.env` files
- Database credentials
- OAuth secrets
- Payment processor keys

### ALWAYS:
- Use `.env.example` for templates
- Add `.env` to `.gitignore`
- Use Vercel's environment variables UI for production secrets

---

## 📞 EMERGENCY CONTACTS

If you accidentally deploy to production:
1. **IMMEDIATELY** rollback using the procedure above
2. Notify the team
3. Document the incident
4. Review these guidelines

---

## 🎯 RECOMMENDED WORKFLOW

1. **Development**: Work locally with `npm start`
2. **Preview**: Deploy to Vercel preview with `vercel`
3. **Staging**: Deploy to staging project (if available)
4. **Production**: Only deploy dashboards to dashboard-specific projects

---

## 🚀 SAFE DEPLOYMENT COMMANDS FOR THIS PROJECT

```bash
# First time setup
rm -rf .vercel
vercel link --project siteoptz-scraping --yes

# Deploy to preview
vercel

# Deploy to production (only after verification)
vercel --prod

# Check deployment status
vercel ls
```

---

## ⚠️ FINAL WARNING

**THIS PROJECT IS A REACT DASHBOARD**
**DO NOT DEPLOY TO:**
- siteoptz.ai
- siteoptz.com
- Any customer website
- Any production domain

**ONLY DEPLOY TO:**
- siteoptz-scraping
- Development/staging projects

---

Last Updated: October 2024
Review these guidelines before EVERY deployment