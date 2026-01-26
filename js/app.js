/**
 * StickyDraft - App Module
 */
import { store } from './store.js';
import { ui } from './ui.js';

// Global State for Interactions
let draggingNoteId = null;
let dragOffset = { x: 0, y: 0 };
let isDraggingActive = false;

// Main Init
document.addEventListener('DOMContentLoaded', () => {
    store.load();
    ui.init();
    ui.applyTheme();
    ui.renderTabs();
    ui.renderBoard();

    setupGlobalListeners();
});

function setupGlobalListeners() {
    const board = document.getElementById('board');
    const fabSync = document.getElementById('fab-sync');
    const syncModal = document.getElementById('sync-modal');
    const closeSyncModal = document.getElementById('close-sync-modal');
    const themeToggle = document.getElementById('theme-toggle');
    const helpToggle = document.getElementById('help-toggle');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.getElementById('close-modal');
    const contextMenu = document.getElementById('context-menu');
    const donateBtn = document.querySelector('.donate-btn');

    // Donate Button - Redirect to Buy Me a Coffee
    if (donateBtn) {
        donateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://buymeacoffee.com/akash.neela', '_blank');
        });
    }

    // FAB Sync Button (now "How to")
    if (fabSync) {
        fabSync.addEventListener('click', () => {
            if (helpModal) helpModal.classList.remove('hidden');
        });
    }

    // Close Sync Modal
    if (closeSyncModal) {
        closeSyncModal.addEventListener('click', () => {
            if (syncModal) syncModal.classList.add('hidden');
        });
    }

    if (syncModal) {
        syncModal.addEventListener('click', (e) => {
            if (e.target === syncModal) syncModal.classList.add('hidden');
        });
    }

    // FAB Menu Button - Reset Everything
    // (Removed - no longer needed)

    // Theme
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            store.toggleTheme();
            ui.applyTheme();
        });
    }

    // Help Modal
    if (helpToggle) {
        helpToggle.onclick = (e) => {
            e.stopPropagation();
            if (helpModal) helpModal.classList.remove('hidden');
        };
    }
    if (helpModal) {
        if (closeModal) closeModal.onclick = () => helpModal.classList.add('hidden');

        // Close on backdrop click (clicking outside the modal content)
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.add('hidden');
        });

        // Clear Data Button
        const clearDataBtn = document.getElementById('clear-data-btn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ui.showResetConfirmation();
            });
        }

        // Tabs
        const tabs = document.querySelectorAll('.modal-tab');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.tab;
                document.querySelectorAll('.modal-pane').forEach(p => p.classList.remove('active'));
                const pane = document.getElementById(`pane-${target}`);
                if (pane) pane.classList.add('active');
            });
        });
    }

    // Board Click (Create Note)
    board.addEventListener('click', (e) => {
        if (isDraggingActive) {
            isDraggingActive = false;
            return;
        }

        // Close Menus if click is strictly on board
        ui.closeAllMenus();
        if (contextMenu) contextMenu.classList.add('hidden');

        // Check targets
        if (e.target.closest('.note') || e.target.closest('.modal-content') || e.target.closest('.tab-bar')) return;
        if (contextMenu && !contextMenu.classList.contains('hidden') && contextMenu.contains(e.target)) return;

        if (e.target === board || e.target.id === 'empty-state' || e.target.closest('.app-background-brand')) {
            const note = {
                id: crypto.randomUUID(),
                title: '', content: '',
                x: e.clientX - 130, y: e.clientY - 130,
                width: 260, height: 260,
                color: 'var(--note-yellow)',
                zIndex: ui.maxZIndex + 1,
                createdAt: Date.now()
            };
            store.addNote(note);
            // Optimization: Just append instead of full re-render? For now full render is safer for sync
            const el = ui.createNoteElement(note);
            board.appendChild(el);
            setTimeout(() => {
                const input = el.querySelector('.note-title-input');
                if (input) input.focus();
            }, 50);
        }
    });

    // Board Context Menu
    board.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.note')) return; // Let note context handle
        e.preventDefault();

        if (contextMenu) {
            contextMenu.classList.remove('hidden');
            let x = e.clientX;
            let y = e.clientY;
            // Bounds
            if (x + 220 > window.innerWidth) x -= 220;
            if (y + 200 > window.innerHeight) y -= 200;
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
        }
    });

    // Board Context Actions
    if (contextMenu) {
        contextMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = e.target.closest('.ctx-item');
            if (!item) return;
            const action = item.dataset.action;

            if (action === 'new-note') {
                const note = {
                    id: crypto.randomUUID(),
                    title: '', content: '',
                    x: window.innerWidth / 2 - 130, y: window.innerHeight / 2 - 130,
                    width: 260, height: 260,
                    color: 'var(--note-yellow)', createdAt: Date.now()
                };
                store.addNote(note);
                ui.renderBoard();
            } else if (action === 'help') {
                if (helpModal) helpModal.classList.remove('hidden');
            } else if (action === 'new-board') {
                store.createTab();
                ui.renderTabs();
                ui.renderBoard();
            } else if (action === 'theme') {
                store.toggleTheme();
                ui.applyTheme();
            }
            contextMenu.classList.add('hidden');
        });
    }

    // Dragging
    window.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
}

function handleDragStart(e) {
    const target = e.target;
    // Don't drag if interacting with controls
    if (target.closest('button') || target.closest('input') || target.closest('textarea') ||
        target.closest('.note-content-editable') || target.closest('.delete-dialog-backdrop') ||
        target.closest('.modal-content') || target.closest('.dropdown-menu') || target.closest('.context-menu')) {
        return;
    }

    const noteEl = target.closest('.note');
    if (!noteEl) return;

    // Resize check
    const rect = noteEl.getBoundingClientRect();
    if (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    draggingNoteId = noteEl.id;
    dragOffset.x = clientX - rect.left;
    dragOffset.y = clientY - rect.top;
    isDraggingActive = false;

    noteEl.classList.add('dragging');
    const note = store.getActiveTab().notes.find(n => n.id === draggingNoteId);
    if (note) ui.bringToFront(note);
}

function handleDragMove(e) {
    if (!draggingNoteId) return;
    e.preventDefault();
    isDraggingActive = true;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const noteEl = document.getElementById(draggingNoteId);
    if (noteEl) {
        const newX = clientX - dragOffset.x;
        const newY = clientY - dragOffset.y;
        noteEl.style.left = `${newX}px`;
        noteEl.style.top = `${newY}px`;
    }
}

function handleDragEnd(e) {
    if (draggingNoteId) {
        const noteEl = document.getElementById(draggingNoteId);
        if (noteEl) {
            noteEl.classList.remove('dragging');
            store.updateNote(draggingNoteId, {
                x: parseInt(noteEl.style.left),
                y: parseInt(noteEl.style.top)
            });
        }
        draggingNoteId = null;
        setTimeout(() => { isDraggingActive = false; }, 50);
    }
}

// Keyboard Shortcuts for Text Formatting
document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlCmd = isMac ? e.metaKey : e.ctrlKey;

    // Check if we're in a note content area
    const contentDiv = document.activeElement?.closest?.('.note-content-editable');
    if (!contentDiv) return;

    // Cmd+B / Ctrl+B = Bold
    if (isCtrlCmd && e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold', false, null);
    }

    // Cmd+I / Ctrl+I = Italic
    if (isCtrlCmd && e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic', false, null);
    }

    // Cmd+U / Ctrl+U = Underline
    if (isCtrlCmd && e.key === 'u') {
        e.preventDefault();
        document.execCommand('underline', false, null);
    }
});

