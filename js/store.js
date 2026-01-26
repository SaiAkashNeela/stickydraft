/**
 * StickyDraft - Data Store Module
 */

const STORAGE_KEY = 'stickydraft_data_v2';

const defaultData = {
    activeTabId: null,
    tabs: [],
    theme: 'light'
};

export const store = {
    data: { ...defaultData },

    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                // Validation/Repair
                if (!this.data.tabs || !Array.isArray(this.data.tabs)) this.data.tabs = [];
                if (this.data.tabs.length === 0) this.createTab('My Board');
                if (!this.data.theme) this.data.theme = 'light';
            } catch (e) {
                console.error('Data load error', e);
                this.reset();
            }
        } else {
            this.reset();
        }
    },

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    },

    reset() {
        const tabId = crypto.randomUUID();
        this.data = {
            activeTabId: tabId,
            tabs: [{ id: tabId, title: 'My Board', notes: [] }],
            theme: 'light'
        };
        this.save();
    },

    // --- Tab Actions ---

    createTab(title = 'New Board') {
        const id = crypto.randomUUID();
        const newTab = { id, title, notes: [] };
        this.data.tabs.push(newTab);
        this.data.activeTabId = id;
        this.save();
        return id;
    },

    deleteTab(id) {
        if (this.data.tabs.length <= 1) return false; // Prevent deleting last tab

        const idx = this.data.tabs.findIndex(t => t.id === id);
        if (idx === -1) return false;

        // Switch active tab if deleting current
        if (this.data.activeTabId === id) {
            const nextTab = this.data.tabs[idx - 1] || this.data.tabs[idx + 1];
            this.data.activeTabId = nextTab.id;
        }

        this.data.tabs = this.data.tabs.filter(t => t.id !== id);
        this.save();
        return true;
    },

    duplicateTab(id) {
        const original = this.getTab(id);
        if (!original) return;

        const newId = crypto.randomUUID();
        // Deep copy notes with new IDs
        const newNotes = original.notes.map(n => ({
            ...n,
            id: crypto.randomUUID(),
            createdAt: Date.now()
        }));

        const newTab = {
            id: newId,
            title: `${original.title} (Copy)`,
            notes: newNotes
        };

        this.data.tabs.push(newTab);
        this.data.activeTabId = newId;
        this.save();
    },

    setActiveTab(id) {
        if (this.data.activeTabId === id) return false;
        this.data.activeTabId = id;
        this.save();
        return true;
    },

    updateTabTitle(id, title) {
        const tab = this.getTab(id);
        if (tab) {
            tab.title = title;
            this.save();
        }
    },

    getTab(id) {
        return this.data.tabs.find(t => t.id === id);
    },

    getActiveTab() {
        return this.getTab(this.data.activeTabId);
    },

    // --- Note Actions ---

    addNote(note) {
        const tab = this.getActiveTab();
        if (tab) {
            tab.notes.push(note);
            this.save();
        }
    },

    updateNote(id, updates) {
        const tab = this.getActiveTab();
        if (!tab) return;

        const note = tab.notes.find(n => n.id === id);
        if (note) {
            Object.assign(note, updates);
            note.updatedAt = Date.now();
            this.save();
        }
    },

    deleteNote(id) {
        const tab = this.getActiveTab();
        if (!tab) return;
        tab.notes = tab.notes.filter(n => n.id !== id);
        this.save();
    },

    moveNote(noteId, targetTabId) {
        const sourceTab = this.getActiveTab();
        const targetTab = this.getTab(targetTabId);
        if (!sourceTab || !targetTab) return;

        const idx = sourceTab.notes.findIndex(n => n.id === noteId);
        if (idx === -1) return;

        const note = sourceTab.notes[idx];
        sourceTab.notes.splice(idx, 1);

        // Reset pos for new board roughly
        const newNote = { ...note, x: 100, y: 100 };
        targetTab.notes.push(newNote);
        this.save();
    },

    copyNote(noteId, targetTabId) {
        const sourceTab = this.getActiveTab();
        const targetTab = this.getTab(targetTabId);
        if (!sourceTab || !targetTab) return;

        const note = sourceTab.notes.find(n => n.id === noteId);
        if (!note) return;

        const newNote = {
            ...note,
            id: crypto.randomUUID(),
            x: 100, y: 100,
            createdAt: Date.now()
        };
        targetTab.notes.push(newNote);
        this.save();
    },

    addNoteToTab(tabId, note) {
        const tab = this.data.tabs.find(t => t.id === tabId);
        if (tab) {
            tab.notes.push(note);
            this.save();
        }
    },

    // --- Global ---
    toggleTheme() {
        this.data.theme = (this.data.theme === 'dark' ? 'light' : 'dark');
        this.save();
        return this.data.theme;
    }
};
