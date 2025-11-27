# Gita Admin Panel

A complete, production-ready web-based admin panel for managing the Gita mobile application. This is a **separate, standalone project** that does NOT modify your mobile app.

## 🚀 Features

- **Dashboard**: Real-time statistics and analytics with interactive charts
- **User Management**: View, search, and manage app users
- **Shlok Management**: CRUD operations for shloks with search and filtering
- **Video Links**: Manage Google Drive video links
- **Analytics**: Detailed insights with charts and popular content tracking
- **Authentication**: Secure admin login with JWT tokens
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🎨 Theme Colors

Matches your mobile app theme:
- Royal Blue: `#0D1B3E`
- Polished Gold: `#D4AF37`
- Warm Sand: `#F4E6C3`

## 📁 Project Structure

```
gita_admin_panel/
├── server/                   # Backend Node.js server
│   ├── config/
│   │   └── database.js      # Database configuration
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── users.js         # User management routes
│   │   ├── shloks.js        # Shlok management routes
│   │   ├── videos.js        # Video links routes
│   │   └── analytics.js     # Analytics routes
│   ├── data/                # JSON data storage
│   └── index.js             # Server entry point
├── client/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js    # Main layout with sidebar
│   │   │   └── Layout.css
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.js     # Login page
│   │   │   ├── Dashboard.js # Dashboard with charts
│   │   │   ├── Users.js     # User management
│   │   │   ├── Shloks.js    # Shlok management
│   │   │   ├── Videos.js    # Video management
│   │   │   └── Analytics.js # Analytics page
│   │   ├── App.js           # Root component
│   │   ├── App.css          # Global styles
│   │   └── index.js
│   └── package.json
├── .env.example             # Environment variables template
├── package.json             # Server dependencies
└── README.md               # This file
```

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Step 1: Clone/Copy the Project

This project is already created in:
```
c:\Users\ASUS\Downloads\gita_admin_panel\
```

### Step 2: Install Dependencies

```bash
# Navigate to project directory
cd gita_admin_panel

# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 3: Configure Environment

```bash
# Copy example environment file
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

**Important**: Change these values in `.env`:
- `JWT_SECRET`: Use a strong random string
- `DEFAULT_ADMIN_PASSWORD`: Change after first login

### Step 4: Initialize Data

The server will automatically create a `data/` directory with the following files on first run:
- `admins.json` - Admin users
- `users.json` - App users (copy from your mobile app if needed)
- `shloks.json` - Shloks data (copy from your mobile app's `assets/shlok_data.json`)
- `videos.json` - Video links (copy from your mobile app's `assets/video_links.json`)
- `analytics.json` - Analytics data

**To load your existing data:**

```bash
# Copy your mobile app data to the admin panel
copy "c:\Users\ASUS\Downloads\gita_app_final\assets\shlok_data.json" "c:\Users\ASUS\Downloads\gita_admin_panel\server\data\shloks.json"

copy "c:\Users\ASUS\Downloads\gita_app_final\assets\video_links.json" "c:\Users\ASUS\Downloads\gita_admin_panel\server\data\videos.json"
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd gita_admin_panel
npm start
```
Server will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd gita_admin_panel\client
npm start
```
Frontend will open on `http://localhost:3000`

### Production Mode

```bash
# Build React app
cd client
npm run build

# Start server (serves React build)
cd ..
set NODE_ENV=production
npm start
```

Access at `http://localhost:5000`

## 🔐 Default Admin Credentials

```
Email: admin@gitagita.com
Password: Admin@123456
```

**⚠️ IMPORTANT: Change the password after first login!**

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users` - List all users (with search & pagination)
- `GET /api/users/:email` - Get single user
- `PUT /api/users/:email` - Update user
- `DELETE /api/users/:email` - Delete user
- `GET /api/users/:email/bookmarks` - Get user bookmarks

### Shloks
- `GET /api/shloks` - List all shloks (with filters)
- `GET /api/shloks/:id` - Get single shlok
- `POST /api/shloks` - Create shlok
- `PUT /api/shloks/:id` - Update shlok
- `DELETE /api/shloks/:id` - Delete shlok

### Videos
- `GET /api/videos` - List all video links
- `POST /api/videos` - Add video link
- `PUT /api/videos/:key` - Update video link
- `DELETE /api/videos/:key` - Delete video link

### Analytics
- `GET /api/analytics/stats` - Overall statistics
- `GET /api/analytics/popular-shloks` - Most bookmarked shloks
- `GET /api/analytics/user-growth` - User growth over time
- `GET /api/analytics/bookmarks-by-theme` - Bookmark distribution

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

## 🌐 Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Option 2: Netlify

1. Build the project:
```bash
cd client
npm run build
```

2. Deploy `client/build` folder to Netlify

3. Set up serverless functions for backend or use a separate API server

### Option 3: VPS/Server

1. Install Node.js on your server

2. Clone/upload the project

3. Install dependencies:
```bash
npm install
cd client && npm install && npm run build
cd ..
```

4. Set environment variables:
```bash
export NODE_ENV=production
export PORT=5000
export JWT_SECRET=your_secret_here
```

5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server/index.js --name gita-admin
pm2 save
pm2 startup
```

6. Configure Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Best Practices

1. **Change default admin password** immediately after first login
2. **Use strong JWT_SECRET** (at least 32 random characters)
3. **Enable HTTPS** in production (use Let's Encrypt with Certbot)
4. **Keep dependencies updated**: `npm audit fix`
5. **Restrict CORS** in production (update `CORS_ORIGIN` in `.env`)
6. **Use environment variables** for all sensitive data
7. **Implement rate limiting** for login attempts
8. **Regular backups** of `data/` directory

## 📝 Syncing Data with Mobile App

To sync data between mobile app and admin panel:

### Manual Sync

Copy updated data files from admin panel to mobile app:
```bash
copy "gita_admin_panel\server\data\shloks.json" "gita_app_final\assets\shlok_data.json"
copy "gita_admin_panel\server\data\videos.json" "gita_app_final\assets\video_links.json"
```

Then rebuild your mobile app.

### Automated Sync (Future Enhancement)

You can integrate the mobile app to fetch data from admin panel API on app startup.

## 🐛 Troubleshooting

### Server won't start

- Check if port 5000 is already in use
- Verify Node.js version: `node --version` (should be v14+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### React app won't start

- Check if port 3000 is already in use
- Clear React cache: `cd client && rm -rf node_modules .cache && npm install`

### Authentication errors

- Verify JWT_SECRET is set in `.env`
- Check token hasn't expired (24h expiry)
- Clear browser localStorage and login again

### Data not loading

- Verify data files exist in `server/data/` directory
- Check file permissions
- Look at server console for error messages

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs in terminal
3. Check browser console for frontend errors

## 📄 License

MIT License - Free to use and modify

---

**✨ Enjoy managing your Gita app with this powerful admin panel!**
# Updated 2025-11-27 13:15:04
