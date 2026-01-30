# Sceptyr.com Deployment Process - PRD

## Overview
Sceptyr.com (production) is served from the `sceptyr-staging` Vercel project through DNS configuration on GoDaddy. The staging environment serves as the production environment.

## Current Architecture

### Domain Setup
- **Production Domain**: `sceptyr.com`
- **Vercel Project**: `sceptyr-staging`
- **DNS Provider**: GoDaddy
- **Hosting**: Vercel
- **Repository**: https://github.com/siteoptz/sceptyr-staging.git

### File Structure
```
/Users/siteoptz/Documents/Development/Clients/consulting-projects/Sceptyr Rebrand/
├── contact-us.html          # Contact form page
├── index.html              # Homepage
├── vercel.json             # Vercel configuration
├── *.html                  # All other pages
└── .vercel/               # Vercel project configuration
```

## Deployment Process

### Method 1: Vercel CLI Deployment (Recommended)
```bash
# Navigate to project directory
cd "/Users/siteoptz/Documents/Development/Clients/consulting-projects/Sceptyr Rebrand"

# Deploy to staging first (for testing)
vercel deploy

# Deploy to production (live site)
vercel deploy --prod

# Force deployment if needed
vercel deploy --force --prod
```

### Method 2: Git-based Deployment (If Repository is Connected)
```bash
# Check git status
git status

# Add changes
git add [filename]

# Commit changes
git commit -m "Description of changes"

# Push to trigger auto-deployment (if configured)
git push origin main
```

## Pre-Deployment Checklist

### Before Making Changes
1. **Backup Current Files**: Always backup the working version
2. **Test Locally**: Preview changes by opening HTML files directly
3. **Validate HTML**: Ensure no syntax errors
4. **Check Dependencies**: Verify all external links and resources

### Change Validation
1. **Form Functionality**: Test all forms work correctly
2. **Navigation**: Verify all internal links work
3. **Mobile Responsiveness**: Check on different devices
4. **Performance**: Ensure fast load times

## Post-Deployment Verification

### Immediate Checks (within 2 minutes)
1. **Site Accessibility**: Visit https://www.sceptyr.com
2. **Form Functionality**: Test contact form submission
3. **Navigation**: Check key pages load correctly
4. **SSL Certificate**: Ensure HTTPS is working

### Extended Checks (within 15 minutes)
1. **CDN Propagation**: Check from multiple locations
2. **Email Delivery**: Test form submissions arrive
3. **Analytics**: Verify tracking is working
4. **SEO**: Check meta tags and structured data

## Common Issues & Solutions

### Issue: Changes Not Visible on Live Site
**Causes**:
- Browser cache
- CDN cache
- Deployment didn't complete
- Wrong deployment target

**Solutions**:
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Check in incognito/private mode
3. Wait 5-10 minutes for CDN propagation
4. Redeploy: `vercel redeploy [deployment-url]`
5. Force new deployment: `vercel deploy --force --prod`

### Issue: Form Submissions Not Working
**Causes**:
- Email service not verified
- Form action incorrect
- JavaScript errors
- Hidden fields missing

**Solutions**:
1. Check email verification (FormSubmit requires verification)
2. Verify form action URL
3. Check browser console for errors
4. Validate HTML form structure

### Issue: Site Completely Down
**Emergency Actions**:
1. Check Vercel status page
2. Verify DNS settings in GoDaddy
3. Redeploy last known good version
4. Contact Vercel support if needed

## Environment Variables & Configuration

### Vercel Configuration (vercel.json)
- **Rewrites**: Clean URLs configuration
- **Headers**: Security headers
- **Redirects**: URL redirects if needed

### DNS Configuration (GoDaddy)
- **A Record**: Points to Vercel's IP
- **CNAME**: www subdomain configuration
- **Name Servers**: Should point to Vercel's DNS

## Contact Form Configuration

### Current Setup (Monday.com Integration + Email)
- **Primary Integration**: Monday.com "Sceptyr Inquiries" board
- **Email Notifications**: antonio@siteoptz.com (primary), info@sceptyr.com (CC)
- **API Endpoint**: `/api/form-submission`
- **Fallback**: FormSubmit.co for email delivery

### Integration Architecture
```
Form Submission → Vercel Serverless Function → Monday.com API + Email Notifications
```

### Form Configuration Details
```html
<form action="/api/form-submission" method="POST">
    <!-- Monday.com integration via serverless function -->
    <!-- Form fields here -->
</form>
```

### Environment Variables Required
- `MONDAY_API_TOKEN`: Monday.com API access token
- `MONDAY_BOARD_ID`: ID of "Sceptyr Inquiries" board

### Data Flow
1. User submits form
2. JavaScript prevents default submission
3. Data sent to `/api/form-submission` endpoint
4. Function creates item in Monday.com board
5. Function sends email notifications
6. Success/error message shown to user

## Emergency Contacts

### Technical Issues
- **Developer**: Antonio (antonio@siteoptz.com)
- **Vercel Support**: support@vercel.com
- **GoDaddy Support**: Via account portal

### Business Issues
- **Primary Contact**: info@sceptyr.com
- **Technical Lead**: antonio@siteoptz.com

## Change Log Template
```
Date: [YYYY-MM-DD]
Change: [Description]
Files Modified: [List of files]
Deployed By: [Name]
Deployment URL: [Vercel deployment URL]
Status: [Success/Failed]
Notes: [Any additional notes]
```

## Best Practices

### Development
1. **Test First**: Always test in staging before production
2. **Small Changes**: Deploy small, incremental changes
3. **Documentation**: Update this PRD when process changes
4. **Backups**: Keep backups of working versions

### Security
1. **HTTPS Only**: Always use secure connections
2. **Form Validation**: Validate all user inputs
3. **Email Security**: Use secure email services
4. **Access Control**: Limit deployment access

### Performance
1. **Image Optimization**: Compress images before upload
2. **CSS/JS Minification**: Minimize file sizes
3. **CDN Usage**: Leverage Vercel's CDN
4. **Cache Headers**: Set appropriate cache headers

---

**Last Updated**: 2026-01-30
**Version**: 1.0
**Next Review**: 2026-02-30