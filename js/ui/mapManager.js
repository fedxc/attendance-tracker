export class MapManager {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.map = null;
        this.marker = null;
        this.defaultLocation = {
            latitude: -34.9027297,
            longitude: -56.1342857
        };
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMap());
        } else {
            this.setupMap();
        }
    }

    setupMap() {
        const mapContainer = document.getElementById('officeLocationMap');
        if (!mapContainer) {
            console.warn('Map container not found');
            return;
        }

        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.warn('Leaflet not available, map will not be initialized');
            this.showMapUnavailableMessage();
            return;
        }

        // Get current settings
        const settings = this.notificationManager.getSettings();
        const currentLocation = settings.officeLocation || this.defaultLocation;

        // Initialize map
        this.map = L.map('officeLocationMap').setView([currentLocation.latitude, currentLocation.longitude], 15);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add marker for office location
        this.marker = L.marker([currentLocation.latitude, currentLocation.longitude], {
            draggable: true,
            title: 'Office Location'
        }).addTo(this.map);

        // Add popup to marker
        this.marker.bindPopup('Office Location<br>Drag to move').openPopup();

        // Update coordinates display
        this.updateCoordinatesDisplay(currentLocation.latitude, currentLocation.longitude);

        // Handle marker drag events
        this.marker.on('dragend', (event) => {
            const position = event.target.getLatLng();
            this.updateOfficeLocation(position.lat, position.lng);
        });

        // Handle map click events
        this.map.on('click', (event) => {
            const position = event.latlng;
            this.marker.setLatLng(position);
            this.updateOfficeLocation(position.lat, position.lng);
        });

        // Bind control buttons
        this.bindControlEvents();
    }

    bindControlEvents() {
        const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
        const resetLocationBtn = document.getElementById('resetLocation');

        if (useCurrentLocationBtn) {
            useCurrentLocationBtn.addEventListener('click', () => this.useCurrentLocation());
        }

        if (resetLocationBtn) {
            resetLocationBtn.addEventListener('click', () => this.resetToDefault());
        }
    }

    async useCurrentLocation() {
        if (!('geolocation' in navigator)) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        try {
            const position = await this.getCurrentPosition();
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            this.marker.setLatLng([lat, lng]);
            this.map.setView([lat, lng], 15);
            this.updateOfficeLocation(lat, lng);

            // Show success message
            this.marker.bindPopup('Current location set as office!<br>Drag to adjust if needed.').openPopup();
        } catch (error) {
            console.error('Error getting current location:', error);
            alert('Could not get your current location. Please check your browser permissions.');
        }
    }

    resetToDefault() {
        const lat = this.defaultLocation.latitude;
        const lng = this.defaultLocation.longitude;

        this.marker.setLatLng([lat, lng]);
        this.map.setView([lat, lng], 15);
        this.updateOfficeLocation(lat, lng);

        // Show reset message
        this.marker.bindPopup('Location reset to default!<br>Drag to adjust if needed.').openPopup();
    }

    updateOfficeLocation(latitude, longitude) {
        // Update coordinates display
        this.updateCoordinatesDisplay(latitude, longitude);

        // Update notification manager settings
        const newSettings = {
            officeLocation: {
                latitude: latitude,
                longitude: longitude
            }
        };
        this.notificationManager.updateSettings(newSettings);
    }

    updateCoordinatesDisplay(latitude, longitude) {
        const latElement = document.getElementById('selectedLatitude');
        const lngElement = document.getElementById('selectedLongitude');

        if (latElement) {
            latElement.textContent = latitude.toFixed(7);
        }
        if (lngElement) {
            lngElement.textContent = longitude.toFixed(7);
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5 * 60 * 1000 // 5 minutes
            });
        });
    }

    // Method to update map when theme changes
    updateMapTheme() {
        if (this.map) {
            // Force map to redraw with new theme
            this.map.invalidateSize();
        }
    }

    // Method to reinitialize map if needed
    reinitializeMap() {
        if (!this.map) {
            this.setupMap();
        }
    }

    // Method to get current office location
    getCurrentOfficeLocation() {
        if (this.marker) {
            const position = this.marker.getLatLng();
            return {
                latitude: position.lat,
                longitude: position.lng
            };
        }
        return this.defaultLocation;
    }

    // Show message when map is unavailable
    showMapUnavailableMessage() {
        const mapContainer = document.getElementById('officeLocationMap');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; 
                           background: var(--color-progress-bg); color: var(--color-text); 
                           font-family: 'Fira Code', monospace; text-align: center; padding: 20px;">
                    <div>
                        <div style="font-size: 1.2rem; margin-bottom: 10px;">🗺️</div>
                        <div>Map loading...</div>
                        <div style="font-size: 0.8rem; margin-top: 5px;">Please refresh if map doesn't appear</div>
                    </div>
                </div>
            `;
        }
    }
}
