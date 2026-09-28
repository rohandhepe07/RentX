document.addEventListener("DOMContentLoaded", () => {
  const user = requireRole("admin");
  if (!user) return;
  renderNav("dashboard");

  document.querySelectorAll(".side-link[data-section]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".side-link[data-section]").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      document.querySelectorAll("main > section").forEach(s => s.classList.add("hidden"));
      document.getElementById("section-" + link.dataset.section).classList.remove("hidden");
      const titles = {
        overview: ["Overview", "A snapshot of activity across RentX."],
        users: ["Users", "Everyone with an account on the platform."],
        listings: ["Listings", "Every item currently listed by an owner."],
        bookings: ["Bookings", "Every rental request across the platform."]
      };
      document.getElementById("page-title").textContent = titles[link.dataset.section][0];
      document.getElementById("page-sub").textContent = titles[link.dataset.section][1];
    });
  });

  function renderStats() {
    const users = getAllUsers();
    const listings = getListings();
    const bookings = getBookings();
    const activeListings = listings.filter(l => l.status === "active").length;
    const pendingBookings = bookings.filter(b => b.status === "pending").length;
    document.getElementById("stat-row").innerHTML = `
      <div class="stat-card"><div class="stat-num">${users.length}</div><div class="stat-label">Registered users</div></div>
      <div class="stat-card"><div class="stat-num">${activeListings}</div><div class="stat-label">Active listings</div></div>
      <div class="stat-card"><div class="stat-num">${pendingBookings}</div><div class="stat-label">Pending bookings</div></div>
      <div class="stat-card"><div class="stat-num">${bookings.length}</div><div class="stat-label">Total bookings</div></div>
    `;
  }

  function renderOverview() {
    const rows = getBookings().slice(0, 8);
    const body = document.getElementById("overview-bookings-body");
    if (rows.length === 0) { body.innerHTML = `<tr><td colspan="5" class="table-empty">No bookings yet.</td></tr>`; return; }
    body.innerHTML = rows.map(b => {
      const listing = getListingById(b.listingId);
      const renter = getUserById(b.renterId);
      const owner = getUserById(b.ownerId);
      return `<tr>
        <td>${listing ? escapeHTML(listing.title) : "—"}</td>
        <td>${renter ? renter.name : "—"}</td>
        <td>${owner ? owner.name : "—"}</td>
        <td>${formatDate(b.startDate)} – ${formatDate(b.endDate)}</td>
        <td><span class="badge ${b.status}">${b.status}</span></td>
      </tr>`;
    }).join("");
  }

  function renderUsers() {
    const rows = getAllUsers();
    const body = document.getElementById("users-body");
    body.innerHTML = rows.map(u => `
      <tr>
        <td>${escapeHTML(u.name)}</td>
        <td>${escapeHTML(u.email)}</td>
        <td style="text-transform:capitalize;">${u.role}</td>
        <td>${escapeHTML(u.area)}</td>
        <td>${formatDate(u.joined)}</td>
        <td>${u.role === "admin" ? "" : `<button class="btn btn-sm ${u.suspended ? "btn-ghost" : "btn-danger"}" data-toggle-user="${u.id}">${u.suspended ? "Reinstate" : "Suspend"}</button>`}</td>
      </tr>
    `).join("");

    body.querySelectorAll("[data-toggle-user]").forEach(btn => btn.addEventListener("click", () => {
      const u = getUserById(btn.dataset.toggleUser);
      setUserStatus(u.id, u.suspended ? "active" : "suspended");
      showToast(u.suspended ? "User reinstated." : "User suspended.");
      renderUsers();
    }));
  }

  function renderListings() {
    const rows = getListings();
    const body = document.getElementById("admin-listings-body");
    if (rows.length === 0) { body.innerHTML = `<tr><td colspan="6" class="table-empty">No listings yet.</td></tr>`; return; }
    body.innerHTML = rows.map(l => {
      const owner = getUserById(l.ownerId);
      return `<tr>
        <td>${categoryRowThumbHTML(l.category)}${escapeHTML(l.title)}</td>
        <td>${owner ? owner.name : "—"}</td>
        <td>${l.category}</td>
        <td>${formatINR(l.pricePerDay)}</td>
        <td><span class="badge ${l.status === "paused" ? "pending" : ""}">${l.status}</span></td>
        <td><button class="btn btn-danger btn-sm" data-remove-listing="${l.id}">Remove</button></td>
      </tr>`;
    }).join("");

    body.querySelectorAll("[data-remove-listing]").forEach(btn => btn.addEventListener("click", () => {
      if (!confirm("Remove this listing from the platform?")) return;
      deleteListing(btn.dataset.removeListing);
      showToast("Listing removed.");
      renderListings(); renderStats();
    }));
  }

  function renderBookings() {
    const rows = getBookings();
    const body = document.getElementById("admin-bookings-body");
    if (rows.length === 0) { body.innerHTML = `<tr><td colspan="6" class="table-empty">No bookings yet.</td></tr>`; return; }
    body.innerHTML = rows.map(b => {
      const listing = getListingById(b.listingId);
      const renter = getUserById(b.renterId);
      const owner = getUserById(b.ownerId);
      return `<tr>
        <td>${listing ? escapeHTML(listing.title) : "—"}</td>
        <td>${renter ? renter.name : "—"}</td>
        <td>${owner ? owner.name : "—"}</td>
        <td>${formatDate(b.startDate)} – ${formatDate(b.endDate)}</td>
        <td>${formatINR(b.totalPrice)}</td>
        <td><span class="badge ${b.status}">${b.status}</span></td>
      </tr>`;
    }).join("");
  }

  renderStats();
  renderOverview();
  renderUsers();
  renderListings();
  renderBookings();
});
