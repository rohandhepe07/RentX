/* Shared chrome: top nav + toast helper. Include after data.js. */

function renderNav(activePage) {
  const mount = document.getElementById("nav-mount");
  if (!mount) return;
  const user = getCurrentUser();

  const links = [
    { href: "index.html", label: "Browse", key: "browse" },
    { href: "index.html#how-it-works", label: "How it works", key: "how" }
  ];

  let dashboardLink = "";
  if (user) {
    const dashHref = user.role === "owner" ? "owner-dashboard.html"
                    : user.role === "admin" ? "admin-dashboard.html"
                    : "renter-dashboard.html";
    dashboardLink = `<a href="${dashHref}" class="${activePage === "dashboard" ? "active" : ""}">Dashboard</a>`;
  }

  const rightSide = user ? `
    <div class="nav-user">
      <span class="avatar">${initials(user.name)}</span>
      <span>${user.name.split(" ")[0]}</span>
    </div>
    <button class="btn btn-ghost btn-sm" id="logout-btn">Log out</button>
  ` : `
    <a href="login.html" class="btn btn-ghost btn-sm">Log in</a>
    <a href="signup.html" class="btn btn-primary btn-sm">List an item</a>
  `;

  mount.innerHTML = `
    <div class="topbar-inner">
      <a href="index.html" class="wordmark"><span class="logo-mark">R</span>RentX</a>
      <nav class="nav-links">
        ${links.map(l => `<a href="${l.href}" class="${activePage === l.key ? "active" : ""}">${l.label}</a>`).join("")}
        ${dashboardLink}
      </nav>
      <div class="nav-actions">${rightSide}</div>
      <button class="mobile-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
    </div>
  `;

  const bar = mount.closest(".topbar");
  const toggle = document.getElementById("nav-toggle");
  toggle.addEventListener("click", () => {
    const open = bar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  renderFooter(user);

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
      window.location.href = "index.html";
    });
  }
}

function renderFooter(user) {
  const el = document.getElementById("footer-mount");
  if (!el) return;
  const dash = !user ? "" : user.role === "owner" ? "owner-dashboard.html"
             : user.role === "admin" ? "admin-dashboard.html" : "renter-dashboard.html";
  const account = user
    ? `<a href="${dash}">Dashboard</a>`
    : `<a href="login.html">Log in</a><a href="signup.html?role=renter">Sign up</a>`;
  el.innerHTML = `
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="index.html" class="wordmark"><span class="logo-mark">R</span>RentX</a>
          <p>Rent what you need from neighbours in Mumbai &amp; Thane. List what you don't use and earn.</p>
        </div>
        <div class="footer-col"><h4>Explore</h4>
          <a href="index.html">Browse items</a>
          <a href="index.html#how-it-works">How it works</a>
        </div>
        <div class="footer-col"><h4>Account</h4>${account}</div>
        <div class="footer-col"><h4>For owners</h4>
          <a href="signup.html?role=owner">List an item</a>
          <a href="login.html?role=admin">Admin sign in</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} RentX</span>
        <span>Demo prototype &mdash; data is stored in your browser only.</span>
      </div>
    </div>`;
}

function showToast(message, isError) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.toggle("error", !!isError);
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 2600);
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
