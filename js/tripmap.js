import {trips} from "./trips.js";

let map;
let polylines = [];
let markers = [];

const startIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    iconSize: [44, 44],
    iconAnchor: [22, 44]
});

const cityIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/15853/15853957.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38]
});

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    renderTripCards();
});

function initMap() {
    map = L.map("trip-map").setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    // fix mobile sizing issue
    setTimeout(() => map.invalidateSize(), 300);
}

function renderTripCards() {
    const container = document.getElementById("trip-cards");

    container.innerHTML = trips.map(t => `
        <div class="trip-card" tabindex="0">
            <h3>${t.name}</h3>
            <p class="dates">${t.dates}</p>
            <p><strong>Route:</strong> ${t.cities.map(c => c.name).join(" → ")}</p>
            <p class="notes">${t.notes}</p>
            <button class="show-route" data-id="${t.id}">Show Route</button>
        </div>
    `).join("");

    /* clickable buttons */
    document.querySelectorAll(".show-route").forEach(btn => {
        btn.addEventListener("click", () => {
            const trip = trips.find(t => t.id === btn.dataset.id);
            showRouteOnMap(trip);
        });
    });

    /* keyboard accessible trip-cards */
    document.querySelectorAll(".trip-card").forEach(card => {
        card.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                const id = card.querySelector(".show-route").dataset.id;
                const trip = trips.find(t => t.id === id);
                showRouteOnMap(trip);
            }
        });
    });
}

function showRouteOnMap(trip) {
    polylines.forEach(p => map.removeLayer(p));
    markers.forEach(m => map.removeLayer(m));
    polylines = [];
    markers = [];

    const coords = trip.cities.map(c => c.coords);

    const line = L.polyline(coords, {
        color: "#e05a4f",
        weight: 5,
        opacity: 0.9
    }).addTo(map);

    polylines.push(line);

    map.fitBounds(line.getBounds(), {padding: [40, 40]});

    trip.cities.forEach((city, index) => {
        const icon = index === 0 ? startIcon : cityIcon;

        const marker = L.marker(city.coords, {icon})
            .addTo(map)
            .bindPopup(`<b>${city.name}</b>`);

        markers.push(marker);
    });

    document.getElementById("trip-map").focus();
}
