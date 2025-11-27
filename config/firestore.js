/**
 * Firebase Firestore Configuration
 * Replaces JSON file database for persistent storage
 */

const admin = require('firebase-admin');
const serviceAccount = require('../vitagita-firebase-adminsdk.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'vitagita',
});

const db = admin.firestore();

// Collections
const collections = {
  users: db.collection('users'),
  shloks: db.collection('shloks'),
  videos: db.collection('videos'),
  analytics: db.collection('analytics'),
};

/**
 * Firestore Database Helper Functions
 */
const firestoreDB = {
  // Users
  users: {
    async getAll() {
      const snapshot = await collections.users.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async save(users) {
      const batch = db.batch();
      
      // Delete all existing users
      const snapshot = await collections.users.get();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Add new users
      users.forEach(user => {
        const docRef = collections.users.doc(user.email);
        batch.set(docRef, user);
      });
      
      await batch.commit();
      return true;
    },
    
    async findByEmail(email) {
      const doc = await collections.users.doc(email).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },
    
    async create(userData) {
      const docRef = collections.users.doc(userData.email);
      await docRef.set(userData);
      return { id: docRef.id, ...userData };
    },
    
    async update(email, updates) {
      await collections.users.doc(email).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    },
    
    async delete(email) {
      await collections.users.doc(email).delete();
    },
  },

  // Shloks
  shloks: {
    async getAll() {
      const snapshot = await collections.shloks.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async save(shloks) {
      const batch = db.batch();
      
      // Delete all existing shloks
      const snapshot = await collections.shloks.get();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Add new shloks
      shloks.forEach((shlok, index) => {
        const docRef = collections.shloks.doc(`shlok_${index}`);
        batch.set(docRef, shlok);
      });
      
      await batch.commit();
      return true;
    },
  },

  // Videos
  videos: {
    async getAll() {
      const snapshot = await collections.videos.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async save(videos) {
      const batch = db.batch();
      
      // Delete all existing videos
      const snapshot = await collections.videos.get();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Add new videos
      videos.forEach((video, index) => {
        const docRef = collections.videos.doc(video.key || `video_${index}`);
        batch.set(docRef, video);
      });
      
      await batch.commit();
      return true;
    },
  },

  // Analytics
  analytics: {
    async get() {
      const doc = await collections.analytics.doc('stats').get();
      if (doc.exists) {
        return doc.data();
      }
      // Return default analytics if not exists
      return {
        totalUsers: 0,
        totalShloks: 0,
        totalVideos: 0,
        newUsersToday: 0,
        lastUpdated: new Date().toISOString(),
      };
    },
    
    async save(analyticsData) {
      await collections.analytics.doc('stats').set({
        ...analyticsData,
        lastUpdated: new Date().toISOString(),
      });
      return true;
    },
  },
};

module.exports = { db: firestoreDB, firestore: db, admin };
