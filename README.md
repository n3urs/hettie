# Hettie — Marine Biology Portfolio & Blog

A static site (plain HTML/CSS/JS, no build step) with a friendly admin panel so Hettie can
write posts and manage all content herself — no code, no git.

## How it works

- Public site: `index.html` (single-page: Home, About, Research, Field Notes, Gallery,
  Resources, Contact), `blog.html` (post list), `post.html?slug=…` (single post).
- Content lives in `content/*.json` and is rendered by the JS in `js/`.
- Hettie edits everything at **`/admin`** (Decap CMS). Publishing commits to this repo and
  Netlify redeploys automatically — she never touches code.

## Local preview

```bash
cd hettie
python3 -m http.server 8000
# open http://localhost:8000
```

(The `/admin` login only works once Netlify Identity is set up — see below.)

## One-time setup (Oscar)

1. **Create a GitHub repo** and push this folder (same as builtinkernow).
2. **Netlify → Add new site → Import from Git** → pick the repo.
   Build command: *(empty)* · Publish directory: `.` (already set in `netlify.toml`).
3. **Netlify → Identity → Enable Identity.**
   - Registration preferences → **Invite only**.
   - Services → **Git Gateway → Enable**.
4. **Identity → Invite users** → enter Hettie's email.
   She gets an email → clicks the link → sets a password → can now log in at `yoursite/admin`.
5. *(Optional)* Add a custom domain in Netlify → Domain settings.

That's it. After step 4, Hettie visits `/admin`, logs in, and can edit every section, upload
photos, and publish blog posts.

## Editing tips for Hettie

- Text boxes marked "Body" or "The experience" use **markdown** — the editor has buttons for
  bold, headings, links and images, so no need to learn syntax.
- In the Home heading, wrap a word in `*stars*` to give it the coloured accent.
- Blog posts need a **Slug** (the web address) — keep it `lowercase-with-dashes`.
- Uploaded images are saved automatically; just pick "Choose an image".
