document.addEventListener("DOMContentLoaded", () => {
  renderNav();

  const tabs = document.getElementById("role-tabs");
  let selectedRole = "renter";

  const presetRole = qs("role");
  if (presetRole && tabs) {
    const match = [...tabs.children].find(b => b.dataset.role === presetRole);
    if (match) {
      [...tabs.children].forEach(b => b.classList.remove("active"));
      match.classList.add("active");
      selectedRole = presetRole;
    }
  }

  if (tabs) {
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      [...tabs.children].forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedRole = btn.dataset.role;
    });
  }

  const dashHref = (role) => role === "owner" ? "owner-dashboard.html"
                    : role === "admin" ? "admin-dashboard.html"
                    : "renter-dashboard.html";

  // ---- Login page ----
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    const errorEl = document.getElementById("login-error");
    const switchLine = document.getElementById("switch-line");

    function syncSwitchLine() {
      if (!switchLine) return;
      switchLine.innerHTML = selectedRole === "admin"
        ? "Admin accounts are created internally."
        : `New here? <a href="signup.html?role=${selectedRole}">Create an account</a>`;
    }
    syncSwitchLine();
    if (tabs) tabs.addEventListener("click", syncSwitchLine);

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      errorEl.classList.remove("show");
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      try {
        const user = login(email, password, selectedRole);
        showToast(`Welcome back, ${user.name.split(" ")[0]}.`);
        setTimeout(() => { window.location.href = dashHref(user.role); }, 500);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add("show");
      }
    });
  }

  // ---- Signup page ----
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    const errorEl = document.getElementById("signup-error");
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      errorEl.classList.remove("show");
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const area = document.getElementById("area").value.trim();
      try {
        const user = createUser({ name, email, password, role: selectedRole, area });
        login(email, password, selectedRole);
        showToast(`Account created. Welcome, ${user.name.split(" ")[0]}.`);
        setTimeout(() => { window.location.href = dashHref(user.role); }, 500);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add("show");
      }
    });
  }
});
