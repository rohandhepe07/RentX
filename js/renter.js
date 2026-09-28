document.addEventListener("DOMContentLoaded", () => {
  const user = requireRole("renter");
  if (!user) return;
  renderNav("dashboard");

  // section switching
  document.querySelectorAll(".side-link[data-section]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".side-link[data-section]").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      document.querySelectorAll("main > section").forEach(s => s.classList.add("hidden"));
      document.getElementById("section-" + link.dataset.section).classList.remove("hidden");
      const titles = {
        bookings: ["My bookings", "Requests you've sent to owners, and their current status."],
        profile: ["Profile", "Your account details."]
      };
      document.getElementById("page-title").textContent = titles[link.dataset.section][0];
      document.getElementById("page-sub").textContent = titles[link.dataset.section][1];
    });
  });

  function renderStats(bookings) {
    const pending = bookings.filter(b => b.status === "pending").length;
    const active = bookings.filter(b => b.status === "approved").length;
    const completed = bookings.filter(b => b.status === "completed").length;
    const spent = bookings.filter(b => b.status === "completed").reduce((s, b) => s + b.totalPrice, 0);
    document.getElementById("stat-row").innerHTML = `
      <div class="stat-card"><div class="stat-num">${pending}</div><div class="stat-label">Pending requests</div></div>
      <div class="stat-card"><div class="stat-num">${active}</div><div class="stat-label">Approved &amp; upcoming</div></div>
      <div class="stat-card"><div class="stat-num">${completed}</div><div class="stat-label">Completed rentals</div></div>
      <div class="stat-card"><div class="stat-num">${formatINR(spent)}</div><div class="stat-label">Total spent</div></div>
    `;
  }

  function renderBookings() {
    const bookings = getBookings({ renterId: user.id });
    renderStats(bookings);
    const body = document.getElementById("bookings-body");

    if (bookings.length === 0) {
      body.innerHTML = `<tr><td colspan="5" class="table-empty">You haven't requested any rentals yet. <a href="index.html">Browse listings</a> to get started.</td></tr>`;
      return;
    }

    body.innerHTML = bookings.map(b => {
      const listing = getListingById(b.listingId);
      const canCancel = b.status === "pending";
      return `
      <tr>
        <td>${categoryRowThumbHTML(listing ? listing.category : "Tools & Equipment")}${listing ? escapeHTML(listing.title) : "Listing removed"}</td>
        <td>${formatDate(b.startDate)} – ${formatDate(b.endDate)}</td>
        <td>${formatINR(b.totalPrice)}</td>
        <td><span class="badge ${b.status}">${b.status}</span></td>
        <td>${canCancel ? `<button class="btn btn-danger btn-sm" data-cancel="${b.id}">Cancel</button>` : ""}</td>
      </tr>`;
    }).join("");

    body.querySelectorAll("[data-cancel]").forEach(btn => {
      btn.addEventListener("click", () => {
        updateBookingStatus(btn.dataset.cancel, "cancelled");
        showToast("Booking request cancelled.");
        renderBookings();
      });
    });
  }

  function renderProfile() {
    document.getElementById("profile-body").innerHTML = `
      <div class="form-group"><label>Name</label><input value="${escapeHTML(user.name)}" disabled></div>
      <div class="form-group"><label>Email</label><input value="${escapeHTML(user.email)}" disabled></div>
      <div class="form-group"><label>Area</label><input value="${escapeHTML(user.area)}" disabled></div>
      <div class="form-group"><label>Member since</label><input value="${formatDate(user.joined)}" disabled></div>
      <p class="form-hint">Profile editing isn't wired up in this prototype — it would call an update-user endpoint on the real backend.</p>
    `;
  }

  renderBookings();
  renderProfile();
});
