import { PersonAvatar } from "@/components/ui/PersonAvatar";

export type RecruiterCard = {
  id: string;
  name: string;
  teamName: string;
  description: string;
  photoUrl: string | null;
};

function descriptionLines(description: string): string[] {
  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function RecruitersGrid({ recruiters }: { recruiters: RecruiterCard[] }) {
  if (recruiters.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="heading-display mb-8 text-3xl text-white">
        Perfil de los reclutadores
      </h2>
      <ul
        className="flex list-none flex-wrap justify-center gap-6 p-0 m-0 sm:gap-8"
        role="list"
      >
        {recruiters.map((r) => {
          const bullets = descriptionLines(r.description);
          return (
          <li
            key={r.id}
            className="w-full max-w-[20rem]"
            role="listitem"
          >
            <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 text-center">
              <div className="mx-auto w-fit rounded-full border-2 border-accent">
                <PersonAvatar
                  name={r.name}
                  photoUrl={r.photoUrl}
                  size={112}
                />
              </div>
              <h3 className="heading-display mt-4 text-xl text-white">
                {r.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-accent">
                {r.teamName}
              </p>
              {bullets.length > 0 && (
                <ul className="mt-4 flex-1 list-disc space-y-1.5 pl-5 text-left text-sm leading-relaxed text-muted">
                  {bullets.map((line, index) => (
                    <li key={`${r.id}-${index}`}>{line}</li>
                  ))}
                </ul>
              )}
            </article>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
