const forTime = document.querySelector('#home .page-header');
forTime.innerHTML = '';
const timeDiv = document.createElement('div');
timeDiv.id = 'timeDiv';

const timeHours = document.createElement('h1');
    timeHours.className = 'timeHours';
const timeMinutes = document.createElement('h1');
    timeMinutes.className = 'timeMinutes';
const timeSeconds = document.createElement('h1');
    timeSeconds.className = 'timeSeconds';

const dateDiv = document.createElement('h3');

timeDiv.appendChild(timeHours);
timeDiv.appendChild(timeMinutes);
timeDiv.appendChild(timeSeconds);

forTime.appendChild(timeDiv);
forTime.appendChild(dateDiv);

function updateTimeDisplay() {
    const time = formatTime();
    
    // Update hours
    if (timeHours) {
        timeHours.textContent = time.hours;
    }
    
    // Update minutes
    if (timeMinutes) {
        timeMinutes.textContent = ` :${time.minutes}`;
        if (settings.clock.showSeconds) {
            timeMinutes.textContent += ':';
        }
        if (settings.clock.clockFormat === '12' && settings.clock.amPm) {
            timeMinutes.textContent += time.ampm;
        }
    }
    
    // Update seconds
    if (timeSeconds) {
        if (settings.clock.showSeconds) {
            timeSeconds.style.display = 'inline';
            timeSeconds.textContent = time.seconds;
        } else {
            timeSeconds.style.display = 'none';
        }
    }
    
    // Update date
    if (dateDiv) {
        dateDiv.textContent = formatDate();
    }
}

const worldTimeDiv = document.getElementById('worldTime');

// Функция экранирования HTML для защиты от XSS
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

let worldTimeElements = [];

function updateWorldTime() {
    if (!worldTimeDiv || 
        !window.settings?.clock?.worldTime || 
        !Array.isArray(settings.clock.worldTime)) {
        return;
    }

    const cities = settings.clock.worldTime;
    const now = new Date();
    const offsetUser = -now.getTimezoneOffset(); // Смещение пользователя в минутах от UTC

    // Инициализация элементов при изменении количества городов
    if (worldTimeElements.length !== cities.length) {
        worldTimeDiv.innerHTML = '';
        worldTimeElements = cities.map((place) => {
            const item = document.createElement('div');
            item.className = 'world-clock-item';

            const left = document.createElement('div');
            const right = document.createElement('div');
            left.className = 'leftBlock';
            right.className = 'rightBlock';
            
            const cityName = document.createElement('h2');
            cityName.className = 'cityName';
            cityName.textContent = `${escapeHtml(place.name)}:`;
            
            const diffEl = document.createElement('p');
            diffEl.className = 'time-diff';
            diffEl.textContent = 'загрузка...';
            
            const timeEl = document.createElement('h1');
            timeEl.className = 'timeOfCity';

            left.append(cityName, diffEl);
            right.append(timeEl);
            
            item.append(left, right);
            worldTimeDiv.appendChild(item);
            
            return { timeEl, diffEl };
        });
    }

    // Обновление для каждого города
    cities.forEach((place, index) => {
        const { timeEl, diffEl } = worldTimeElements[index];
        if (!timeEl || !diffEl) return;

        try {
            // === ОПРЕДЕЛЕНИЕ АКТУАЛЬНОГО ЧАСОВОГО ПОЯСА (с учётом DST) ===
            let zone = place.zone?.[0] || 'GMT0';
            if (Array.isArray(place.zone) && place.zone.length > 1) {
                // Расчёт последнего воскресенья марта и октября для DST (Европа/СНГ)
                const getDSTTransition = (month) => {
                    const date = new Date(now.getFullYear(), month, 31);
                    while (date.getDay() !== 0) date.setDate(date.getDate() - 1);
                    return date;
                };
                const dstStart = getDSTTransition(2); // Март
                const dstEnd = getDSTTransition(9);   // Октябрь
                
                if (now >= dstStart && now < dstEnd) {
                    zone = place.zone[1];
                }
            }

            // === ПАРСИНГ СМЕЩЕНИЯ С ПОДДЕРЖКОЙ СЛОЖНЫХ ФОРМАТОВ ===
            let totalOffsetMinutes = 0;
            const offsetMatch = zone.match(/GMT\s*([+-]\d+)(?::(\d+))?/i) || 
                               zone.match(/([+-]\d+)(?::(\d+))?/);
            
            if (offsetMatch) {
                const hours = parseInt(offsetMatch[1]) || 0;
                const mins = parseInt(offsetMatch[2]) || 0;
                totalOffsetMinutes = hours * 60 + (hours >= 0 ? mins : -mins);
            } else {
                // Резервный парсинг для "UTC+3", "Etc/GMT-5" и подобных
                const clean = zone.replace(/[^0-9+\-.]/g, '');
                const num = parseFloat(clean);
                if (!isNaN(num)) totalOffsetMinutes = num * 60;
            }

            // === РАСЧЁТ РАЗНИЦЫ С ЛОКАЛЬНЫМ ВРЕМЕНЕМ ===
            const diffMinutes = totalOffsetMinutes - offsetUser;
            updateDiffDisplay(diffEl, diffMinutes);

            // === РАСЧЁТ И ОТОБРАЖЕНИЕ ВРЕМЕНИ ГОРОДА ===
            const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
            const cityTime = new Date(utcNow + (totalOffsetMinutes * 60000));
            
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: settings.clock?.clockFormat === '12'
            };
            
            if (settings.clock?.worldTimeSeconds) {
                options.second = '2-digit';
            }
            
            timeEl.textContent = cityTime.toLocaleTimeString('en-US', options);
            
        } catch (e) {
            console.error(`Ошибка обновления времени для ${place.name}:`, e);
            if (timeEl) timeEl.textContent = '--:--';
            if (diffEl) diffEl.textContent = 'ошибка';
            diffEl.classList.add('error');
        }
    });
}

// Вспомогательная функция для форматирования разницы с правильным склонением
function updateDiffDisplay(element, diffMinutes) {
    element.classList.remove('error', 'current');
    
    if (Math.abs(diffMinutes) < 1) { // Учитываем погрешность в 1 минуту
        element.textContent = 'совпадает';
        element.classList.add('current');
        return;
    }

    const absDiff = Math.abs(diffMinutes);
    const hours = Math.floor(absDiff / 60);
    const minutes = absDiff % 60;
    const direction = diffMinutes > 0 ? 'позже' : 'раньше';
    
    // Формируем части текста с правильным склонением для часов
    const parts = [];
    
    if (hours > 0) {
        // Склонение "час"/"часа"/"часов"
        let hourWord = 'часов';
        if (hours % 10 === 1 && hours % 100 !== 11) hourWord = 'час';
        else if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) hourWord = 'часа';
        parts.push(`${hours} ${hourWord}`);
    }
    
    if (minutes > 0) {
        // Склонение "минута"/"минуты"/"минут"
        let minWord = 'минут';
        if (minutes % 10 === 1 && minutes % 100 !== 11) minWord = 'минута';
        else if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) minWord = 'минуты';
        parts.push(`${minutes} ${minWord}`);
    }
    
    element.textContent = `на ${parts.join(' ')} ${direction}`;
}

// Обновляем основной интервал (оставляем без изменений, но убираем вызов initWorldTime)
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (window.settings && forTime) {
            setInterval(() => {
                updateTimeDisplay();
                updateWorldTime();
            }, 1000);
            updateTimeDisplay();
            updateWorldTime(); // Первый вызов для инициализации элементов
        }
    }, 100);
});
