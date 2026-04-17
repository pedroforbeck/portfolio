# Project Overview — pedroforbeck.me

## 1. Project Summary

**Name:** pedroforbeck.me  
**Location in Monorepo:** `projects/pedroforbeck-portfolio` *(or root if standalone)*  
**Owner / Maintainer:** Pedro Forbeck  
**Status:** Active / Public  

**Purpose:**  
Personal portfolio website for Pedro Forbeck, a Software Engineer focused on the intersection of logic and craft. The site serves as a public-facing identity hub, showcasing projects, background, and professional presence. It acts as the front door for recruiters, collaborators, and anyone exploring Pedro's work.

**Key Features:**
- About section (developer identity and philosophy)
- Work section listing open-source and personal projects with GitHub links
- Theme toggle (light/dark mode)
- Minimal, clean design — no bloat, no distractions
- 2026-dated footer (modern, freshly maintained)

---

## 2. Context and Relationships

**Upstream Dependencies:**
- GitHub (project hosting — all listed work lives there)
- `pedroforbeck/bff-agendador-tarefas` — Backend-for-frontend task scheduling service (Java)
- `pedroforbeck/sentinel` — Monitoring & alerting system (Java)

**Downstream Dependents:**
- None directly. This is a leaf node — a public-facing static site.

**Integration Points:**
- Outbound links to GitHub repositories
- No backend, no API, no database

**Bounded Context:**
- Developer portfolio / personal brand / public identity

---

## 3. Architecture Overview

**Type:** Frontend static site (personal portfolio)  
**Language / Stack:** HTML, CSS, JavaScript (likely vanilla or lightweight framework based on the minimal footprint)  
**Key Technologies Used:**
- Static site generation or plain HTML/CSS
- Theme switching (CSS variables or class toggle)
- Minimalist single-page layout

**Architecture Summary:**
> The site is a single-page static portfolio. It renders two primary sections — About and Work — with an anchor-based navigation. A theme toggle allows switching between light and dark modes. Projects are listed as anchor cards linking directly to GitHub. No server-side rendering or API calls are involved.

**Key Components or Directories:**

| Path | Description |
|------|-------------|
| `/` (root) | Landing + About section |
| `#about` | Developer philosophy and intro |
| `#work` | Project cards with name, description, stack tag, and GitHub link |
| Theme toggle | UI control for light/dark mode switch |

**Data Flow:**
Static — no dynamic data. Content is hardcoded HTML. Projects are manually curated.

---

## 4. Configuration & Environment

**Environment Variables:** None (static site)

**Build / Run Commands:**
```bash
# If plain HTML/CSS
open index.html

# If using a static site generator (e.g., Astro, Eleventy, Hugo)
npm run dev      # local dev
npm run build    # production build
```

**Deployment Target:** Likely Vercel, Netlify, or GitHub Pages (standard for minimal static portfolios)

**CI/CD:** Likely auto-deploy on push to `main` via Vercel or Netlify

---

## 5. API / Event Interfaces

**Public APIs:** None  
**Events Produced / Consumed:** None  

---

## 6. Data & Storage

**Database:** None  
**External Resources:** None  
All content is static and inline.

---

## 7. Security & Permissions

- No auth, no sensitive data, no user input
- All outbound links point to public GitHub repositories
- No forms, no data collection

---

## 8. Observability

- Basic web analytics may exist (not publicly visible from source)
- No custom metrics or alerting needed for a static site

---

## 9. Development Notes

**Local Development:**
> Clone the repo, open `index.html` in browser or use a local server (e.g., `npx serve .` or VS Code Live Server). If using a framework, install deps with `npm install` and run `npm run dev`.

**Testing Strategy:**
- Visual regression testing (manual)
- Cross-browser compatibility check
- Lighthouse audit for performance, accessibility, SEO scores

---

## 10. Projects Listed on the Site

### Task Scheduler (`bff-agendador-tarefas`)
- **Type:** Backend-for-frontend task scheduling service
- **Stack:** Java
- **Repo:** https://github.com/pedroforbeck/bff-agendador-tarefas
- **Purpose:** Orchestrates task scheduling at the BFF layer, decoupling frontend scheduling concerns from core backend services.

### Sentinel
- **Type:** Monitoring & alerting system
- **Stack:** Java
- **Repo:** https://github.com/pedroforbeck/sentinel
- **Purpose:** System for monitoring application health and triggering alerts based on configured thresholds or conditions.

---

## 11. Any Findings / Future Improvements

- Add project descriptions with metrics (impact, usage, scale) to strengthen credibility
- Consider adding a blog or writing section (Pedro has a related workflow guide worth publishing)
- Add contact section or social links (LinkedIn, Twitter/X, email)
- SEO improvements: meta tags, Open Graph, structured data
- Add a case study or "how I built this" section for listed projects
- Consider RSS feed if blog is added
- Animate section transitions for a more polished UX

---

## 12. Cross-Project Links

| Related Project | Relationship | Notes |
|-----------------|--------------|-------|
| `bff-agendador-tarefas` | showcased | Java BFF task scheduler |
| `sentinel` | showcased | Java monitoring & alerting |
| AI Dev Workflow (gist) | context guide | Methodology reference for AI-assisted development — by fforbeck |

---

## 13. Revision History

| Date | Author | Summary |
|------|--------|---------|
| 2026-04-07 | Claude (Anthropic) | Initial draft generated from pedroforbeck.me + fforbeck AI workflow guide |
