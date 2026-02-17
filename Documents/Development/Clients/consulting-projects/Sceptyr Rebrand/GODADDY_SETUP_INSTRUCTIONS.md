# GoDaddy Migration Setup Instructions

## Files Created for Migration

### ✅ Created Files:
1. **`.htaccess`** - Handles clean URL redirects (replaces `vercel.json`)
2. **`api/form-submission.php`** - PHP version of Vercel serverless function
3. **Updated `contact-us.html`** - Now points to `.php` endpoint

## Upload Instructions

### Method 1: cPanel File Manager (Recommended)

1. **Login to GoDaddy Hosting**
   - Go to godaddy.com → My Products → Web Hosting → Manage
   - Click "cPanel Admin"

2. **Open File Manager**
   - Find "File Manager" in Files section
   - Navigate to `public_html/` folder

3. **Clean Directory**
   - Delete any default files (index.html, etc.)

4. **Upload These Files:**
   ```
   ✅ .htaccess (very important!)
   ✅ index.html
   ✅ contact-us.html (updated)
   ✅ All other *.html files (35 files)
   ✅ JT_Cutout2.png
   ✅ api/form-submission.php (NEW)
   ```

### Method 2: FTP Upload

1. **Get FTP Credentials from GoDaddy**
   - Hosting Dashboard → FTP Access
   - Note: Server, Username, Password

2. **Use FileZilla or FTP Client**
   ```
   Host: ftp.yourdomain.com
   Username: [your FTP username]
   Password: [your FTP password]
   Port: 21
   ```

3. **Upload to `/public_html/`**

## CRITICAL: Configure PHP Environment Variables

### ⚠️ IMPORTANT: Update Monday.com Credentials

Edit `api/form-submission.php` and replace these lines:

```php
$MONDAY_API_TOKEN = 'YOUR_MONDAY_API_TOKEN_HERE'; // ← Replace this
$BOARD_ID = 'YOUR_MONDAY_BOARD_ID_HERE';         // ← Replace this
```

### Get Your Monday.com Credentials:
1. Go to Monday.com → Admin → API
2. Copy your API token
3. Go to your "Sceptyr Inquiries" board
4. Copy the board ID from URL

## Testing Checklist

After upload:

1. **✅ Test Homepage:** `https://yourdomain.com`
2. **✅ Test Clean URLs:** `https://yourdomain.com/services`
3. **✅ Test Contact Form:** Submit a test form
4. **✅ Check Monday.com:** Verify test submission appears
5. **✅ Check Email:** Verify email notifications work

## DNS Configuration (If Keeping GoDaddy Nameservers)

If you want to keep email with Outlook while using GoDaddy hosting:

### Email DNS Records (Add in GoDaddy DNS):
```
MX Record:
  Name: @
  Value: sceptyr-com.mail.protection.outlook.com
  Priority: 0

TXT Records:
  Name: @
  Value: v=spf1 include:spf.protection.outlook.com -all
  
  Name: _dmarc
  Value: v=DMARC1; p=quarantine; rua=mailto:admin@sceptyr.com

CNAME Records:
  Name: autodiscover
  Value: autodiscover.outlook.com
  
  Name: mail
  Value: outlook.office365.com
```

## Performance Considerations

- ✅ `.htaccess` includes compression and caching rules
- ✅ Security headers added
- ⚠️ May be slower than Vercel CDN
- ✅ Form submission will work the same

## Troubleshooting

### Form Not Working?
1. Check file permissions on `api/form-submission.php` (should be 644)
2. Check PHP error logs in cPanel
3. Verify Monday.com credentials are correct

### Clean URLs Not Working?
1. Verify `.htaccess` uploaded correctly
2. Check if Apache mod_rewrite is enabled (ask GoDaddy support)

### Email Issues?
1. Test PHP mail() function
2. Check spam folders
3. Verify FormSubmit.co is working

## Next Steps

1. Upload all files to GoDaddy
2. Update Monday.com credentials in PHP file
3. Test thoroughly
4. Update DNS if needed
5. Monitor for 24-48 hours to ensure stability