import { cal } from '../_calendar.js';

export function months() {

    let container = document.createElement('div');

    // container.innerHTML = cal.map((month) => `<div>${month.name}</div>`).join('');

    cal.forEach((month, index) => {
        let monthElement = document.createElement('div');
        monthElement.setAttribute('data-item', 'month');
        monthElement.setAttribute('data-month', index);

        let monthName = document.createElement('h3');
        monthName.textContent = month.name;
        
        monthElement.appendChild(monthName);
        container.appendChild(monthElement);
    });

    return container.innerHTML;
    
}