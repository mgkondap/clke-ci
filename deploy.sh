#!/bin/bash

# ALOS Kernel Releases Deployment Script
# Deploys from GitHub to production and pre-prod environments

# Configuration
REPO_URL="https://github.com/mgkondap/clke-ci.git"
PROD_DIR="/var/www/html"
PREPROD_DIR="/var/www/html/pre-prod"
TEMP_DIR="/tmp/clke-ci-deploy"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  ALOS Kernel Releases Deployment${NC}"
echo -e "${BLUE}================================================${NC}"

# Function to deploy to a directory
deploy_to_dir() {
    local TARGET_DIR=$1
    local ENV_NAME=$2
    
    echo -e "\n${BLUE}Deploying to ${ENV_NAME} (${TARGET_DIR})...${NC}"
    
    # Create directory if it doesn't exist
    sudo mkdir -p "${TARGET_DIR}"
    
    # Copy files
    sudo cp "${TEMP_DIR}/index.html" "${TARGET_DIR}/"
    sudo cp "${TEMP_DIR}/styles.css" "${TARGET_DIR}/"
    sudo cp "${TEMP_DIR}/script.js" "${TARGET_DIR}/"
    sudo cp "${TEMP_DIR}/admin.html" "${TARGET_DIR}/"
    sudo cp "${TEMP_DIR}/save_release.php" "${TARGET_DIR}/"
    
    # Copy or create releases.json (preserve existing if it exists)
    if [ ! -f "${TARGET_DIR}/releases.json" ]; then
        sudo cp "${TEMP_DIR}/releases.json" "${TARGET_DIR}/"
        echo -e "${GREEN}Created new releases.json${NC}"
    else
        echo -e "${GREEN}Preserved existing releases.json${NC}"
    fi
    
    # Set permissions
    sudo chown -R www-data:www-data "${TARGET_DIR}"
    sudo chmod 644 "${TARGET_DIR}"/*.html "${TARGET_DIR}"/*.css "${TARGET_DIR}"/*.js "${TARGET_DIR}"/*.php
    sudo chmod 666 "${TARGET_DIR}/releases.json"
    
    echo -e "${GREEN}✓ Deployed to ${ENV_NAME}${NC}"
}

# Remove temp directory if exists
rm -rf "${TEMP_DIR}"

# Clone repository
echo -e "\n${BLUE}Cloning repository...${NC}"
git clone "${REPO_URL}" "${TEMP_DIR}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to clone repository${NC}"
    exit 1
fi

# Deploy to production
deploy_to_dir "${PROD_DIR}" "PRODUCTION"

# Deploy to pre-prod
deploy_to_dir "${PREPROD_DIR}" "PRE-PROD"

# Cleanup
rm -rf "${TEMP_DIR}"

# Restart web server
echo -e "\n${BLUE}Restarting web server...${NC}"
sudo systemctl restart apache2

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "Production:  http://clke/index.html"
echo -e "Pre-prod:    http://clke/pre-prod/index.html"
echo -e "Admin (Prod):     http://clke/admin.html"
echo -e "Admin (Pre-prod): http://clke/pre-prod/admin.html"
echo -e "${GREEN}================================================${NC}"
