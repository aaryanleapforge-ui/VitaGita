# Mobile App Integration Guide

How to integrate your Flutter mobile app with the admin panel backend (optional future enhancement).

## 🔄 Current Setup (File-Based)

Currently, your mobile app reads data from static JSON files:
- `assets/shlok_data.json` (700 shloks)
- `assets/video_links.json` (Google Drive links)

This works perfectly for a standalone app. However, if you want real-time updates from the admin panel, you can integrate the API.

---

## 🚀 Option 1: Keep It Simple (Recommended)

**Continue using static files** and manually sync when needed:

### When to Sync
- After adding/editing shloks in admin panel
- After updating video links
- Before releasing app update

### How to Sync
```powershell
# Copy data from admin panel to mobile app
copy "gita_admin_panel\server\data\shloks.json" "gita_app_final\assets\shlok_data.json"
copy "gita_admin_panel\server\data\videos.json" "gita_app_final\assets\video_links.json"

# Rebuild app
cd gita_app_final
flutter build apk --release
```

### Pros
- ✅ App works offline
- ✅ No internet required
- ✅ Faster load times
- ✅ No API costs
- ✅ Simpler codebase

### Cons
- ❌ Need to rebuild app for updates
- ❌ Users must download new APK

---

## 🌐 Option 2: API Integration (Advanced)

**Connect mobile app to admin panel API** for real-time updates.

### Prerequisites
1. Deploy admin panel to production (see DEPLOYMENT.md)
2. Get public URL (e.g., `https://gita-admin.vercel.app`)

### Step 1: Add HTTP Package

Add to `pubspec.yaml`:
```yaml
dependencies:
  http: ^1.1.0
  shared_preferences: ^2.2.2  # Already have this
```

### Step 2: Create API Service

Create `lib/services/api_service.dart`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Replace with your deployed admin panel URL
  static const String baseUrl = 'https://your-admin-panel-url.com/api';
  
  // Fetch all shloks from API
  static Future<List<dynamic>> fetchShloks() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/shloks?limit=1000'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['data']['shloks'];
        }
      }
      
      return [];
    } catch (e) {
      print('Error fetching shloks: $e');
      return [];
    }
  }

  // Fetch video links from API
  static Future<Map<String, dynamic>> fetchVideoLinks() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/videos'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          // Convert array to map
          Map<String, dynamic> videoMap = {};
          for (var video in data['data']['videos']) {
            videoMap[video['key']] = video['url'];
          }
          return videoMap;
        }
      }
      
      return {};
    } catch (e) {
      print('Error fetching videos: $e');
      return {};
    }
  }

  // Sync user data to admin panel
  static Future<bool> syncUserData(Map<String, dynamic> userData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(userData),
      );

      return response.statusCode == 201;
    } catch (e) {
      print('Error syncing user: $e');
      return false;
    }
  }

  // Sync bookmarks to admin panel
  static Future<bool> syncBookmarks(String email, List<String> bookmarks) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bookmarks'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'email': email,
          'bookmarks': bookmarks,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error syncing bookmarks: $e');
      return false;
    }
  }
}
```

### Step 3: Update Main App

Modify `lib/main.dart` to load data from API:

```dart
// In _MyAppState class

// Add loading state
bool _isLoadingFromApi = false;

// Load data from API with fallback to local files
Future<void> _loadDataFromApi() async {
  setState(() => _isLoadingFromApi = true);

  try {
    // Try to fetch from API
    final apiShloks = await ApiService.fetchShloks();
    final apiVideos = await ApiService.fetchVideoLinks();

    if (apiShloks.isNotEmpty) {
      // Use API data
      setState(() {
        shloks = apiShloks.map((json) => Shlok.fromJson(json)).toList();
        videoLinks = apiVideos;
      });
    } else {
      // Fallback to local files
      await _loadLocalData();
    }
  } catch (e) {
    print('API load failed, using local data: $e');
    await _loadLocalData();
  } finally {
    setState(() => _isLoadingFromApi = false);
  }
}

// Keep existing local load method as fallback
Future<void> _loadLocalData() async {
  // Your existing data loading code from assets
  final shlokData = await rootBundle.loadString('assets/shlok_data.json');
  final videoData = await rootBundle.loadString('assets/video_links.json');
  
  setState(() {
    shloks = (json.decode(shlokData) as List)
        .map((json) => Shlok.fromJson(json))
        .toList();
    videoLinks = json.decode(videoData);
  });
}

@override
void initState() {
  super.initState();
  _loadDataFromApi(); // Try API first, fallback to local
}
```

### Step 4: Sync User Data

Add sync calls after user actions:

```dart
// After user registration
Future<void> _registerUser() async {
  // Your existing registration code...
  
  // Sync to admin panel
  await ApiService.syncUserData({
    'email': emailController.text,
    'name': nameController.text,
    'dob': dobController.text,
    'createdAt': DateTime.now().toIso8601String(),
  });
}

// After bookmark changes
Future<void> _toggleBookmark(String shlokKey) async {
  // Your existing bookmark code...
  
  // Sync to admin panel
  final email = FirebaseAuth.instance.currentUser?.email;
  if (email != null) {
    await ApiService.syncBookmarks(email, bookmarks);
  }
}
```

### Step 5: Handle Offline Mode

Add connectivity check:

```dart
import 'package:connectivity_plus/connectivity_plus.dart';

Future<bool> _isOnline() async {
  var connectivityResult = await Connectivity().checkConnectivity();
  return connectivityResult != ConnectivityResult.none;
}

// Use in data loading
Future<void> _loadData() async {
  if (await _isOnline()) {
    await _loadDataFromApi();
  } else {
    await _loadLocalData();
  }
}
```

### Pros
- ✅ Real-time content updates
- ✅ No app rebuild needed
- ✅ Analytics tracking
- ✅ User data synced

### Cons
- ❌ Requires internet connection
- ❌ Slower initial load
- ❌ API hosting costs
- ❌ More complex codebase

---

## 📊 Analytics Integration

Track user behavior in admin panel:

```dart
class AnalyticsService {
  static const String baseUrl = 'https://your-admin-panel-url.com/api';
  
  // Log shlok view
  static Future<void> logView(String email, String shlokKey) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/analytics/log-view'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'shlokKey': shlokKey,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );
    } catch (e) {
      print('Failed to log view: $e');
    }
  }

  // Log search
  static Future<void> logSearch(String email, String query) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/analytics/log-search'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'query': query,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );
    } catch (e) {
      print('Failed to log search: $e');
    }
  }
}

// Use in DetailPage
@override
void initState() {
  super.initState();
  AnalyticsService.logView(
    currentUserEmail,
    widget.shlok.key(),
  );
}
```

---

## 🔒 Security Considerations

### If Using API Integration:

1. **Use HTTPS Only**
   - Never use HTTP in production
   - Verify SSL certificates

2. **API Authentication**
   - Don't expose admin JWT tokens in mobile app
   - Create separate mobile app API key
   - Add to admin panel:

```javascript
// In server/middleware/auth.js
const authenticateMobileApp = (req, res, next) => {
  const apiKey = req.headers['x-mobile-api-key'];
  
  if (apiKey === process.env.MOBILE_API_KEY) {
    next();
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

// Use in routes
router.get('/shloks', authenticateMobileApp, async (req, res) => {
  // Your code...
});
```

3. **Rate Limiting**
   - Prevent API abuse
   - Use packages like `express-rate-limit`

4. **Data Validation**
   - Validate all input
   - Sanitize user data

---

## 🎯 Recommendation

For your current app:

**Keep using static files** (Option 1). It's:
- Simpler
- Faster
- More reliable
- No internet required
- Lower costs

**Use API integration** (Option 2) only if you need:
- Frequent content updates
- Real-time analytics
- Dynamic content
- Multi-platform support

---

## 📝 Summary

| Feature | Static Files | API Integration |
|---------|-------------|-----------------|
| Setup Complexity | Easy | Medium |
| Works Offline | ✅ Yes | ❌ No |
| Real-time Updates | ❌ No | ✅ Yes |
| Internet Required | ❌ No | ✅ Yes |
| App Size | Larger | Smaller |
| Initial Load | Fast | Slower |
| Hosting Cost | None | $$ |
| Maintenance | Low | Medium |

---

**💡 Start with static files. Add API later if needed!**

Your admin panel is ready to use either way. The architecture supports both approaches.
