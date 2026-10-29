# VPS Deployment Guide for lichtmarketinglimited.org

Complete guide to deploying the **Licht Marketing Limited** website and Spring Boot API on a Linux VPS (Ubuntu 22.04 / 24.04 LTS).

---

## Architecture Overview
```
Clients / Web Browsers
         │
         ▼ (Port 80 / 443 with SSL)
   [ Nginx Reverse Proxy ]
   ├── Static Files (/) ───────► /var/www/lichtmarketinglimited.org/frontend (React Build)
   └── API Requests (/api/) ──► http://127.0.0.1:8081/api/ (Spring Boot Java 21)
                                         │
                                         ▼
                                   [ MySQL Database ]
```

---

## Step 1: Point Your Domain DNS (in Namecheap / GoDaddy / Cloudflare)
Add these two records in your DNS management zone:
* **A Record**:
  * Name / Host: `@`
  * Value: `YOUR_VPS_PUBLIC_IP`
  * TTL: Auto / 300
* **A Record or CNAME**:
  * Name / Host: `www`
  * Value: `YOUR_VPS_PUBLIC_IP` (or CNAME `lichtmarketinglimited.org`)
  * TTL: Auto / 300

---

## Step 2: Connect to Your VPS and Run Server Setup
Open a terminal (PowerShell, Command Prompt, or Mac/Linux Terminal) and connect:
```bash
ssh root@YOUR_VPS_PUBLIC_IP
```

Clone your project or copy the `deploy/` directory to your VPS, then execute:
```bash
# Upload or create setup-vps.sh and run:
sudo bash setup-vps.sh
```
This script automatically installs **Java 21 OpenJDK**, **MySQL Server**, **Nginx**, **Certbot SSL**, configures the **UFW Firewall**, and sets up the MySQL database.

---

## Step 3: Copy Frontend Build and Backend JAR to VPS
From your local Windows PC, you can copy the files via SCP:

### 1. Copy Frontend Build:
```powershell
scp -r c:\Users\Sharon\cleaningproject\Litch-cleaning2\build\* root@YOUR_VPS_PUBLIC_IP:/var/www/lichtmarketinglimited.org/frontend/
```

### 2. Copy Spring Boot Backend JAR:
```powershell
scp C:\Users\Sharon\IdeaProjects\housingCleaningbackend\target\housing-cleaning-backend-1.0.0-SNAPSHOT.jar root@YOUR_VPS_PUBLIC_IP:/var/www/lichtmarketinglimited.org/backend/
```

---

## Step 4: Configure Nginx & Activate SSL
On your VPS terminal:
```bash
# 1. Copy Nginx configuration
sudo cp /var/www/lichtmarketinglimited.org/deploy/nginx.conf /etc/nginx/sites-available/lichtmarketinglimited.org

# 2. Enable site
sudo ln -sf /etc/nginx/sites-available/lichtmarketinglimited.org /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Test Nginx syntax
sudo nginx -t

# 4. Generate Free Let's Encrypt SSL Certificate
sudo certbot --nginx -d lichtmarketinglimited.org -d www.lichtmarketinglimited.org
```

---

## Step 5: Start Backend API (systemd)
On your VPS:
```bash
# 1. Enable and start the background service
sudo systemctl daemon-reload
sudo systemctl enable licht-backend
sudo systemctl start licht-backend

# 2. Check service status
sudo systemctl status licht-backend

# 3. View live backend logs
sudo journalctl -u licht-backend -f
```

---

## Step 6: Verify Live Website & Admin Portal
1. Open **`https://lichtmarketinglimited.org`** in any browser.
2. Verify SSL padlock (Let's Encrypt).
3. Access Admin Portal: **`https://lichtmarketinglimited.org/#admin`**
   * Email: `admin@lichtmarketinglimited.org`
   * Password: `admin123`
