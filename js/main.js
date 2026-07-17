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
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var oceanH = ocean.offsetHeight;      // 115vh (min 640px) — see CSS
    window.addEventListener("resize", function () { oceanH = ocean.offsetHeight; });

    var restDepth = function () {         // resting visible water depth
      return Math.min(190, window.innerHeight * 0.26);
    };

    // how close we are to the bottom of the page (0 → 1 over the
    // last 480px of scroll) — drives the flood finale
    var floodProgress = function (y) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max < 700) return 0;            // page too short to flood
      var f = (y - (max - 480)) / 480;
      f = Math.max(0, Math.min(1, f));
      return f * f * (3 - 2 * f);         // smoothstep
    };

    if (reduce) {
      // no motion: park the waterline at its resting depth
      ocean.style.transform = "translateY(" + (restDepth() - oceanH) + "px)";
      // still show the contact card at the bottom of the page
      var onScrollRM = function () {
        ocean.classList.toggle("ocean--flooded",
          floodProgress(Math.max(0, window.scrollY)) > 0.5);
      };
      window.addEventListener("scroll", onScrollRM, { passive: true });
      onScrollRM();
    } else {
      var current = restDepth();
      var vel = 0;
      var lastY = Math.max(0, window.scrollY);

      window.addEventListener("scroll", function () {
        var y = Math.max(0, window.scrollY);  // ignore rubber-band overscroll
        vel += y - lastY;                 // signed: down = in, up = out
        lastY = y;
      }, { passive: true });

      var t0 = performance.now();
      var frame = function (now) {
        vel *= 0.9;                       // friction
        // the waterline stays roughly put: only a small nudge with scroll
        var surge = Math.max(-26, Math.min(30, vel * 0.25));
        var target = restDepth() + surge;

        // flood finale: near the page bottom the tide comes all the
        // way in and the contact card floats up on the water
        var flood = floodProgress(lastY);
        if (flood > 0) {
          var floodDepth = window.innerHeight * 1.06;
          target = target + (floodDepth - target) * flood;
        }
        ocean.classList.toggle("ocean--flooded", flood > 0.5);

        current += (target - current) * 0.06;

        // scroll energy makes the sea livelier without moving it:
        // bigger, quicker swells while you're scrolling, calm at rest
        var energy = Math.min(1, Math.abs(vel) / 260);
        var t = now - t0;
        var bob = Math.sin(t / 1900) * (14 + energy * 16)
                + Math.sin(t / 820)  * (5 + energy * 12)
                + Math.sin(t / 460)  * (energy * 7);

        ocean.style.transform = "translateY(" + ((current + bob) - oceanH) + "px)";
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }

    // fill the flood card's links from the CMS contact file
    var floodLinks = document.getElementById("floodLinks");
    if (floodLinks) {
      fetch("content/contact.json", { cache: "no-cache" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d) return;
          var esc = function (s) {
            return String(s == null ? "" : s).replace(/&/g, "&amp;")
              .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          };
          var links = [];
          if (d.email) links.push('<a href="mailto:' + esc(d.email) + '">✉️ ' + esc(d.email) + '</a>');
          if (d.linkedin) links.push('<a href="' + esc(d.linkedin) + '" target="_blank" rel="noopener">in LinkedIn</a>');
          (d.links || []).forEach(function (l) {
            if (l.url) links.push('<a href="' + esc(l.url) + '" target="_blank" rel="noopener">↗ ' + esc(l.label || l.url) + '</a>');
          });
          if (links.length) floodLinks.innerHTML = links.join("");
        })
        .catch(function () {});
    }
  }
})();
