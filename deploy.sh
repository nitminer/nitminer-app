#!/bin/bash

# NitMiner Production Deployment Script
# For www.nitminer.com only

set -e

echo "🚀 Starting NitMiner Production Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/root/nitminer"
NODE_USER="root"
DOMAIN="www.nitminer.com"

echo -e "${YELLOW}1. Checking prerequisites...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 not installed. Installing...${NC}"
    npm install -g pm2
    pm2 startup
fi

if ! command -v nginx &> /dev/null; then
    echo -e "${RED}Nginx not installed. Installing...${NC}"
    apt-get update
    apt-get install -y nginx
fi

if ! command -v certbot &> /dev/null; then
    echo -e "${RED}Certbot not installed. Installing...${NC}"
    apt-get install -y certbot python3-certbot-nginx
fi

echo -e "${YELLOW}2. Checking Nginx configuration...${NC}"
if [ ! -L /etc/nginx/sites-enabled/nitminer.com ]; then
    echo "Enabling Nginx site..."
    ln -sf /etc/nginx/sites-available/nitminer.com /etc/nginx/sites-enabled/
fi

echo -e "${YELLOW}3. Testing Nginx configuration...${NC}"
nginx -t

echo -e "${YELLOW}4. Reloading Nginx...${NC}"
systemctl reload nginx

echo -e "${YELLOW}5. Installing/Updating SSL certificates...${NC}"
# Only create cert for www.nitminer.com
certbot certonly --nginx -d www.nitminer.com -d nitminer.com --non-interactive --agree-tos || true

echo -e "${YELLOW}6. Setting up Nginx auto-renewal...${NC}"
certbot renew --dry-run || true

echo -e "${YELLOW}7. Navigating to app directory...${NC}"
cd "$APP_DIR"

echo -e "${YELLOW}8. Installing dependencies...${NC}"
npm ci --production

echo -e "${YELLOW}9. Building Next.js application...${NC}"
npm run build

echo -e "${YELLOW}10. Creating logs directory...${NC}"
mkdir -p logs

echo -e "${YELLOW}11. Stopping existing PM2 app...${NC}"
pm2 stop nitminer-app || true
pm2 delete nitminer-app || true

echo -e "${YELLOW}12. Starting app with PM2...${NC}"
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup -u $NODE_USER --hp /root

echo -e "${YELLOW}13. Checking application status...${NC}"
sleep 2
pm2 status

echo -e "${YELLOW}14. Testing health endpoint...${NC}"
sleep 2
curl -f http://localhost:3000/health || echo "Health check: App starting up..."

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is live at: https://www.nitminer.com${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs                 - View app logs"
echo "  pm2 restart nitminer-app - Restart the app"
echo "  pm2 stop nitminer-app    - Stop the app"
echo "  pm2 status               - Check status"
echo "  nginx -s reload          - Reload Nginx config"
echo ""
