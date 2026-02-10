// Function to format time based on settings
function formatTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    
    // Handle time zone conversion
    let displayDate = now;
    if (settings.clock.timeZone === 'UTC') {
        displayDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        hours = displayDate.getHours();
        minutes = displayDate.getMinutes();
        seconds = displayDate.getSeconds();
    }
    
    // Handle 12/24 hour format
    let ampm = '';
    if (settings.clock.clockFormat === '12') {
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
    }
    
    // Add leading zeros if needed
    const hoursStr = settings.clock.leadingZero ? String(hours).padStart(2, '0') : String(hours);
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    
    return {
        hours: hoursStr,
        minutes: minutesStr,
        seconds: secondsStr,
        ampm: ampm
    };
}

// Function to format date based on settings
function formatDate() {
    const now = new Date();
    
    // Handle time zone conversion
    let displayDate = now;
    if (settings.clock.timeZone === 'UTC') {
        displayDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    }
    
    let dateStr = '';
    
    // Add date if enabled
    if (settings.clock.showDate) {
        const day = String(displayDate.getDate()).padStart(2, '0');
        const month = String(displayDate.getMonth() + 1).padStart(2, '0');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthText = monthNames[displayDate.getMonth()];
        let year = displayDate.getFullYear();
        if (settings.clock.jucheCalendar) year = year - 1911;
        
        let monthValue = settings.clock.monthAsText ? monthText : month;
        const sep = settings.clock.dateSeparator;
        
        switch (settings.clock.dateFormat) {
            case 'DDMMYYYY':
                dateStr = `${day}${sep}${monthValue}${settings.clock.showYear ? sep : ''}${settings.clock.showYear ? year : ''}`;
                break;
            case 'MMDDYYYY':
                dateStr = `${monthValue}${sep}${day}${settings.clock.showYear ? sep : ''}${settings.clock.showYear ? year : ''}`;
                break;
            case 'YYYYMMDD':
                dateStr = `${settings.clock.showYear ? year : ''}${settings.clock.showYear ? sep : ''}${monthValue}${sep}${day}`;
                break;
        }
        
        // Add year option for date format
        if (!settings.clock.showYear && settings.clock.dateFormat) {
            dateStr = dateStr.replace(/\/\d{4}/, '').replace(/\s\d{4}/, '');
        }
        
        // Add day of week if enabled
        if (settings.clock.showDayOfWeek) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[displayDate.getDay()];
            dateStr = `${dayName}, ${dateStr}`;
        }
    }
    
    return dateStr;
}

window.formatDate = formatDate;
window.formatTime = formatTime;