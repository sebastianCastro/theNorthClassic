# Auditoría de accesibilidad — WCAG 2.2 AA

## Implementado

| Criterio | Estado |
|----------|--------|
| Skip link al contenido | ✅ `#contenido-principal` |
| Navegación por teclado | ✅ focus-visible en globals.css |
| ARIA en menú móvil | ✅ `aria-expanded`, `aria-controls` |
| Contraste texto | ✅ blanco/#070707, accent sobre oscuro |
| Imágenes alt | ✅ nombres de jugadores/equipos |
| Reduced motion | ✅ `@media (prefers-reduced-motion: reduce)` |
| Formularios etiquetados | ✅ admin login, filtros jugadores |
| Lightbox teclado | ✅ Escape, flechas |
| Idioma | ✅ `lang="es-MX"` |

## Pendiente / producción

- [ ] Auditoría automática con axe-core en CI
- [ ] Subtítulos en videos embebidos (YouTube CC)
- [ ] Revisión manual con lector de pantalla (NVDA/VoiceOver)
- [ ] Página de accesibilidad con contacto

## Contraste verificado

- Texto blanco sobre `#070707`: > 15:1
- `#D72638` sobre negro (botones): cumple para texto grande
- `#A3A3A3` muted: usar solo para texto secundario no crítico
