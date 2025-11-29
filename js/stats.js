export function updateStats(data) {
    const statsDiv = document.getElementById("stats");
    const grid = document.getElementById("checkin-grid");

    statsDiv.innerHTML = `<p>You have checked in <b>${data.length}</b> locations.</p>`;

    grid.innerHTML = data.map(item => {
        const name = item.isCustom ? item.name : item.id;
        const icon = '🌍'

        return `
            <div class="checkin-card">
                <span>${icon} ${name}</span>
                <button class="delete-btn" data-id="${item.id}">X</button>
            </div>
        `;
    }).join("");
}

