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
to the latest official `GameFeed-Setup.exe` GitHub Release asset so completed
downloads are included in GitHub's release-asset counter. Update that single
constant if the installer host or filename changes.

## Owner download dashboard

`/owner/` is an unlinked, `noindex` dashboard for release download totals. It
requires a GitHub token and unlocks only when the authenticated account is
`RichieFireball`. The token is held in memory for the current tab only and is
sent only to `api.github.com`; it is never stored by the page.

Because GitHub Pages and GitHub release statistics are public, this protects
the dashboard view rather than making the underlying GitHub API data private.
Use a fine-grained token with the minimum read-only access needed for the
public `GameFeed-site` repository.

The site has no package dependencies and can be hosted on GitHub Pages,
Cloudflare Pages, Netlify, or any static web server.

## Sponsored placement page

`/ads/` is an unlinked, `noindex` page reserved for the desktop app's
provider-neutral sponsored overlay. Add a future provider's approved embed
code inside `website/ads/index.html`; the public homepage is independent and
does not need to change.
