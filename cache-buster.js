#!/usr/bin/env node

/**
 * Cache Buster Utility
 * Automatically updates version numbers in HTML and service worker files
 * to force cache refresh when deploying new versions.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const VERSION_FILE = 'version.txt';
const FILES_TO_UPDATE = [
    'index.html',
    'sw.js'
];

// Generate new version number
function generateVersion() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    return `2.2.${year}${month}${day}${hour}${minute}`;
}

// Read current version
function readCurrentVersion() {
    try {
        if (fs.existsSync(VERSION_FILE)) {
            return fs.readFileSync(VERSION_FILE, 'utf8').trim();
        }
    } catch (error) {
        console.log('No existing version file found');
    }
    return '2.2.1'; // Default version
}

// Write new version
function writeVersion(version) {
    fs.writeFileSync(VERSION_FILE, version);
    console.log(`Version updated to: ${version}`);
}

// Update version in HTML file
function updateHtmlFile(version) {
    const htmlPath = 'index.html';
    if (!fs.existsSync(htmlPath)) {
        console.error('index.html not found');
        return false;
    }

    let content = fs.readFileSync(htmlPath, 'utf8');
    
    // Update CSS version
    content = content.replace(
        /href="css\/style\.css\?v=[^"]*"/g,
        `href="css/style.css?v=${version}"`
    );
    
    // Update JS version
    content = content.replace(
        /src="js\/main\.js\?v=[^"]*"/g,
        `src="js/main.js?v=${version}"`
    );
    
    // Update version span
    content = content.replace(
        /<span class="version">v[^<]*<\/span>/g,
        `<span class="version">v${version}</span>`
    );
    
    fs.writeFileSync(htmlPath, content);
    console.log('Updated index.html');
    return true;
}

// Update version in service worker
function updateServiceWorker(version) {
    const swPath = 'sw.js';
    if (!fs.existsSync(swPath)) {
        console.error('sw.js not found');
        return false;
    }

    let content = fs.readFileSync(swPath, 'utf8');
    
    // Update cache name
    content = content.replace(
        /const CACHE_NAME = 'attendance-tracker-v[^']*';/g,
        `const CACHE_NAME = 'attendance-tracker-v${version}';`
    );
    
    // Update cached file versions
    content = content.replace(
        /'\/css\/style\.css\?v=[^']*'/g,
        `'/css/style.css?v=${version}'`
    );
    
    content = content.replace(
        /'\/js\/main\.js\?v=[^']*'/g,
        `'/js/main.js?v=${version}'`
    );
    
    fs.writeFileSync(swPath, content);
    console.log('Updated sw.js');
    return true;
}

// Main function
function main() {
    console.log('🔄 Cache Buster Utility');
    console.log('========================');
    
    const currentVersion = readCurrentVersion();
    const newVersion = generateVersion();
    
    console.log(`Current version: ${currentVersion}`);
    console.log(`New version: ${newVersion}`);
    
    if (currentVersion === newVersion) {
        console.log('⚠️  Version already up to date');
        return;
    }
    
    // Update files
    let success = true;
    
    if (!updateHtmlFile(newVersion)) {
        success = false;
    }
    
    if (!updateServiceWorker(newVersion)) {
        success = false;
    }
    
    if (success) {
        writeVersion(newVersion);
        console.log('\n✅ Cache busting completed successfully!');
        console.log('📝 Remember to:');
        console.log('   1. Test the application');
        console.log('   2. Clear browser cache if needed');
        console.log('   3. Deploy the updated files');
    } else {
        console.log('\n❌ Cache busting failed!');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    generateVersion,
    updateHtmlFile,
    updateServiceWorker
};
