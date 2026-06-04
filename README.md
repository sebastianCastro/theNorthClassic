# The North Classic

Plataforma web de showcase de baloncesto juvenil en México — torneos, perfiles de jugadores, scouting y CMS administrativo.

## Stack técnico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Frontend | **Next.js 16** (App Router) | SEO, ISR, Image Optimization, rutas en español |
| Estilos | **Tailwind CSS v4** | Design system dark, mobile-first |
| Base de datos | **PostgreSQL** (prod) / **SQLite** (dev) | Prisma ORM, bajo mantenimiento |
| Auth | **Auth.js (NextAuth v5)** | Roles Admin / Visitante, credenciales |
| CMS | **Panel admin propio** | CSV import desde Google Sheets / Forms |
| Hosting | **Vercel** | CDN global, edge en México, deploy automático |
| Storage | **Vercel Blob** o **Cloudflare R2** | Fotos y media (configurar en producción) |
| Analytics | **Google Analytics 4** | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

## Inicio rápido

```bash
npm install
npm run db:setup
npm run dev
```

- Sitio: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- Credenciales seed: `admin@thenorthclassic.mx` / `admin123`

## Estructura del proyecto

```
src/app/(site)/     # Páginas públicas (es-MX)
src/app/admin/      # CMS y importación CSV
prisma/             # Schema y seed
docs/               # Arquitectura, design system, accesibilidad
```

## Importación de jugadores (Google Forms)

1. En Google Sheets: **Archivo → Descargar → CSV**
2. Admin → **Importar** → subir CSV
3. Columnas soportadas en español: `nombre`, `apellido`, `equipo`, `numero`, `posicion`, `altura`, `peso`, etc.
4. Duplicados se detectan por slug de nombre y se actualizan

## Producción

1. Crear base **PostgreSQL** (Neon, Supabase o Railway)
2. Actualizar `DATABASE_URL` en Vercel
3. Configurar `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`
4. `npx prisma migrate deploy`
5. Subir media a Blob/R2 y actualizar URLs en admin

## Documentación

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — API, schema, hosting
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — Colores, tipografía, componentes
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) — Auditoría WCAG 2.2 AA
- [docs/SITEMAP.md](docs/SITEMAP.md) — Mapa del sitio

## Licencia

Proyecto privado — The North Classic © 2026
