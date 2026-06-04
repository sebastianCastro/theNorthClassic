# Design System — The North Classic

## Identidad

Estética **Modern Sports Media Platform**: oscuro, editorial, aspiracional (referentes: EYBL, Overtime Elite, Ballislife).

## Colores

| Token | Hex | Uso |
|-------|-----|-----|
| Black | `#070707` | Fondo principal |
| North Red | `#9B111E` | Marca secundaria |
| Bright Red | `#D72638` | CTAs, acentos |
| White | `#FFFFFF` | Texto principal |
| Gray 100 | `#EAEAEA` | Texto secundario |
| Gray 400 | `#A3A3A3` | Muted |
| Gray 600 | `#555555` | Bordes sutiles |
| Success | `#22C55E` | Estados positivos |

## Tipografía

- **Display**: Bebas Neue — headlines, scores
- **Body**: Inter — párrafos, UI
- **Stats**: Space Grotesk — números, records

## Espaciado

Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px

## Layout

- Max width: 1440px
- Content: 1280px (`.container-north`)
- Grid: 12 columnas en desktop

## Componentes

| Componente | Archivo |
|------------|---------|
| Header | `components/layout/Header.tsx` |
| PlayerCard | `components/players/PlayerCard.tsx` |
| StatCounter | `components/ui/StatCounter.tsx` |
| SectionHeading | `components/ui/SectionHeading.tsx` |
| Lightbox | `components/ui/Lightbox.tsx` |

## Motion

- Hover en cards (`card-hover`)
- Contadores animados con `prefers-reduced-motion` respetado
- Sin animaciones excesivas

## Responsive breakpoints

320, 375, 390, 768, 1024, 1440+ px
