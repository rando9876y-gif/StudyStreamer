# StudyStream

A comprehensive, fully client-side productivity and study website built with pure HTML, CSS, and JavaScript.

## Overview

StudyStream is a complete study companion that runs 100% in the browser using localStorage for data persistence. No backend, no server code, no build tools required.

## Project Structure

```
/
├── index.html      # Main HTML file with all page structures
├── styles.css      # Complete styling with 6 theme options
├── app.js          # All JavaScript functionality
└── replit.md       # This documentation file
```

## Features

### Study Tools
- **Pomodoro Timer**: Customizable work/break durations, animated progress ring, YouTube video embedding for background music
- **Blurting Method**: Audio recording with Web Speech API transcription, compares recall against notes with accuracy scoring
- **Flashcards**: Deck management, flip animations, shuffle mode, text-to-speech, study progress tracking
- **Test Generator**: Creates fill-in-blank, true/false, and short answer questions from study material
- **Mind Map Creator**: Interactive draggable nodes with colored branches

### Organization
- **Notes**: Rich text editor with bold, italic, underline, lists; search functionality
- **Daily Checklist**: Task creation with filters (all/active/completed)
- **Habit Tracker**: Weekly tracking grid with completion streaks
- **Kanban Board**: Drag-and-drop task management across 4 columns
- **Calendar**: Monthly view with event creation and management

### Writing & Planning
- **AI Grading Tool**: Heuristic-based analysis of grammar, structure, clarity, and vocabulary
- **Writing Dashboard**: Word/character counts, reading time, draft saving and export
- **School Planner**: Course and assignment management with due dates
- **Journal**: Daily entries with mood tracking and writing prompts
- **Study Session Logger**: Time tracking with weekly statistics and charts

### Study Techniques
Detailed explanations for 14 study methods including:
- Pomodoro Technique, Active Recall, Spaced Repetition
- Feynman Technique, Interleaving, Cornell Notes
- Dual Coding, PQ4R, SQ3R, Mind Mapping, and more

### Settings & Themes
6 theme options with instant switching:
- Light (default)
- Dark
- Nord
- Solarized
- Dracula
- Monokai

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties for theming, Grid and Flexbox layouts
- **JavaScript ES6+**: Vanilla JS with modern features
- **Web APIs**:
  - localStorage for data persistence
  - Web Speech API for voice recognition
  - SpeechSynthesis for text-to-speech
  - Notification API for timer alerts
  - YouTube iframe API for video embedding

## Data Storage

All data is stored in localStorage with the following keys:
- `studystream_theme`: Current theme selection
- `studystream_flashcards`: Flashcard decks and cards
- `studystream_notes`: User notes
- `studystream_checklist`: Daily tasks
- `studystream_habits`: Habit tracking data
- `studystream_kanban`: Kanban board tasks
- `studystream_calendar`: Calendar events
- `studystream_writing`: Writing drafts
- `studystream_planner`: Courses and assignments
- `studystream_journal`: Journal entries
- `studystream_study_logs`: Study session logs
- `studystream_pomodoro`: Pomodoro completion counts

## Running the Application

The application is served using Python's built-in HTTP server:
```
python -m http.server 5000 --bind 0.0.0.0
```

## Recent Changes

- December 5, 2025: Initial complete implementation with all features
