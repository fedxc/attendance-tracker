// Notification Manager for Attendance Tracker
// Handles service worker registration and notification settings

export class NotificationManager {
    constructor() {
        this.serviceWorker = null;
        this.settings = this.loadSettings();
        this.isSupported = this.checkSupport();
        
        if (this.isSupported) {
            this.init();
        }
    }
    
    // Check if service workers and notifications are supported
    checkSupport() {
        return 'serviceWorker' in navigator && 'Notification' in window;
    }
    
    // Initialize the notification system
    async init() {
        try {
            const registration = await this.registerServiceWorker();
            await this.requestNotificationPermission();
            this.setupMessageListener();
            
            // Signal that initialization is complete
            this.initialized = true;
            
            if (this.settings.enabled && registration) {
                this.startMonitoring();
            }
            
            console.log('Notification manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize notification system:', error);
            // Still mark as initialized so the app can function without service worker
            this.initialized = true;
        }
    }
    
    // Register the service worker
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            this.serviceWorker = registration;
            
            console.log('Service Worker registered successfully:', registration);
            
            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        this.showUpdateNotification();
                    }
                });
            });
            
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    
    // Request notification permission
    async requestNotificationPermission() {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Notification permission denied');
            }
        }
        return Notification.permission;
    }
    
    // Setup message listener for service worker communication
    setupMessageListener() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, data } = event.data;
            
            switch (type) {
                case 'MARK_ATTENDANCE':
                    this.handleMarkAttendance(data);
                    break;
                case 'NOTIFICATION_CLICKED':
                    this.handleNotificationClick(data);
                    break;
                case 'CHECK_LOCATION_REQUEST':
                    this.handleLocationCheckRequest(data);
                    break;
                case 'CLEAR_NOTIFICATION_HISTORY':
                    this.clearNotificationHistory();
                    break;
            }
        });
    }
    
    // Start location monitoring
    startMonitoring() {
        if (!this.serviceWorker || !this.serviceWorker.active) {
            console.warn('Service Worker not ready');
            return;
        }
        
        this.serviceWorker.active.postMessage({
            type: 'START_MONITORING',
            data: this.settings
        });
        
        console.log('Location monitoring started');
    }
    
    // Stop location monitoring
    stopMonitoring() {
        if (!this.serviceWorker || !this.serviceWorker.active) {
            return;
        }
        
        this.serviceWorker.active.postMessage({
            type: 'STOP_MONITORING'
        });
        
        console.log('Location monitoring stopped');
    }
    
    // Update notification settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        if (this.serviceWorker && this.serviceWorker.active) {
            this.serviceWorker.active.postMessage({
                type: 'UPDATE_SETTINGS',
                data: this.settings
            });
        }
        
        // Start or stop monitoring based on enabled state
        if (this.settings.enabled) {
            this.startMonitoring();
        } else {
            this.stopMonitoring();
        }
    }
    
    // Check location immediately
    checkLocationNow() {
        if (this.serviceWorker && this.serviceWorker.active) {
            this.serviceWorker.active.postMessage({
                type: 'CHECK_LOCATION_NOW'
            });
        } else {
            // Fallback: check location directly if service worker is not available
            this.handleLocationCheckRequest(this.settings);
        }
    }
    
    // Handle mark attendance from notification
    handleMarkAttendance(data) {
        // Dispatch custom event for the main app to handle
        const event = new CustomEvent('markAttendance', {
            detail: { day: data.day }
        });
        document.dispatchEvent(event);
    }
    
    // Handle notification click
    handleNotificationClick(data) {
        console.log('Notification clicked:', data);
    }
    
    // Handle location check request from service worker
    async handleLocationCheckRequest(settings) {
        if (!('geolocation' in navigator)) {
            console.error('Geolocation not supported');
            return;
        }
        
        try {
            const position = await this.getCurrentPosition();
            const userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            // Use office location from passed settings, fallback to current settings
            const officeLocation = settings.officeLocation || this.settings.officeLocation;
            const distance = this.calculateDistance(officeLocation, userLocation);
            console.log(`Distance from office: ${distance.toFixed(2)} meters`);
            
            if (distance <= settings.maxDistanceMeters) {
                // Check if attendance is already marked for today
                const alreadyMarked = await this.checkAttendanceStatus();
                if (!alreadyMarked) {
                    // Check if notification was already shown today
                    if (!this.hasNotificationBeenShownToday()) {
                        // Mark notification as shown for today
                        this.markNotificationAsShown();
                        
                        // Send notification request to service worker
                        if (this.serviceWorker && this.serviceWorker.active) {
                            this.serviceWorker.active.postMessage({
                                type: 'SHOW_NOTIFICATION',
                                data: {
                                    title: "You're at the office!",
                                    body: "Don't forget to mark your attendance for today.",
                                    tag: 'attendance-reminder',
                                    requireInteraction: true,
                                    actions: [
                                        {
                                            action: 'mark',
                                            title: 'Mark Attendance',
                                            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%234caf50" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
                                        },
                                        {
                                            action: 'snooze',
                                            title: 'Snooze 15min',
                                            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23ff9800" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
                                        }
                                    ]
                                }
                            });
                        } else {
                            // Fallback: show simple notification without actions
                            this.showNotification(
                                "You're at the office!",
                                "Don't forget to mark your attendance for today."
                            );
                        }
                    } else {
                        console.log('Notification already shown today, skipping...');
                    }
                }
            }
        } catch (error) {
            console.error('Geolocation error:', error.message);
        }
    }
    
    // Get current position with promise
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 5 * 60 * 1000 // 5 minutes
            });
        });
    }
    
    // Calculate distance between two points using Haversine formula
    calculateDistance(loc1, loc2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = loc1.latitude * Math.PI / 180;
        const φ2 = loc2.latitude * Math.PI / 180;
        const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
        const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;
        
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in meters
    }
    

    
    // Check if attendance is already marked for today
    async checkAttendanceStatus() {
        try {
            const today = new Date();
            const day = today.getDate();
            const month = today.getMonth() + 1; // getMonth() is 0-indexed
            const year = today.getFullYear();
            
            const attendanceHistory = localStorage.getItem('attendanceHistory');
            if (attendanceHistory) {
                const data = JSON.parse(attendanceHistory);
                const monthKey = `${year}-${month}`;
                const monthData = data[monthKey] || [];
                
                return monthData.some(entry => entry.day === day);
            }
            
            return false;
        } catch (error) {
            console.error('Error checking attendance status:', error);
            return false;
        }
    }
    
    // Check if notification was already shown today
    hasNotificationBeenShownToday() {
        try {
            const today = new Date();
            const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            const notificationHistory = localStorage.getItem('notificationHistory') || '{}';
            const history = JSON.parse(notificationHistory);
            
            return history[todayKey] === true;
        } catch (error) {
            console.error('Error checking notification history:', error);
            return false;
        }
    }
    
    // Mark notification as shown for today
    markNotificationAsShown() {
        try {
            const today = new Date();
            const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            const notificationHistory = localStorage.getItem('notificationHistory') || '{}';
            const history = JSON.parse(notificationHistory);
            
            history[todayKey] = true;
            localStorage.setItem('notificationHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Error marking notification as shown:', error);
        }
    }
    
    // Clear notification history (for testing or reset)
    clearNotificationHistory() {
        localStorage.removeItem('notificationHistory');
    }
    
    // Show notification
    showNotification(title, body, options = {}) {
        if (Notification.permission === 'granted') {
            const notificationOptions = {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="90" height="90" x="5" y="5" fill="%23fff" stroke="%23000" stroke-width="10"/><path d="M30 50 L45 65 L70 35" stroke="%234caf50" stroke-width="10" fill="none"/></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="90" height="90" x="5" y="5" fill="%23fff" stroke="%23000" stroke-width="10"/><path d="M30 50 L45 65 L70 35" stroke="%234caf50" stroke-width="10" fill="none"/></svg>',
                tag: 'attendance-reminder',
                requireInteraction: true,
                ...options
            };
            
            return new Notification(title, notificationOptions);
        } else {
            console.warn('Notification permission not granted');
        }
    }
    
    // Show update notification
    showUpdateNotification() {
        if (Notification.permission === 'granted') {
            new Notification('Attendance Tracker Updated', {
                body: 'A new version is available. Refresh the page to update.',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="90" height="90" x="5" y="5" fill="%23fff" stroke="%23000" stroke-width="10"/><path d="M30 50 L45 65 L70 35" stroke="%234caf50" stroke-width="10" fill="none"/></svg>',
                requireInteraction: true
            });
        }
    }
    
    // Load settings from localStorage
    loadSettings() {
        const defaultSettings = {
            enabled: false,
            maxDistanceMeters: 550,
            workingHours: {
                start: 9,
                end: 18
            },
            checkInterval: 15 * 60 * 1000, // 15 minutes
            officeLocation: {
                latitude: -34.9027297,
                longitude: -56.1342857
            }
        };
        
        try {
            const saved = localStorage.getItem('notificationSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading notification settings:', error);
            return defaultSettings;
        }
    }
    
    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    }
    
    // Get current settings
    getSettings() {
        return { ...this.settings };
    }
    
    // Test notification
    testNotification() {
        if (Notification.permission === 'granted') {
            if (this.serviceWorker && this.serviceWorker.active) {
                this.serviceWorker.active.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    data: {
                        title: 'Test Notification',
                        body: 'This is a test notification from Attendance Tracker',
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="90" height="90" x="5" y="5" fill="%23fff" stroke="%23000" stroke-width="10"/><path d="M30 50 L45 65 L70 35" stroke="%234caf50" stroke-width="10" fill="none"/></svg>'
                    }
                });
            } else {
                // Fallback: show simple notification
                new Notification('Test Notification', {
                    body: 'This is a test notification from Attendance Tracker',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="90" height="90" x="5" y="5" fill="%23fff" stroke="%23000" stroke-width="10"/><path d="M30 50 L45 65 L70 35" stroke="%234caf50" stroke-width="10" fill="none"/></svg>'
                });
            }
        } else {
            console.warn('Notification permission not granted');
        }
    }
    
    // Check if notifications are supported and enabled
    isNotificationSupported() {
        return this.isSupported && Notification.permission === 'granted';
    }
    
    // Get notification permission status
    getPermissionStatus() {
        return Notification.permission;
    }
    
    // Check if notification manager is ready
    isReady() {
        return this.initialized && this.isSupported;
    }
    

}
