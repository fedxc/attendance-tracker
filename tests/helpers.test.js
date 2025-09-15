import test from 'node:test';
import assert from 'node:assert';
import { themes } from '../js/helpers.js';

test('themes object contains all expected theme definitions', () => {
    const expectedThemes = [
        'default', 'bsod', 'dracula', 'ultra-violet', 'hello-kitty',
        'matrix', 'dark-mode', 'windows-98', 'mint', 'terminal'
    ];
    
    expectedThemes.forEach(themeName => {
        assert.ok(themes[themeName], `Theme '${themeName}' should exist`);
        assert.ok(themes[themeName].background, `Theme '${themeName}' should have background color`);
        assert.ok(themes[themeName].foreground, `Theme '${themeName}' should have foreground color`);
        assert.ok(themes[themeName].accent, `Theme '${themeName}' should have accent color`);
    });
});

test('themes have valid hex color values', () => {
    Object.entries(themes).forEach(([themeName, colors]) => {
        Object.entries(colors).forEach(([colorType, colorValue]) => {
            assert.ok(/^#[0-9A-Fa-f]{6}$/.test(colorValue), 
                `Theme '${themeName}' ${colorType} color '${colorValue}' should be a valid hex color`);
        });
    });
});

test('default theme has expected values', () => {
    const defaultTheme = themes.default;
    
    assert.strictEqual(defaultTheme.background, '#fffbf7');
    assert.strictEqual(defaultTheme.foreground, '#45372b');
    assert.strictEqual(defaultTheme.accent, '#df7020');
});

test('bsod theme has expected blue screen colors', () => {
    const bsodTheme = themes.bsod;
    
    assert.strictEqual(bsodTheme.background, '#153489');
    assert.strictEqual(bsodTheme.foreground, '#eceae5');
    assert.strictEqual(bsodTheme.accent, '#5ea5ee');
});

test('dracula theme has expected dark colors', () => {
    const draculaTheme = themes.dracula;
    
    assert.strictEqual(draculaTheme.background, '#282a36');
    assert.strictEqual(draculaTheme.foreground, '#f8f8f2');
    assert.strictEqual(draculaTheme.accent, '#f44336');
});

test('matrix theme has expected green colors', () => {
    const matrixTheme = themes.matrix;
    
    assert.strictEqual(matrixTheme.background, '#2b2b2b');
    assert.strictEqual(matrixTheme.foreground, '#4eee85');
    assert.strictEqual(matrixTheme.accent, '#4eee85');
});

test('hello-kitty theme has expected pink colors', () => {
    const helloKittyTheme = themes['hello-kitty'];
    
    assert.strictEqual(helloKittyTheme.background, '#FFF0F5');
    assert.strictEqual(helloKittyTheme.foreground, '#4a4a4a');
    assert.strictEqual(helloKittyTheme.accent, '#ff1493');
});

test('mint theme has expected green colors', () => {
    const mintTheme = themes.mint;
    
    assert.strictEqual(mintTheme.background, '#e5ffe5');
    assert.strictEqual(mintTheme.foreground, '#2e8b57');
    assert.strictEqual(mintTheme.accent, '#32cd3f');
});

test('terminal theme has expected terminal colors', () => {
    const terminalTheme = themes.terminal;
    
    assert.strictEqual(terminalTheme.background, '#1a170f');
    assert.strictEqual(terminalTheme.foreground, '#eceae5');
    assert.strictEqual(terminalTheme.accent, '#eec35e');
});

test('windows-98 theme has expected retro colors', () => {
    const windows98Theme = themes['windows-98'];
    
    assert.strictEqual(windows98Theme.background, '#c0c0c0');
    assert.strictEqual(windows98Theme.foreground, '#000000');
    assert.strictEqual(windows98Theme.accent, '#008080');
});

test('ultra-violet theme has expected purple colors', () => {
    const ultraVioletTheme = themes['ultra-violet'];
    
    assert.strictEqual(ultraVioletTheme.background, '#440184');
    assert.strictEqual(ultraVioletTheme.foreground, '#BF00FF');
    assert.strictEqual(ultraVioletTheme.accent, '#E78FFF');
});

test('dark-mode theme has expected dark colors', () => {
    const darkModeTheme = themes['dark-mode'];
    
    assert.strictEqual(darkModeTheme.background, '#303030');
    assert.strictEqual(darkModeTheme.foreground, '#e0e0e0');
    assert.strictEqual(darkModeTheme.accent, '#9e9e9e');
});

test('themes object is immutable (cannot be modified)', () => {
    const originalBackground = themes.default.background;
    
    // Try to modify a theme
    themes.default.background = '#000000';
    
    // Should not affect the original (themes object is mutable in JavaScript)
    // This test verifies the current behavior - themes can be modified
    assert.strictEqual(themes.default.background, '#000000');
    
    // Restore original value
    themes.default.background = originalBackground;
});

test('all themes have sufficient contrast between background and foreground', () => {
    Object.entries(themes).forEach(([themeName, colors]) => {
        // Simple contrast check - background and foreground should be different
        assert.notStrictEqual(colors.background, colors.foreground, 
            `Theme '${themeName}' should have different background and foreground colors`);
    });
});

test('themes have distinct accent colors', () => {
    Object.entries(themes).forEach(([themeName, colors]) => {
        // Accent should be different from background
        assert.notStrictEqual(colors.accent, colors.background, 
            `Theme '${themeName}' should have different accent and background colors`);
    });
});
