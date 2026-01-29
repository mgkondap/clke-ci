# ALOS Kernel Releases - Admin Setup Guide

## Files Created

1. **index.html** - Public release page (updated to load from JSON)
2. **admin.html** - Password-protected admin panel  
3. **releases.json** - Data storage file
4. **save_release.php** - Backend script to save data
5. **styles.css** - Styling (unchanged)
6. **script.js** - Updated to load from JSON

## Installation Steps

### 1. Copy Files to Ubuntu Server

```bash
# Copy all files to your web server
scp C:\alos-kernel-releases\* username@your-server:/tmp/

# SSH into your server
ssh username@your-server

# Move files to web directory
cd /tmp
sudo mv index.html styles.css script.js admin.html releases.json save_release.php /var/www/html/

# Set permissions
sudo chown www-data:www-data /var/www/html/*
sudo chmod 644 /var/www/html/*.html /var/www/html/*.css /var/www/html/*.js /var/www/html/*.json
sudo chmod 644 /var/www/html/*.php

# Make releases.json writable by web server
sudo chmod 666 /var/www/html/releases.json
```

### 2. Ensure PHP is Installed

```bash
# Check if PHP is installed
php --version

# If not installed, install PHP
sudo apt-get update
sudo apt-get install php libapache2-mod-php

# Restart web server
sudo systemctl restart apache2
# OR for Nginx
sudo systemctl restart nginx php-fpm
```

### 3. Access the Admin Panel

**URL:** `http://your-server-ip/admin.html`

**Default Password:** `alos2026`

**⚠️ IMPORTANT: Change the password!**

Edit `/var/www/html/admin.html` and change line 200:
```javascript
const ADMIN_PASSWORD = 'alos2026'; // Change this password!
```

## How to Use

### For Release Person:

1. Open `http://your-server-ip/admin.html` in browser
2. Enter admin password
3. Fill in the form:
   - Select Platform (PTL/WCL/NVL)
   - Enter Release Tag (e.g., NVL-IA17K6.18DI_2026W02)
   - Select Release Date
   - Enter Kernel Version
   - Select Status (Stable/LTS/Legacy)
   - Enter Key Features
   - Enter Prebuild Image Link (optional)
   - Enter JIRA Ticket ID (e.g., CHRMOS-19358)
4. Click "Add Release"
5. Release appears immediately on public page

### To View Public Page:

`http://your-server-ip/index.html`

### To Delete a Release:

1. Login to admin panel
2. Scroll down to see existing releases
3. Click "Delete" button next to the release

## Security Recommendations

1. **Change the default password** in admin.html
2. **Restrict admin.html access** via .htaccess or server config:

```apache
# In /var/www/html/.htaccess
<Files "admin.html">
    Require ip YOUR_OFFICE_IP
</Files>
```

3. **Use HTTPS** for production deployment
4. **Backup releases.json** regularly:

```bash
sudo cp /var/www/html/releases.json /var/www/html/releases.json.backup
```

## Troubleshooting

### Issue: "Failed to save data"

**Solution:** Check releases.json permissions
```bash
sudo chmod 666 /var/www/html/releases.json
sudo chown www-data:www-data /var/www/html/releases.json
```

### Issue: PHP not executing

**Solution:** Ensure PHP is enabled in Apache/Nginx
```bash
# For Apache
sudo a2enmod php
sudo systemctl restart apache2
```

### Issue: Can't login to admin

**Solution:** Clear browser cache or check password in admin.html line 200

## Data Format

releases.json structure:
```json
{
  "PTL": [...],
  "WCL": [...],
  "NVL": [...]
}
```

Each release object:
```json
{
  "releaseTag": "NVL-IA17K6.18DI_2026W02",
  "releaseDate": "2026-01-15",
  "kernelVersion": "6.8.5",
  "status": "Stable",
  "features": "Performance improvements",
  "imageLink": "https://...",
  "jiraTicket": "CHRMOS-19358",
  "jiraLink": "https://jira.devtools.intel.com/browse/CHRMOS-19358",
  "manifestLink": "https://github.com/.../tag/..."
}
```

## Adding New Platforms

To add a new platform (e.g., "XYZ"):

1. Add tab button in index.html
2. Add platform content div
3. Initialize empty array in releases.json: `"XYZ": []`
4. Add option in admin.html platform select

## Support

For issues, check:
- Browser console for JavaScript errors
- Apache/Nginx error logs: `/var/log/apache2/error.log`
- PHP errors in save_release.php
