import Image from "next/image";
import Link from "next/link";
import { POSITION_LABELS } from "@/lib/constants";
import { isValidImageUrl } from "@/lib/team-logo";
import { formatHeight } from "@/lib/utils";

export type PlayerCardData = {
  slug: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  teamName: string | null;
  position: string | null;
  heightCm: number | null;
  jerseyNumber: number | null;
  category?: string | null;
};

function playerPhotoUrl(player: PlayerCardData) {
  const name = `${player.firstName} ${player.lastName}`;
  if (isValidImageUrl(player.photoUrl)) return player.photoUrl!;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9B111E&color=fff&size=512`;
}

export function PlayerCard({ player }: { player: PlayerCardData }) {
  const name = `${player.firstName} ${player.lastName}`;
  const position = player.position
    ? POSITION_LABELS[player.position] ?? player.position
    : null;

  return (
    <Link
      href={`/jugadores/${player.slug}`}
      className="card-hover group block overflow-hidden rounded-lg border border-border bg-surface-elevated"
      aria-label={`Ver perfil de ${name}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        <Image
          src={playerPhotoUrl(player)}
          alt={name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        {player.jerseyNumber != null && (
          <span className="stat-number absolute right-3 top-3 text-4xl font-bold text-white/30">
            #{player.jerseyNumber}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="heading-display text-xl text-white">{name}</h3>
        {player.teamName && (
          <p className="mt-1 text-sm text-accent">{player.teamName}</p>
        )}
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {position && (
            <div>
              <dt className="sr-only">Posición</dt>
              <dd>{position}</dd>
            </div>
          )}
          {player.heightCm && (
            <div>
              <dt className="sr-only">Altura</dt>
              <dd>{formatHeight(player.heightCm)}</dd>
            </div>
          )}
        </dl>
      </div>
    </Link>
  );
}
