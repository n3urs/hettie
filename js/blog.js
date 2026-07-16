/* blog.js — renders the blog post list from content/blog.json */
(function () {
  "use strict";
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtDate(d) {
    if (!d) return "";
    var dt = new Date(d);
    return isNaN(dt) ? esc(d) : dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  var list = document.getElementById("postList");

  fetch("content/blog.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      var posts = (d && d.posts || []).slice();
      if (!posts.length) {
        list.innerHTML = '<p class="empty">No posts yet — check back soon 🌊</p>';
        return;
      }
      // newest first
      posts.sort(function (a, b) { return new Date(b.date || 0) - new Date(a.date || 0); });
      list.innerHTML = posts.map(function (p) {
        var cover = p.cover ? '<div class="card-cover"><img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy"></div>' : "";
        var tags = (p.tags || []).length ? '<div class="tag-row">' + p.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</div>' : "";
        return '<a class="card" href="post.html?slug=' + encodeURIComponent(p.slug || "") + '">' +
          cover +
          '<span class="meta">' + fmtDate(p.date) + '</span>' +
          '<h3>' + esc(p.title) + '</h3>' +
          (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : "") +
          tags +
          '<span class="card-link">Read more</span></a>';
      }).join("");
    })
    .catch(function () {
      list.innerHTML = '<p class="empty">Couldn\'t load posts.</p>';
    });
})();
