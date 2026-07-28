/* main.js — shared UI: mobile nav, cursor glow, scroll reveal, footer year */
(function () {
  "use strict";

  // ----- footer year -----
  document.querySelectorAll('[data-site="year"]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ----- site text (headings, buttons, labels) -----
  // Every fixed string on the site carries data-txt="path.in.site.json",
  // so Hettie can reword any of it in the admin panel. Runs on all three
  // pages, which is why it lives here rather than in content.js.
  (function siteText() {
    var nodes = document.querySelectorAll("[data-txt]");
    if (!nodes.length) return;

    function esc(s) {
      return String(s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
    // *starred* words get the coloured italic accent
    function accent(s) {
      return esc(s).replace(/\*([^*]+)\*/g, '<span class="grad-serif">$1</span>');
    }

    fetch("content/site.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        nodes.forEach(function (el) {
          var val = el.getAttribute("data-txt").split(".").reduce(function (o, k) {
            return o == null ? o : o[k];
          }, data);
          // blank or missing leaves the hardcoded fallback in place
          if (val == null || val === "") return;
          el.innerHTML = accent(val);
        });
      })
      .catch(function () { /* keep the fallbacks already in the HTML */ });
  })();

  // ----- responsive images -----
  // Hettie uploads photos straight off a phone or laptop, so they arrive at
  // 2-5MB. Netlify's image CDN resizes and re-encodes them on the fly, which
  // means she never has to think about it: full-size in, ~50KB out.
  //
  // The CDN only exists on Netlify, so localhost and GitHub Pages fall back
  // to the original file. Anything that isn't a local upload (an external
  // URL) is left alone.
  var CDN_OK = !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) &&
               !/\.github\.io$/.test(location.hostname) &&
               location.protocol !== "file:";

  window.__img = function (src, width) {
    if (!src) return "";
    if (!CDN_OK || !/^\/?assets\//.test(src)) return src;
    var path = src.charAt(0) === "/" ? src : "/" + src;
    return "/.netlify/images?url=" + encodeURIComponent(path) +
           "&w=" + (width || 1000) + "&fm=webp&q=78";
  };

  // Rewrites <img> elements already in the DOM — used for photos that come
  // out of markdown, where we don't build the tag ourselves.
  window.__imgFix = function (root, width) {
    if (!root) return;
    root.querySelectorAll("img").forEach(function (im) {
      var raw = im.getAttribute("src");
      var opt = window.__img(raw, width);
      if (opt && opt !== raw) {
        im.setAttribute("data-fallback", raw);
        im.setAttribute("src", opt);
      }
      if (!im.hasAttribute("loading")) im.setAttribute("loading", "lazy");
    });
  };

  // If a transform ever fails, quietly swap back to the original so a photo
  // never just disappears. 'error' doesn't bubble, hence capture phase.
  document.addEventListener("error", function (e) {
    var el = e.target;
    if (el && el.tagName === "IMG") {
      var fb = el.getAttribute("data-fallback");
      if (fb && el.getAttribute("src") !== fb) {
        el.removeAttribute("data-fallback");
        el.setAttribute("src", fb);
      }
    }
  }, true);

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
      return Math.min(240, window.innerHeight * 0.30);
    };

    // Her name lives in the hero at the top of the home page, so the
    // water only takes it over once you've scrolled past — no doubling.
    // On other pages the water carries the name straight away.
    var oceanTitle = document.querySelector(".ocean__title");
    var hero = document.querySelector(".hero");
    var isHome = !!document.getElementById("oceanEnd");
    var syncTitle = function () {
      if (!oceanTitle) return;
      var show = !isHome || !hero
        ? window.scrollY > 40
        : window.scrollY > hero.offsetHeight * 0.6;
      oceanTitle.classList.toggle("shows-name", show);
    };
    window.addEventListener("scroll", syncTitle, { passive: true });
    window.addEventListener("resize", syncTitle);
    syncTitle();

    // the end screen only exists on the home page — no flood without it
    var endScreen = document.getElementById("oceanEnd");

    // how close we are to the bottom of the page (0 → 1 over the
    // last 460px of scroll) — drives the flood finale
    var FLOOD_RUN = 460;
    var floodProgress = function (y) {
      if (!endScreen) return 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max < 400) return 0;            // page too short to flood
      var f = (y - (max - FLOOD_RUN)) / FLOOD_RUN;
      f = Math.max(0, Math.min(1, f));
      return f * f * (3 - 2 * f);         // smoothstep
    };

    var setFlooded = function (on) {
      ocean.classList.toggle("ocean--flooded", on);
      document.body.classList.toggle("is-flooded", on);
    };

    // The end screen is toggled straight from the scroll event, NOT from
    // the animation loop — browsers throttle rAF (background tabs, low
    // power mode), and the finale must never depend on that.
    var syncFlood = function () {
      // the card rises with the water rather than waiting for it
      setFlooded(floodProgress(Math.max(0, window.scrollY)) > 0.35);
    };
    window.addEventListener("scroll", syncFlood, { passive: true });
    window.addEventListener("resize", syncFlood);
    syncFlood();

    if (reduce) {
      // no motion: park the waterline at its resting depth
      // (syncFlood above still reveals the end screen at the bottom)
      ocean.style.transform = "translateY(" + (restDepth() - oceanH) + "px)";
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
