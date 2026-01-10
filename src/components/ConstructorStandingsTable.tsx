import { useConstructorStandings } from "@/services/f1Service";
import { Trophy, Medal, Ranking, Flag } from "@phosphor-icons/react";

const nationalityFlags: { [key: string]: string } = {
  "British": "GB", "Italian": "IT", "German": "DE", "French": "FR",
  "Austrian": "AT", "Swiss": "CH", "American": "US", "Japanese": "JP",
};

const teamColors: { [key: string]: string } = {
  "Red Bull": "#3671C6",
  "Ferrari": "#E8002D",
  "Mercedes": "#27F4D2",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine F1 Team": "#FF87BC",
  "Williams": "#64C4FF",
  "RB F1 Team": "#6692FF",
  "Sauber": "#52E252",
  "Haas F1 Team": "#B6BABD",
};

export function ConstructorStandingsTable() {
  const { standings, loading, error } = useConstructorStandings();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-900/20 to-red-900/10 border border-red-900/30 text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <p className="text-gray-500 text-sm mt-1">Zkuste to prosím později</p>
      </div>
    );
  }

  const maxPoints = standings.length > 0 ? Math.max(...standings.map(s => parseFloat(s.points))) : 1;

  return (
    <div className="space-y-3">
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {standings.slice(0, 3).map((standing, index) => (
          <TeamPodiumCard
            key={standing.position}
            standing={standing}
            position={index + 1}
            maxPoints={maxPoints}
          />
        ))}
      </div>

      {/* Rest of standings */}
      <div className="space-y-2">
        {standings.slice(3).map((standing) => (
          <TeamRow
            key={standing.position}
            standing={standing}
            maxPoints={maxPoints}
          />
        ))}
      </div>

      {standings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Data o šampionátu zatím nejsou k dispozici
        </div>
      )}
    </div>
  );
}

function TeamPodiumCard({
  standing,
  position,
  maxPoints,
}: {
  standing: any;
  position: number;
  maxPoints: number;
}) {
  const flagCode = nationalityFlags[standing.Constructor.nationality] || "UN";
  const pointsPercentage = (parseFloat(standing.points) / maxPoints) * 100;
  const teamColor = teamColors[standing.Constructor.name] || "#E10600";

  const positionStyles = {
    1: {
      gradient: "from-yellow-500/20 via-yellow-600/10 to-transparent",
      border: "border-yellow-500/30",
      icon: Trophy,
      iconColor: "text-yellow-400",
      numberColor: "text-yellow-400",
      glow: "shadow-yellow-500/20",
    },
    2: {
      gradient: "from-gray-400/20 via-gray-500/10 to-transparent",
      border: "border-gray-400/30",
      icon: Medal,
      iconColor: "text-gray-300",
      numberColor: "text-gray-300",
      glow: "shadow-gray-400/20",
    },
    3: {
      gradient: "from-amber-600/20 via-amber-700/10 to-transparent",
      border: "border-amber-600/30",
      icon: Ranking,
      iconColor: "text-amber-500",
      numberColor: "text-amber-500",
      glow: "shadow-amber-500/20",
    },
  };

  const style = positionStyles[position as 1 | 2 | 3];
  const Icon = style.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border} p-5 transition-all hover:scale-[1.02] ${style.glow} shadow-lg`}>
      {/* Team color accent */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl"
        style={{ backgroundColor: teamColor }}
      />

      {/* Position indicator */}
      <div className="flex items-center justify-between mb-4 pl-2">
        <div className={`flex items-center gap-2 ${style.iconColor}`}>
          <Icon className="w-5 h-5" />
          <span className={`text-2xl font-black ${style.numberColor}`}>{position}</span>
        </div>
        <img
          src={`https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`}
          alt={standing.Constructor.nationality}
          className="w-8 h-5 object-cover rounded-sm"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* Team info */}
      <div className="mb-4 pl-2">
        <h3 className="text-white font-bold text-lg leading-tight mb-1">
          {standing.Constructor.name}
        </h3>
        <p className="text-gray-500 text-sm">{standing.Constructor.nationality}</p>
      </div>

      {/* Points and Wins */}
      <div className="pl-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black ${position === 1 ? 'gradient-text-red' : 'text-white'}`}>
              {standing.points}
            </span>
            <span className="text-gray-500 text-sm">bodů</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg border border-white/10">
            <Trophy className="w-3.5 h-3.5 text-f1-red" />
            <span className="text-white font-bold text-sm">{standing.wins}</span>
          </div>
        </div>
        {/* Progress bar with team color */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pointsPercentage}%`,
              backgroundColor: position === 1 ? undefined : teamColor,
              background: position === 1 ? 'linear-gradient(to right, #E10600, #DC143C)' : undefined,
            }}
          />
        </div>
      </div>

      {/* Decorative number */}
      <div className="absolute -bottom-4 -right-2 text-8xl font-black text-white/[0.03] pointer-events-none">
        {position}
      </div>
    </div>
  );
}

function TeamRow({
  standing,
  maxPoints,
}: {
  standing: any;
  maxPoints: number;
}) {
  const flagCode = nationalityFlags[standing.Constructor.nationality] || "UN";
  const pointsPercentage = (parseFloat(standing.points) / maxPoints) * 100;
  const teamColor = teamColors[standing.Constructor.name] || "#E10600";

  return (
    <div className="group relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/[0.03] to-transparent hover:from-white/[0.06] border border-white/5 hover:border-white/10 transition-all overflow-hidden">
      {/* Team color accent */}
      <div
        className="absolute left-0 top-0 w-1 h-full"
        style={{ backgroundColor: teamColor }}
      />

      {/* Position */}
      <div className="w-8 text-center pl-2">
        <span className="text-lg font-black text-gray-500">{standing.position}</span>
      </div>

      {/* Flag */}
      <img
        src={`https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`}
        alt={standing.Constructor.nationality}
        className="w-6 h-4 object-cover rounded-sm"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />

      {/* Team info */}
      <div className="flex-1 min-w-0">
        <span className="text-white font-bold text-sm">{standing.Constructor.name}</span>
        <p className="text-gray-600 text-xs mt-0.5">{standing.Constructor.nationality}</p>
      </div>

      {/* Wins badge */}
      <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
        <Trophy className="w-3 h-3 text-gray-500" />
        <span className="text-white font-medium text-xs">{standing.wins}</span>
      </div>

      {/* Points section */}
      <div className="flex items-center gap-3">
        {/* Mini progress bar */}
        <div className="hidden sm:block w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pointsPercentage}%`,
              backgroundColor: teamColor,
            }}
          />
        </div>
        <span className="text-white font-bold text-lg w-12 text-right">{standing.points}</span>
      </div>
    </div>
  );
}
