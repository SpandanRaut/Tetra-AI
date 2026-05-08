# TETRA AI — Website (v2)

Premium rebuild of the Tetra AI marketing site. Vanilla HTML + CSS +
JavaScript, single Three.js dependency loaded from a CDN. No build
step, no framework. Open `index.html` and it runs.

---

## What changed in v2 vs v1

The brief was: *"this is great but missing the professionalism that big
companies have."* So v2 is rebuilt from the ground up with that in mind.

**Visual & feel**
- **Real 3D in the hero.** Replaced the 2D canvas with a Three.js scene
  — three nested wireframe tetrahedra, glowing vertex spheres, and 600
  orbital particles. The camera responds to mouse position and the
  tetrahedron tilts and scales as you scroll.
- **GLSL aurora background.** A custom WebGL fragment shader runs
  full-page behind everything — flowing fbm noise that subtly warps
  toward the cursor. This is what gives the site its atmosphere.
- **Glassmorphism cards** with a radial cursor glow that follows the
  pointer (driven by CSS variables set in JS). Cards 3D-tilt toward
  the cursor on hover.
- **Premium typography pairing** — Instrument Serif (display) with
  Geist (body) and JetBrains Mono (technical labels).
- **Custom cursor** with a magnetic ring that lerps and a hard dot
  that tracks 1:1 — disabled on touch.

**Content**
- **Case studies section** with four real-feeling examples — each with
  a custom animated visual (browser mockup, live chat, generative
  grid, automation flow).
- **Testimonial section** with a placeholder quote.
- **Trust strip** — animated marquee of the tech stack.
- **FAQ** as native `<details>` elements.
- **Contact form** with chip-style service selection and a quieter
  particle field behind it.

**Polish**
- Loader with animated logo and progress percentage.
- UTC clock in the footer (because small details matter).
- All animations respect `prefers-reduced-motion`.

---

## File structure

```
tetra-v2/
├── index.html              ← the page
├── assets/
│   └── logo.png            ← Tetra logo
├── css/
│   ├── reset.css           ← baseline reset
│   ├── main.css            ← design tokens, layout, all components
│   ├── animations.css      ← keyframes & reveal utilities
│   └── responsive.css      ← tablet & mobile breakpoints
└── js/
    ├── main.js             ← loader, nav, footer clock, smooth scroll
    ├── aurora-shader.js    ← full-page WebGL background shader
    ├── three-scene.js      ← Three.js 3D hero scene
    ├── contact-bg.js       ← quiet particle field for the contact section
    ├── animations.js       ← scroll reveals + stat count-ups
    ├── tilt.js             ← 3D card tilt + radial cursor glow
    ├── cursor.js           ← magnetic custom cursor (desktop only)
    └── form.js             ← contact form chips, validation, mailto submit
```

---

## How to run it

Open `index.html` in a browser. That's it.

For development (recommended — canvases size correctly on first paint):

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

---

## Where to make common changes

| What you want to change           | File                          | Where to look                              |
| --------------------------------- | ----------------------------- | ------------------------------------------ |
| Brand colors                      | `css/main.css`                | `:root` block at the top (`--cyan`, etc.)  |
| Fonts                             | `index.html` + `css/main.css` | `<link>` to Google Fonts + `--font-*` vars |
| Hero copy                         | `index.html`                  | inside `<section class="hero">`            |
| Service descriptions              | `index.html`                  | inside `<section class="services">`        |
| Case studies                      | `index.html`                  | inside `<section class="work">`            |
| Team members                      | `index.html`                  | inside `<section class="team">`            |
| Testimonial quote                 | `index.html`                  | inside `<section class="testimonial">`     |
| FAQ questions                     | `index.html`                  | inside `<section class="faq">`             |
| Contact email                     | `index.html` + `js/form.js`   | search `hello@tetra-ai.com`                |
| Tetrahedron size / particle count | `js/three-scene.js`           | `tetraSizes` array, `particleCount` const  |
| Aurora intensity                  | `css/main.css`                | `.aurora { opacity: ... }`                 |

---

## Wiring up the contact form to a real backend

Right now the form opens the user's mail client via `mailto:`. To wire
it to something real, open `js/form.js` and replace the body of the
submit handler. The form already collects: `name`, `email`, `service`,
`message`.

**Easiest no-code option — Formspree:**

```js
// In form.js, replace the mailto block with:
const res = await fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ name, email, service, message }),
});
if (res.ok) confirmSent(form);
```

Other good options: Resend, your own API endpoint, Cloudflare Workers,
Supabase Edge Functions.

---

## Browser support

Modern Chrome, Edge, Firefox, Safari (last 2 years). The site degrades
gracefully:

- WebGL not available → aurora background simply doesn't render
  (everything else still works).
- Three.js fails to load → hero loses the 3D scene, layout intact.
- Touch device → custom cursor and card tilt are disabled.
- `prefers-reduced-motion` → all animations are killed; 3D scenes
  render a single static frame.

---

## Performance notes

- WebGL pixel ratios are capped (1.5× for the aurora, 2× for Three.js)
  to keep things smooth on retina displays.
- Three.js scene is only ~600 particles + 3 wireframes — light enough
  to run at 60fps on mid-range hardware.
- Aurora shader uses 5 fbm octaves — adjustable in `aurora-shader.js`
  if you want more or fewer.
- All fonts use `display=swap` so type doesn't block paint.

---

## Quick to-dos before going live

1. Replace placeholder team names + roles in `index.html` (search for
   `[Founder Name]`, `[Engineer Name]`, etc.).
2. Replace placeholder testimonial in the testimonial section.
3. Replace `hello@tetra-ai.com` with your real address (in `index.html`
   and `js/form.js`).
4. Add real social links in the footer (currently `#`).
5. Wire up the contact form to a real backend (see above).
6. Replace the case study metrics with real client numbers (or rename
   the cases to your actual projects).
7. Add Open Graph + Twitter card meta tags if you'll be sharing the URL.
8. Add a `favicon.ico` if you want better tab branding (`logo.png` is
   already used as the icon, but `.ico` has wider compatibility).
