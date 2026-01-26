# StickyDraft 📝

> Open-source sticky notes app. No signup, no login, no setup. Just write.

[![GitHub](https://img.shields.io/badge/GitHub-Open%20Source-black?logo=github)](https://github.com/SaiAkashNeela/stickydraft.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Website](https://img.shields.io/badge/Website-stickydraft.com-blue)](https://stickydraft.com)

## ✨ Features

- **Instant**: Open and start writing immediately - no signup required
- **Private**: Your notes stay on your device - no data sent to servers
- **Visual**: Organize thoughts spatially like physical sticky notes
- **Simple**: No unnecessary features, just pure functionality
- **Open**: 100% open source, built with web standards

### Key Capabilities

- 🎨 **6 Beautiful Colors** - Choose from yellow, blue, green, pink, purple, or orange
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📌 **Drag & Drop** - Freely position notes on your canvas
- 📐 **Resizable Notes** - Adjust note dimensions to fit your content
- 📚 **Multiple Boards** - Create separate workspaces for different projects
- ⌨️ **Text Formatting** - Bold (`Cmd+B`), Italic (`Cmd+I`), Underline (`Cmd+U`)
- 💾 **Auto-Save** - Changes saved automatically to browser storage
- 📱 **Responsive** - Works great on desktop, tablet, and mobile

## 🚀 Getting Started

### Visit the App

Head to [stickydraft.com](https://stickydraft.com) and start taking notes immediately. No installation required!

### Local Development

```bash
# Clone the repository
git clone https://github.com/SaiAkashNeela/stickydraft.com.git
cd stickydraft.com

# Start a local server (Python 3)
python3 -m http.server 3000

# Or use Node.js (if installed)
npx http-server -p 3000

# Visit http://localhost:3000
```

## 📁 Project Structure

```
stickydraft.com/
├── index.html          # Main application
├── style.css           # Styles
├── js/
│   ├── app.js          # Main app logic
│   ├── store.js        # Data storage & management
│   ├── ui.js           # UI rendering & interactions
│   └── modules/
│       └── payments.js # Payment integration
├── support/            # Donation system
├── manifest.json       # PWA manifest
├── robots.txt          # SEO robots file
└── sitemap.xml         # SEO sitemap
```

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks, pure JS
- **LocalStorage/IndexedDB** - Client-side data persistence
- **Phosphor Icons** - Beautiful icon library

## 📖 How to Use

### Creating Notes

1. **Click anywhere** on the board to create a new note
2. Use the **+** button in the floating action button area
3. Right-click and select **"New Draft"** from context menu

### Managing Notes

- **Drag** notes to reposition
- **Resize** by dragging the bottom-right corner
- **Click the menu** (⋯) for note options
- **Right-click** for quick actions
- **Delete** with the trash icon

### Organizing with Boards

- **Create new board** with the + button in the tab bar
- **Switch between boards** using the tabs at the top
- Each board is **saved independently**

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+B` / `Ctrl+B` | Bold text |
| `Cmd+I` / `Ctrl+I` | Italic text |
| `Cmd+U` / `Ctrl+U` | Underline text |

## 💾 Data & Privacy

- **All notes stored locally** in your browser
- **No server access** to your data
- **No tracking** or analytics
- **No accounts** required
- **Zero data collection**

> Your privacy is sacred. We believe note-taking apps should be simple, transparent, and put you in complete control.

## 💝 Support the Project

If you love StickyDraft and want to support ongoing development, you can donate here:

👉 [Buy Me a Coffee - Support StickyDraft](https://buymeacoffee.com/akash.neela)

Your support helps with:
- ✨ New features & improvements
- 🚀 Faster development & bug fixes
- ☁️ Infrastructure & hosting
- 🎨 Better design & UX
- 🤝 Community support

## 🐛 Issues & Feedback

Found a bug? Have a feature request? Want to contribute?

- **GitHub Issues**: [Report bugs or request features](https://github.com/SaiAkashNeela/stickydraft.com/issues)
- **Email**: [akash@stickydraft.com](mailto:akash@stickydraft.com)
- **X**: [@TheSaiAkash](https://x.com/TheSaiAkash)

## 🤝 Contributing

StickyDraft is open source and welcomes contributions! Here's how you can help:

### 1. Fork the Repository
```bash
git clone https://github.com/YOUR_USERNAME/stickydraft.com.git
cd stickydraft.com
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes
- Keep code clean and simple
- Follow existing code style
- Update relevant documentation

### 4. Test Locally
```bash
python3 -m http.server 3000
# or
npx http-server -p 3000
```

### 5. Commit & Push
```bash
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

### 6. Submit a Pull Request
- Describe your changes clearly
- Reference any related issues
- Wait for review and feedback

## 📜 License

StickyDraft is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

This means you're free to:
- ✅ Use StickyDraft for any purpose (personal, commercial)
- ✅ Modify and redistribute the code
- ✅ Include it in other projects
- ✅ Distribute modified versions

Just include the original license when redistributing.

## 🚀 Future Roadmap

- [ ] Device sync across browsers/devices
- [ ] Collaborative boards (real-time collaboration)
- [ ] Note encryption
- [ ] Export to PDF/Markdown
- [ ] Plugins system
- [ ] Custom keyboard shortcuts
- [ ] Note templates
- [ ] Search functionality
- [ ] Tags & filtering
- [ ] Mobile apps

## 👨‍💻 About the Creator

Hi, I'm **Akash** – an indie hacker building tools that get out of your way.

I created StickyDraft because I got tired of complex note-taking apps. Sometimes you just need to dump thoughts quickly, organize them on a canvas, and move on. No bloat. No login screens. No algorithms.

- 🌐 Website: [stickydraft.com](https://stickydraft.com)
- 🐙 GitHub: [@SaiAkashNeela](https://github.com/SaiAkashNeela)
- ❌ X: [@TheSaiAkash](https://x.com/TheSaiAkash)
- 📧 Email: [akash@stickydraft.com](mailto:akash@stickydraft.com)

## 🎯 Fun Facts

- Built with **zero dependencies** - just vanilla JavaScript
- **First commit**: January 2026
- **Inspired by**: Physical sticky notes, Figma's canvas, and the desire for simplicity
- **Design philosophy**: Less is more

## 📚 Resources

- [StickyDraft Website](https://stickydraft.com)
- [GitHub Repository](https://github.com/SaiAkashNeela/stickydraft.com)
- [Report Issues](https://github.com/SaiAkashNeela/stickydraft.com/issues)
- [Discussions](https://github.com/SaiAkashNeela/stickydraft.com/discussions)

## ❤️ Thank You!

Thanks for using StickyDraft! Whether you're a user, contributor, or just curious about the project, your support means the world.

---

**Made with ❤️ by Akash Neela**

*StickyDraft is open source and free to use. No ads, no tracking, no strings attached.*
