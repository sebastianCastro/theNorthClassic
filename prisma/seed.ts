import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("northClassic2026!", 12);

  await prisma.user.upsert({
    where: { email: "admin@thenorthclassic.mx" },
    update: {
      passwordHash,
      name: "Administrador",
      role: "ADMIN",
    },
    create: {
      email: "admin@thenorthclassic.mx",
      name: "Administrador",
      role: "ADMIN",
      passwordHash,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      socialInstagram: "https://www.instagram.com/thenorth_classic",
      socialFacebook:
        "https://www.facebook.com/share/17kGPoa4W1/?mibextid=wwXIfr",
      socialTiktok: null,
      socialYoutube: null,
    },
    create: {
      id: "main",
      mission:
        "Elevar el baloncesto juvenil mexicano creando la plataforma de showcase más profesional del país, donde cada jugador tenga visibilidad ante scouts y programas universitarios.",
      history:
        "Desde 2022, The North Classic ha reunido a los mejores prospectos del norte de México en un formato competitivo inspirado en circuitos como EYBL y Prep Hoops.\n\nLo que comenzó como un torneo regional se consolidó como referencia nacional en scouting juvenil.",
      contactEmail: "info@thenorthclassic.mx",
      contactPhone: "+52 81 0000 0000",
      address: "Chihuahua, Chihuahua, México",
      socialInstagram: "https://www.instagram.com/thenorth_classic",
      socialFacebook:
        "https://www.facebook.com/share/17kGPoa4W1/?mibextid=wwXIfr",
      socialTiktok: null,
      socialYoutube: null,
      leadership: JSON.stringify([
        {
          name: "Roberto Vega",
          role: "Director del torneo",
          bio: "Ex jugador profesional y promotor de talento juvenil con 15 años de experiencia.",
        },
        {
          name: "Laura Méndez",
          role: "Directora de scouting",
          bio: "Conecta jugadores con programas NCAA y ligas de desarrollo en México y EE.UU.",
        },
      ]),
    },
  });

  const defaultConfig = {
    genderDivisions: ["Varonil", "Femenil"],
    categoryDivisions: ["2007-2009", "2010-2011"],
    rules: [],
    faqs: [],
    featuredPlayerSlugs: [],
    statLeaders: [],
    tournament: { name: "The North Classic 2026" },
    north: {
      instagram: "https://www.instagram.com/thenorth_classic",
      facebook:
        "https://www.facebook.com/share/17kGPoa4W1/?mibextid=wwXIfr",
    },
    tiago: {
      instagram: "https://www.instagram.com/tiago.shoots",
      facebook:
        "https://www.facebook.com/share/1GzeMwYxAE/?mibextid=wwXIfr",
      tiktok:
        "https://www.tiktok.com/@tiago.shoots?_r=1&_t=ZS-96u7IfksiYL",
      youtube:
        "https://www.youtube.com/@tiagoshoots?si=daVRHmHiM0RpRA8V",
    },
  };

  await prisma.siteSettings.update({
    where: { id: "main" },
    data: { configJson: JSON.stringify(defaultConfig) },
  });

  const teams = [
    {
      name: "Lobos Norte",
      slug: "lobos-norte",
      genderDivision: "Varonil",
      categoryDivision: "2007-2009",
      coaches: "Coach García / Coach Ruiz",
      logoUrl:
        "https://ui-avatars.com/api/?name=Lobos+Norte&background=9B111E&color=fff&size=256&bold=true",
    },
    {
      name: "Águilas CDMX",
      slug: "aguilas-cdmx",
      genderDivision: "Varonil",
      categoryDivision: "2007-2009",
      coaches: "Coach Morales",
      logoUrl:
        "https://ui-avatars.com/api/?name=Aguilas+CDMX&background=D72638&color=fff&size=256&bold=true",
    },
    {
      name: "Titanes GDL",
      slug: "titanes-gdl",
      genderDivision: "Varonil",
      categoryDivision: "2010-2011",
      coaches: "Coach Herrera",
      logoUrl:
        "https://ui-avatars.com/api/?name=Titanes+GDL&background=070707&color=D72638&size=256&bold=true",
    },
    {
      name: "Rayos MTY",
      slug: "rayos-mty",
      genderDivision: "Femenil",
      categoryDivision: "2007-2009",
      coaches: "Coach Soto",
      logoUrl:
        "https://ui-avatars.com/api/?name=Rayos+MTY&background=9B111E&color=fff&size=256&bold=true",
    },
  ];

  for (const t of teams) {
    await prisma.team.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }

  const lobos = await prisma.team.findUnique({ where: { slug: "lobos-norte" } });
  const aguilas = await prisma.team.findUnique({ where: { slug: "aguilas-cdmx" } });

  const players = [
    {
      slug: "mateo-hernandez",
      firstName: "Mateo",
      lastName: "Hernández",
      teamId: lobos?.id,
      jerseyNumber: 7,
      position: "PG" as const,
      heightCm: 185,
      weightKg: 78,
      age: 17,
      birthdate: new Date("2008-03-15"),
      wingspanCm: 192,
      categoryDivision: "2007-2009",
      genderDivision: "Varonil",
      featured: true,
      biography:
        "Base anotador con visión de juego elite. Líder ofensivo de Lobos Norte y seleccionado estatal en 2025.",
      achievements: JSON.stringify([
        "MVP Regional Norte 2025",
        "Selección estatal Chihuahua",
        "Top 10 anotador del circuito",
        "Campeón estatal 2024",
        "All-Tournament Team 2025",
      ]),
      highlightUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      photoUrl:
        "https://images.unsplash.com/photo-1574623456110-8fd79f591e35?w=600&q=80",
      instagram: "@mateo.h",
    },
    {
      slug: "diego-santos",
      firstName: "Diego",
      lastName: "Santos",
      teamId: lobos?.id,
      jerseyNumber: 23,
      position: "SF" as const,
      heightCm: 198,
      weightKg: 88,
      age: 17,
      wingspanCm: 205,
      categoryDivision: "2007-2009",
      genderDivision: "Varonil",
      featured: true,
      biography: "Alero versátil con gran defensa perimetral y rango de tiro tres.",
      achievements: JSON.stringify([
        "Defensor del año categoría U17",
        "Invitado a camp elite NBA Academy",
        "Promedio 18 PPG temporada 2025",
        "Capitán Lobos Norte",
        "Mención honorable nacional",
      ]),
      highlightUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      photoUrl:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
    },
    {
      slug: "santiago-ruiz",
      firstName: "Santiago",
      lastName: "Ruiz",
      teamId: aguilas?.id,
      jerseyNumber: 11,
      position: "C" as const,
      heightCm: 208,
      weightKg: 102,
      age: 18,
      categoryDivision: "2007-2009",
      genderDivision: "Varonil",
      featured: true,
      biography: "Pívot dominante en la pintura con presencia defensiva de élite.",
      achievements: JSON.stringify([
        "Líder en rebotes del torneo 2024",
        "Double-double en 12 de 15 partidos",
        "Seleccionado All-Star Norte",
        "Bloqueos promedio 3.2 por partido",
        "Campeón de copa CDMX",
      ]),
      photoUrl:
        "https://images.unsplash.com/photo-1519861531473-9200262184bf?w=600&q=80",
    },
  ];

  for (const p of players) {
    const { achievements: achievementsRaw, ...rest } = p;
    await prisma.player.upsert({
      where: { slug: p.slug },
      update: { ...rest, achievements: achievementsRaw },
      create: { ...rest, achievements: achievementsRaw },
    });
    const player = await prisma.player.findUnique({ where: { slug: p.slug } });
    const achievementList = achievementsRaw
      ? (JSON.parse(achievementsRaw) as string[])
      : [];
    if (player && achievementList.length) {
      await prisma.playerAward.deleteMany({ where: { playerId: player.id } });
      for (const title of achievementList.slice(0, 3)) {
        await prisma.playerAward.create({
          data: { playerId: player.id, title, year: 2025, awardType: "Award" },
        });
      }
    }
  }

  if (lobos && aguilas) {
    await prisma.game.createMany({
      data: [
        {
          homeTeamId: lobos.id,
          awayTeamId: aguilas.id,
          scheduledAt: new Date("2026-06-15T16:00:00"),
          venue: "Gimnasio del Instituto La Salle Chihuahua",
          genderDivision: "Varonil",
          categoryDivision: "2007-2009",
          status: "SCHEDULED",
          round: "Jornada 1",
        },
        {
          homeTeamId: aguilas.id,
          awayTeamId: lobos.id,
          scheduledAt: new Date("2026-05-20T18:00:00"),
          venue: "Gimnasio del Instituto La Salle Chihuahua",
          genderDivision: "Varonil",
          categoryDivision: "2007-2009",
          status: "FINAL",
          homeScore: 72,
          awayScore: 68,
          round: "Amistoso preparación",
        },
      ],
    });
  }

  const existingTournament = await prisma.tournament.findFirst({
    where: { active: true },
  });
  const tournamentData = {
      name: "The North Classic 2026",
      edition: "5ª Edición",
      location: "Chihuahua, Chihuahua",
      venue: "Gimnasio del Instituto La Salle Chihuahua",
      venueMapUrl:
        "https://www.google.com/maps?q=Gimnasio+del+Instituto+La+Salle+Chihuahua,+Av.+Pol%C3%ADtecnico+Nacional+5100,+Chihuahua,+Chihuahua,+Mexico&hl=es&z=17&output=embed",
      startDate: new Date("2026-06-14"),
      endDate: new Date("2026-06-18"),
      active: true,
      registrationUrl: "https://forms.google.com/example",
      description:
        "El principal showcase de basketball juvenil en Chihuahua. Competencia de alto nivel, exposición ante reclutadores universitarios y cobertura mediática profesional.",
      rules:
        "• Partidos de 4 cuartos de 8 minutos\n• Categorías U15, U17, U19 y Premier\n• Reglamento FIBA adaptado\n• Máximo 12 jugadores por roster\n• Documentación oficial obligatoria",
      faq: JSON.stringify([
        {
          q: "¿Cómo registro a mi equipo?",
          a: "Completa el formulario de registro en línea o contacta a nuestro equipo operativo.",
        },
        {
          q: "¿Los scouts tienen acceso a perfiles?",
          a: "Sí, todos los jugadores registrados cuentan con perfil digital verificado en la plataforma.",
        },
      ]),
      divisions: JSON.stringify([
        { name: "Sub-15", description: "13-15 años. Desarrollo fundamental." },
        { name: "Sub-17", description: "16-17 años. Exposición NCAA." },
        { name: "Sub-19", description: "18-19 años. Pre-profesional." },
      ]),
    };
  if (existingTournament) {
    await prisma.tournament.update({
      where: { id: existingTournament.id },
      data: tournamentData,
    });
  } else {
    await prisma.tournament.create({ data: tournamentData });
  }

  const sponsors = [
    {
      name: "Elite Sports MX",
      slug: "elite-sports",
      logoUrl:
        "https://ui-avatars.com/api/?name=Elite+Sports&background=fff&color=9B111E&size=200",
      tier: "Oro",
      sortOrder: 1,
    },
    {
      name: "Hoop Nation",
      slug: "hoop-nation",
      logoUrl:
        "https://ui-avatars.com/api/?name=Hoop+Nation&background=fff&color=070707&size=200",
      tier: "Plata",
      sortOrder: 2,
    },
  ];

  for (const s of sponsors) {
    await prisma.sponsor.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  await prisma.testimonial.createMany({
    data: [
      {
        name: "Coach Michael Torres",
        role: "Scout NCAA Division II",
        content:
          "The North Classic es el evento que reviso cada año para descubrir talento mexicano con proyección universitaria.",
        sortOrder: 1,
      },
      {
        name: "María López",
        role: "Madre de jugador U17",
        content:
          "La plataforma nos da confianza: perfiles profesionales, resultados en vivo y comunicación clara.",
        sortOrder: 2,
      },
    ],
  });

  await prisma.mediaItem.createMany({
    data: [
      {
        slug: "final-u17-2025",
        title: "Resumen Final U17 2025",
        type: "highlight",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
        featured: true,
      },
      {
        slug: "galeria-dia-1",
        title: "Galería Día 1 — The North Classic",
        type: "photo",
        url: "/media",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1574623456110-8fd79f591e35?w=800&q=80",
        featured: true,
      },
    ],
  });


  console.log("✓ Seed completado");
  console.log("  Admin: usuario admin (configurado en seed)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
