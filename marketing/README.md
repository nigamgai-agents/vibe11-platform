# Vibe11 Marketing Site

Static marketing site for [www.vibe11.ai](https://www.vibe11.ai). No build step, no dependencies.

## Files

- `index.html` — all page content (hero, problem/solution, how it works, CTA, footer)
- `styles.css` — design system and layout
- `script.js` — scroll reveals, waitlist form handler
- `assets/vibe11-mark.svg` — transparent logo mark (nav + footer)
- `assets/favicon.svg` — simplified mark for browser tabs
- `assets/vibe11-lockup.svg` — full brand lockup (use as the base for the og-image)

## Preview locally

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Any static host works — point it at this directory:

- **Vercel**: `vercel deploy` (or drag the folder into vercel.com/new)
- **Netlify**: drag the folder into app.netlify.com/drop
- **Cloudflare Pages**: `npx wrangler pages deploy .`

Then point the `www.vibe11.ai` DNS at the host per their instructions.
Currently deployed on Vercel (project `vibe11`): `npx vercel deploy --prod` from this directory.

## Before launch

- Waitlist form is wired to Formspree (`FORMSPREE_ENDPOINT` in `script.js`).
- Add an `og-image.png` (1200×630) and reference it with a
  `<meta property="og:image" ...>` tag for link previews.
