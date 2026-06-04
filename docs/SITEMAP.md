# Sitemap — The North Classic

## Páginas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Home — hero, destacados, stats, sponsors |
| `/torneo` | Overview, reglas, venue, FAQ, registro |
| `/equipos` | Directorio de equipos |
| `/equipos/[slug]` | Roster, record, partidos |
| `/jugadores` | Directorio con filtros avanzados |
| `/jugadores/[slug]` | **Perfil de jugador** (página clave SEO) |
| `/calendario` | Lista / por día, filtros categoría |
| `/resultados` | Scores, standings |
| `/media` | Fotos, videos, highlights |
| `/patrocinadores` | Partners |
| `/nosotros` | Misión, historia, liderazgo |
| `/contacto` | Contacto y redes |
| `/privacidad` | Aviso legal |
| `/terminos` | Términos |

## Admin (no indexado)

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard |
| `/admin/login` | Autenticación |
| `/admin/importar` | CSV import |

## Jerarquía de componentes

```
Layout (Root)
├── SiteLayout (Header + Footer)
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── PlayerCard[]
│   │   ├── TeamCard[]
│   │   └── StatCounter[]
│   ├── JugadoresPage → PlayerDirectory
│   └── PlayerProfilePage
│       ├── PlayerGallery → Lightbox
│       └── PlayerResumeButton
└── AdminLayout
    ├── Dashboard
    └── CsvImporter
```
