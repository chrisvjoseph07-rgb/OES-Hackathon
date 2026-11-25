const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-memory cache + persistent disk sync
let dataStore = {
  users: [],
  departments: [],
  courses: [],
  sections: [],
  subjects: [],
  exams: [],
  questions: [],
  attempts: [],
  notifications: [],
  settings: {
    institutionName: 'EXAMORA University of Technology',
    academicYear: '2025-2026',
    defaultDuration: 60,
    defaultPassingPercentage: 40,
    allowRegistration: false,
    systemEmail: 'admin@examora.com'
  },
  activityLogs: []
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        dataStore = { ...dataStore, ...parsed };
      }
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading database file, initializing fresh:', err.message);
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dataStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err.message);
  }
}

loadDatabase();

const db = {
  getStore: () => dataStore,
  save: () => saveDatabase(),

  find: (collection, filter = {}) => {
    const list = dataStore[collection] || [];
    return list.filter(item => {
      for (const key of Object.keys(filter)) {
        if (Array.isArray(filter[key])) {
          if (!filter[key].includes(item[key])) return false;
        } else if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  },

  findOne: (collection, filter = {}) => {
    const list = dataStore[collection] || [];
    return list.find(item => {
      for (const key of Object.keys(filter)) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    }) || null;
  },

  findById: (collection, id) => {
    const list = dataStore[collection] || [];
    return list.find(item => item._id === id || item.id === id) || null;
  },

  create: (collection, data) => {
    if (!dataStore[collection]) dataStore[collection] = [];
    const item = {
      _id: 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    dataStore[collection].push(item);
    saveDatabase();
    return item;
  },

  findByIdAndUpdate: (collection, id, updates) => {
    if (!dataStore[collection]) return null;
    const index = dataStore[collection].findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    dataStore[collection][index] = {
      ...dataStore[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDatabase();
    return dataStore[collection][index];
  },

  findByIdAndDelete: (collection, id) => {
    if (!dataStore[collection]) return false;
    const initialLen = dataStore[collection].length;
    dataStore[collection] = dataStore[collection].filter(item => item._id !== id && item.id !== id);
    if (dataStore[collection].length !== initialLen) {
      saveDatabase();
      return true;
    }
    return false;
  },

  updateMany: (collection, filter, updates) => {
    if (!dataStore[collection]) return 0;
    let count = 0;
    dataStore[collection] = dataStore[collection].map(item => {
      let matches = true;
      for (const key of Object.keys(filter)) {
        if (item[key] !== filter[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        count++;
        return { ...item, ...updates, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    if (count > 0) saveDatabase();
    return count;
  },

  deleteMany: (collection, filter) => {
    if (!dataStore[collection]) return 0;
    const initialLen = dataStore[collection].length;
    dataStore[collection] = dataStore[collection].filter(item => {
      for (const key of Object.keys(filter)) {
        if (item[key] === filter[key]) return false;
      }
      return true;
    });
    const deletedCount = initialLen - dataStore[collection].length;
    if (deletedCount > 0) saveDatabase();
    return deletedCount;
  },

  count: (collection, filter = {}) => {
    return db.find(collection, filter).length;
  },

  logActivity: (action, user, details = {}) => {
    db.create('activityLogs', {
      action,
      userId: user?._id || user?.id,
      userName: user?.fullName || 'System',
      userRole: user?.role || 'system',
      details,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = db;
