import { cal } from '../_calendar.js';

export function days(month) {
    
    let container = document.createElement('div');

    for (let i = 1; i <= cal[month]?.days; i++) {
        let dayElement = document.createElement('div');
        dayElement.setAttribute('data-item', 'day');
        dayElement.setAttribute('data-month', month);
        dayElement.setAttribute('data-day', i);

        dayElement.textContent = i;
        container.appendChild(dayElement);
    }

    return container.innerHTML;
}