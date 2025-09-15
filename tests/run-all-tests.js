#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFiles = [
    'attendanceHistory.test.js',
    'attendanceManager.test.js',
    'attendanceUtils.test.js',
    'optionsManager.test.js',
    'helpers.test.js',
    'integration.test.js'
];

console.log('🧪 Running comprehensive test suite for Attendance Tracker...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runTestFile(testFile) {
    return new Promise((resolve) => {
        const testPath = join(__dirname, testFile);
        const child = spawn('node', ['--test', testPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        child.on('close', (code) => {
            const lines = output.split('\n');
            let fileTests = 0;
            let filePassed = 0;
            let fileFailed = 0;

            lines.forEach(line => {
                if (line.includes('✔')) {
                    filePassed++;
                    fileTests++;
                } else if (line.includes('✖')) {
                    fileFailed++;
                    fileTests++;
                }
            });

            totalTests += fileTests;
            passedTests += filePassed;
            failedTests += fileFailed;

            const status = code === 0 ? '✅' : '❌';
            console.log(`${status} ${testFile}: ${filePassed} passed, ${fileFailed} failed`);

            if (errorOutput) {
                console.log(`   Error: ${errorOutput.trim()}`);
            }

            resolve({ code, fileTests, filePassed, fileFailed });
        });
    });
}

async function runAllTests() {
    console.log('📋 Test Files to Run:');
    testFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');

    for (const testFile of testFiles) {
        await runTestFile(testFile);
    }

    console.log('\n📊 Test Summary:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);

    if (failedTests === 0) {
        console.log('\n🎉 All tests passed! Your attendance tracker is working perfectly.');
    } else {
        console.log(`\n⚠️  ${failedTests} test(s) failed. Please review the output above.`);
        process.exit(1);
    }
}

runAllTests().catch(console.error);
