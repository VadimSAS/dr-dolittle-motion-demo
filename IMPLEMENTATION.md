# Dr Dolittle motion demo

Original code: https://github.com/whatisjery/atelier-ui-codrops
Original tutorial: https://tympanus.net/codrops/2026/10/21/atelier-ui-webgl-dom/

The original SphereGallery shaders, spherical tile layout, focus and dissolve animations,
WebglProvider and WebglScene are retained. This is WebGL, not a CSS carousel.
Added: local patient sources, full-text dialog, hover captions, keyboard rotation/zoom,
bounded wheel zoom, restoration of the view, WebGL fallback and reduced motion.

## Reproduce

Use Node >=20.9 and **pnpm 10.10.0**, exactly as package.json specifies.
`corepack pnpm install --frozen-lockfile`
`corepack pnpm dev`

Build for GitHub Pages (PowerShell):
`$env:NEXT_PUBLIC_BASE_PATH='/dr-dolittle-motion-demo'`
`corepack pnpm build`

Serve the `out` directory below `/dr-dolittle-motion-demo/` to check the same URLs.
All 81 source articles, dates, paragraphs and image associations are in
`src/data/stories.json`. 77 contain media; 4 contain no photographs.
Sphere textures are bounded to the four pilot patients. Fifty tiles reuse four textures.
The archive uses native details/summary and lazy images. Text is present in exported HTML.
This test copy is noindex to avoid competing with production SEO.

## Static website integration

`integration.html` demonstrates a normal static page embedding the isolated `/module/`
export in an iframe. No Next.js migration of the host website is required. Root `/` and
`/gallery/` show the full demo and accessible archive. Existing production header/footer
can surround the iframe; keep original indexable stories in the host page as well.
No production files, CRM, databases, booking or telephony integrations were changed.
The demo navigation points back to production pages but does not write to them.

## Limits

The original gallery is viewed from inside the spherical surface, as in Atelier's demo.
The remaining 73 illustrated articles are prepared in data and archive, not activated as
textures before the four-patient pilot is approved. A later rollout should load bounded
batches of patients and dispose old textures on batch change.
Desktop browser and responsive viewport checks do not certify physical iOS/Android
devices or establish a mobile FPS benchmark; those require hardware testing.
