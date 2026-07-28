/* content.js — loads content/*.json and renders the home page sections.
   All content here is editable by Hettie in the /admin CMS. */
(function () {
  "use strict";

  var reveal = window.__revealObserve || function () {};
  // resized via Netlify's image CDN — see js/main.js
  var img = window.__img || function (s) { return s; };
  var imgFix = window.__imgFix || function () {};

  function get(url) {
    return fetch(url, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function fmtDate(d) {
    if (!d) return "";
    var dt = new Date(d);
    if (isNaN(dt)) return esc(d);
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  function fill(sel, key, value) {
    document.querySelectorAll('[' + key + ']').forEach(function (el) {
      if (el.getAttribute(key) === sel) el.innerHTML = value;
    });
  }
  function set(attr, name, html) {
    document.querySelectorAll('[data-' + attr + '="' + name + '"]').forEach(function (el) {
      el.innerHTML = html;
    });
  }
  function target(name) { return document.querySelector('[data-render="' + name + '"]'); }
  function empty(el, msg) { if (el) el.innerHTML = '<p class="empty">' + esc(msg) + '</p>'; }

  // ---------- HOME ----------
  get("content/home.json").then(function (d) {
    if (!d) return;
    if (d.heading) set("home", "heading", md.render(d.heading).replace(/^<p>|<\/p>$/g, ""));
    if (d.study) set("home", "study", esc(d.study));
    if (d.intro) set("home", "intro", esc(d.intro));
    if (d.goals) set("home", "goals", esc(d.goals));
    if (d.photo) {
      var m = document.querySelector('[data-home="photo"]');
      if (m) m.innerHTML = '<img src="' + esc(img(d.photo, 900)) + '" data-fallback="' + esc(d.photo) + '" alt="Portrait">';
    }
  });

  // ---------- ABOUT ----------
  get("content/about.json").then(function (d) {
    if (!d) return;
    if (d.title) set("about", "title", esc(d.title));
    if (d.bio) { set("about", "bio", md.render(d.bio)); imgFix(document.querySelector('[data-about="bio"]'), 1000); }
    if (d.glanceTitle) set("about", "glanceTitle", esc(d.glanceTitle));
    if (d.glance) set("about", "glance", md.render(d.glance));
    if (Array.isArray(d.skills) && d.skills.length) {
      set("about", "skills", d.skills.map(function (s) {
        return '<span class="tag">' + esc(s) + '</span>';
      }).join(""));
    }
    if (d.cvUrl) {
      set("about", "cv", '<a class="btn btn-ghost" href="' + esc(d.cvUrl) + '" target="_blank" rel="noopener">' +
        esc(d.cvLabel || "Download CV") + '</a>');
    }
  });

  // ---------- RESEARCH ----------
  get("content/research.json").then(function (d) {
    var el = target("research");
    var items = d && d.items || [];
    if (!items.length) { empty(el, "Research projects will appear here."); return; }
    el.innerHTML = items.map(function (p) {
      var cover = p.cover ? '<div class="card-cover"><img src="' + esc(img(p.cover, 900)) + '" data-fallback="' + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy"></div>' : "";
      var link = p.link ? '<a class="card-link" href="' + esc(p.link) + '" target="_blank" rel="noopener">' + esc(p.linkLabel || "View project") + '</a>' : "";
      return '<article class="card">' + cover +
        (p.date ? '<span class="meta">' + fmtDate(p.date) + '</span>' : "") +
        '<h3>' + esc(p.title) + '</h3>' +
        (p.summary ? '<p>' + esc(p.summary) + '</p>' : "") + link + '</article>';
    }).join("");
    reveal(el);
  });

  // ---------- IN THE NEWS ----------
  get("content/press.json").then(function (d) {
    var el = target("press");
    var items = (d && d.items || []).slice();
    if (!items.length) { empty(el, "News coverage will appear here."); return; }
    // newest first
    items.sort(function (a, b) { return new Date(b.date || 0) - new Date(a.date || 0); });
    el.innerHTML = items.map(function (p) {
      var shot = p.image
        ? '<div class="clip-shot"><img src="' + esc(img(p.image, 700)) + '" data-fallback="' + esc(p.image) +
          '" alt="' + esc(p.title || p.outlet) + '" loading="lazy"></div>'
        : "";
      var inner =
        shot +
        '<div class="clip-body">' +
        (p.outlet ? '<div class="clip-outlet">' + esc(p.outlet) + '</div>' : "") +
        (p.title ? '<h3>' + esc(p.title) + '</h3>' : "") +
        (p.date ? '<div class="meta">' + fmtDate(p.date) + '</div>' : "") +
        (p.summary ? '<p>' + esc(p.summary) + '</p>' : "") +
        (p.url ? '<span class="card-link">Read the article</span>' : "") +
        '</div>';
      return p.url
        ? '<a class="clip" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
        : '<div class="clip">' + inner + '</div>';
    }).join("");
    reveal(el);
  });

  // ---------- FIELD NOTES ----------
  get("content/fieldnotes.json").then(function (d) {
    var el = target("fieldnotes");
    var items = d && d.items || [];
    if (!items.length) { empty(el, "Field notes will appear here."); return; }
    el.innerHTML = items.map(function (n) {
      var photo = n.photo ? '<img src="' + esc(img(n.photo, 500)) + '" data-fallback="' + esc(n.photo) + '" alt="' + esc(n.species || n.location) + '" loading="lazy">' : "";
      return '<article class="note">' +
        '<div class="note-photo">' + photo + '</div>' +
        '<div>' +
        '<div class="meta">' + [fmtDate(n.date), esc(n.location)].filter(Boolean).join(" · ") + '</div>' +
        (n.species ? '<div class="species">' + esc(n.species) + '</div>' : "") +
        (n.note ? '<p>' + esc(n.note) + '</p>' : "") +
        '</div></article>';
    }).join("");
    reveal(el);
  });

  // ---------- GALLERY (interactive) ----------
  var galleryData = [];
  get("content/gallery.json").then(function (d) {
    var el = target("gallery");
    galleryData = d && d.items || [];
    if (!galleryData.length) { empty(el, "Photos will appear here — click one to reveal its story."); return; }
    el.innerHTML = galleryData.map(function (g, idx) {
      var thumb = g.image ? '<img src="' + esc(img(g.image, 800)) + '" data-fallback="' + esc(g.image) + '" alt="' + esc(g.title) + '" loading="lazy">' : "";
      return '<button class="gallery-item" data-idx="' + idx + '">' + thumb +
        '<span class="g-hint">+</span>' +
        '<span class="g-label">' + esc(g.title || "Untitled") + '</span></button>';
    }).join("");
    el.querySelectorAll(".gallery-item").forEach(function (btn) {
      btn.addEventListener("click", function () { openModal(galleryData[+btn.dataset.idx]); });
    });
    reveal(el);
  });

  // ---------- RESOURCES ----------
  get("content/resources.json").then(function (d) {
    var el = target("resources");
    var items = d && d.items || [];
    if (!items.length) { empty(el, "Useful links and datasets will appear here."); return; }
    el.innerHTML = items.map(function (r) {
      var inner = '<div class="res-icon">🔗</div><div>' +
        '<h4>' + esc(r.title) + '</h4>' +
        (r.category ? '<div class="meta"><span class="tag">' + esc(r.category) + '</span></div>' : "") +
        (r.description ? '<p>' + esc(r.description) + '</p>' : "") + '</div>';
      return r.url
        ? '<a class="res" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
        : '<div class="res">' + inner + '</div>';
    }).join("");
    reveal(el);
  });

  // ---------- CONTACT ----------
  // Only the intro line lives in the page; the links are rendered onto
  // the end screen by main.js, so there's one source of truth.
  get("content/contact.json").then(function (d) {
    if (d && d.blurb) set("contact", "blurb", esc(d.blurb));
  });

  // ---------- MODAL ----------
  var modal = document.getElementById("galleryModal");
  function openModal(g) {
    if (!g || !modal) return;
    document.getElementById("modalMedia").innerHTML = g.image
      ? '<img src="' + esc(img(g.image, 1600)) + '" data-fallback="' + esc(g.image) + '" alt="' + esc(g.title) + '">' : "";
    document.getElementById("modalTitle").textContent = g.title || "";
    document.getElementById("modalMeta").textContent = [fmtDate(g.date), g.location].filter(Boolean).join(" · ");
    document.getElementById("modalExperience").innerHTML = md.render(g.experience || "");
    imgFix(document.getElementById("modalExperience"), 1200);
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (modal) {
    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }
})();
