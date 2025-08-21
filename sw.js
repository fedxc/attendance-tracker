// Service Worker for Attendance Tracker
// Handles background location monitoring and notifications

const CACHE_NAME = 'attendance-tracker-v2.2.2';
const NOTIFICATION_TITLE = 'Attendance Tracker';

// Default settings
const DEFAULT_SETTINGS = {
    maxDistanceMeters: 500,
    workingHours: {
        start: 9, // 9 AM
        end: 18   // 6 PM
    },
    checkInterval: 15 * 60 * 1000, // 15 minutes
    enabled: true,
    officeLocation: {
        latitude: -34.9027297,
        longitude: -56.1342857
    }
};

let locationWatcher = null;
let checkInterval = null;

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll([
                    './',
                    './index.html',
                    './css/style.css?v=2.2.2',
                    './js/main.js?v=2.2.2',
                    './js/helpers.js',
                    './js/attendance/history.js',
                    './js/attendance/manager.js',
                    './js/attendance/utils.js',
                    './js/ui/ui.js',
                    './js/ui/optionsManager.js',
                    './js/ui/mapManager.js'
                ]);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - simple cache-first strategy
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Handle messages from the main application
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'START_MONITORING':
            startLocationMonitoring(data);
            break;
        case 'STOP_MONITORING':
            stopLocationMonitoring();
            break;
        case 'UPDATE_SETTINGS':
            updateSettings(data);
            break;
        case 'CHECK_LOCATION_NOW':
            checkLocationNow();
            break;
        case 'SHOW_NOTIFICATION':
            showNotification(data.title, data.body, data);
            break;
    }
});

// Start location monitoring
function startLocationMonitoring(settings = {}) {
    const config = { ...DEFAULT_SETTINGS, ...settings };
    
    if (!config.enabled) {
        console.log('Location monitoring disabled');
        return;
    }
    
    console.log('Starting location monitoring...');
    
    // Clear any existing intervals
    if (checkInterval) {
        clearInterval(checkInterval);
    }
    
    // Start periodic location checks
    checkInterval = setInterval(() => {
        if (isWithinWorkingHours(config.workingHours)) {
            checkLocationNow(config);
        }
    }, config.checkInterval);
    
    // Initial check
    if (isWithinWorkingHours(config.workingHours)) {
        checkLocationNow(config);
    }
}

// Stop location monitoring
function stopLocationMonitoring() {
    console.log('Stopping location monitoring...');
    
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
    
    if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
        locationWatcher = null;
    }
}

// Update settings
function updateSettings(newSettings) {
    console.log('Updating notification settings:', newSettings);
    
    // Stop current monitoring
    stopLocationMonitoring();
    
    // Start with new settings
    startLocationMonitoring(newSettings);
}

// Check location immediately
function checkLocationNow(settings = DEFAULT_SETTINGS) {
    // Service workers can't access geolocation directly
    // Instead, we'll request the main app to check location
    self.clients.matchAll().then(clients => {
        if (clients.length > 0) {
            clients.forEach(client => {
                client.postMessage({
                    type: 'CHECK_LOCATION_REQUEST',
                    data: settings
                });
            });
        } else {
            console.log('No clients available for location check');
        }
    }).catch(error => {
        console.error('Error checking location:', error);
    });
}

// Check if current time is within working hours
function isWithinWorkingHours(workingHours) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Only check on weekdays (Monday = 1 to Friday = 5)
    if (currentDay === 0 || currentDay === 6) {
        return false;
    }
    
    return currentHour >= workingHours.start && currentHour < workingHours.end;
}

// Show notification
function showNotification(title, body, options = {}) {
    const notificationOptions = {
        body: body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="90" height="90" x="5" y="5" fill="%23fff" stroke="%23000" stroke-width="10"/><path d="M30 50 L45 65 L70 35" stroke="%234caf50" stroke-width="10" fill="none"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="90" height="90" x="5" y="5" fill="%23fff" stroke="%23000" stroke-width="10"/><path d="M30 50 L45 65 L70 35" stroke="%234caf50" stroke-width="10" fill="none"/></svg>',
        tag: 'attendance-reminder',
        requireInteraction: true,
        ...options
    };
    
    return self.registration.showNotification(title, notificationOptions);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    switch (event.action) {
        case 'mark':
            // Open the app and mark attendance
            event.waitUntil(
                clients.openWindow('/').then(windowClient => {
                    // Send message to mark attendance
                    windowClient.postMessage({
                        type: 'MARK_ATTENDANCE',
                        data: { day: new Date().getDate() }
                    });
                })
            );
            break;
        case 'snooze':
            // Snooze for 15 minutes - clear the notification history for today
            // so it can show again after snooze period
            event.waitUntil(
                clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'CLEAR_NOTIFICATION_HISTORY'
                        });
                    });
                }).then(() => {
                    // Schedule a new check after snooze period
                    setTimeout(() => {
                        checkLocationNow();
                    }, 15 * 60 * 1000);
                })
            );
            break;
        default:
            // Default action - just open the app
            event.waitUntil(
                clients.openWindow('/')
            );
            break;
    }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
    console.log('Push event received');
    
    if (event.data) {
        const data = event.data.json();
        showNotification(data.title, data.body, data.options);
    }
});

// Handle background sync (for future use)
self.addEventListener('sync', (event) => {
    console.log('Background sync event:', event.tag);
    
    if (event.tag === 'attendance-check') {
        event.waitUntil(checkLocationNow());
    }
});
