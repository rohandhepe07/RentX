document.addEventListener("DOMContentLoaded", () => {
  renderNav("browse");

  // hero stack thumbs
  document.getElementById("stack-1").outerHTML = categoryThumbHTML("Cameras & Electronics", "width:56px;height:56px;border-radius:8px;");
  document.getElementById("stack-2").outerHTML = categoryThumbHTML("Party & Events", "width:56px;height:56px;border-radius:8px;");
  document.getElementById("stack-3").outerHTML = categoryThumbHTML("Sports & Outdoors", "width:56px;height:56px;border-radius:8px;");

  // category select + chips
  const catSelect = document.getElementById("search-cat");
  CATEGORIES.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    catSelect.appendChild(opt);
  });

  const chipMount = document.getElementById("category-chips");
  CATEGORIES.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.dataset.cat = c;
    btn.textContent = c;
    chipMount.appendChild(btn);
  });

  let activeCategory = "";
  let activeQuery = "";

  function setActiveChip(cat) {
    activeCategory = cat;
    [...chipMount.children].forEach(chip => {
      chip.classList.toggle("active", chip.dataset.cat === cat);
    });
    catSelect.value = cat;
    renderGrid();
  }

  chipMount.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    setActiveChip(chip.dataset.cat);
  });

  catSelect.addEventListener("change", () => setActiveChip(catSelect.value));

  document.getElementById("search-btn").addEventListener("click", runSearch);
  document.getElementById("search-q").addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
  function runSearch() {
    activeQuery = document.getElementById("search-q").value.trim();
    renderGrid();
  }

  function renderGrid() {
    const rows = getListings({
      status: "active",
      category: activeCategory || undefined,
      q: activeQuery || undefined
    });
    const grid = document.getElementById("listing-grid");
    document.getElementById("results-count").textContent =
      rows.length === 0 ? "No listings match yet — try a different search." : `${rows.length} item${rows.length === 1 ? "" : "s"} listed by owners near you`;

    if (rows.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="icon">🔍</div>
        <p>Nothing matches that search right now.</p>
      </div>`;
      return;
    }

    grid.innerHTML = rows.map(listing => {
      const owner = getUserById(listing.ownerId);
      return `
      <a class="card-listing" href="listing.html?id=${listing.id}" style="text-decoration:none;">
        ${categoryThumbHTML(listing.category)}
        <div class="card-body">
          <span class="card-meta">${listing.category}</span>
          <h3>${escapeHTML(listing.title)}</h3>
          <span class="card-meta">${listing.area} · Listed by ${owner ? owner.name.split(" ")[0] : "owner"}</span>
          <div class="card-price">
            <strong>${formatINR(listing.pricePerDay)}</strong><span>&nbsp;/ day</span>
          </div>
        </div>
      </a>`;
    }).join("");
  }

  renderGrid();
});
