/* preview.js — makes the CMS preview pane look like the real site.
 *
 * Decap's default preview is a plain list of field values, which isn't much
 * help when you're trying to picture a finished post. These templates render
 * the same markup the site uses, with the site's own stylesheet loaded on top,
 * so what Hettie sees on the right is close to what visitors will get.
 *
 * No build step here either: `h` (createElement) and `createClass` are globals
 * provided by Decap, and markdown goes through the same js/vendor/md.js the
 * site uses, so previewed text renders exactly like the published page.
 */
(function () {
  "use strict";

  CMS.registerPreviewStyle("/css/style.css");
  CMS.registerPreviewStyle("/admin/preview.css");

  function toJS(entry) {
    var d = entry && entry.get && entry.get("data");
    return d && d.toJS ? d.toJS() : (d || {});
  }
  function markdown(text) {
    if (!text) return "";
    try { return window.md ? md.render(text) : String(text); }
    catch (e) { return String(text); }
  }
  function html(cls, str) {
    return h("div", { className: cls, dangerouslySetInnerHTML: { __html: str } });
  }
  function date(d) {
    if (!d) return "";
    var dt = new Date(d);
    return isNaN(dt) ? String(d)
      : dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  // *stars* -> the coloured italic accent, same as the site
  function accent(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*([^*]+)\*/g, '<span class="grad-serif">$1</span>');
  }
  function wrap(note, children) {
    return h("div", { className: "pv-wrap" },
      h("p", { className: "pv-note" }, note),
      children && children.length ? children : h("p", { className: "pv-empty" }, "Nothing to show yet.")
    );
  }
  function img(src, cls) {
    return src ? h("div", { className: cls || "" }, h("img", { src: src })) : null;
  }

  // ---------------- BLOG ----------------
  var BlogPreview = createClass({
    render: function () {
      var posts = (toJS(this.props.entry).posts || []).slice().reverse();
      return wrap("Blog preview — newest first", posts.map(function (p, i) {
        return h("article", { className: "pv-item", key: i },
          h("h1", {}, p.title || "Untitled post"),
          h("p", { className: "meta" }, date(p.date)),
          img(p.cover, "pv-cover"),
          (p.tags || []).length
            ? h("div", { className: "tag-row" }, p.tags.map(function (t, j) {
                return h("span", { className: "tag", key: j }, t);
              }))
            : null,
          html("post-body prose", markdown(p.body || p.excerpt || ""))
        );
      }));
    }
  });

  // ---------------- HOME ----------------
  var HomePreview = createClass({
    render: function () {
      var d = toJS(this.props.entry);
      return wrap("Home page preview", [
        h("div", { className: "pv-item", key: "h" },
          h("span", { className: "eyebrow" }, "Welcome in — mind the tide"),
          h("h1", { dangerouslySetInnerHTML: { __html: accent(d.heading || "Your name") } }),
          h("p", { className: "hero-study" }, d.study || ""),
          d.photo ? img(d.photo, "pv-cover") : null,
          h("p", { className: "lead" }, d.intro || ""),
          d.goals ? h("div", { className: "hero-goals" }, d.goals) : null
        )
      ]);
    }
  });

  // ---------------- ABOUT ----------------
  var AboutPreview = createClass({
    render: function () {
      var d = toJS(this.props.entry);
      return wrap("About page preview", [
        h("div", { className: "pv-item", key: "a" },
          h("h1", {}, d.title || "About"),
          html("prose", markdown(d.bio || "")),
          (d.skills || []).length
            ? h("div", { className: "pv-skills" }, d.skills.map(function (s, i) {
                return h("span", { className: "tag", key: i }, s);
              }))
            : null,
          d.cvUrl ? h("p", {}, h("span", { className: "btn btn-ghost" }, d.cvLabel || "Download CV")) : null
        ),
        h("div", { className: "pv-item", key: "g" },
          h("span", { className: "eyebrow" }, "At a glance"),
          h("h1", { style: { fontSize: "1.5rem" } }, d.glanceTitle || "Currently"),
          html("prose", markdown(d.glance || ""))
        )
      ]);
    }
  });

  // ---------------- GALLERY ----------------
  var GalleryPreview = createClass({
    render: function () {
      var items = toJS(this.props.entry).items || [];
      return wrap("Gallery preview — click-through stories shown below", [
        h("div", { className: "pv-gallery", key: "grid" }, items.map(function (g, i) {
          return h("div", { className: "pv-shot", key: i },
            g.image ? h("img", { src: g.image }) : null,
            h("span", {}, g.title || "Untitled")
          );
        })),
        items.length ? h("div", { key: "stories" }, items.map(function (g, i) {
          return h("div", { className: "pv-item", key: i, style: { marginTop: "18px" } },
            h("h1", { style: { fontSize: "1.3rem" } }, g.title || "Untitled"),
            h("p", { className: "meta" }, [date(g.date), g.location].filter(Boolean).join(" · ")),
            html("prose", markdown(g.experience || ""))
          );
        })) : null
      ]);
    }
  });

  // ---------------- FIELD NOTES ----------------
  var FieldNotesPreview = createClass({
    render: function () {
      var items = toJS(this.props.entry).items || [];
      return wrap("Field notes preview", items.map(function (n, i) {
        return h("div", { className: "pv-item", key: i },
          h("p", { className: "meta" }, [date(n.date), n.location].filter(Boolean).join(" · ")),
          n.species ? h("div", { className: "species" }, n.species) : null,
          img(n.photo, "pv-cover"),
          n.note ? h("p", {}, n.note) : null
        );
      }));
    }
  });

  // ---------------- RESEARCH ----------------
  var ResearchPreview = createClass({
    render: function () {
      var items = toJS(this.props.entry).items || [];
      return wrap("Research preview", items.map(function (p, i) {
        return h("div", { className: "pv-item", key: i },
          img(p.cover, "pv-cover"),
          h("p", { className: "meta" }, date(p.date)),
          h("h1", { style: { fontSize: "1.4rem" } }, p.title || "Untitled project"),
          p.summary ? h("p", {}, p.summary) : null,
          p.link ? h("p", {}, h("span", { className: "card-link" }, p.linkLabel || "View project")) : null
        );
      }));
    }
  });

  // ---------------- RESOURCES ----------------
  var ResourcesPreview = createClass({
    render: function () {
      var items = toJS(this.props.entry).items || [];
      return wrap("Resources preview", items.map(function (r, i) {
        return h("div", { className: "pv-item", key: i },
          h("h1", { style: { fontSize: "1.25rem" } }, r.title || "Untitled"),
          r.category ? h("span", { className: "tag" }, r.category) : null,
          r.description ? h("p", { style: { marginTop: "10px" } }, r.description) : null
        );
      }));
    }
  });

  // ---------------- CONTACT ----------------
  var ContactPreview = createClass({
    render: function () {
      var d = toJS(this.props.entry);
      return wrap("Contact preview", [
        h("div", { className: "pv-item", key: "c" },
          h("span", { className: "eyebrow" }, "The tide's in"),
          h("h1", { dangerouslySetInnerHTML: { __html: accent("Let's *talk*") } }),
          h("p", { className: "lead" }, d.blurb || ""),
          d.email ? h("p", {}, h("span", { className: "tag" }, "✉️ " + d.email)) : null,
          d.linkedin ? h("p", {}, h("span", { className: "tag" }, "LinkedIn")) : null
        )
      ]);
    }
  });

  // ---------------- SITE TEXT ----------------
  var SiteTextPreview = createClass({
    render: function () {
      var d = toJS(this.props.entry);
      var w = d.wave || {}, hero = d.hero || {};
      function section(label, s) {
        if (!s) return null;
        return h("div", { className: "pv-item", key: label },
          h("span", { className: "eyebrow" }, s.eyebrow || ""),
          h("h1", { dangerouslySetInnerHTML: { __html: accent(s.title || "") } }),
          h("p", { className: "section-sub" }, s.sub || "")
        );
      }
      return wrap("Headings preview", [
        h("div", { className: "pv-item", key: "wave" },
          h("h1", {}, w.name || ""),
          h("p", { className: "hero-study" }, w.tagline || ""),
          h("p", { className: "meta", style: { marginTop: "12px" } }, hero.eyebrow || "")
        ),
        section("research", d.research),
        section("fieldnotes", d.fieldnotes),
        section("gallery", d.gallery),
        section("resources", d.resources),
        section("blogPage", d.blogPage)
      ].filter(Boolean));
    }
  });

  // Register against both the collection name and the file name inside it —
  // Decap looks these up differently depending on the collection type, and
  // registering both is harmless.
  [
    ["blog", BlogPreview], ["home", HomePreview], ["about", AboutPreview],
    ["gallery", GalleryPreview], ["fieldnotes", FieldNotesPreview],
    ["research", ResearchPreview], ["resources", ResourcesPreview],
    ["contact", ContactPreview], ["sitetext", SiteTextPreview]
  ].forEach(function (pair) {
    CMS.registerPreviewTemplate(pair[0], pair[1]);
  });
})();
