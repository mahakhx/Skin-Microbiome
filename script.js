/* =========================================================
   MICROBES THAT REMEMBER YOU — presentation controller
   Vanilla JS · transform-scaled 1280×720 canvas deck
   ---------------------------------------------------------
   01. STATE & DOM
   02. CANVAS SCALING
   03. NAVIGATION
   04. URL / HASH SYNC
   05. KEYBOARD
   06. TOUCH / SWIPE
   07. FULLSCREEN
   08. OVERVIEW
   09. PRINT
   10. INIT
   ========================================================= */

(function () {
  "use strict";

  /* ---------- 01. STATE & DOM ---------- */
  var stage       = document.getElementById("stage");
  var slides      = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var progressBar = document.getElementById("progressBar");
  var overview    = document.getElementById("overview");
  var overviewGrid= document.getElementById("overviewGrid");
  var hint        = document.getElementById("hint");

  var total   = slides.length;
  var current = 0;               // zero-based index

  var section = {                // rail section labels, for overview cards
    1:"Cover", 2:"Introduction", 3:"The Need", 4:"Methods", 5:"Local Data",
    6:"Results · 02", 7:"Results · 03", 8:"Results · 04", 9:"Related Work",
    10:"Results · 05", 11:"Local Data", 12:"Local Data", 13:"Local Data",
    14:"Proof at Scale", 15:"The Impact", 16:"Live Demo", 17:"Visit",
    18:"Challenges", 19:"Conclusions", 20:"Thank You", 21:"Explore",
    22:"References", 23:"References"
  };
  var titles = {
    1:"Microbes That Remember You", 2:"The skin carries a personal signature",
    3:"What happens when DNA runs out?", 4:"Machine-learning pipeline",
    5:"Preparing the Egyptian pilot", 6:"What drives the main axis",
    7:"Which taxa identify a person", 8:"Where the identifying taxa live",
    9:"The closest study to ours", 10:"Which model identifies best",
    11:"What populations share & diverge", 12:"USA — same body site",
    13:"Egypt vs USA — not site or time", 14:"A geographic locator",
    15:"From dataset to forensic tool", 16:"Live identification platform",
    17:"Explore the live database", 18:"Hurdles before court-ready",
    19:"What we established & next", 20:"Thank You", 21:"Explore the live platform",
    22:"References — primary", 23:"References — geolocation"
  };

  /* ---------- 02. CANVAS SCALING ---------- */
  function fitStage() {
    var margin = 0;
    var sx = (window.innerWidth  - margin) / 1280;
    var sy = (window.innerHeight - margin) / 720;
    var scale = Math.min(sx, sy);
    document.documentElement.style.setProperty("--scale", scale);
  }

  /* ---------- 03. NAVIGATION ---------- */
  function render() {
    slides.forEach(function (s, i) {
      s.classList.toggle("is-active", i === current);
      s.setAttribute("aria-hidden", i === current ? "false" : "true");
    });
    progressBar.style.width = ((current + 1) / total * 100) + "%";
    updateOverviewCurrent();
  }

  function goTo(index, opts) {
    opts = opts || {};
    var next = Math.max(0, Math.min(total - 1, index));
    if (next === current && !opts.force) return;
    current = next;
    render();
    if (!opts.silent) setHash(current + 1);
  }
  function nextSlide() { goTo(current + 1); }
  function prevSlide() { goTo(current - 1); }

  /* Avoid hijacking navigation while the user is selecting text
     or interacting with a real link/button. */
  function selectionActive() {
    var sel = window.getSelection && window.getSelection();
    return sel && sel.toString().length > 0;
  }

  /* ---------- 04. URL / HASH SYNC ---------- */
  function setHash(num) {
    if (("#" + num) !== window.location.hash) {
      history.pushState({ slide: num }, "", "#" + num);
    }
  }
  function slideFromHash() {
    var n = parseInt(window.location.hash.replace("#", ""), 10);
    if (!isNaN(n) && n >= 1 && n <= total) return n - 1;
    return null;
  }
  window.addEventListener("popstate", function () {
    var idx = slideFromHash();
    if (idx !== null) goTo(idx, { silent: true });
  });

  /* ---------- 05. KEYBOARD ---------- */
  document.addEventListener("keydown", function (e) {
    if (overview.classList.contains("is-open")) {
      if (e.key === "Escape" || e.key === "o" || e.key === "O") { closeOverview(); e.preventDefault(); }
      return;
    }
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
      case "ArrowDown":
        nextSlide(); e.preventDefault(); break;
      case " ":
        if (!selectionActive()) { nextSlide(); e.preventDefault(); } break;
      case "ArrowLeft":
      case "PageUp":
      case "ArrowUp":
        prevSlide(); e.preventDefault(); break;
      case "Home":
        goTo(0); e.preventDefault(); break;
      case "End":
        goTo(total - 1); e.preventDefault(); break;
      case "f": case "F":
        toggleFullscreen(); e.preventDefault(); break;
      case "o": case "O":
        openOverview(); e.preventDefault(); break;
      case "Escape":
        if (document.fullscreenElement) document.exitFullscreen(); break;
    }
  });

  /* ---------- 06. TOUCH / SWIPE ---------- */
  var touchX = null, touchY = null;
  stage.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) && !selectionActive()) {
      if (dx < 0) nextSlide(); else prevSlide();
    }
    touchX = touchY = null;
  }, { passive: true });

  /* ---------- 07. FULLSCREEN ---------- */
  function toggleFullscreen() {
    var root = document.documentElement;
    if (!document.fullscreenElement) {
      (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
  }

  /* ---------- 08. OVERVIEW ---------- */
  function buildOverview() {
    slides.forEach(function (s, i) {
      var n = i + 1;
      var btn = document.createElement("button");
      btn.className = "ov-card";
      btn.setAttribute("aria-label", "Go to slide " + n + ": " + (titles[n] || ""));
      btn.innerHTML =
        '<div class="ov-card__top"><span class="ov-card__n">' + (n < 10 ? "0" + n : n) +
        '</span><span class="ov-card__sec">' + (section[n] || "") + '</span></div>' +
        '<div class="ov-card__ttl">' + (titles[n] || "") + '</div>';
      btn.addEventListener("click", function () { goTo(i); closeOverview(); });
      overviewGrid.appendChild(btn);
    });
  }
  function updateOverviewCurrent() {
    var cards = overviewGrid.children;
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle("is-current", i === current);
    }
  }
  function openOverview()  { overview.classList.add("is-open"); updateOverviewCurrent(); }
  function closeOverview() { overview.classList.remove("is-open"); }

  /* ---------- 09. PRINT ---------- */
  // Reveal every slide for printing, then restore afterwards.
  var printPrev = null;
  window.addEventListener("beforeprint", function () {
    printPrev = current;
    slides.forEach(function (s) { s.classList.add("is-active"); });
  });
  window.addEventListener("afterprint", function () {
    slides.forEach(function (s, i) { s.classList.toggle("is-active", i === printPrev); });
  });

  /* ---------- 10. INIT ---------- */
  function bindControls() {
    document.getElementById("btnNext").addEventListener("click", nextSlide);
    document.getElementById("btnPrev").addEventListener("click", prevSlide);
    document.getElementById("btnFull").addEventListener("click", toggleFullscreen);
    document.getElementById("btnOverview").addEventListener("click", openOverview);
    document.getElementById("btnCloseOverview").addEventListener("click", closeOverview);
    overview.addEventListener("click", function (e) { if (e.target === overview) closeOverview(); });
  }

  function fadeHint() {
    // gently retire the keyboard hint once the user has navigated a bit
    var used = false;
    function retire() { if (!used) { used = true; hint.style.opacity = "0"; } }
    document.addEventListener("keydown", retire, { once: true });
    setTimeout(function () { hint.style.opacity = "0"; }, 8000);
  }

  function init() {
    fitStage();
    window.addEventListener("resize", fitStage);
    buildOverview();
    bindControls();
    var start = slideFromHash();
    current = start !== null ? start : 0;
    goTo(current, { force: true, silent: true });
    fadeHint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
