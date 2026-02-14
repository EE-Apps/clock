class SettingsManager {
    constructor() {
        this.settings = {};
        this.storageKey = '';
        this.defaultSettings = {};
        this.schema = {};
        this.onChange = null;
    }

    // Инициализация настроек
    init({ storageKey, defaultSettings, schema, onChange = null }) {
        this.storageKey = storageKey;
        this.defaultSettings = defaultSettings;
        this.schema = schema;
        this.onChange = onChange;
        
        this.load();
        return this;
    }

    // Загрузка из localStorage
    load() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.settings = this.deepMerge(this.defaultSettings, parsed);
            } catch (e) {
                console.error('Error parsing settings:', e);
                this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
            }
        } else {
            this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        }
        window.settings = this.settings;
    }

    // Сохранение в localStorage
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            if (this.onChange) {
                this.onChange(this.settings);
            }
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    // Получение значения по пути
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.settings);
    }

    // Установка значения по пути
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.settings);
        target[lastKey] = value;
        this.save();
    }

    // Генерация UI настроек
    generateUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        Object.entries(this.schema).forEach(([sectionKey, section]) => {
            const sectionEl = document.createElement("div");
            sectionEl.className = "settings-section";

            sectionEl.innerHTML = `
                <div class="settings-header hideSettSection" data-section="sett-${sectionKey}">
                    <h2>${section.title}</h2>
                    <img src="img/ui/arrow/up.svg" style="rotate: 90deg;">
                </div>
                <div id="sett-${sectionKey}" class="settingsSectionDiv" style="height: 0px;"></div>
            `;

            sectionEl.querySelector(".hideSettSection").onclick = (e) => {
                const targetId = e.currentTarget.getAttribute("data-section");
                const targetEl = document.getElementById(targetId);
                if (targetEl.style.height === '0px') {
                    targetEl.style.height = targetEl.scrollHeight + 'px';
                    e.currentTarget.querySelector('img').style.rotate = '0deg';
                    sectionEl.classList.add('active');
                    targetEl.classList.add('active');
                } else {
                    targetEl.style.height = '0px';
                    e.currentTarget.querySelector('img').style.rotate = '90deg';
                    sectionEl.classList.remove('active');
                    targetEl.classList.remove('active');
                }
            };

            const body = sectionEl.querySelector(".settingsSectionDiv");

            section.items.forEach(item => {
                body.appendChild(this.createSettingItem(sectionKey, item));
            });

            container.appendChild(sectionEl);
        });
    }

    // Создание элемента настройки
    createSettingItem(sectionKey, item) {
        const value = this.settings[sectionKey][item.key];
        const block = document.createElement("div");
        block.className = "settingsBlock";

        if (item.type === "toggle") {
            block.innerHTML = `
                <label>${item.label}:</label>
                <label class="oneui-switch">
                    <input type="checkbox" ${value ? "checked" : ""}>
                    <span class="slider"></span>
                </label>
            `;

            block.querySelector("input").addEventListener("change", e => {
                this.set(`${sectionKey}.${item.key}`, e.target.checked);
            });
        }

        if (item.type === "select") {
            const options = Object.entries(item.options)
                .map(([v, l]) =>
                    `<option value="${v}" ${v === value ? "selected" : ""}>${l}</option>`
                ).join("");

            block.innerHTML = `
                <label>${item.label}:</label>
                <select class="settings-select">${options}</select>
            `;

            block.querySelector("select").addEventListener("change", e => {
                this.set(`${sectionKey}.${item.key}`, e.target.value);
            });
        }

        return block;
    }

    // Глубокое слияние объектов
    deepMerge(target, source) {
        const result = JSON.parse(JSON.stringify(target));
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }

    // Сброс к дефолтным настройкам
    reset() {
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        this.save();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.settingsManager = new SettingsManager();
});