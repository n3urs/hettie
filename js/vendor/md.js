/* Tiny markdown -> HTML renderer (no dependencies).
   Supports: headings, bold, italic, inline code, links, images,
   blockquotes, unordered/ordered lists, code fences, hr, paragraphs.
   Escapes HTML first, so content is safe to inject. */
(function (global) {
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function inline(s) {
    // images ![alt](src)
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" loading="lazy">');
    // links [text](href)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // bold **x** / __x__
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    // italic *x* / _x_
    s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
    s = s.replace(/(^|[^_])_([^_\s][^_]*)_/g, "$1<em>$2</em>");
    // inline code `x`
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    return s;
  }
  function render(md) {
    if (!md) return "";
    md = String(md).replace(/\r\n/g, "\n");
    var lines = md.split("\n");
    var out = [];
    var i = 0;
    var listType = null;
    function closeList() { if (listType) { out.push("</" + listType + ">"); listType = null; } }

    while (i < lines.length) {
      var line = lines[i];

      // code fence
      if (/^```/.test(line)) {
        closeList();
        var code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { code.push(esc(lines[i])); i++; }
        i++;
        out.push("<pre><code>" + code.join("\n") + "</code></pre>");
        continue;
      }
      // blank
      if (/^\s*$/.test(line)) { closeList(); i++; continue; }
      // hr
      if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) { closeList(); out.push("<hr>"); i++; continue; }
      // heading
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { closeList(); var lvl = h[1].length; out.push("<h" + lvl + ">" + inline(esc(h[2])) + "</h" + lvl + ">"); i++; continue; }
      // blockquote
      if (/^\s*>\s?/.test(line)) {
        closeList();
        var quote = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
        out.push("<blockquote>" + inline(esc(quote.join(" "))) + "</blockquote>");
        continue;
      }
      // unordered list
      if (/^\s*[-*+]\s+/.test(line)) {
        if (listType !== "ul") { closeList(); out.push("<ul>"); listType = "ul"; }
        out.push("<li>" + inline(esc(line.replace(/^\s*[-*+]\s+/, ""))) + "</li>");
        i++; continue;
      }
      // ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        if (listType !== "ol") { closeList(); out.push("<ol>"); listType = "ol"; }
        out.push("<li>" + inline(esc(line.replace(/^\s*\d+\.\s+/, ""))) + "</li>");
        i++; continue;
      }
      // paragraph (gather until blank)
      closeList();
      var para = [line];
      i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|```|\s*>|\s*[-*+]\s|\s*\d+\.\s)/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      out.push("<p>" + inline(esc(para.join(" "))) + "</p>");
    }
    closeList();
    return out.join("\n");
  }
  global.md = { render: render };
})(window);
