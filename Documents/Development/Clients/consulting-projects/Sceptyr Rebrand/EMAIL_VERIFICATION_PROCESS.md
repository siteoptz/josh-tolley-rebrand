# FormSubmit Email Verification Process

## Overview
FormSubmit.co requires email verification for the first submission to any new email address. This is a security measure to prevent spam and unauthorized use.

## Current Configuration
- **Primary Email**: antonio@siteoptz.com (requires verification)
- **CC Email**: info@sceptyr.com
- **Form Action**: https://formsubmit.co/antonio@siteoptz.com

## Verification Process

### Step 1: Initial Form Submission
When the first form submission is made to the new email address (antonio@siteoptz.com), FormSubmit will:

1. **Hold the submission**: The form data will be temporarily stored
2. **Send verification email**: An email will be sent to antonio@siteoptz.com
3. **Show confirmation**: The form will still show the thank you message to the user

### Step 2: Email Verification
Antonio needs to:

1. **Check inbox**: Look for an email from FormSubmit.co in antonio@siteoptz.com
2. **Check spam folder**: Verification emails sometimes go to spam
3. **Click verification link**: Click the link in the email to verify the address
4. **Confirm activation**: The email address will be activated for future submissions

### Step 3: Form Activation
After verification:

1. **Immediate effect**: New submissions will be processed normally
2. **Email delivery**: Both antonio@siteoptz.com and info@sceptyr.com will receive submissions
3. **No further verification**: Subsequent submissions will work automatically

## Expected Email Content

### Verification Email Subject
```
Please verify your email address for FormSubmit
```

### Email Content
```
Hello,

Someone has used your email address (antonio@siteoptz.com) to submit a form via FormSubmit.

To confirm this was you and activate form submissions to this address, please click the verification link below:

[VERIFY EMAIL ADDRESS]

If you did not submit this form, please ignore this email.

Best regards,
The FormSubmit Team
```

## Timeline
- **Verification email arrival**: Usually within 1-5 minutes
- **Link expiration**: Verification links typically expire in 24 hours
- **Activation time**: Immediate after clicking verification link

## Troubleshooting

### If Verification Email Doesn't Arrive
1. **Check spam/junk folder**: Most common issue
2. **Wait longer**: Can take up to 10 minutes
3. **Check email address**: Ensure antonio@siteoptz.com is correct
4. **Try another submission**: Submit the form again to trigger another verification email

### If Verification Link Doesn't Work
1. **Copy full URL**: Click and copy the full link, paste in browser
2. **Check expiration**: Links expire after 24 hours
3. **Try different browser**: Some browsers block external links
4. **Contact FormSubmit**: support@formsubmit.co for help

### If Form Still Doesn't Work After Verification
1. **Wait 5 minutes**: Changes can take a few minutes to propagate
2. **Check form configuration**: Verify action URL is correct
3. **Test with different data**: Try a new form submission
4. **Check FormSubmit status**: Visit formsubmit.co for service status

## Testing the Form

### Pre-Verification Test
1. Submit a test form entry
2. Look for verification email in antonio@siteoptz.com
3. Click verification link
4. Submit another test entry
5. Confirm both emails receive the submission

### Test Data Example
```
First Name: Test
Last Name: User
Email: test@example.com
Phone: (555) 123-4567
Net Worth: $1 million - $2 million
Accredited: Yes
Interest: Investment Opportunities
Message: This is a test submission for form verification.
```

## Monitoring

### What to Monitor
- **Email delivery**: Both antonio@siteoptz.com and info@sceptyr.com receive submissions
- **Form completion**: Users receive thank you message
- **Data quality**: All form fields are captured correctly

### Regular Checks
- **Weekly**: Test form submission to ensure it's working
- **After any changes**: Test immediately after form modifications
- **Monthly**: Review email deliverability and spam folder

## Contact Information

### Technical Issues
- **Developer**: antonio@siteoptz.com
- **FormSubmit Support**: support@formsubmit.co

### Business Questions
- **Primary Contact**: info@sceptyr.com

---

**Important Notes**:
1. Verification is required ONLY for the first submission to a new email
2. CC emails (info@sceptyr.com) do not require separate verification
3. Keep verification emails for records
4. Test the form after verification to ensure everything works

**Last Updated**: 2026-01-30
**Status**: Pending Verification (antonio@siteoptz.com)