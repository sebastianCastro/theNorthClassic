# Arquitectura — The North Classic

## Visión general

```
[Usuario] → [Vercel CDN / Edge] → [Next.js App Router]
                                      ├── Server Components (páginas, SEO)
                                      ├── Server Actions (CMS import)
                                      ├── API Routes (Auth.js)
                                      └── Prisma → PostgreSQL
```

## Base de datos (Prisma)

Entidades principales: `Player`, `Team`, `Game`, `Tournament`, `MediaItem`, `Sponsor`, `Standing`, `User`.

El perfil de jugador (`Player`) almacena:
- Datos físicos y posición
- `achievements` (JSON, 5 logros del formulario)
- `highlightUrl` (YouTube del jugador)
- Redes sociales
- Relación con `PlayerPhoto` y `PlayerAward`

## Autenticación

- **Admin**: acceso completo al panel e importación CSV
- **Visitante** (coach, scout): rol `VISITOR` — extensible para edición de roster propio

Auth.js con adapter Prisma y provider Credentials (bcrypt).

## SEO

- `generateMetadata` por ruta dinámica (`/jugadores/[slug]`)
- JSON-LD: Organization, Person, SportsEvent, BreadcrumbList, VideoObject
- `/sitemap.xml` y `/robots.txt` generados dinámicamente

## Seguridad

- HTTPS (Vercel)
- CSP headers en `next.config.ts`
- Server Actions con `requireAdmin()`
- Prisma parametrizado (anti SQL injection)
- Sanitización de URLs en embeds YouTube

## CDN y México

Vercel Edge entrega assets estáticos y páginas cacheadas cerca del usuario. Para tráfico pesado de video, usar YouTube/Vimeo embebido (no self-host). Imágenes: `next/image` con AVIF/WebP.

## Escalabilidad

1. **Fase 1** (actual): Monolito Next.js + SQLite/Postgres
2. **Fase 2**: Vercel Blob + Redis para live scores
3. **Fase 3**: Workers para notificaciones push de partidos en vivo

## Costos estimados (inicio)

| Servicio | Costo |
|----------|-------|
| Vercel Pro | ~$20 USD/mes |
| Neon Postgres | Free tier → $19 |
| Blob storage | Uso bajo ~$5 |
| **Total** | **~$25–45 USD/mes** |
