const KEY = "travel_checkins";

export function getCheckins() {
    return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function saveCheckin(cityData) {
    const existing = getCheckins();
    const exists = existing.some(item => item.id === cityData.id);
    if (!exists) {
        existing.push(cityData);
        localStorage.setItem(KEY, JSON.stringify(existing));
    }
}

export function clearCheckins() {
    localStorage.removeItem(KEY);
}

export function deleteCheckin(id) {
    const all = getCheckins();
    const filtered = all.filter(item => item.id !== id);
    localStorage.setItem(KEY, JSON.stringify(filtered));
}
