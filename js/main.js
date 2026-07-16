/* main.js — shared UI: mobile nav, cursor glow, scroll reveal, footer year */
(function () {
  "use strict";

  // ----- footer year -----
  document.querySelectorAll('[data-site="year"]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ----- mobile nav toggle -----
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ----- cursor glow (desktop only) -----
  var glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(hover: hover)").matches) {
    window.addEventListener("mousemove", function (e) {
      glow.classList.add("is-active");
      glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    });
    window.addEventListener("mouseleave", function () { glow.classList.remove("is-active"); });
  }

  // ----- scroll reveal -----
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // expose a helper so content.js can re-observe dynamically added .reveal nodes
  window.__revealObserve = function (el) {
    if (el) { el.classList.add("in"); }
  };
})();
