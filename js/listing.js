document.addEventListener("DOMContentLoaded", () => {
  renderNav("browse");

  const id = qs("id");
  const listing = getListingById(id);
  const root = document.getElementById("listing-root");

  if (!listing) {
    root.innerHTML = `<div class="empty-state">
      <div class="icon">📦</div>
      <h3>This listing isn't available anymore</h3>
      <p>It may have been removed by the owner.</p>
      <a href="index.html" class="btn btn-primary">Back to browse</a>
    </div>`;
    return;
  }

  const owner = getUserById(listing.ownerId);
  const user = getCurrentUser();

  root.innerHTML = `
    <a href="index.html" class="small" style="display:inline-block; margin-bottom:18px;">&larr; Back to browse</a>
    <div class="detail-grid">
      <div>
        ${categoryThumbHTML(listing.category, "border-radius:16px;").replace('class="card-thumb"', 'class="detail-thumb"')}
        <h1 style="margin-top:24px;">${escapeHTML(listing.title)}</h1>
        <span class="badge">${listing.category}</span>
        <p style="margin-top:16px;">${escapeHTML(listing.description)}</p>

        <div class="owner-line">
          <span class="avatar">${owner ? initials(owner.name) : "?"}</span>
          <div>
            <strong style="display:block; font-size:.92rem;">${owner ? owner.name : "Unknown owner"}</strong>
            <span class="small">${listing.area} · Member since ${owner ? formatDate(owner.joined) : "—"}</span>
          </div>
        </div>
      </div>

      <div>
        <div class="booking-box">
          <div class="price-line">
            <strong>${formatINR(listing.pricePerDay)}</strong>
            <span class="small">per day</span>
          </div>
          <div class="divider"></div>
          <p class="small mt-0">Area: ${listing.area}</p>
          <p class="small">Status: ${listing.status === "active" ? "Available now" : "Currently unavailable"}</p>
          <button class="btn btn-primary btn-block" id="request-btn" ${listing.status !== "active" ? "disabled" : ""}>
            ${listing.status !== "active" ? "Not available" : "Request to book"}
          </button>
          <p class="form-hint text-center" style="margin-top:10px;" id="request-hint"></p>
        </div>
      </div>
    </div>
  `;

  const hint = document.getElementById("request-hint");
  const requestBtn = document.getElementById("request-btn");

  if (!user) {
    hint.textContent = "Log in as a renter to send a booking request.";
  } else if (user.role !== "renter") {
    hint.textContent = "Only renter accounts can request bookings.";
    requestBtn.disabled = true;
  } else if (user.id === listing.ownerId) {
    hint.textContent = "This is your own listing.";
    requestBtn.disabled = true;
  }

  requestBtn.addEventListener("click", () => {
    if (!user) { window.location.href = "login.html"; return; }
    openModal();
  });

  const modal = document.getElementById("booking-modal");
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  const totalEl = document.getElementById("modal-total");
  const errorEl = document.getElementById("booking-error");

  const todayISO = new Date().toISOString().slice(0, 10);
  startInput.min = todayISO;
  endInput.min = todayISO;

  function openModal() {
    errorEl.classList.remove("show");
    modal.classList.add("open");
  }
  function closeModal() { modal.classList.remove("open"); }
  document.getElementById("modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  function recalcTotal() {
    const s = startInput.value, e = endInput.value;
    if (!s || !e) { totalEl.textContent = "—"; return; }
    const days = Math.round((new Date(e) - new Date(s)) / 86400000);
    totalEl.textContent = days > 0 ? formatINR(days * listing.pricePerDay) + ` (${days} day${days === 1 ? "" : "s"})` : "—";
  }
  startInput.addEventListener("change", () => { endInput.min = startInput.value; recalcTotal(); });
  endInput.addEventListener("change", recalcTotal);

  document.getElementById("booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const s = startInput.value, en = endInput.value;
    if (new Date(en) <= new Date(s)) {
      errorEl.textContent = "End date needs to be after the start date.";
      errorEl.classList.add("show");
      return;
    }
    createBooking({ listingId: listing.id, renterId: user.id, startDate: s, endDate: en });
    closeModal();
    showToast("Request sent to the owner.");
    setTimeout(() => { window.location.href = "renter-dashboard.html"; }, 900);
  });
});
