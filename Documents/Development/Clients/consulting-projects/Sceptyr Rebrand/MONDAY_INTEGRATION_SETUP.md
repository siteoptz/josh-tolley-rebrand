# Monday.com Integration Setup Guide

## Overview
This guide explains how to configure the Monday.com integration for the Sceptyr contact form. Form submissions will automatically create items in your "Sceptyr Inquiries" Monday.com board.

## Prerequisites
- Monday.com account with admin access
- "Sceptyr Inquiries" board created in Monday.com
- Vercel project access for environment variables

## Step 1: Set Up Monday.com Board

### Create the "Sceptyr Inquiries" Board
1. Go to Monday.com dashboard
2. Click "Create Board" or use existing "Sceptyr Inquiries" board
3. Configure the following columns:

#### Required Columns
| Column Name | Type | Column ID | Purpose |
|-------------|------|-----------|---------|
| Name | Text | `name` | Contact name (auto-populated as item name) |
| Email | Email | `email` | Contact email address |
| Phone | Phone | `phone` | Contact phone number |
| Net Worth | Dropdown | `net_worth` | Approximate net worth |
| Accredited | Dropdown | `accredited_investor` | Yes/No for accredited status |
| Interest | Dropdown | `primary_interest` | Primary service interest |
| Message | Long Text | `message` | Contact message/details |
| Submitted | Date | `submission_date` | Form submission date |

#### Net Worth Dropdown Options
- Less than $100K
- $100k-500K
- $500 - $1 million
- $1 million - $2 million
- Greater than $2 million

#### Accredited Dropdown Options
- Yes
- No

#### Primary Interest Dropdown Options
- Investment Opportunities
- Legacy Guidance & Protection
- Strategic Applied Insurance
- Business M&A or Exit
- Balance Sheet Bankroll

## Step 2: Get Monday.com API Credentials

### Generate API Token
1. Go to Monday.com → Your Avatar → Developers
2. Click "My Access Tokens"
3. Click "Generate New Token"
4. Name it "Sceptyr Website Integration"
5. Select scopes: `boards:read`, `boards:write`
6. Copy the generated token (save securely)

### Get Board ID
1. Open your "Sceptyr Inquiries" board
2. Look at the URL: `https://your-org.monday.com/boards/1234567890`
3. The number after `/boards/` is your Board ID
4. Copy this Board ID

### Get Column IDs (Important!)
1. Go to your Monday.com board
2. Click on any column header → "Column Settings"
3. Look for "Column ID" at the bottom of the settings panel
4. Record all Column IDs for each column you created

**Example Column Mapping:**
```
email → "email"
phone → "phone4"
net_worth → "dropdown"
accredited_investor → "dropdown7" 
primary_interest → "dropdown1"
message → "long_text"
submission_date → "date4"
```

## Step 3: Configure Vercel Environment Variables

### Add Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `MONDAY_API_TOKEN` | Your API token from Step 2 | Production |
| `MONDAY_BOARD_ID` | Your board ID from Step 2 | Production |

### Environment Variable Format
```
MONDAY_API_TOKEN=your_api_token_here
MONDAY_BOARD_ID=1234567890
```

## Step 4: Update Column Mapping

### Edit the API Function
1. Open `/api/form-submission.js`
2. Update the `columnValues` object with your actual column IDs:

```javascript
const columnValues = {
  "email": formData.email,                    // Replace "email" with your email column ID
  "phone4": formData.phone,                   // Replace "phone4" with your phone column ID  
  "dropdown": formData.netWorth,              // Replace "dropdown" with your net worth column ID
  "dropdown7": formData.accredited,           // Replace "dropdown7" with your accredited column ID
  "dropdown1": formData.interest,             // Replace "dropdown1" with your interest column ID
  "long_text": formData.message,              // Replace "long_text" with your message column ID
  "date4": new Date().toISOString().split('T')[0] // Replace "date4" with your date column ID
};
```

## Step 5: Deploy and Test

### Deploy to Vercel
```bash
cd "/Users/siteoptz/Documents/Development/Clients/consulting-projects/Sceptyr Rebrand"
vercel deploy --prod
```

### Test the Integration
1. Go to https://www.sceptyr.com/contact-us
2. Fill out and submit the form
3. Check your Monday.com board for the new item
4. Verify emails are still sent to antonio@siteoptz.com and info@sceptyr.com

## Step 6: Verify Integration

### Check Monday.com Board
- New item should appear with contact name as title
- All form fields should populate respective columns
- Submission date should be automatically set

### Check Email Notifications
- antonio@siteoptz.com should receive notification
- info@sceptyr.com should receive CC notification
- Email format should include all form details

## Troubleshooting

### Common Issues

#### Issue: No items appearing in Monday.com
**Possible Causes:**
- Incorrect API token
- Wrong Board ID
- Column ID mismatch
- API permissions insufficient

**Solutions:**
1. Check Vercel logs: `vercel logs --prod`
2. Verify environment variables in Vercel dashboard
3. Test API token in Monday.com API explorer
4. Verify column IDs match exactly

#### Issue: Form submission fails
**Possible Causes:**
- API endpoint not deployed
- JavaScript errors
- Network issues

**Solutions:**
1. Check browser console for errors
2. Verify `/api/form-submission` endpoint is accessible
3. Check Vercel deployment status

#### Issue: Emails not sending
**Possible Causes:**
- FormSubmit service issues
- Email addresses need verification
- Network blocking

**Solutions:**
1. Check FormSubmit status
2. Verify email addresses
3. Check spam folders

### Testing API Directly

#### Test Monday.com Connection
```bash
curl -X POST "https://api.monday.com/v2" \
  -H "Authorization: YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { boards(ids: YOUR_BOARD_ID) { name columns { id title type } } }"
  }'
```

#### Test Form Endpoint
```bash
curl -X POST "https://www.sceptyr.com/api/form-submission" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "(555) 123-4567",
    "netWorth": "$1 million - $2 million",
    "accredited": "Yes",
    "interest": "Investment Opportunities",
    "message": "Test submission"
  }'
```

## Monitoring and Maintenance

### Regular Checks
- **Weekly**: Verify form submissions are creating Monday.com items
- **Monthly**: Check API token expiration
- **Quarterly**: Review column mapping for any board changes

### Logs and Debugging
- **Vercel Logs**: `vercel logs --prod` to see function execution
- **Monday.com Activity**: Check board activity log for API calls
- **Browser Console**: Check for JavaScript errors on form submission

## Security Considerations

### API Token Security
- Never commit API tokens to code
- Use Vercel environment variables only
- Regenerate tokens if compromised
- Limit API token permissions to minimum required

### Data Privacy
- Form submissions contain personal information
- Ensure Monday.com workspace has proper access controls
- Consider data retention policies
- Comply with privacy regulations (GDPR, CCPA)

## Support Contacts

### Technical Issues
- **Developer**: antonio@siteoptz.com
- **Monday.com Support**: https://support.monday.com
- **Vercel Support**: https://vercel.com/support

### Business Questions
- **Primary Contact**: info@sceptyr.com

---

**Last Updated**: 2026-01-30
**Version**: 1.0
**Integration Status**: Pending Configuration