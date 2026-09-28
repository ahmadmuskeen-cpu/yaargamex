(function () {
  function isLightMode() {
    return localStorage.getItem("yaargamex_theme") === "light";
  }

  function applyTheme() {
    const light = isLightMode();
    document.body.classList.toggle("light-mode", light);
    document.querySelectorAll(".site-menu-theme").forEach((btn) => {
      const icon = btn.querySelector(".site-menu-theme-icon");
      const text = btn.querySelector(".site-menu-theme-text");
      if (icon) icon.textContent = light ? "🌙" : "☀️";
      if (text) text.textContent = light ? "Dark Mode" : "Light Mode";
      btn.setAttribute("aria-pressed", String(light));
    });
  }

  function toggleTheme() {
    localStorage.setItem("yaargamex_theme", isLightMode() ? "dark" : "light");
    applyTheme();
  }

  const menuMarkup = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "site-menu";
    wrapper.innerHTML = `
      <button class="site-menu-toggle" type="button" aria-expanded="false" aria-haspopup="true">
        <span class="site-menu-icon" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>Menu</span>
      </button>
      <div class="site-menu-panel" role="menu" hidden>
        <a href="index.html" role="menuitem"><span aria-hidden="true">⌂</span><span><strong>Home</strong><small>Main homepage</small></span></a>
        <a href="general-updates.html" role="menuitem"><span aria-hidden="true">📣</span><span><strong>General Updates</strong><small>Announcements &amp; news</small></span></a>
        <a href="admin.html" role="menuitem"><span aria-hidden="true">◆</span><span><strong>Admin</strong><small>Admin Panel</small></span></a>
        <button type="button" class="site-menu-theme" role="menuitem" aria-pressed="false">
          <span class="site-menu-theme-icon" aria-hidden="true">☀️</span>
          <span><strong class="site-menu-theme-text">Light Mode</strong><small>Switch appearance</small></span>
        </button>
      </div>`;
    return wrapper;
  };

  function closeMenu(menu, focusToggle) {
    const toggle = menu.querySelector(".site-menu-toggle");
    menu.querySelector(".site-menu-panel").hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    if (focusToggle) toggle.focus();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav .logo, .admin-nav .logo, .login-box > .logo").forEach((logo) => {
      const menu = menuMarkup();
      logo.insertAdjacentElement("beforebegin", menu);
      const toggle = menu.querySelector(".site-menu-toggle");
      const panel = menu.querySelector(".site-menu-panel");
      const themeBtn = menu.querySelector(".site-menu-theme");

      toggle.addEventListener("click", () => {
        const opening = panel.hidden;
        document.querySelectorAll(".site-menu.is-open").forEach((openMenu) => closeMenu(openMenu));
        panel.hidden = !opening;
        toggle.setAttribute("aria-expanded", String(opening));
        menu.classList.toggle("is-open", opening);
        if (opening) panel.querySelector("a").focus();
      });

      themeBtn.addEventListener("click", () => toggleTheme());

      menu.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu(menu, true);
      });
    });

    applyTheme();

    document.addEventListener("click", (event) => {
      document.querySelectorAll(".site-menu.is-open").forEach((menu) => {
        if (!menu.contains(event.target)) closeMenu(menu);
      });
    });
  });
})();
