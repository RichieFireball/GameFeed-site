# GameFeed website

Static marketing site for the GameFeed Windows desktop application.

## Preview locally

From the repository root:

```powershell
py -3.12 -m http.server 4173 --directory website
```

Then open `http://127.0.0.1:4173`.

## Download button

All download buttons use `DOWNLOAD_URL` near the top of `script.js`. It points
to the latest official `GameFeed-Setup.exe` GitHub Release asset. Update that
single constant if the installer host or filename changes.

The site has no package dependencies and can be hosted on GitHub Pages,
Cloudflare Pages, Netlify, or any static web server.

## Sponsored placement page

`/ads/` is an unlinked, `noindex` page reserved for the desktop app's
provider-neutral sponsored overlay. Add a future provider's approved embed
code inside `website/ads/index.html`; the public homepage is independent and
does not need to change.
