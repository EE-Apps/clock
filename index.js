window.eelib = {
    leftBtn: 'none',
};

window.pages = [
    {
        id: 'alarm',
        title: 'Alarm',
        icon: 'img/other/alarm.svg',
        btns: [
            ['search'],
            ['add'],
        ],
        subcategories: ['all', 'horizontal', 'vertical', 'special'],
    },
    {
        id: 'home',
        title: 'Main',
        description: 'General Elements',
        icon: 'img/ui/home.svg',
        active: true,
        btns: [
            ['search'],
            ['add'],
            ['settings', 'img/ui/settings', 'changePage("settings")', true]
        ],
    },
    {
        id: 'timer',
        title: 'Timer',
        icon: 'img/other/timer.svg',
        btns: [
            ['search'],
            ['add'],
        ],
        subcategories: ['all', 'horizontal', 'vertical', 'special'],
    },
    {
        id: 'seconds',
        title: 'Seconds',
        icon: 'img/other/seconds.svg',
        btns: [
            ['search'],
            ['add'],
        ],
        subcategories: ['all', 'horizontal', 'vertical', 'special'],
    },
    {
        id: 'about',
        title: 'About',
        icon: 'img/ui/time.svg',
        noBottom: true,
    },
    {
        id: 'settings',
        title: 'Настройки',
        icon: 'img/ui/settings.svg',
        leftBtn: 'back',
        noBottom: true,
    },
];

// Wait for pages.js to be ready before initializing navigation
function initializeNav() {
    if (window.pagesManager && typeof window.pagesManager.createBtnList === 'function') {
        console.log('Initializing navigation...');
        window.cnavMgr.init(pages);
        window.cnavMgr.createNav(pages);
    } else {
        console.log('Waiting for pagesManager...');
        window.addEventListener('pagesManagerReady', () => {
            console.log('pagesManager ready, initializing navigation...');
            window.cnavMgr.init(pages);
            window.cnavMgr.createNav(pages);
        }, { once: true });
    }
}

// Initialize navigation
initializeNav();


// Инициализация настроек
document.addEventListener("DOMContentLoaded", () => {
window.settingsManager.init({
    storageKey: 'appSettings',
    defaultSettings: {
        clock: {
            clockFormat: "24",
            showSeconds: false,
            showDate: true,
            dateFormat: "DDMMYYYY",
            timeZone: "local",
            showDayOfWeek: true,
            leadingZero: true,
            amPm: false,
            showYear: true,
            monthAsText: false,
            dateSeparator: "/",
            jucheCalendar: false,
            worldTime: [],
            worldTimeSeconds: false,
        }
    },
    schema: {
        clock: {
        title: "Clock",
        items: [
            {
                type: "select",
                key: "clockFormat",
                label: "Clock Format",
                options: {
                    "12": "12-hour",
                    "24": "24-hour"
                }
            },
            { type: "toggle", key: "showSeconds", label: "Show Seconds" },
            { type: "toggle", key: "showDate", label: "Show Date" },
            {
                type: "select",
                key: "dateFormat",
                label: "Date Format",
                options: {
                    "DDMMYYYY": "DD/MM/YYYY",
                    "MMDDYYYY": "MM/DD/YYYY",
                    "YYYYMMDD": "YYYY/MM/DD"
                }
            },
            {
                type: "select",
                key: "timeZone",
                label: "Time Zone",
                options: {
                    local: "Local Time",
                    UTC: "UTC"
                }
            },
            { type: "toggle", key: "showDayOfWeek", label: "Show Day of the Week" },
            { type: "toggle", key: "leadingZero", label: "Leading Zero for Hours" },
            { type: "toggle", key: "amPm", label: "AM/PM Indicator" },
            { type: "toggle", key: "showYear", label: "Show Year" },
            { type: "toggle", key: "monthAsText", label: "Month as Text" },
            {
                type: "select",
                key: "dateSeparator",
                label: "Date Separator",
                options: {
                    "/": "/",
                    "-": "-",
                    ".": ".",
                    " ": "Space"
                }
            },
            { type: "toggle", key: "jucheCalendar", label: "Juche calendar" }
        ]
        },
    },
    onChange: (settings) => {
        // Вызывается при любом изменении настроек
        if (typeof updateTimeDisplay === 'function') {
        updateTimeDisplay();
        }
    }
});

// Генерация UI
settingsManager.generateUI('settings');

// Примеры использования:
// settingsManager.get('clock.clockFormat')
// settingsManager.set('clock.showSeconds', true)
// settingsManager.reset()

});
