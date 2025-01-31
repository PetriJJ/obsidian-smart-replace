const { Plugin, PluginSettingTab, Setting, Notice, Modal } = require("obsidian");
const fs = require("fs");

module.exports = class SmartReplacePlugin extends Plugin {
    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: "smart-replace",
            name: "Smart Replace, Remove empty lines & Smart quotes",
            editorCallback: async (editor, view) => {
                await this.processText(editor);
            },
        });

        // Ensure settings are fully loaded before adding the settings tab
        if (this.settings) {
            this.addSettingTab(new SmartReplaceSettingTab(this.app, this));
        } else {
            new Notice("Smart Replace: Failed to load settings.");
        }
    }

    async loadSettings() {
        this.settings = Object.assign({
            replaceRulesPath: "replaceRules.md",
            enableSmartQuotes: true,
            enableRemoveEmptyLines: true
        }, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async processText(editor) {
        let text = editor.getValue();

        if (this.settings.enableSmartQuotes) {
            text = this.convertSmartQuotes(text);
        }

        text = await this.applyReplacements(text);

        if (this.settings.enableRemoveEmptyLines) {
            text = text.replace(/^\s*\n/gm, "");
        }

        editor.setValue(text);
    }

    convertSmartQuotes(text) {
        text = text.replace(/\"(.*?)\"/g, "“$1”");
        text = text.replace(/\'([^']+)\'/g, "‘$1’");
        return text;
    }

    async applyReplacements(text) {
        if (!this.settings.replaceRulesPath) {
            new Notice("Smart Replace: No replacement rules file set.");
            return text;
        }

        const rulesFile = this.app.vault.getAbstractFileByPath(this.settings.replaceRulesPath);

        if (!rulesFile) {
            new Notice(`Smart Replace: File not found - ${this.settings.replaceRulesPath}`);
            return text;
        }

        try {
            const content = await this.app.vault.read(rulesFile);
            const rules = content.split("\n");

            rules.forEach(line => {
                line = line.trim();
                if (!line || line.startsWith(";") || line.startsWith("==")) return;

                const match = line.match(/^"(.*?)",\s*"(.*?)"$/);
                if (match) {
                    const search = new RegExp(match[1], "gm");
                    const replace = match[2].replace(/\\n/g, "\n");
                    text = text.replace(search, replace);
                }
            });
        } catch (error) {
            new Notice("Smart Replace: Error reading rules file.");
        }

        return text;
    }
};

class SmartReplaceSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        if (!this.plugin.settings) {
            new Notice("Plugin settings are not loaded properly.");
            return;
        }

        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("Replacement Rules File Path")
            .setDesc("Specify the path of the replacement rules file within your Obsidian vault.")
            .addText(text => text
                .setPlaceholder("replaceRules.md")
                .setValue(this.plugin.settings.replaceRulesPath || "")
                .onChange(async (value) => {
                    this.plugin.settings.replaceRulesPath = value;
                    await this.plugin.saveSettings();
                })
            )
            .addButton(button => {
                button.setButtonText("Browse").onClick(() => {
                    new FileSearchModal(this.app, this.plugin).open();
                });
            });

        new Setting(containerEl)
            .setName("Enable Smart Quotes")
            .setDesc("Convert straight quotes to smart quotes.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartQuotes)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartQuotes = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("Remove Empty Lines")
            .setDesc("Automatically remove empty lines from the text.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableRemoveEmptyLines)
                .onChange(async (value) => {
                    this.plugin.settings.enableRemoveEmptyLines = value;
                    await this.plugin.saveSettings();
                })
            );
    }
}
