# Attendance Tracker

A modern, client-side web application for tracking daily attendance. Built with vanilla JavaScript, it provides a comprehensive attendance management system that works entirely in your browser.

## Features

### Core Attendance Tracking
- **Interactive Calendar**: Mark or unmark attendance on any day with a click
- **Progress Tracking**: Visual progress ring showing attendance toward your goal
- **Configurable Goals**: Set attendance percentage goals (0-100%) with real-time updates
- **Working Day Calculation**: Automatically excludes weekends and holidays
- **Data Persistence**: All data stored locally using localStorage

### User Interface
- **Modern Brutalist Design**: Clean, accessible interface with customizable themes
- **Theme System**: 11 preset themes including Sunlit Cream, BSOD, Matrix, and more
- **Color Customization**: Full control over background, foreground, and accent colors
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and screen reader support

### Data Management
- **Attendance History**: Complete log of all attendance records
- **CSV Export/Import**: Backup and restore your attendance data
- **Visual Analytics**: Day-of-week attendance graph
- **Data Reset Options**: Clear monthly or full history

## Project Structure

```
attendance-tracker/
├── index.html              # Main application page
├── css/
│   └── style.css          # Application styling and themes
├── js/
│   ├── main.js            # Application entry point
│   ├── helpers.js         # Utility functions and theme definitions
│   ├── attendance/
│   │   ├── history.js     # LocalStorage persistence
│   │   ├── manager.js     # Attendance logic and calculations
│   │   └── utils.js       # Working day and holiday calculations
│   └── ui/
│       ├── ui.js          # Main UI rendering and interactions
│       └── optionsManager.js  # User preference handling
├── tests/                 # Unit tests
│   └── calculateWorkingDays.test.js
└── package.json           # Project configuration
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Local web server (recommended for best experience)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd attendance-tracker
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

If you're experiencing cache issues:
1. Open the options menu (gear icon)
2. Click "Clear cache" button
3. The page will automatically reload with fresh content

### Basic Usage
1. **Mark Attendance**: Click "Mark today's attendance" or click any day on the calendar
2. **Set Goals**: Use the gear icon to open options and adjust your attendance goal
3. **View Progress**: See your progress toward the goal with the visual progress ring
4. **Export Data**: Click "Log" to view history and export to CSV

## Customization

### Themes
The app includes 11 preset themes:
- **Sunlit Cream** (default): Clean, professional look
- **BSOD**: Classic blue screen aesthetic
- **Mint Condition**: Fresh green theme
- **Windows 98**: Retro Windows styling
- **Dracula**: Dark purple theme
- **Ultra Violet**: Vibrant purple
- **Hello Kitty**: Pink and cute
- **Matrix**: Green terminal style
- **Dark Mode**: Modern dark theme
- **Terminal**: Classic terminal look
- **Custom**: Use your own colors

### Color Customization
- **Background**: Main background color
- **Foreground**: Text and primary elements
- **Accent**: Highlights and interactive elements

## Data Management

### Export/Import
- **Export CSV**: Download your complete attendance history
- **Import CSV**: Restore data from a previously exported file
- **Format**: CSV files contain date, attendance status, and metadata

### Reset Options
- **Reset Monthly**: Clear attendance for the current month only
- **Reset All Data**: Complete data wipe for a fresh start
- **Reset Options**: Restore default theme settings

## Testing

Run the test suite to verify functionality:
```bash
npm test
```

Tests cover:
- Working day calculations (weekends and holidays)
- Holiday detection for various regions

## Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Edge**: Full support
- **Safari**: Full support

## Privacy & Security

- **Local Storage**: All data stays on your device
- **No Server Communication**: No data is sent to external servers
- **Client-Side Only**: Everything runs in your browser

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Version

Current version: v2.2.2

## Cache Management

The application uses simple version parameters to prevent cache issues:

### For CSS Changes
1. Make your changes in `css/style.css`
2. Update the version in `index.html`:
   ```html
   <link rel="stylesheet" href="css/style.css?v=2.2.3">
   ```

### Manual Cache Clearing
If you experience cache issues:
1. Open the options menu (gear icon)
2. Click "Clear cache" button
3. The page will reload with fresh content