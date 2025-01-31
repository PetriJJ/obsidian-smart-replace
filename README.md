# Smart Replace - Obsidian Plugin

Smart Replace is a plugin for Obsidian that allows users to:
- Replace text using customizable rules, which are defined in a separate file.
- Automatically remove empty lines.
- Convert straight quotes to smart quotes.

## 🛠 Installation
1. Download `main.js`, `manifest.json`, and `styles.css` (if applicable).
2. Place them inside your Obsidian vault under `.obsidian/plugins/smart-replace/`.
3. Restart Obsidian and enable the smart-replace plugin.

## ⚙️ Features
- **Custom Replacement Rules:** Uses `replaceRules.md` for batch text replacements. The rules are applied for each line using: "findSomeText", "replaceWithThis". You can also remove text by replacing with empty: "findSomeText", ""
- **Smart Quotes:** Option to replace straight quotes with typographically correct quotes. Replaces straight quotes "" with smart quotes “”.
- **Empty Line Removal:** Removes excess blank lines.
