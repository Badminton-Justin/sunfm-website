// Temporary diagnostic: something in Instagram's in-app browser opens /start
// already scrolled down to the form, and it doesn't reproduce in a normal
// browser. This records what moves the page during the first seconds after
// load: any script calling a scroll or focus API (with where it was called
// from), every real scroll, and the visitor's first touch. A scroll with no
// API call before it was done natively by the app, not by a script.
//
// It runs as an inline script before React so it sees calls made by scripts
// the in-app browser injects at document start. Remove once the cause is fixed.
export const SCROLL_DEBUG_SCRIPT = `(function(){
  if (window.__scrollDebug) return;
  var log = [], touched = false, lastY = 0;
  function now(){ return Math.round(performance.now()); }
  function where(){
    try { return (new Error().stack || "").split("\\n").slice(3, 6).map(function(s){ return s.trim(); }).join(" < ").slice(0, 240); }
    catch (e) { return ""; }
  }
  function add(type, detail){
    log.push({ t: now(), y: Math.round(window.scrollY), type: type, detail: detail || "" });
    if (log.length > 60) log.shift();
  }
  function wrap(obj, name, label, describe){
    var orig = obj && obj[name];
    if (typeof orig !== "function") return;
    obj[name] = function(){
      add(label, (describe ? describe(this, arguments) + " " : "") + where());
      return orig.apply(this, arguments);
    };
  }
  function args(_, a){ try { return JSON.stringify([].slice.call(a)).slice(0, 60); } catch (e) { return ""; } }
  function el(t){ return t ? (t.name || t.id || t.tagName || "") : ""; }
  wrap(window, "scrollTo", "window.scrollTo", args);
  wrap(window, "scrollBy", "window.scrollBy", args);
  wrap(window, "scroll", "window.scroll", args);
  var E = Element.prototype;
  wrap(E, "scrollIntoView", "scrollIntoView", el);
  wrap(E, "scrollIntoViewIfNeeded", "scrollIntoViewIfNeeded", el);
  wrap(E, "scrollTo", "element.scrollTo", el);
  wrap(HTMLElement.prototype, "focus", "focus()", el);
  window.addEventListener("scroll", function(){
    var y = Math.round(window.scrollY);
    if (Math.abs(y - lastY) >= 40) { add("scrolled", touched ? "after touch" : "no touch yet"); lastY = y; }
  }, { passive: true, capture: true });
  ["touchstart", "pointerdown", "wheel", "keydown"].forEach(function(e){
    window.addEventListener(e, function(){ if (!touched) { touched = true; add("first " + e); } }, { capture: true, passive: true });
  });
  document.addEventListener("focusin", function(e){ add("focusin", el(e.target)); }, true);
  window.addEventListener("hashchange", function(){ add("hashchange", location.hash); });
  var nav = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {};
  add("start", "hash=" + (location.hash || "none") + " navHasFragment=" + (String(nav.name || "").indexOf("#") >= 0) + " restoration=" + history.scrollRestoration);
  window.__scrollDebug = { log: log, touched: function(){ return touched; } };
})();`;

export const IN_APP_BROWSER = /Instagram|FBAN|FBAV|FB_IAB|FBIOS/i;
