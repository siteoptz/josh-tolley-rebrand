# PHPMyAdmin Database Setup Guide

## Step 1: Create MySQL Database in GoDaddy

### **Access Database Manager:**
1. Login to GoDaddy hosting account
2. Go to **My Products** → **Web Hosting** → **Manage**
3. Click **cPanel** button
4. Find **MySQL Databases** in the Databases section

### **Create Database:**
1. **Database Name:** Enter `sceptyr_forms` (or your preferred name)
2. Click **Create Database**
3. **Remember:** GoDaddy prefixes your username, so actual name might be `username_sceptyr_forms`

### **Create Database User:**
1. In **MySQL Users** section:
   - **Username:** `sceptyr_admin`
   - **Password:** Create a strong password
   - Click **Create User**

### **Assign User to Database:**
1. In **Add User to Database** section:
   - **User:** Select `sceptyr_admin`
   - **Database:** Select `sceptyr_forms`
   - **Privileges:** Check **ALL PRIVILEGES**
   - Click **Make Changes**

## Step 2: Access PHPMyAdmin

1. In cPanel, find **phpMyAdmin** icon (Database section)
2. Click to open PHPMyAdmin interface
3. Select your database (`sceptyr_forms`) from left sidebar

## Step 3: Import Database Schema

### **Method 1: Using SQL Tab**
1. Click **SQL** tab in PHPMyAdmin
2. Copy and paste this SQL code:

\`\`\`sql
-- Database setup for Sceptyr contact form submissions
CREATE TABLE IF NOT EXISTS \`form_submissions\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`first_name\` varchar(100) NOT NULL,
    \`last_name\` varchar(100) NOT NULL,
    \`email\` varchar(255) NOT NULL,
    \`phone\` varchar(20) DEFAULT NULL,
    \`net_worth\` varchar(50) DEFAULT NULL,
    \`accredited\` enum('Yes','No') DEFAULT NULL,
    \`interest\` varchar(255) DEFAULT NULL,
    \`message\` text DEFAULT NULL,
    \`monday_item_id\` varchar(50) DEFAULT NULL,
    \`email_status\` enum('success','failed') DEFAULT 'success',
    \`ip_address\` varchar(45) DEFAULT NULL,
    \`user_agent\` text DEFAULT NULL,
    \`submitted_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    INDEX \`idx_email\` (\`email\`),
    INDEX \`idx_submitted_at\` (\`submitted_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`admin_users\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`username\` varchar(50) NOT NULL UNIQUE,
    \`email\` varchar(255) NOT NULL UNIQUE,
    \`password_hash\` varchar(255) NOT NULL,
    \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
\`\`\`

3. Click **Go** to execute

### **Method 2: Import SQL File**
1. Click **Import** tab
2. Click **Choose File** 
3. Select \`database_setup.sql\` file
4. Click **Go**

## Step 4: Update Database Configuration

### **Get Database Connection Details:**
From your GoDaddy cPanel → MySQL Databases:
- **Database Host:** Usually \`localhost\`
- **Database Name:** \`username_sceptyr_forms\` (with your prefix)
- **Username:** \`username_sceptyr_admin\`
- **Password:** The password you created

### **Update \`api/db_config.php\`:**
```php
const DB_HOST = 'localhost';
const DB_NAME = 'username_sceptyr_forms';  // Replace with actual name
const DB_USER = 'username_sceptyr_admin';  // Replace with actual username
const DB_PASS = 'your_password_here';      // Replace with actual password
```

## Step 5: Upload Files to GoDaddy

### **Files to Upload:**
\`\`\`
api/
├── form-submission.php     (updated with database storage)
├── db_config.php          (database configuration)
├── admin_dashboard.php    (view submissions)
\`\`\`

## Step 6: Test Database Connection

### **Create Test File:** \`api/test_db.php\`
```php
<?php
require_once 'db_config.php';

try {
    $pdo = DatabaseConfig::getConnection();
    echo "✅ Database connection successful!";
    
    // Test table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'form_submissions'");
    if ($stmt->rowCount() > 0) {
        echo "<br>✅ form_submissions table exists!";
    } else {
        echo "<br>❌ form_submissions table NOT found!";
    }
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage();
}
?>
```

### **Test Steps:**
1. Upload \`test_db.php\` to \`/api/\` folder
2. Visit \`https://yourdomain.com/api/test_db.php\`
3. Should show "Database connection successful!"
4. Delete test file after verification

## Step 7: Admin Dashboard Access

### **Change Default Credentials:**
In \`api/admin_dashboard.php\`, update:
```php
$ADMIN_USERNAME = 'your_username';      // Change this
$ADMIN_PASSWORD = 'your_secure_password';  // Change this  
```

### **Access Dashboard:**
- URL: \`https://yourdomain.com/api/admin_dashboard.php\`
- Login with your credentials
- View all form submissions
- Export data to CSV

## Database Benefits

### **✅ What You Get:**
1. **Backup Storage:** All submissions stored locally
2. **Admin Dashboard:** View and manage submissions
3. **Data Export:** CSV export functionality
4. **Redundancy:** Works even if Monday.com fails
5. **Analytics:** Track submission patterns
6. **Search:** Find specific submissions easily

### **🔍 Viewing Data in PHPMyAdmin:**
1. Select \`form_submissions\` table
2. Click **Browse** tab to see all data
3. Use **Search** tab to filter results
4. **Export** tab for backups

## Security Considerations

### **✅ Security Features:**
- SQL injection protection (prepared statements)
- Input validation and sanitization
- IP address and user agent logging
- Admin authentication required

### **🔒 Additional Security:**
- Change admin passwords regularly
- Restrict \`/api/\` folder access via \`.htaccess\`
- Regular database backups
- Monitor for suspicious activity

## Troubleshooting

### **Common Issues:**

**❌ "Database connection failed"**
- Check database credentials in \`db_config.php\`
- Verify database exists in PHPMyAdmin
- Test with \`test_db.php\`

**❌ "Table doesn't exist"** 
- Run SQL schema in PHPMyAdmin
- Check table names match exactly

**❌ "Permission denied"**
- Verify database user has correct privileges
- Check user is assigned to database

**❌ "Access denied for user"**
- Double-check username and password
- Ensure user exists in MySQL Users

### **Support:**
- GoDaddy support for database issues
- PHPMyAdmin documentation
- Check PHP error logs in cPanel