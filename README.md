# Attendance Tracker

Attendance Tracker is a client-side web application that helps you monitor daily attendance throughout the month. It calculates working days, lets you define an attendance goal, and stores data in the browser so your progress persists between sessions.

## Project Purpose

The project provides an interactive calendar for marking attendance, tracks progress toward a configurable goal, and offers tools to review or export your history.

## File Structure

```
index.html                # Main application page
css/
  style.css               # Application styling
js/
  main.js                 # Entry point
  helpers.js              # Shared helpers and theme definitions
  attendance/
    history.js            # LocalStorage persistence
    manager.js            # Attendance logic
    utils.js              # Working-day calculation
  ui/
    ui.js                 # UI rendering and interactions
    optionsManager.js     # User preference handling
```

## Local Usage

1. Clone the repository.
2. Serve the files or open `index.html` directly in a browser.
   - Example: `python -m http.server` and visit `http://localhost:8000`.
3. Mark attendance and explore options; all data is kept in your browser's storage.

## Features

- Mark or unmark days on a calendar and see progress toward your goal.
- Adjustable attendance goal with a progress ring and celebratory confetti when achieved.
- Options menu for theme and color customization with preset themes.
- Attendance log overlay with CSV export/import and a day-of-week graph.
- Optional geolocation reminder to mark attendance when near the office.
- Data persistence using localStorage with the ability to reset monthly or full history.
