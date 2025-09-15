import test from 'node:test';
import assert from 'node:assert';
import { OptionsManager } from '../js/ui/optionsManager.js';

// Mock localStorage for testing
const mockLocalStorage = {
    data: {},
    getItem: function(key) {
        return this.data[key] || null;
    },
    setItem: function(key, value) {
        this.data[key] = value;
    },
    removeItem: function(key) {
        delete this.data[key];
    },
    clear: function() {
        this.data = {};
    }
};

// Mock document and getComputedStyle
const mockDocument = {
    documentElement: {
        style: {
            setProperty: function(property, value) {
                this[property] = value;
            }
        }
    }
};

global.localStorage = mockLocalStorage;
global.document = mockDocument;

// Mock getComputedStyle
global.getComputedStyle = function(element) {
    return {
        getPropertyValue: function(property) {
            const mockStyles = {
                '--color-bg': '#fffbf7',
                '--color-text': '#45372b',
                '--color-progress-fill': '#df7020'
            };
            return mockStyles[property] || '';
        }
    };
};

test('OptionsManager constructor initializes with default values', () => {
    mockLocalStorage.clear();
    const optionsManager = new OptionsManager();
    
    assert.strictEqual(optionsManager.storageKey, 'customOptions');
    assert.strictEqual(optionsManager.options.background, '#fffbf7');
    assert.strictEqual(optionsManager.options.foreground, '#45372b');
    assert.strictEqual(optionsManager.options.accent, '#df7020');
    assert.strictEqual(optionsManager.options.attendanceGoal, 55);
});

test('OptionsManager loads saved options from localStorage', () => {
    mockLocalStorage.clear();
    const savedOptions = {
        background: '#ff0000',
        foreground: '#00ff00',
        accent: '#0000ff',
        attendanceGoal: 75
    };
    mockLocalStorage.setItem('customOptions', JSON.stringify(savedOptions));
    
    const optionsManager = new OptionsManager();
    
    assert.strictEqual(optionsManager.options.background, '#ff0000');
    assert.strictEqual(optionsManager.options.foreground, '#00ff00');
    assert.strictEqual(optionsManager.options.accent, '#0000ff');
    assert.strictEqual(optionsManager.options.attendanceGoal, 75);
});

test('OptionsManager handles corrupted localStorage data gracefully', () => {
    mockLocalStorage.clear();
    mockLocalStorage.setItem('customOptions', 'invalid json');
    
    const optionsManager = new OptionsManager();
    
    // Should fall back to default values
    assert.strictEqual(optionsManager.options.background, '#fffbf7');
    assert.strictEqual(optionsManager.options.foreground, '#45372b');
    assert.strictEqual(optionsManager.options.accent, '#df7020');
    assert.strictEqual(optionsManager.options.attendanceGoal, 55);
});

test('OptionsManager saves options to localStorage', () => {
    mockLocalStorage.clear();
    const optionsManager = new OptionsManager();
    
    optionsManager.saveOptions();
    
    const saved = JSON.parse(mockLocalStorage.getItem('customOptions'));
    assert.deepStrictEqual(saved, optionsManager.options);
});

test('OptionsManager updateOption updates and saves options', () => {
    mockLocalStorage.clear();
    const optionsManager = new OptionsManager();
    
    optionsManager.updateOption('background', '#ff0000');
    
    assert.strictEqual(optionsManager.options.background, '#ff0000');
    
    const saved = JSON.parse(mockLocalStorage.getItem('customOptions'));
    assert.strictEqual(saved.background, '#ff0000');
});

test('OptionsManager updateOption updates multiple options', () => {
    mockLocalStorage.clear();
    const optionsManager = new OptionsManager();
    
    optionsManager.updateOption('background', '#ff0000');
    optionsManager.updateOption('foreground', '#00ff00');
    optionsManager.updateOption('attendanceGoal', 80);
    
    assert.strictEqual(optionsManager.options.background, '#ff0000');
    assert.strictEqual(optionsManager.options.foreground, '#00ff00');
    assert.strictEqual(optionsManager.options.attendanceGoal, 80);
    
    const saved = JSON.parse(mockLocalStorage.getItem('customOptions'));
    assert.strictEqual(saved.background, '#ff0000');
    assert.strictEqual(saved.foreground, '#00ff00');
    assert.strictEqual(saved.attendanceGoal, 80);
});

test('OptionsManager applyOptions sets CSS custom properties', () => {
    mockLocalStorage.clear();
    const optionsManager = new OptionsManager();
    
    // Mock the setProperty method to track calls
    const setPropertyCalls = [];
    mockDocument.documentElement.style.setProperty = function(property, value) {
        setPropertyCalls.push({ property, value });
    };
    
    optionsManager.applyOptions();
    
    // Check that CSS properties were set
    assert.ok(setPropertyCalls.some(call => call.property === '--color-bg'));
    assert.ok(setPropertyCalls.some(call => call.property === '--color-text'));
    assert.ok(setPropertyCalls.some(call => call.property === '--color-progress-fill'));
});

test('OptionsManager handles hex color conversion correctly', () => {
    mockLocalStorage.clear();
    const optionsManager = new OptionsManager();
    
    // Test that the internal hex conversion functions work
    // This is tested indirectly through applyOptions
    optionsManager.updateOption('background', '#123456');
    optionsManager.applyOptions();
    
    // Should not throw error and should save correctly
    const saved = JSON.parse(mockLocalStorage.getItem('customOptions'));
    assert.strictEqual(saved.background, '#123456');
});

test('OptionsManager handles 3-character hex colors', () => {
    mockLocalStorage.clear();
    const optionsManager = new OptionsManager();
    
    optionsManager.updateOption('background', '#abc');
    optionsManager.applyOptions();
    
    // Should not throw error
    const saved = JSON.parse(mockLocalStorage.getItem('customOptions'));
    assert.strictEqual(saved.background, '#abc');
});

test('OptionsManager preserves existing options when loading partial data', () => {
    mockLocalStorage.clear();
    const partialOptions = {
        background: '#ff0000'
        // Missing other options
    };
    mockLocalStorage.setItem('customOptions', JSON.stringify(partialOptions));
    
    const optionsManager = new OptionsManager();
    
    assert.strictEqual(optionsManager.options.background, '#ff0000');
    assert.strictEqual(optionsManager.options.foreground, '#45372b'); // Default
    assert.strictEqual(optionsManager.options.accent, '#df7020'); // Default
    assert.strictEqual(optionsManager.options.attendanceGoal, 55); // Default
});

test('OptionsManager handles localStorage errors gracefully', () => {
    mockLocalStorage.clear();
    
    // Mock localStorage to throw error
    const originalSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem = function() {
        throw new Error('Storage quota exceeded');
    };
    
    const optionsManager = new OptionsManager();
    
    // Should not throw error
    optionsManager.updateOption('background', '#ff0000');
    
    // Restore original method
    mockLocalStorage.setItem = originalSetItem;
});
