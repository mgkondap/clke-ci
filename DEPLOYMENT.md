# ALOS Kernel Releases - Deployment Guide

## Repository
**GitHub:** https://github.com/mgkondap/clke-ci

## Environments

### Production
- **URL:** http://clke/index.html
- **Admin:** http://clke/admin.html
- **Location:** /var/www/html/

### Pre-Production
- **URL:** http://clke/pre-prod/index.html
- **Admin:** http://clke/pre-prod/admin.html
- **Location:** /var/www/html/pre-prod/

---

## Initial Setup on Server

### 1. SSH into your web server:
```bash
ssh username@clke
```

### 2. Clone the repository:
```bash
cd /tmp
git clone https://github.com/mgkondap/clke-ci.git
cd clke-ci
```

### 3. Run initial deployment:
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

This will:
- Deploy files to both production and pre-prod
- Set proper permissions
- Preserve existing releases.json files
- Restart Apache

---

## Manual Deployment (Alternative)

### Deploy to Production:
```bash
cd /tmp
git clone https://github.com/mgkondap/clke-ci.git
cd clke-ci

sudo cp index.html styles.css script.js admin.html save_release.php /var/www/html/
sudo cp releases.json /var/www/html/  # Only if doesn't exist

sudo chown www-data:www-data /var/www/html/*
sudo chmod 644 /var/www/html/*.html /var/www/html/*.css /var/www/html/*.js /var/www/html/*.php
sudo chmod 666 /var/www/html/releases.json

sudo systemctl restart apache2
```

### Deploy to Pre-Prod:
```bash
sudo mkdir -p /var/www/html/pre-prod
cd /tmp/clke-ci

sudo cp index.html styles.css script.js admin.html save_release.php /var/www/html/pre-prod/
sudo cp releases.json /var/www/html/pre-prod/  # Only if doesn't exist

sudo chown www-data:www-data /var/www/html/pre-prod/*
sudo chmod 644 /var/www/html/pre-prod/*.html /var/www/html/pre-prod/*.css /var/www/html/pre-prod/*.js /var/www/html/pre-prod/*.php
sudo chmod 666 /var/www/html/pre-prod/releases.json

sudo systemctl restart apache2
```

---

## Update Deployment (After Code Changes)

### Using Deployment Script:
```bash
ssh username@clke
cd /tmp
wget https://raw.githubusercontent.com/mgkondap/clke-ci/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

### Manual Update:
```bash
ssh username@clke
cd /tmp
rm -rf clke-ci
git clone https://github.com/mgkondap/clke-ci.git
cd clke-ci

# Update production
sudo cp index.html styles.css script.js admin.html save_release.php /var/www/html/
sudo systemctl restart apache2

# Update pre-prod
sudo cp index.html styles.css script.js admin.html save_release.php /var/www/html/pre-prod/
```

---

## Testing Workflow

1. **Make changes** on your local machine (C:\alos-kernel-releases\)
2. **Test locally** by opening index.html in browser
3. **Commit to GitHub:**
   ```powershell
   cd C:\alos-kernel-releases
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. **Deploy to Pre-Prod:**
   ```bash
   ssh username@clke
   sudo /tmp/deploy.sh  # Or manual deploy to pre-prod only
   ```
5. **Test Pre-Prod:** Visit http://clke/pre-prod/index.html
6. **Deploy to Production:** If pre-prod looks good, files are already in production from step 4

---

## Directory Structure

```
/var/www/html/
├── index.html              # Production public page
├── admin.html              # Production admin panel
├── styles.css
├── script.js
├── releases.json           # Production data (independent)
├── save_release.php
└── pre-prod/
    ├── index.html          # Pre-prod public page
    ├── admin.html          # Pre-prod admin panel
    ├── styles.css
    ├── script.js
    ├── releases.json       # Pre-prod data (independent)
    └── save_release.php
```

**Note:** Each environment has its own releases.json - changes in pre-prod won't affect production data.

---

## Backup Releases Data

### Before deployment:
```bash
sudo cp /var/www/html/releases.json /var/www/html/releases.json.backup.$(date +%Y%m%d)
sudo cp /var/www/html/pre-prod/releases.json /var/www/html/pre-prod/releases.json.backup.$(date +%Y%m%d)
```

### Restore from backup:
```bash
sudo cp /var/www/html/releases.json.backup.YYYYMMDD /var/www/html/releases.json
```

---

## Admin Access

### Production Admin:
- **URL:** http://clke/admin.html
- **Password:** alos2026 (change this!)

### Pre-Prod Admin:
- **URL:** http://clke/pre-prod/admin.html
- **Password:** alos2026 (change this!)

---

## Troubleshooting

### Issue: Files not updating after deployment
**Solution:** Clear browser cache (Ctrl + Shift + R)

### Issue: Permission denied when saving releases
**Solution:**
```bash
sudo chmod 666 /var/www/html/releases.json
sudo chmod 666 /var/www/html/pre-prod/releases.json
```

### Issue: PHP not working
**Solution:**
```bash
sudo apt-get install php libapache2-mod-php
sudo systemctl restart apache2
```

---

## Security Notes

1. **Change admin passwords** in both admin.html files
2. **Use HTTPS** in production
3. **Restrict admin.html** access via IP filtering
4. **Regular backups** of releases.json
5. **Monitor access logs:** /var/log/apache2/access.log
