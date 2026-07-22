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
})();
