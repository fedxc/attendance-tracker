# Attendance Tracker - Comprehensive Test Suite

This directory contains a comprehensive test suite for the Attendance Tracker application, covering all major components and functionality.

## Test Files Overview

### Core Functionality Tests

#### `attendanceHistory.test.js`
- **Purpose**: Tests the AttendanceHistory class for data persistence
- **Coverage**:
  - localStorage integration
  - Data serialization/deserialization
  - Error handling for corrupted data
  - Month key formatting
  - CRUD operations (Create, Read, Update, Delete)

#### `attendanceManager.test.js`
- **Purpose**: Tests the AttendanceManager class for business logic
- **Coverage**:
  - Attendance tracking (add, remove, toggle)
  - Duplicate prevention
  - Data persistence
  - Goal calculation
  - Working days integration

#### `attendanceUtils.test.js`
- **Purpose**: Tests utility functions for attendance calculations
- **Coverage**:
  - Holiday generation for different years
  - Working days calculation with holidays
  - Weekend exclusion
  - Month-specific calculations
  - Edge cases and boundary conditions
  - Original calculateWorkingDays tests (consolidated)

### UI and Configuration Tests

#### `optionsManager.test.js`
- **Purpose**: Tests the OptionsManager class for user preferences
- **Coverage**:
  - Theme management
  - Color customization
  - localStorage persistence
  - CSS property application
  - Error handling

#### `helpers.test.js`
- **Purpose**: Tests helper functions and theme definitions
- **Coverage**:
  - Theme object structure
  - Color validation
  - Theme consistency
  - Immutability

### Integration Tests

#### `integration.test.js`
- **Purpose**: Tests component interactions and end-to-end workflows
- **Coverage**:
  - Complete attendance workflow
  - Data consistency across components
  - Error handling integration
  - Month boundary handling
  - Options and attendance data isolation

## Running Tests

### Individual Test Files
```bash
# Run a specific test file
node --test tests/attendanceManager.test.js

# Run all tests
node --test tests/*.test.js
```

### Using npm Scripts
```bash
# Run all tests with detailed output
npm run test:all

# Run unit tests
npm run test:unit

# Run tests with coverage (Node.js 20+)
npm run test:coverage
```

### Test Runner Script
```bash
# Run the comprehensive test suite
node tests/run-all-tests.js
```

## Test Coverage

The test suite provides comprehensive coverage of:

### ✅ **Core Features**
- [x] Attendance tracking and management
- [x] Working days calculation
- [x] Holiday exclusion
- [x] Data persistence
- [x] Goal setting and tracking

### ✅ **User Interface**
- [x] Theme management
- [x] Color customization
- [x] Options persistence
- [x] CSS property application

### ✅ **Data Management**
- [x] localStorage integration
- [x] Data serialization
- [x] Error handling
- [x] Data isolation

### ✅ **Edge Cases**
- [x] Corrupted data handling
- [x] Month boundaries
- [x] Leap years
- [x] Invalid inputs
- [x] Storage errors

## Test Statistics

- **Total Test Files**: 6
- **Total Test Cases**: 74+
- **Coverage Areas**: 6 major components
- **Integration Tests**: 10 comprehensive scenarios

## Mocking Strategy

The tests use comprehensive mocking for:

### localStorage
- Mock implementation with in-memory storage
- Error simulation for quota exceeded scenarios
- Data corruption testing

### DOM APIs
- Mock document and getComputedStyle
- CSS property setting simulation
- Element interaction testing

### Browser APIs
- Geolocation mocking (where applicable)
- Notification API mocking
- Service Worker mocking

## Test Data

Tests use realistic data scenarios:

- **Years**: 2023, 2024, 2025 (including leap year)
- **Months**: All 12 months with different characteristics
- **Holidays**: Uruguay-specific holidays with proper dates
- **Working Days**: Calculated based on actual calendar data

## Continuous Integration

The test suite is designed to run in CI/CD environments:

- No external dependencies
- Deterministic results
- Clear pass/fail indicators
- Comprehensive error reporting

## Adding New Tests

When adding new functionality:

1. **Unit Tests**: Add tests for individual functions/classes
2. **Integration Tests**: Add tests for component interactions
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Documentation**: Update this README with new test coverage

## Test Best Practices

- **Isolation**: Each test is independent
- **Mocking**: External dependencies are mocked
- **Assertions**: Clear, specific assertions
- **Naming**: Descriptive test names
- **Coverage**: Both happy path and error scenarios

## Troubleshooting

### Common Issues

1. **localStorage Errors**: Ensure mock localStorage is properly set up
2. **DOM Errors**: Check that document mocking is in place
3. **Import Errors**: Verify ES module syntax and file paths
4. **Async Issues**: Use proper async/await patterns

### Debug Mode

Run tests with verbose output:
```bash
node --test --experimental-test-coverage tests/*.test.js
```

This comprehensive test suite ensures your Attendance Tracker is robust, reliable, and ready for production use! 🎉
