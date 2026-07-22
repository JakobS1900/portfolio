// Theme toggle with cross-page persistence. The initial theme is set by a
// tiny inline script in each page's <head> so there is no flash on load.
(function () {
  var KEY = "jsz-theme";
  window.toggleTheme = function () {
    var root = document.documentElement;
    var current =
      root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {}
  };

  // Build the mobile menu from the existing desktop nav so every page gets it
  // without duplicating markup. On phones the desktop links are hidden by CSS;
  // this gives them somewhere to live.
  function buildMobileNav() {
    var bar = document.querySelector("header.bar .wrap");
    var links = document.querySelector("nav.links");
    if (!bar || !links || document.querySelector(".menu-btn")) return;

    var btn = document.createElement("button");
    btn.className = "menu-btn";
    btn.setAttribute("aria-label", "Menu");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";

    var panel = document.createElement("nav");
    panel.className = "mobile-menu";
    panel.innerHTML = links.innerHTML;

    var themeBtn = bar.querySelector(".theme-toggle");
    bar.insertBefore(btn, themeBtn);
    document.body.appendChild(panel);

    btn.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      btn.classList.toggle("active", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        panel.classList.remove("open");
        btn.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildMobileNav);
  } else {
    buildMobileNav();
  }
})();
