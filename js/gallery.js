import { photos } from "./photos.js";

const gallery = document.getElementById("gallery");

/* Group by continent → country */
const byContinent = {};
photos.forEach(p => {
    if (!byContinent[p.continent]) byContinent[p.continent] = {};
    if (!byContinent[p.continent][p.country]) byContinent[p.continent][p.country] = [];
    byContinent[p.continent][p.country].push(p);
});

/* Render */
Object.keys(byContinent).sort().forEach(cont => {
    const contSection = document.createElement("section");
    contSection.className = "continent-block";

    //continent id
    const safeContinentId = `continent-${cont.toLowerCase().replace(/\s+/g, '-')}`;
    contSection.innerHTML = `<h2 class="continent-title" id="${safeContinentId}">${cont}</h2>`;

    const countries = byContinent[cont];

    Object.keys(countries).sort().forEach(country => {
        const countryDiv = document.createElement("div");

        //country id
        const safeCountryId = `country-${cont.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase().replace(/\s+/g, '-')}`;

        countryDiv.innerHTML = `<h3 class="country-title" id="${safeCountryId}">${country}</h3>`;

        const grid = document.createElement("div");
        grid.className = "photo-grid";
        grid.setAttribute("role", "region");
        grid.setAttribute("aria-labelledby", safeCountryId);

        countries[country].forEach(p => {
            const card = document.createElement("div");
            card.className = "photo-card";
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            card.setAttribute("aria-expanded", "false");
            card.setAttribute("aria-label", `${p.title}, ${p.location}`);

            card.innerHTML = `
                <img src="pics/${p.file}" class="photo-img" alt="">
                <div class="caption">
                    <h4>${p.title}</h4>
                    <p><strong>${p.location}</strong></p>
                    <p>${p.description}</p>
                </div>
            `;

            // alt text
            const img = card.querySelector(".photo-img");
            img.alt = `${p.title} in ${p.location}. ${p.description}`;

            // expand/close logic
            const toggleExpanded = () => {
                const isExpanded = card.classList.contains("expanded");

                document.querySelectorAll(".photo-card.expanded").forEach(c => {
                    c.classList.remove("expanded");
                    c.setAttribute("aria-expanded", "false");
                });

                if (!isExpanded) {
                    card.classList.add("expanded");
                    card.setAttribute("aria-expanded", "true");
                    card.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            };

            card.addEventListener("click", e => {
                e.preventDefault();
                toggleExpanded();
            });

            card.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExpanded();
                }
                if (e.key === "Escape") {
                    document.querySelectorAll(".photo-card.expanded").forEach(c => {
                        c.classList.remove("expanded");
                        c.setAttribute("aria-expanded", "false");
                    });
                }
            });

            grid.appendChild(card);
        });

        countryDiv.appendChild(grid);
        contSection.appendChild(countryDiv);
    });

    gallery.appendChild(contSection);
});

