import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const staticRoutes = [
    "",
    "/torneo",
    "/equipos",
    "/jugadores",
    "/partidos",
    "/media",
    "/patrocinadores",
    "/nosotros",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const [players, teams] = await Promise.all([
    prisma.player.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.team.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const playerRoutes = players.map((p) => ({
    url: `${base}/jugadores/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const teamRoutes = teams.map((t) => ({
    url: `${base}/equipos/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...playerRoutes, ...teamRoutes];
}
