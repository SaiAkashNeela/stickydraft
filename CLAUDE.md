# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Running the App

This is a vanilla JavaScript web application with no build process. Use any simple HTTP server:

```bash
# Python 3
python3 -m http.server 3000

# Or Node.js (npx http-server)
npx http-server -p 3000
```

Visit `http://localhost:3000` in your browser.

## Architecture Overview

StickyDraft is a modular vanilla JavaScript application using ES6 imports. The codebase is organized into three core modules:

### Module Structure

**`js/store.js`** - Data management and persistence
- Single-source-of-truth for all app state
- Handles localStorage serialization/deserialization with key `stickydraft_data_v2`
- Data structure: `{ activeTabId, tabs[], theme }`
- Each tab: `{ id, title, notes[] }`
- Each note: `{ id, title, content, x, y, width, height, color, zIndex, createdAt, updatedAt }`
- All entities use UUID identifiers (`crypto.randomUUID()`)
- Key methods: `load()`, `save()`, `reset()`, tab operations (create/delete/switch), note operations (add/update/delete/move/copy)
- Data integrity checks on load: ensures all notes have IDs, initializes empty board if needed

**`js/ui.js`** - Rendering and DOM manipulation
- Renders tabs, notes, and modal dialogs
- Manages note element creation with event listeners
- Color management via CSS variables (6 colors: yellow, blue, green, pink, purple, orange)
- Theme system (light/dark) applied via `data-theme` attribute on document root
- Toast notifications for user feedback
- Modal dialogs for help, confirmation, and other interactions
- Tracks max z-index for note layering
- Does NOT modify store directly; delegates to app.js

**`js/app.js`** - Event handling and interaction logic
- Initializes the app on DOMContentLoaded
- Manages all global event listeners (click, drag, keyboard)
- Drag handling for note repositioning with visual feedback
- Text formatting shortcuts: Cmd+B/Ctrl+B (bold), Cmd+I/Ctrl+I (italic), Cmd+U/Ctrl+U (underline) using `document.execCommand`
- Context menu for board actions (new note, new board, help, theme toggle)
- Board click handling for creating new notes
- Manages modal dialogs (help, sync, reset confirmation)
- Calls store methods to persist changes

### Data Flow

1. **User interaction** (click/drag/keyboard) → **app.js** event handler
2. **app.js** → calls **store.js** method to update state
3. **store.js** → persists to localStorage and updates in-memory `store.data`
4. **app.js** → calls **ui.js** to re-render affected DOM elements

For simple updates (note position during drag), the DOM is updated directly without re-rendering. For complex changes (new note, delete tab), full board re-render is called.

## Code Patterns & Conventions

- **IDs**: All entities (tabs, notes) use UUID from `crypto.randomUUID()`
- **Storage key**: Always use `STORAGE_KEY = 'stickydraft_data_v2'` in store.js (version 2 for data migration)
- **CSS Variables**: All colors use CSS variables (e.g., `var(--note-yellow)`)
- **Theme**: Applied via `data-theme` attribute; components use CSS selectors for light/dark variants
- **Event delegation**: Use `e.target.closest(selector)` for event target identification
- **Modal patterns**: Modals use `.hidden` class to show/hide; backdrop clicks close modals
- **Z-index management**: Use `ui.maxZIndex` to ensure dragged notes come to front; update via `ui.bringToFront(note)`

## Important Files

| File | Purpose |
|------|---------|
| `index.html` | Main HTML structure, meta tags for SEO/PWA, modal templates |
| `style.css` | All styling, including dark mode variables, note styles, animations |
| `js/app.js` | Event listeners, interaction logic, drag/drop |
| `js/store.js` | State management, localStorage persistence |
| `js/ui.js` | DOM rendering, element creation, toast/modal management |
| `manifest.json` | PWA configuration |

## Key Technical Details

- **No external dependencies**: Pure vanilla JavaScript, uses Phosphor Icons via CDN
- **localStorage limits**: Current implementation uses localStorage (typical ~5-10MB limit). Consider IndexedDB migration if user data grows significantly
- **Mobile warning**: `ui.checkMobile()` shows optimization alert on mobile devices; dismissed via `sessionStorage`
- **Text content**: Uses `contentEditable` divs for note titles and content with `document.execCommand` for formatting
- **Drag mechanics**: Tracks `draggingNoteId`, `dragOffset`, and `isDraggingActive` to manage note positioning

## Common Development Tasks

### Adding a new note property

1. Update note creation in `app.js` (line 128-136) to include new field
2. Ensure field is included in all note creation paths (board click, context menu, copy, move)
3. Add to `updateNote()` in store.js if it should be editable
4. Update `ui.createNoteElement()` to render new property if visible

### Adding a global keyboard shortcut

Add to the keydown listener in `app.js` (line 265-290). Check for correct modifier key (metaKey for Mac, ctrlKey for others).

### Adding a new tab feature

Tab operations are in `store.js` (lines 60-132). Remember to call `store.save()` after any modifications. Update `renderTabs()` in `ui.js` to display new features.

### Changing storage structure

Increment `STORAGE_KEY` version (e.g., `v3`) in store.js and add migration logic in `store.load()` to handle old data format.

## Testing Locally

- Clear browser storage: Open DevTools → Application → LocalStorage → right-click → Clear → Reload
- Inspect rendered HTML: Open DevTools → Elements tab → find notes in `#board`
- Check localStorage: Open DevTools → Application → LocalStorage → check `stickydraft_data_v2` value
- Dark mode: Toggle via theme button in UI or set `data-theme="dark"` on `<html>` in DevTools

## Performance Considerations

- Full board re-render is called via `ui.renderBoard()` for major changes (new note, delete, move between tabs)
- Drag positioning updates DOM directly without re-render (optimization to avoid lag)
- Toast notifications auto-remove after 3s to prevent memory leaks
- Modal creation/removal is immediate; no pooling
