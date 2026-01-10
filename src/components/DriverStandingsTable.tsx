import { useDriverStandings } from "@/services/f1Service";
import { SkeletonCard } from "./SkeletonCard";
import { Trophy, Medal, Ranking } from "@phosphor-icons/react";

const nationalityFlags: { [key: string]: string } = {
  "British": "GB", "Dutch": "NL", "Spanish": "ES", "Monegasque": "MC",
  "Mexican": "MX", "Australian": "AU", "German": "DE", "French": "FR",
  "Finnish": "FI", "Canadian": "CA", "Japanese": "JP", "Chinese": "CN",
  "Thai": "TH", "American": "US", "Danish": "DK", "Italian": "IT",
  "Brazilian": "BR", "Belgian": "BE", "Swiss": "CH", "Austrian": "AT",
  "Russian": "RU", "Polish": "PL", "New Zealander": "NZ", "Argentine": "AR",
};

export function DriverStandingsTable() {
  const { standings, loading, error } = useDriverStandings();

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
          <PodiumCard
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
          <DriverRow
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

function PodiumCard({
  standing,
  position,
  maxPoints,
}: {
  standing: any;
  position: number;
  maxPoints: number;
}) {
  const flagCode = nationalityFlags[standing.Driver.nationality] || "UN";
  const pointsPercentage = (parseFloat(standing.points) / maxPoints) * 100;

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
      {/* Position indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 ${style.iconColor}`}>
          <Icon className="w-5 h-5" />
          <span className={`text-2xl font-black ${style.numberColor}`}>{position}</span>
        </div>
        <img
          src={`https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`}
          alt={standing.Driver.nationality}
          className="w-8 h-5 object-cover rounded-sm"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* Driver info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-xs font-bold bg-white/10 rounded-md text-white border border-white/10">
            {standing.Driver.code}
          </span>
        </div>
        <h3 className="text-white font-bold text-lg leading-tight">
          {standing.Driver.givenName} <span className="text-white">{standing.Driver.familyName}</span>
        </h3>
        <p className="text-gray-500 text-sm">{standing.Constructors[0]?.name || 'N/A'}</p>
      </div>

      {/* Points */}
      <div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className={`text-3xl font-black ${position === 1 ? 'gradient-text-red' : 'text-white'}`}>
            {standing.points}
          </span>
          <span className="text-gray-500 text-sm">bodů</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${position === 1 ? 'bg-gradient-to-r from-f1-red to-f1-crimson' : 'bg-white/30'
              }`}
            style={{ width: `${pointsPercentage}%` }}
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

function DriverRow({
  standing,
  maxPoints,
}: {
  standing: any;
  maxPoints: number;
}) {
  const flagCode = nationalityFlags[standing.Driver.nationality] || "UN";
  const pointsPercentage = (parseFloat(standing.points) / maxPoints) * 100;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/[0.03] to-transparent hover:from-white/[0.06] border border-white/5 hover:border-white/10 transition-all">
      {/* Position */}
      <div className="w-8 text-center">
        <span className="text-lg font-black text-gray-500">{standing.position}</span>
      </div>

      {/* Flag */}
      <img
        src={`https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`}
        alt={standing.Driver.nationality}
        className="w-6 h-4 object-cover rounded-sm"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />

      {/* Driver info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/10 rounded text-white/80 border border-white/10">
            {standing.Driver.code}
          </span>
          <span className="text-gray-400 text-sm">{standing.Driver.givenName}</span>
          <span className="text-white font-bold text-sm">{standing.Driver.familyName}</span>
        </div>
        <p className="text-gray-600 text-xs mt-0.5 truncate">{standing.Constructors[0]?.name || 'N/A'}</p>
      </div>

      {/* Points section */}
      <div className="flex items-center gap-3">
        {/* Mini progress bar */}
        <div className="hidden sm:block w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-f1-red/50 to-f1-crimson/50 rounded-full transition-all"
            style={{ width: `${pointsPercentage}%` }}
          />
        </div>
        <span className="text-white font-bold text-lg w-12 text-right">{standing.points}</span>
      </div>
    </div>
  );
}
