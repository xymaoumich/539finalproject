import {saveCheckin, getCheckins} from "./storage.js";
import {updateStats} from "./stats.js";

let map;
let customMarkers = [];

// reverse geocode (click map)
async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        );
        const data = await response.json();
        const address = data.address || {};
        return address.city || address.town || address.village || address.state || address.country || "Unknown Location";
    } catch (err) {
        console.warn("Geocoding failed:", err);
        return "Unknown Location";
    }
}

// search city
export async function searchLocation(query) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
        );
        const results = await response.json();
        if (results && results.length > 0) {
            const loc = results[0];
            const lat = parseFloat(loc.lat);
            const lng = parseFloat(loc.lon);
            const name = loc.display_name.split(',')[0] || loc.name || query;
            return {lat, lng, name};
        }
        return null;
    } catch (err) {
        console.warn("Search failed:", err);
        return null;
    }
}

export function initMap(loaderFn) {
    const mapDiv = document.getElementById("map");
    mapDiv.innerHTML = "";
    if (map) map.remove();

    map = L.map("map").setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    customMarkers.forEach(m => m.remove());
    customMarkers = [];

    loaderFn().then(data => {
        const visited = getCheckins();

        // predefined cities
        data.cities.forEach(city => {
            const isVisited = visited.some(v => v.id === city.id);
            const marker = L.marker(city.coords, {
                icon: L.icon({
                    iconUrl:"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
                    iconSize: [28, 28]
                })
            }).addTo(map);

            marker.bindPopup(createPopupContent(city, isVisited));
        });

        // custom check-ins
        loadCustomCheckins();

        // click to check in
        let clickTimeout = null;
        map.on('click', async function (e) {
            if (clickTimeout) return;
            clickTimeout = setTimeout(() => clickTimeout = null, 1000);

            const latlng = e.latlng;
            const cityName = await reverseGeocode(latlng.lat, latlng.lng);
            const confirmed = confirm(`Do you want to check in at "${cityName}"?`);
            if (!confirmed) return;

            const customId = `custom_${Date.now()}`;
            const customCity = {
                id: customId,
                name: cityName,
                coords: [latlng.lat, latlng.lng],
                isCustom: true
            };

            saveCheckin(customCity);
            addCustomMarker(customCity);
            updateStats(getCheckins());
        });

        updateStats(getCheckins());
    });
}

function createPopupContent(city, isVisited) {
    return `
        <b>${city.name}</b><br>
        ${isVisited ? "✅ Checked-in" : `<button class="check-btn" data-city="${city.id}">Check in</button>`}
    `;
}

export function addCustomMarker(city) {
    const marker = L.marker(city.coords, {
        icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/15853/15853957.png",
            iconSize: [28, 28]
        })
    }).addTo(map);

    marker.cityId = city.id;

    marker.bindPopup(`<b>${city.name}</b><br>✅ Checked-in (Custom)`);

    customMarkers.push(marker);
}


function loadCustomCheckins() {
    getCheckins()
        .filter(v => v.isCustom)
        .forEach(city => addCustomMarker(city));
}

document.addEventListener("click", e => {
    if (e.target.classList.contains("check-btn")) {
        const id = e.target.dataset.city;
        saveCheckin({id});
        updateStats(getCheckins());
        initMap(() => Promise.resolve({cities: []}));
    }
});

export {map};


