/* post.js — renders a single blog post from ?slug= using content/blog.json */
(function () {
  "use strict";
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtDate(d) {
    if (!d) return "";
    var dt = new Date(d);
    return isNaN(dt) ? esc(d) : dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  var box = document.getElementById("postContent");
  var slug = new URLSearchParams(location.search).get("slug");

  if (!slug) {
    box.innerHTML = '<p class="empty">No post specified. <a class="back-link" href="blog.html">Back to blog</a></p>';
    return;
  }

  fetch("content/blog.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      var post = (d && d.posts || []).filter(function (p) { return p.slug === slug; })[0];
      if (!post) {
        box.innerHTML = '<p class="empty">Post not found. <a class="back-link" href="blog.html">Back to blog</a></p>';
        return;
      }
      document.title = post.title + " — Hettie";
      var tags = (post.tags || []).length
        ? '<div class="tag-row" style="margin-bottom:20px">' + post.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</div>'
        : "";
      var cover = post.cover ? '<div class="post-cover"><img src="' + esc(post.cover) + '" alt="' + esc(post.title) + '"></div>' : "";
      box.innerHTML =
        '<h1>' + esc(post.title) + '</h1>' +
        '<p class="meta" style="color:var(--text-soft);margin-bottom:22px">' + fmtDate(post.date) + '</p>' +
        cover + tags +
        '<div class="post-body prose">' + md.render(post.body || post.excerpt || "") + '</div>' +
        '<p style="margin-top:34px"><a class="back-link" href="blog.html">Back to blog</a></p>';
    })
    .catch(function () {
      box.innerHTML = '<p class="empty">Couldn\'t load this post.</p>';
    });
})();
