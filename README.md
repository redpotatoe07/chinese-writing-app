# Chinese Writing App (tp-003)

iPad-optimized web application for Chinese character writing practice with Apple Pencil support.

## Project Overview

A standalone web application designed for Chinese character writing practice, optimized for iPad with Apple Pencil support. Integrates seamlessly with a comprehensive Chinese study system through URL parameters and structured results export.

## Key Features

- **iPad-Optimized Interface:** Professional HTML5 Canvas with Apple Pencil support (pressure sensitivity, palm rejection)
- **Character Practice System:** Tracks characters as Mastered/Needs Work/Not Practiced
- **Integration Ready:** Receives character lists via URL parameters
- **Results Export:** Generates structured output for study system integration
- **Offline PWA:** Works as a Progressive Web App, installable on iPad home screen

## Technical Stack

- **Frontend:** Pure HTML5, CSS3, JavaScript with Fabric.js for canvas drawing
- **Hosting:** GitHub Pages
- **PWA:** Service Worker for offline functionality

## Project Structure

```
chinese-writing-app/
├── index.html                 # Main application entry point
├── css/
│   ├── app.css               # Core application styles
│   ├── canvas.css            # Drawing canvas specific styles
│   └── ipad.css              # iPad-specific optimizations
├── js/
│   ├── app.js                # Main application logic
│   ├── canvas.js             # Drawing canvas management
│   ├── characters.js         # Character data management
│   ├── practice.js           # Practice session logic
│   ├── export.js             # Results export functionality
│   └── storage.js            # Data persistence layer
├── data/
│   ├── characters.json       # Character database
│   └── stroke-order.json     # Stroke order data (if needed)
├── assets/
│   ├── manifest.json         # PWA manifest
│   ├── service-worker.js     # Offline functionality
│   └── icons/               # App icons for PWA
└── README.md                 # This file
```

## Development Phases

### Phase 1: Core Writing Interface (MVP)
- [x] Project structure and technical foundation
- [ ] HTML5 Canvas with Fabric.js integration
- [ ] Apple Pencil input handling and optimization
- [ ] Basic character display and selection
- [ ] Simple practice tracking (mastered/needs work)
- [ ] Export functionality for results

### Phase 2: Enhanced Practice Features
- [ ] Stroke order hints and guidance
- [ ] Practice session timer and statistics
- [ ] Character information panel with details
- [ ] Local storage for practice history
- [ ] Improved UI/UX based on Phase 1 testing

### Phase 3: PWA and Offline Capabilities  
- [ ] PWA manifest and service worker
- [ ] Home screen installation capability  
- [ ] Offline character data storage
- [ ] Background sync for results
- [ ] App-like navigation and interface

## Getting Started

1. Clone the repository
2. Open `index.html` in a web browser (preferably Safari on iPad)
3. For development, use a local web server to avoid CORS issues

## Integration Workflow

1. **Character Input:** Receive character lists via URL parameters from study system
2. **Practice Session:** User practices writing characters on iPad with Apple Pencil  
3. **Results Export:** App generates structured results for easy copying
4. **Study System Integration:** Results flow back into comprehensive study system

## License

This project is part of a personal Chinese language learning system.

---

**Live App:** https://redpotatoe07.github.io/chinese-writing-app/  
**Project Code:** tp-003  
**Started:** September 7, 2025
