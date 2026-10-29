#!/bin/bash
# ==============================================================================
# One-Click VPS Provisioning Script for lichtmarketinglimited.org
# OS: Ubuntu 22.04 LTS / 24.04 LTS or Debian 12
# Run as root: sudo bash setup-vps.sh
# ==============================================================================

set -e

echo "=========================================================="
echo " Starting VPS Setup for https://lichtmarketinglimited.org"
echo "=========================================================="

# 1. Update OS packages
echo "--> Updating system packages..."
apt update && apt upgrade -y

# 2. Install OpenJDK 21, MySQL Server, Nginx, Certbot, Git, UFW
echo "--> Installing Java 21, MySQL, Nginx, Certbot..."
apt install -y openjdk-21-jdk mysql-server nginx certbot python3-certbot-nginx curl ufw git

# 3. Configure Firewall
echo "--> Configuring UFW Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 4. Prepare Directory Structure
echo "--> Setting up production directories..."
mkdir -p /var/www/lichtmarketinglimited.org/frontend
mkdir -p /var/www/lichtmarketinglimited.org/backend
mkdir -p /var/www/certbot

# 5. Create MySQL Database if not exists
echo "--> Initializing MySQL database..."
mysql -e "CREATE DATABASE IF NOT EXISTS licht_cleaning_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'root';"
mysql -e "GRANT ALL PRIVILEGES ON licht_cleaning_db.* TO 'root'@'localhost' WITH GRANT OPTION;"
mysql -e "FLUSH PRIVILEGES;"

# 6. Copy systemd service file
echo "--> Setting up systemd service for Backend API..."
if [ -f "licht-backend.service" ]; then
    cp licht-backend.service /etc/systemd/system/licht-backend.service
    systemctl daemon-reload
    systemctl enable licht-backend
fi

# 7. Inform user of next steps
echo "=========================================================="
echo " Base VPS Setup Complete!"
echo " Next steps:"
echo " 1. Copy 'build/' contents to: /var/www/lichtmarketinglimited.org/frontend/"
echo " 2. Copy 'housing-cleaning-backend-1.0.0-SNAPSHOT.jar' to: /var/www/lichtmarketinglimited.org/backend/"
echo " 3. Copy 'nginx.conf' to: /etc/nginx/sites-available/lichtmarketinglimited.org"
echo "    and run: ln -s /etc/nginx/sites-available/lichtmarketinglimited.org /etc/nginx/sites-enabled/"
echo " 4. Obtain SSL certificate:"
echo "    sudo certbot --nginx -d lichtmarketinglimited.org -d www.lichtmarketinglimited.org"
echo " 5. Start backend:"
echo "    sudo systemctl restart licht-backend"
echo "    sudo systemctl restart nginx"
echo "=========================================================="
