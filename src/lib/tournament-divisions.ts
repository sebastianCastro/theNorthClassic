import { getSiteConfig, getDivisionGroups } from "./site-config";

/** Divisions shown on torneo page: Varonil per category + single Femenil division. */
export async function getTorneoDivisions(): Promise<
  { name: string; description: string }[]
> {
  const config = await getSiteConfig();
  return getDivisionGroups(config).map((g) => ({
    name: g.label,
    description:
      g.genderDivision === "Femenil"
        ? "Categoría femenil del torneo."
        : `Competencia varonil — generación ${g.categoryDivision}.`,
  }));
}
