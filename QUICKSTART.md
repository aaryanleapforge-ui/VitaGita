# Quick Start Guide - Gita Admin Panel

Get your admin panel running in 5 minutes!

## ⚡ Quick Setup

### Step 1: Install Dependencies (2 minutes)

Open PowerShell and run:

```powershell
cd c:\Users\ASUS\Downloads\gita_admin_panel

# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Copy Your Data (1 minute)

Copy your existing app data to the admin panel:

```powershell
# Create data directory
mkdir server\data

# Copy shloks data
copy "..\gita_app_final\assets\shlok_data.json" "server\data\shloks.json"

# Copy video links
copy "..\gita_app_final\assets\video_links.json" "server\data\videos.json"
```

### Step 3: Configure Environment (30 seconds)

```powershell
# Copy environment template
copy .env.example .env

# Edit .env file (optional - defaults work fine for local development)
notepad .env
```

### Step 4: Start the Application (1 minute)

**Open TWO PowerShell windows:**

**Window 1 - Start Backend:**
```powershell
cd c:\Users\ASUS\Downloads\gita_admin_panel
npm start
```

Wait for: `✅ Server running on: http://localhost:5000`

**Window 2 - Start Frontend:**
```powershell
cd c:\Users\ASUS\Downloads\gita_admin_panel\client
npm start
```

Browser will auto-open to `http://localhost:3000`

### Step 5: Login

```
Email: admin@gitagita.com
Password: Admin@123456
```

**🎉 That's it! Your admin panel is running!**

---

## 📱 What You Can Do Now

### Dashboard
- View total users, shloks, bookmarks
- See charts of data distribution
- Monitor recent user signups

### Users
- Search and filter users
- View user details and bookmarks
- Delete users if needed

### Shloks
- Browse all 700 shloks
- Search by chapter, theme, or keywords
- Edit shlok details
- Add new shloks

### Videos
- View all video links
- Update Google Drive URLs
- Add new video links

### Analytics
- See most popular shloks
- Track user growth over time
- Analyze bookmark patterns

---

## 🛠️ Common Tasks

### Add a New Shlok

1. Go to "Shloks" page
2. Click "+ Add Shlok" (if you add this button)
3. Fill in details
4. Save

### Update Video Link

1. Go to "Videos" page
2. Find the video
3. Click edit icon
4. Update URL
5. Save

### View User Bookmarks

1. Go to "Users" page
2. Find user
3. Click view icon
4. See their bookmarked shloks

### Export Data

Your data is stored in JSON files at:
```
c:\Users\ASUS\Downloads\gita_admin_panel\server\data\
```

Just copy these files to backup!

---

## 🔄 Syncing Changes to Mobile App

After making changes in admin panel:

1. Copy updated data back to mobile app:
```powershell
copy "server\data\shloks.json" "..\gita_app_final\assets\shlok_data.json"
copy "server\data\videos.json" "..\gita_app_final\assets\video_links.json"
```

2. Rebuild mobile app:
```powershell
cd ..\gita_app_final
flutter run
```

---

## ⚙️ Stopping the Application

Press `Ctrl + C` in both PowerShell windows

---

## 🆘 Quick Fixes

### "Port already in use" Error

**Backend (port 5000):**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

**Frontend (port 3000):**
```powershell
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Module not found" Error

```powershell
# Delete and reinstall
cd c:\Users\ASUS\Downloads\gita_admin_panel
rm -r node_modules
npm install

cd client
rm -r node_modules
npm install
```

### Data Not Loading

```powershell
# Check if data files exist
dir server\data

# If missing, copy from mobile app again
copy "..\gita_app_final\assets\shlok_data.json" "server\data\shloks.json"
```

---

## 📝 Default Credentials

**Admin Login:**
- Email: `admin@gitagita.com`
- Password: `Admin@123456`

**⚠️ Change password after first login!**

---

## 🎯 Next Steps

1. ✅ Change admin password
2. ✅ Explore all features
3. ✅ Test editing shloks
4. ✅ Check analytics
5. 📚 Read full README.md
6. 🚀 Deploy to production (see DEPLOYMENT.md)

---

## 📞 Need Help?

Check these files for more details:
- `README.md` - Complete documentation
- `DEPLOYMENT.md` - Production deployment guide
- `.env.example` - All configuration options

---

**✨ Happy managing! Your admin panel is ready to use!**
