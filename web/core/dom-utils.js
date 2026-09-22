(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelDomUtils = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function setHidden(element, hidden) {
    if (!element || !element.classList) return false;
    element.classList.toggle("hidden", Boolean(hidden));
    element.setAttribute("aria-hidden", hidden ? "true" : "false");
    return true;
  }

  function setSelected(element, selected) {
    if (!element) return false;
    const active = Boolean(selected);
    if (element.classList) element.classList.toggle("active", active);
    element.setAttribute("aria-selected", active ? "true" : "false");
    return true;
  }

  function setText(element, value) {
    if (!element) return false;
    element.textContent = value == null ? "" : String(value);
    return true;
  }

  return Object.freeze({ setHidden, setSelected, setText });
});
