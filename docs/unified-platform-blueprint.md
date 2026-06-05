# Unified Sooq Alketab Platform Blueprint

This repository is the production base for the merged platform.

## Source repositories

1. sooq-alketabplus
   - Production base.
   - Firebase authentication.
   - Inventory, invoices, customers, suppliers, purchases, finance, reports, audit, recycle bin.

2. Ss
   - Diwan, sleep manager, day planner, backup/import, and a local Sooq Ketab manager.
   - Useful modules: poetry archive, personal planning, backup UX, book seed data.

3. hogass
   - Unified command center, sidebar architecture, file manager, fuzzy search, dashboard shell.
   - Useful modules: global search, files, command palette, unified dashboard experience.

4. albasha-hwagees
   - Polished public-facing shell for writing, discipline, daily organization, and literary identity.
   - Useful modules: public presentation style, overview cards, poetic/personal brand tone.

## Final target

A single Arabic RTL platform that works as:

- Public library website.
- Book catalog and request portal.
- User registration/login area.
- Admin dashboard.
- POS and inventory system.
- Orders and shipping management.
- Customer and supplier CRM.
- Financial accounts, expenses, purchases, reports.
- Poetry/diwan section.
- File/archive manager.
- Global search and command center.
- Netlify deployable Vite application.

## Brand hierarchy

Sooq Alketab remains the original foundation.
Sooq Alketab Plus and Sooq Alketab Technology are presented as independent branches under the broader brand family, not as one generic agency.

## Implementation phases

### Phase 1 - Stabilize production base

- Keep sooq-alketabplus as the main application.
- Fix login type mismatch.
- Keep Netlify deployment deterministic.
- Keep Firebase as the real persistence layer.
- Prevent local-only critical business data where possible.

### Phase 2 - Add public portal

- Public landing page.
- Library catalog.
- Book details.
- Book request / order interest form.
- Login entry for users/admin.

### Phase 3 - Add merged modules

- Poetry/diwan from Ss and albasha-hwagees.
- Day planner and notes as optional owner tools.
- Global search from hogass using Fuse.js.
- File/archive manager from hogass after storage decision.

### Phase 4 - Harden for Netlify

- Vite-only build.
- No webpack template.
- dist publish directory.
- SPA redirects.
- Node 20.
- Remove AI Studio import-map assumptions when safe.

## Immediate coding rules

- Do not paste four apps into one App.tsx.
- Extract reusable features into modules.
- Keep admin and public user routes separate.
- Keep business data in Firestore.
- LocalStorage may only be used for cache, preferences, or temporary drafts.
