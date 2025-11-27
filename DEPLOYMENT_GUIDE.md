# Gita Admin Panel - Deployment Guide

## 📦 What's Included

This package contains a complete admin panel system for the Gita mobile app with:
- **Backend Server** (Node.js + Express) - Port 5000
- **Frontend Dashboard** (React) - Port 3000
- **User Management** - View and manage app users
- **Video Library** - Manage shlok videos
- **Analytics Dashboard** - Track app usage statistics

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

### Step 1: Install Dependencies

Open terminal/command prompt in the project folder and run:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the `server` folder with:

```env
PORT=5000
JWT_SECRET=gita_admin_secret_key_2024_secure_token
ADMIN_EMAIL=admin@gitagita.com
ADMIN_PASSWORD=Admin@123456
```

### Step 3: Start the Servers

**Option A: Manual Start (Two terminals)**

Terminal 1 - Backend:
```bash
cd server
node index.js
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

**Option B: Using the Startup Script**

Windows:
```bash
start_servers.bat
```

Mac/Linux:
```bash
chmod +x start_servers.sh
./start_servers.sh
```

### Step 4: Access the Admin Panel

Open your browser and go to:
- **Admin Panel**: http://localhost:3000

**Default Login:**
- Email: `admin@gitagita.com`
- Password: `Admin@123456`

## 📱 Mobile App Integration

The backend is already configured to work with your Gita mobile app:

- **API Base URL**: `http://10.0.2.2:5000/api` (for emulator)
- **For Real Device**: Change to `http://YOUR_LOCAL_IP:5000/api`

### Mobile App Endpoints:
- `POST /api/users` - User signup
- `POST /api/users/login` - User login
- `GET /api/bookmarks/:email` - Get user bookmarks
- `POST /api/bookmarks/:email` - Save bookmarks

## 🔧 Configuration

### Change Admin Credentials
Edit the `.env` file in the `server` folder:
```env
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=YourSecurePassword123
```

### Change Ports
If ports 3000 or 5000 are already in use:

**Backend** - Edit `server/.env`:
```env
PORT=5001
```

**Frontend** - Edit `client/package.json`:
```json
"proxy": "http://localhost:5001"
```

## 📊 Features

### Dashboard
- Total users count
- Total shloks and videos
- Recent user registrations
- Quick statistics overview

### User Management
- View all registered users
- Search and filter users
- Track user activity
- Delete users if needed

### Video Library
- Browse all shlok videos
- Search by chapter, theme, or speaker
- View video details
- Manage video metadata

### Analytics
- User growth over time
- Bookmark statistics
- Popular content tracking

## 🗄️ Data Storage

All data is stored in JSON files in the `server/data/` folder:
- `admins.json` - Admin accounts
- `users.json` - Mobile app users
- `shloks.json` - Shlok data (700 entries)
- `videos.json` - Video links
- `analytics.json` - Usage statistics

**Backup Recommendation**: Regularly backup the `server/data/` folder.

## 🌐 Deploying to Production

### For Cloud Deployment (Heroku, AWS, etc.):

1. **Backend Deployment**:
   - Deploy the `server` folder
   - Set environment variables in your hosting platform
   - Note the deployed backend URL

2. **Frontend Deployment**:
   - Update `client/package.json` proxy to your backend URL
   - Build: `npm run build` in client folder
   - Deploy the `build` folder to hosting (Netlify, Vercel, etc.)

3. **Update Mobile App**:
   - Change API base URL in `lib/services/api_service.dart`
   - Replace `http://10.0.2.2:5000/api` with your production URL

### Security for Production:
- Change default admin password
- Use strong JWT_SECRET
- Enable HTTPS
- Add rate limiting
- Set up proper CORS policies

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### "Cannot find module" Error
```bash
# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

### Login Not Working
- Check if backend is running on port 5000
- Verify `.env` file exists in `server` folder
- Check browser console for errors
- Clear browser cache/cookies

### Mobile App Can't Connect
- Emulator: Use `http://10.0.2.2:5000/api`
- Real device: Use `http://YOUR_LOCAL_IP:5000/api`
- Check firewall settings
- Ensure backend is running

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review terminal/console logs
3. Verify all dependencies are installed
4. Ensure ports are not blocked by firewall

## 🔒 Security Notes

- Default credentials are for development only
- Change admin password immediately
- Use strong, unique JWT_SECRET
- Keep dependencies updated
- Regular backups of data folder
- Use HTTPS in production
- Implement rate limiting for API endpoints

## 📄 License

This admin panel is provided as-is for managing the Gita mobile application.

---

**Version**: 1.0.0  
**Last Updated**: November 2025
