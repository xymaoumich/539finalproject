import {saveCheckin, getCheckins, clearCheckins, deleteCheckin} from './storage.js';
import {updateStats} from './stats.js';

let map;

async function reverseGeocode(lat, lng) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
    const data = await res.json();
    return data.display_name?.split(',')[0] || "Unknown Place";
}

export async function searchLocation(query) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const results = await res.json();
    if (results?.length) {
        const r = results[0];
        return {lat: +r.lat, lng: +r.lon, name: r.display_name.split(',')[0]};
    }
    return null;
}

function initMap() {
    const existing = document.getElementById('map')._leaflet_id;
    if (existing) map.remove();

    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Load previous custom check-ins
    getCheckins().filter(c => c.isCustom).forEach(c => addMarker(c));

    map.on('click', async e => {
        const name = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        if (!confirm(`Check in at "${name}"?`)) return;

        const city = {
            id: `custom_${Date.now()}`,
            name,
            coords: [e.latlng.lat, e.latlng.lng],
            isCustom: true
        };
        saveCheckin(city);
        addMarker(city);
        updateStats(getCheckins());
    });
}

function addMarker(city) {
    L.marker(city.coords, {
        icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/15853/15853957.png',
            iconSize: [32, 32]
        })
    }).addTo(map)
        .bindPopup(`<b>${city.name}</b><br>Checked-in`);
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    updateStats(getCheckins());

    document.getElementById('search-btn').addEventListener('click', async () => {
        const q = document.getElementById('search-input').value.trim();
        if (!q) return;
        document.getElementById('search-btn').disabled = true;
        document.getElementById('search-btn').textContent = 'Searching...';

        const loc = await searchLocation(q);
        if (loc) {
            map.flyTo([loc.lat, loc.lng], 10);
            setTimeout(() => {
                if (confirm(`Check in at "${loc.name}"?`)) {
                    const city = {
                        id: `custom_${Date.now()}`,
                        name: loc.name,
                        coords: [loc.lat, loc.lng],
                        isCustom: true
                    };
                    saveCheckin(city);
                    addMarker(city);
                    updateStats(getCheckins());
                }
            }, 600);
        } else {
            alert('Location not found');
        }

        document.getElementById('search-btn').disabled = false;
        document.getElementById('search-btn').textContent = 'Search';
        document.getElementById('search-input').value = '';
    });

    document.getElementById('clear-all').addEventListener('click', () => {
        if (confirm('Clear all check-ins?')) {
            clearCheckins();
            updateStats([]);
            initMap();
        }
    });
});

document.addEventListener("click", e => {
    if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;

        deleteCheckin(id);
        updateStats(getCheckins());

        initMap();
    }
});