# Deployment Guide - Gita Admin Panel

Complete guide to deploy your admin panel to production.

## 🌐 Deployment Options

### 1. Vercel (Easiest - Recommended)

**Best for**: Quick deployment with automatic HTTPS

#### Steps:

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
cd gita_admin_panel
vercel
```

4. **Set Environment Variables**

In Vercel dashboard (vercel.com):
- Go to your project settings
- Navigate to "Environment Variables"
- Add:
  - `JWT_SECRET` = (your secret key)
  - `DEFAULT_ADMIN_EMAIL` = admin@gitagita.com
  - `DEFAULT_ADMIN_PASSWORD` = (your password)
  - `NODE_ENV` = production
  - `CORS_ORIGIN` = (your frontend URL)

5. **Redeploy**
```bash
vercel --prod
```

#### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/build/$1"
    }
  ]
}
```

---

### 2. Netlify

**Best for**: Static frontend with serverless functions

#### Steps:

1. **Build React App**
```bash
cd client
npm run build
```

2. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

3. **Login**
```bash
netlify login
```

4. **Deploy**
```bash
netlify deploy --prod --dir=client/build
```

5. **Set up Backend**

Option A: Use Netlify Functions (serverless)
- Convert Express routes to Netlify Functions
- Place in `netlify/functions/` directory

Option B: Deploy backend separately on Heroku/Railway

---

### 3. Railway

**Best for**: Full-stack deployment with database support

#### Steps:

1. **Create account** at railway.app

2. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

3. **Login**
```bash
railway login
```

4. **Initialize**
```bash
cd gita_admin_panel
railway init
```

5. **Deploy**
```bash
railway up
```

6. **Add Environment Variables**
```bash
railway variables set JWT_SECRET=your_secret_here
railway variables set NODE_ENV=production
```

---

### 4. DigitalOcean/VPS (Most Control)

**Best for**: Complete control, custom domain, long-term hosting

#### Prerequisites:
- Ubuntu 20.04+ VPS
- Domain name (optional but recommended)

#### Steps:

**1. Connect to your server**
```bash
ssh root@your_server_ip
```

**2. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**3. Install PM2**
```bash
sudo npm install -g pm2
```

**4. Clone/Upload project**
```bash
cd /var/www
git clone your_repo_url gita-admin
# OR upload via SFTP
```

**5. Install dependencies**
```bash
cd gita-admin
npm install
cd client
npm install
npm run build
cd ..
```

**6. Create .env file**
```bash
nano .env
```

Add:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_key_here
DEFAULT_ADMIN_EMAIL=admin@gitagita.com
DEFAULT_ADMIN_PASSWORD=your_secure_password
CORS_ORIGIN=https://yourdomain.com
```

**7. Start with PM2**
```bash
pm2 start server/index.js --name gita-admin
pm2 save
pm2 startup
```

**8. Install Nginx**
```bash
sudo apt update
sudo apt install nginx
```

**9. Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/gita-admin
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**10. Enable site**
```bash
sudo ln -s /etc/nginx/sites-available/gita-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**11. Install SSL (HTTPS)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**12. Auto-renewal SSL**
```bash
sudo certbot renew --dry-run
```

---

### 5. Heroku

**Best for**: Quick deployment with free tier

#### Steps:

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login**
```bash
heroku login
```

3. **Create app**
```bash
cd gita_admin_panel
heroku create gita-admin-panel
```

4. **Set buildpacks**
```bash
heroku buildpacks:add heroku/nodejs
```

5. **Set environment variables**
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production
```

6. **Deploy**
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku master
```

7. **Open app**
```bash
heroku open
```

---

## 🔒 Post-Deployment Security

### 1. Change Default Password
- Login immediately after deployment
- Go to profile settings
- Change admin password

### 2. Update Environment Variables
- Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Set restrictive CORS_ORIGIN

### 3. Enable Firewall (VPS only)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 4. Regular Backups
```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz server/data/

# Automate with cron
crontab -e
# Add: 0 2 * * * cd /var/www/gita-admin && tar -czf /backups/backup-$(date +\%Y\%m\%d).tar.gz server/data/
```

### 5. Monitor Server (VPS)
```bash
pm2 monitor
pm2 logs gita-admin
```

---

## 🔄 Updating Deployed App

### Vercel
```bash
vercel --prod
```

### Railway
```bash
railway up
```

### VPS
```bash
ssh root@your_server
cd /var/www/gita-admin
git pull
cd client && npm run build && cd ..
pm2 restart gita-admin
```

---

## 🌍 Custom Domain Setup

### Vercel
1. Go to project settings
2. Domains → Add domain
3. Follow DNS instructions

### Netlify
1. Site settings → Domain management
2. Add custom domain
3. Configure DNS

### VPS (Already configured in Nginx above)
Just point your domain A record to server IP

---

## 📊 Monitoring & Analytics

### PM2 Monitoring (VPS)
```bash
pm2 install pm2-server-monit
```

### Application Monitoring
- Use services like:
  - LogRocket
  - Sentry
  - Datadog

---

## ⚡ Performance Optimization

### 1. Enable Gzip (Nginx)
Add to Nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. Caching
Add to Nginx:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN
- Use Cloudflare for free CDN
- Enable in Cloudflare dashboard

---

## 🆘 Troubleshooting Deployment

### Build Fails
```bash
# Clear caches
rm -rf node_modules client/node_modules
npm install
cd client && npm install && cd ..
```

### 502 Bad Gateway
- Check if Node server is running: `pm2 status`
- Check logs: `pm2 logs gita-admin`
- Restart: `pm2 restart gita-admin`

### Database Connection Issues
- Verify data files exist
- Check file permissions: `chmod -R 755 server/data`

---

**🎉 Your admin panel is now live and production-ready!**
