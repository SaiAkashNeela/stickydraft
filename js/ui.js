/**
 * StickyDraft - UI Module (Polished)
 */
import { store } from './store.js';

const COLORS = [
    'var(--note-yellow)', 'var(--note-blue)', 'var(--note-green)',
    'var(--note-pink)', 'var(--note-purple)', 'var(--note-orange)'
];

// Cache DOM
const board = document.getElementById('board');
const tabsContainer = document.getElementById('tabs-container');

export const ui = {
    maxZIndex: 1,

    init() {
        // Create Toast Container
        const tc = document.createElement('div');
        tc.className = 'toast-container';
        document.body.appendChild(tc);
        this.toastContainer = tc;

        this.checkMobile();
    },

    checkMobile() {
        if (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Check if already dismissed in this session
            if (!sessionStorage.getItem('mobile_warning_dismissed')) {
                this.showMobileWarning();
            }
        }
    },

    showMobileWarning() {
        const backdrop = document.createElement('div');
        backdrop.className = 'delete-dialog-backdrop mobile-warning-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.zIndex = '20000';
        backdrop.style.background = 'rgba(0,0,0,0.85)';
        backdrop.innerHTML = `
            <div class="delete-card" style="max-width: 90%; width: 350px;">
                <h4 style="color: #d97706; margin-bottom: 12px;"><i class="ph ph-warning"></i> Optimization Alert</h4>
                <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text-primary); margin-bottom: 20px;">
                    This site is not properly optimized for mobile devices yet.
                    <br><br>
                    We suggest using a <b>Laptop/Desktop</b> or a <b>Tablet</b> for the best experience.
                </p>
                <div class="confirm-btn-group" style="justify-content: center;">
                    <button class="confirm-btn yes" style="background: var(--primary-color); width: 100%;">I Understand</button>
                </div>
            </div>
        `;

        backdrop.querySelector('.yes').addEventListener('click', (e) => {
            e.stopPropagation();
            sessionStorage.setItem('mobile_warning_dismissed', 'true');
            backdrop.remove();
        });

        document.body.appendChild(backdrop);
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', store.data.theme);
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.innerHTML = store.data.theme === 'dark'
                ? '<i class="ph ph-sun"></i>'
                : '<i class="ph ph-moon"></i>';
        }
    },

    showToast(message, icon = 'ph-check-circle') {
        const el = document.createElement('div');
        el.className = 'toast';
        el.innerHTML = `<i class="ph ${icon}"></i> ${message}`;
        this.toastContainer.appendChild(el);

        // Animate in
        requestAnimationFrame(() => el.classList.add('visible'));

        // Remove
        setTimeout(() => {
            el.classList.remove('visible');
            setTimeout(() => el.remove(), 300);
        }, 3000);
    },

    // --- Tabs ---

    renderTabs() {
        if (!tabsContainer) return;
        tabsContainer.innerHTML = '';

        store.data.tabs.forEach(tab => {
            const el = document.createElement('div');
            el.className = `tab ${tab.id === store.data.activeTabId ? 'active' : ''}`;

            // Title Input
            const input = document.createElement('input');
            input.value = tab.title;
            input.readOnly = true;

            // Tab Menu Button (Three dots vertical)
            const menuBtn = document.createElement('button');
            menuBtn.className = 'tab-menu-btn';
            menuBtn.innerHTML = '<i class="ph ph-dots-three-vertical"></i>';
            // Align: Remove manual margins, rely on flex gap in CSS
            menuBtn.style.cssText = 'background:none; border:none; cursor:pointer; opacity:0.5; padding:4px; display:flex; align-items:center; color:inherit;';

            // Events
            el.addEventListener('click', (e) => {
                if (e.target.closest('.tab-menu-btn')) return;

                const becameActive = store.setActiveTab(tab.id);
                if (becameActive) {
                    this.renderTabs();
                    this.renderBoard();
                    return; // element will re-render
                }

                // Already active: allow single-click title edit
                if (e.target === input) {
                    input.readOnly = false;
                    input.focus();
                    input.select();
                    el.classList.add('editing');
                }
            });

            el.addEventListener('dblclick', () => {
                input.readOnly = false;
                input.focus();
                input.select();
                el.classList.add('editing');
            });

            const saveTitle = () => {
                input.readOnly = true;
                store.updateTabTitle(tab.id, input.value || 'Untitled');
                el.classList.remove('editing');
            };
            input.addEventListener('blur', saveTitle);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                } else if (e.key === 'Escape') {
                    input.blur();
                }
                // Allow backspace and delete to work normally
                e.stopPropagation();
            });

            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showBoardContextMenu(e, tab.id);
            });

            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Ensure correct positioning relative to button
                this.showBoardContextMenu(e, tab.id, menuBtn);
            });

            el.appendChild(input);
            el.appendChild(menuBtn);
            tabsContainer.appendChild(el);
        });

        // Add Button - only initialize once
        const addBtn = document.getElementById('add-tab-btn');
        if (addBtn && !addBtn.hasListener) {
            addBtn.hasListener = true;
            addBtn.addEventListener('click', () => {
                store.createTab();
                this.renderTabs();
                this.renderBoard();
                setTimeout(() => {
                    tabsContainer.scrollLeft = tabsContainer.scrollWidth;
                }, 50);
            });
        }
    },

    // --- Board / Notes ---

    renderBoard() {
        const tab = store.getActiveTab();
        const notes = tab ? tab.notes : [];

        if (notes.length > 0) {
            this.maxZIndex = Math.max(...notes.map(n => n.zIndex || 1), 1);
        } else {
            this.maxZIndex = 1;
        }

        document.querySelectorAll('.note').forEach(el => el.remove());

        notes.forEach(note => {
            board.appendChild(this.createNoteElement(note));
        });
    },

    createNoteElement(note) {
        const el = document.createElement('div');
        el.className = 'note';
        el.id = note.id;
        el.style.left = `${note.x}px`;
        el.style.top = `${note.y}px`;
        el.style.width = `${note.width || 260}px`;
        el.style.height = `${note.height || 260}px`;
        el.style.backgroundColor = note.color;
        el.style.zIndex = note.zIndex;
        el.style.animation = 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        el.innerHTML = `
            <div class="note-header">
                <input class="note-title-input" placeholder="Title" value="${note.title || ''}">
                <button class="menu-btn" title="Options">
                    <i class="ph ph-dots-three-outline"></i>
                </button>
            </div>
            <div class="note-content-editable" contenteditable="true" placeholder="Write something...">${note.content}</div>
            <div class="note-footer-tip">✏️ Use keyboard shortcuts for text formatting</div>
        `;

        const titleInput = el.querySelector('.note-title-input');
        const contentDiv = el.querySelector('.note-content-editable');

        const saveUpdate = () => {
            store.updateNote(note.id, {
                title: titleInput.value,
                content: contentDiv.innerHTML,
                width: parseInt(el.style.width) || el.offsetWidth,
                height: parseInt(el.style.height) || el.offsetHeight
            });
        };

        titleInput.addEventListener('input', saveUpdate);
        contentDiv.addEventListener('input', saveUpdate);

        new ResizeObserver(() => {
            store.updateNote(note.id, {
                width: parseInt(el.style.width) || el.offsetWidth,
                height: parseInt(el.style.height) || el.offsetHeight
            });
        }).observe(el);

        const onInteract = () => this.bringToFront(note);
        el.addEventListener('mousedown', onInteract);
        el.addEventListener('touchstart', onInteract, { passive: true });

        // Single click anywhere on note to focus content (except title and menu button)
        el.addEventListener('click', (e) => {
            const isTitle = e.target.closest('.note-title-input');
            const isMenu = e.target.closest('.menu-btn');
            const isFooter = e.target.closest('.note-footer-tip');

            if (!isTitle && !isMenu && !isFooter) {
                e.stopPropagation();
                contentDiv.focus();
            }
        });

        el.querySelector('.menu-btn').addEventListener('click', (e) => {
            this.showNoteMenu(e, note.id);
        });

        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showNoteContextMenu(e, note.id);
        });

        return el;
    },

    bringToFront(note) {
        if (note.zIndex === this.maxZIndex) return;
        this.maxZIndex++;
        store.updateNote(note.id, { zIndex: this.maxZIndex });
        const el = document.getElementById(note.id);
        if (el) el.style.zIndex = this.maxZIndex;
    },

    // --- Menus ---

    closeAllMenus() {
        document.querySelectorAll('.dropdown-menu, .context-menu').forEach(el => {
            if (el.id === 'context-menu') el.classList.add('hidden');
            else el.remove();
        });
    },

    showBoardContextMenu(e, tabId, relativeEl = null) {
        this.closeAllMenus();
        e.stopPropagation();

        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';

        const actions = [
            {
                icon: 'ph-pencil-simple', label: 'Rename', action: () => {
                    this.renderTabs();
                    this.showToast('Double-click tab name to rename!', 'ph-info');
                }
            },
            {
                icon: 'ph-copy', label: 'Duplicate', action: () => {
                    store.duplicateTab(tabId);
                    this.renderTabs();
                    this.renderBoard();
                    this.showToast('Board duplicated');
                }
            },
            {
                icon: 'ph-trash', label: 'Delete', danger: true, action: () => {
                    this.confirmDeleteBoard(tabId);
                }
            }
        ];

        actions.forEach(item => {
            const div = document.createElement('div');
            div.className = `menu-item ${item.danger ? 'danger' : ''}`;
            div.innerHTML = `<i class="ph ${item.icon}"></i> ${item.label}`;
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                item.action();
                this.closeAllMenus();
            });
            menu.appendChild(div);
        });

        let x, y;
        if (relativeEl) {
            const r = relativeEl.getBoundingClientRect();
            x = r.left;
            y = r.bottom + 4;
        } else {
            x = e.clientX;
            y = e.clientY;
        }

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        document.body.appendChild(menu);
    },

    showNoteMenu(e, noteId) {
        e.stopPropagation();
        this.closeAllMenus();

        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';

        // Colors
        const colorRow = document.createElement('div');
        colorRow.className = 'color-row';
        COLORS.forEach(color => {
            const dot = document.createElement('div');
            dot.className = 'menu-color-dot';
            dot.style.backgroundColor = color;
            dot.addEventListener('click', (ev) => {
                ev.stopPropagation();
                store.updateNote(noteId, { color });
                const el = document.getElementById(noteId);
                if (el) el.style.backgroundColor = color;
            });
            colorRow.appendChild(dot);
        });

        // Custom Color
        const addBtn = document.createElement('div');
        addBtn.className = 'add-color-btn';
        addBtn.innerHTML = '<i class="ph ph-plus"></i>';
        const input = document.createElement('input');
        input.type = 'color';
        input.style.display = 'none';
        input.addEventListener('change', (ev) => {
            store.updateNote(noteId, { color: ev.target.value });
            const el = document.getElementById(noteId);
            if (el) el.style.backgroundColor = ev.target.value;
        });
        addBtn.appendChild(input);
        addBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            input.click();
        });
        colorRow.appendChild(addBtn);
        menu.appendChild(colorRow);

        // Standard Options
        const moveItem = document.createElement('div');
        moveItem.className = 'menu-item';
        moveItem.innerHTML = `<i class="ph ph-arrow-square-out"></i> Move to...`;
        moveItem.onclick = () => {
            this.closeAllMenus();
            this.showBoardSelectionModal('move', noteId);
        };
        menu.appendChild(moveItem);

        const copyItem = document.createElement('div');
        copyItem.className = 'menu-item';
        copyItem.innerHTML = `<i class="ph ph-copy"></i> Copy to...`;
        copyItem.onclick = () => {
            this.closeAllMenus();
            this.showBoardSelectionModal('copy', noteId);
        };
        menu.appendChild(copyItem);

        // Duplicate Note
        const duplicateItem = document.createElement('div');
        duplicateItem.className = 'menu-item';
        duplicateItem.innerHTML = `<i class="ph ph-copy"></i> Duplicate`;
        duplicateItem.onclick = () => {
            this.closeAllMenus();
            const note = store.getActiveTab().notes.find(n => n.id === noteId);
            if (note) {
                const newNote = {
                    ...note,
                    id: crypto.randomUUID(),
                    x: note.x + 20,
                    y: note.y + 20,
                    createdAt: Date.now()
                };
                store.addNoteToTab(store.data.activeTabId, newNote);
                this.renderBoard();
                this.showToast('Note duplicated', 'ph-copy');
            }
        };
        menu.appendChild(duplicateItem);

        // Delete
        const delItem = document.createElement('div');
        delItem.className = 'menu-item danger';
        delItem.innerHTML = '<i class="ph ph-trash"></i> Delete';
        delItem.addEventListener('click', (ev) => {
            ev.stopPropagation();
            this.confirmDeleteUI(noteId);
            this.closeAllMenus();
        });
        menu.appendChild(delItem);

        const rect = e.currentTarget.getBoundingClientRect();
        menu.style.top = `${rect.bottom + 8}px`;
        menu.style.left = `${rect.right - 180}px`;
        document.body.appendChild(menu);
    },

    createSubmenuItem(label, icon, callback) {
        const item = document.createElement('div');
        item.className = 'menu-item';
        item.innerHTML = `<i class="ph ${icon}"></i> ${label}`;

        const sub = document.createElement('div');
        sub.className = 'submenu';

        const otherTabs = store.data.tabs.filter(t => t.id !== store.data.activeTabId);
        if (otherTabs.length === 0) {
            sub.innerHTML = '<div style="padding:8px; color:#999; font-size:0.8rem">No other boards</div>';
        } else {
            otherTabs.forEach(t => {
                const li = document.createElement('div');
                li.className = 'menu-item';
                li.textContent = t.title;
                li.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    callback(t.id);
                    this.closeAllMenus();
                });
                sub.appendChild(li);
            });
        }
        item.appendChild(sub);
        return item;
    },

    showNoteContextMenu(e, noteId) {
        this.closeAllMenus();
        const menu = document.createElement('div');
        menu.className = 'context-menu';

        // No Format Options - Just Actions as requested
        const del = document.createElement('div');
        del.className = 'ctx-item';
        del.style.color = '#ef4444';
        del.innerHTML = `<i class="ph ph-trash"></i> Delete`;
        del.addEventListener('click', () => {
            this.confirmDeleteUI(noteId);
            this.closeAllMenus();
        });
        menu.appendChild(del);

        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        document.body.appendChild(menu);
    },

    confirmDeleteUI(id) {
        const el = document.getElementById(id);
        if (!el || el.querySelector('.delete-dialog-backdrop')) return;

        const backdrop = document.createElement('div');
        backdrop.className = 'delete-dialog-backdrop';
        backdrop.innerHTML = `
            <div class="delete-card">
                <h4>Delete this sticky?</h4>
                <div class="confirm-btn-group" style="justify-content: center;">
                    <button class="confirm-btn yes">Delete</button>
                    <button class="confirm-btn no">Keep</button>
                </div>
            </div>
        `;

        backdrop.querySelector('.yes').addEventListener('click', (e) => {
            e.stopPropagation();
            store.deleteNote(id);
            this.renderBoard();
            this.showToast('Sticky deleted', 'ph-trash');
        });
        backdrop.querySelector('.no').addEventListener('click', (e) => {
            e.stopPropagation();
            backdrop.remove();
        });

        el.appendChild(backdrop);
    },

    confirmDeleteBoard(tabId) {
        // Create a modal dialog
        const backdrop = document.createElement('div');
        backdrop.className = 'delete-dialog-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.zIndex = '10002';
        backdrop.innerHTML = `
            <div class="delete-card">
                <h4>Delete this board?</h4>
                <p style="font-size: 0.9rem; color: #6B1D1D; margin: 8px 0 12px 0;">All notes will be gone.</p>
                <div class="confirm-btn-group" style="justify-content: center;">
                    <button class="confirm-btn yes">Delete Board</button>
                    <button class="confirm-btn no">Cancel</button>
                </div>
            </div>
        `;

        backdrop.querySelector('.yes').addEventListener('click', (e) => {
            e.stopPropagation();
            store.deleteTab(tabId);
            this.renderTabs();
            this.renderBoard();
            this.showToast('Board deleted', 'ph-trash');
            backdrop.remove();
        });

        backdrop.querySelector('.no').addEventListener('click', (e) => {
            e.stopPropagation();
            backdrop.remove();
        });

        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.remove();
            }
        });

        document.body.appendChild(backdrop);
    },

    showResetConfirmation() {
        const backdrop = document.createElement('div');
        backdrop.className = 'delete-dialog-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.zIndex = '10002';
        backdrop.innerHTML = `
            <div class="delete-card">
                <h4>Reset Everything?</h4>
                <p style="font-size: 0.9rem; color: #6B1D1D; margin: 8px 0 12px 0;">This will delete all boards and notes. This action cannot be undone.</p>
                <div class="confirm-btn-group" style="justify-content: center;">
                    <button class="confirm-btn yes">Delete All</button>
                    <button class="confirm-btn no">Cancel</button>
                </div>
            </div>
        `;

        backdrop.querySelector('.yes').addEventListener('click', (e) => {
            e.stopPropagation();
            // Reset everything
            localStorage.clear();
            store.data = {
                tabs: [{ id: crypto.randomUUID(), title: 'Board 1', notes: [] }],
                activeTabId: store.data.tabs[0].id,
                theme: store.data.theme
            };
            store.save();
            this.renderTabs();
            this.renderBoard();
            this.showToast('Everything reset', 'ph-arrow-clockwise');
            backdrop.remove();
        });

        backdrop.querySelector('.no').addEventListener('click', (e) => {
            e.stopPropagation();
            backdrop.remove();
        });

        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.remove();
            }
        });

        document.body.appendChild(backdrop);
    },

    showBoardSelectionModal(action, noteId) {
        const tab = store.getActiveTab();

        // Create modal container like help modal
        let modalOverlay = document.getElementById('board-selection-overlay');
        if (modalOverlay) modalOverlay.remove();

        modalOverlay = document.createElement('div');
        modalOverlay.id = 'board-selection-overlay';
        modalOverlay.className = 'modal hidden';

        // Filter to exclude current board
        const otherBoards = store.data.tabs.filter(t => t.id !== store.data.activeTabId);

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${action === 'copy' ? '📋 Copy to Board' : '➡️ Move to Board'}</h2>
            </div>
            <div class="board-selection-list" id="board-list">
                ${otherBoards.length === 0 ? '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No other boards available</p>' : otherBoards.map(t => `
                    <div class="board-item" data-tab-id="${t.id}">
                        <span style="font-weight: 500; color: var(--text-primary);">${t.title}</span>
                    </div>
                `).join('')}
            </div>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Show modal
        modalOverlay.classList.remove('hidden');

        // Handle board selections
        const boardItems = modalOverlay.querySelectorAll('.board-item');
        boardItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetTabId = item.dataset.tabId;

                if (action === 'copy') {
                    store.copyNote(noteId, targetTabId);
                    this.showToast('Note copied', 'ph-copy');
                } else if (action === 'move') {
                    store.moveNote(noteId, targetTabId);
                    this.renderBoard();
                    this.showToast('Note moved', 'ph-arrow-right');
                }

                modalOverlay.classList.add('hidden');
                setTimeout(() => modalOverlay.remove(), 300);
            });
        });

        // Close on background click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
                setTimeout(() => modalOverlay.remove(), 300);
            }
        });
    }
};
