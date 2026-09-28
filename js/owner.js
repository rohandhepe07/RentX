document.addEventListener("DOMContentLoaded", () => {
  const user = requireRole("owner");
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
        listings: ["My listings", "Items you've listed for rent nearby."],
        requests: ["Booking requests", "Approve or decline requests from renters."]
      };
      document.getElementById("page-title").textContent = titles[link.dataset.section][0];
      document.getElementById("page-sub").textContent = titles[link.dataset.section][1];
    });
  });

  const catSelect = document.getElementById("l-category");
  CATEGORIES.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    catSelect.appendChild(opt);
  });

  function renderStats() {
    const listings = getListings({ ownerId: user.id });
    const bookings = getBookings({ ownerId: user.id });
    const active = listings.filter(l => l.status === "active").length;
    const pending = bookings.filter(b => b.status === "pending").length;
    const earnings = bookings.filter(b => b.status === "completed").reduce((s, b) => s + b.totalPrice, 0);
    document.getElementById("stat-row").innerHTML = `
      <div class="stat-card"><div class="stat-num">${listings.length}</div><div class="stat-label">Total listings</div></div>
      <div class="stat-card"><div class="stat-num">${active}</div><div class="stat-label">Currently active</div></div>
      <div class="stat-card"><div class="stat-num">${pending}</div><div class="stat-label">Pending requests</div></div>
      <div class="stat-card"><div class="stat-num">${formatINR(earnings)}</div><div class="stat-label">Earned to date</div></div>
    `;
  }

  function renderListings() {
    const rows = getListings({ ownerId: user.id });
    const body = document.getElementById("listings-body");
    if (rows.length === 0) {
      body.innerHTML = `<tr><td colspan="5" class="table-empty">You haven't listed anything yet.</td></tr>`;
      return;
    }
    body.innerHTML = rows.map(l => `
      <tr>
        <td>${categoryRowThumbHTML(l.category)}${escapeHTML(l.title)}</td>
        <td>${l.category}</td>
        <td>${formatINR(l.pricePerDay)}</td>
        <td><span class="badge ${l.status === "paused" ? "pending" : ""}">${l.status}</span></td>
        <td class="cell-actions">
          <button class="btn btn-ghost btn-sm" data-edit="${l.id}">Edit</button>
          <button class="btn btn-ghost btn-sm" data-toggle="${l.id}">${l.status === "active" ? "Pause" : "Activate"}</button>
          <button class="btn btn-danger btn-sm" data-delete="${l.id}">Delete</button>
        </td>
      </tr>
    `).join("");

    body.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => openListingModal(btn.dataset.edit)));
    body.querySelectorAll("[data-toggle]").forEach(btn => btn.addEventListener("click", () => {
      const l = getListingById(btn.dataset.toggle);
      updateListing(l.id, { status: l.status === "active" ? "paused" : "active" });
      showToast(l.status === "active" ? "Listing paused." : "Listing activated.");
      renderListings(); renderStats();
    }));
    body.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => {
      if (!confirm("Remove this listing? This can't be undone.")) return;
      deleteListing(btn.dataset.delete);
      showToast("Listing removed.");
      renderListings(); renderStats();
    }));
  }

  function renderRequests() {
    const rows = getBookings({ ownerId: user.id });
    const body = document.getElementById("requests-body");
    if (rows.length === 0) {
      body.innerHTML = `<tr><td colspan="6" class="table-empty">No booking requests yet.</td></tr>`;
      return;
    }
    body.innerHTML = rows.map(b => {
      const listing = getListingById(b.listingId);
      const renter = getUserById(b.renterId);
      const actions = b.status === "pending"
        ? `<button class="btn btn-primary btn-sm" data-approve="${b.id}">Approve</button>
           <button class="btn btn-danger btn-sm" data-reject="${b.id}">Decline</button>`
        : (b.status === "approved" ? `<button class="btn btn-ghost btn-sm" data-complete="${b.id}">Mark complete</button>` : "");
      return `
      <tr>
        <td>${listing ? escapeHTML(listing.title) : "Listing removed"}</td>
        <td>${renter ? renter.name : "—"}</td>
        <td>${formatDate(b.startDate)} – ${formatDate(b.endDate)}</td>
        <td>${formatINR(b.totalPrice)}</td>
        <td><span class="badge ${b.status}">${b.status}</span></td>
        <td class="cell-actions">${actions}</td>
      </tr>`;
    }).join("");

    body.querySelectorAll("[data-approve]").forEach(btn => btn.addEventListener("click", () => {
      updateBookingStatus(btn.dataset.approve, "approved");
      showToast("Booking approved.");
      renderRequests(); renderStats();
    }));
    body.querySelectorAll("[data-reject]").forEach(btn => btn.addEventListener("click", () => {
      updateBookingStatus(btn.dataset.reject, "rejected");
      showToast("Booking declined.");
      renderRequests(); renderStats();
    }));
    body.querySelectorAll("[data-complete]").forEach(btn => btn.addEventListener("click", () => {
      updateBookingStatus(btn.dataset.complete, "completed");
      showToast("Marked as completed.");
      renderRequests(); renderStats();
    }));
  }

  // ---- Add / edit listing modal ----
  const modal = document.getElementById("listing-modal");
  const form = document.getElementById("listing-form");
  const errorEl = document.getElementById("listing-error");

  function openListingModal(id) {
    errorEl.classList.remove("show");
    form.reset();
    document.getElementById("listing-id").value = "";
    document.getElementById("listing-modal-title").textContent = "List a new item";
    document.getElementById("listing-submit").textContent = "Publish listing";

    if (id) {
      const l = getListingById(id);
      document.getElementById("listing-id").value = l.id;
      document.getElementById("l-title").value = l.title;
      document.getElementById("l-category").value = l.category;
      document.getElementById("l-price").value = l.pricePerDay;
      document.getElementById("l-area").value = l.area;
      document.getElementById("l-desc").value = l.description;
      document.getElementById("listing-modal-title").textContent = "Edit listing";
      document.getElementById("listing-submit").textContent = "Save changes";
    }
    modal.classList.add("open");
  }
  function closeListingModal() { modal.classList.remove("open"); }

  document.getElementById("add-listing-btn").addEventListener("click", () => openListingModal(null));
  document.getElementById("listing-modal-close").addEventListener("click", closeListingModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeListingModal(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("listing-id").value;
    const data = {
      title: document.getElementById("l-title").value.trim(),
      category: document.getElementById("l-category").value,
      pricePerDay: Number(document.getElementById("l-price").value),
      area: document.getElementById("l-area").value.trim(),
      description: document.getElementById("l-desc").value.trim()
    };
    if (data.pricePerDay <= 0) {
      errorEl.textContent = "Price per day should be greater than zero.";
      errorEl.classList.add("show");
      return;
    }
    if (id) {
      updateListing(id, data);
      showToast("Listing updated.");
    } else {
      createListing({ ...data, ownerId: user.id });
      showToast("Listing published.");
    }
    closeListingModal();
    renderListings(); renderStats();
  });

  renderStats();
  renderListings();
  renderRequests();
});
