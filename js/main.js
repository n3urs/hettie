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

  // ----- the tide -----
  // A fixed ocean band sits over the top of the viewport. At rest it
  // gently ebbs and flows. Scroll down and the tide surges down the
  // page after you; scroll up and it retreats. Transform-only = GPU.
  var ocean = document.getElementById("oceanBand");
  if (ocean) {
    var OCEAN_H = 640;                    // matches .ocean height in CSS
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var restDepth = function () {         // resting visible water depth
      return Math.min(260, window.innerHeight * 0.34);
    };

    if (reduce) {
      // no motion: park the waterline at its resting depth
      ocean.style.transform = "translateY(" + (restDepth() - OCEAN_H) + "px)";
    } else {
      var current = restDepth();
      var vel = 0;
      var lastY = window.scrollY;

      window.addEventListener("scroll", function () {
        var y = window.scrollY;
        vel += y - lastY;                 // signed: down = in, up = out
        lastY = y;
      }, { passive: true });

      var t0 = performance.now();
      var frame = function (now) {
        vel *= 0.9;                       // friction
        var surge = Math.max(-160, Math.min(190, vel * 0.9));
        var target = restDepth() + surge;
        target = Math.max(88, Math.min(window.innerHeight * 0.62, target));
        current += (target - current) * 0.06;   // the tide lags behind you

        // idle ebb & flow: two overlapping swells so it never looks mechanical
        var t = now - t0;
        var bob = Math.sin(t / 1900) * 22 + Math.sin(t / 820) * 7;

        ocean.style.transform = "translateY(" + ((current + bob) - OCEAN_H) + "px)";
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
  }
})();
