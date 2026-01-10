import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid, isSameDay, isWithinInterval } from "date-fns";
import { cs } from "date-fns/locale";
import type { Race } from "@/services/f1Service";
import { Calendar, MapPin, Lightning, CheckCircle, Clock } from "@phosphor-icons/react";

interface RaceCardProps {
  race: Race;
  onClick: () => void;
  isPast: boolean;
}

const countryFlags: { [key: string]: string } = {
  "Italy": "IT", "Monaco": "MC", "Spain": "ES", "UK": "GB", "United Kingdom": "GB",
  "USA": "US", "United States": "US", "Austria": "AT", "Belgium": "BE",
  "Netherlands": "NL", "Hungary": "HU", "Azerbaijan": "AZ", "Canada": "CA",
  "France": "FR", "Germany": "DE", "Japan": "JP", "Mexico": "MX", "Brazil": "BR",
  "Australia": "AU", "Bahrain": "BH", "Saudi Arabia": "SA", "China": "CN",
  "Singapore": "SG", "Qatar": "QA", "UAE": "AE", "United Arab Emirates": "AE",
};

const countryTranslations: { [key: string]: string } = {
  "Italy": "Itálie", "Monaco": "Monako", "Spain": "Španělsko", "UK": "Velká Británie",
  "United Kingdom": "Velká Británie", "USA": "USA", "United States": "USA",
  "Austria": "Rakousko", "Belgium": "Belgie", "Netherlands": "Nizozemsko",
  "Hungary": "Maďarsko", "Azerbaijan": "Ázerbájdžán", "Canada": "Kanada",
  "France": "Francie", "Germany": "Německo", "Japan": "Japonsko", "Mexico": "Mexiko",
  "Brazil": "Brazílie", "Australia": "Austrálie", "Bahrain": "Bahrajn",
  "Saudi Arabia": "Saúdská Arábie", "China": "Čína", "Singapore": "Singapur",
  "Qatar": "Katar", "UAE": "SAE", "United Arab Emirates": "SAE",
};

// Convert country code to Twemoji URL
function getTwemojiUrl(countryCode: string): string {
  // Convert country code to regional indicator symbols (Unicode)
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => (0x1F1E6 + char.charCodeAt(0) - 65).toString(16))
    .join('-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`;
}

function getEventDateRange(race: Race): { startDate: Date | null; endDate: Date | null } {
  const dates = [
    race.FirstPractice && parseISO(`${race.FirstPractice.date}T${race.FirstPractice.time || '00:00:00Z'}`),
    race.SecondPractice && parseISO(`${race.SecondPractice.date}T${race.SecondPractice.time || '00:00:00Z'}`),
    race.ThirdPractice && parseISO(`${race.ThirdPractice.date}T${race.ThirdPractice.time || '00:00:00Z'}`),
    race.SprintQualifying && parseISO(`${race.SprintQualifying.date}T${race.SprintQualifying.time || '00:00:00Z'}`),
    race.Sprint && parseISO(`${race.Sprint.date}T${race.Sprint.time || '00:00:00Z'}`),
    race.Qualifying && parseISO(`${race.Qualifying.date}T${race.Qualifying.time || '00:00:00Z'}`),
    parseISO(`${race.date}T${race.time || '00:00:00Z'}`),
  ].filter((date): date is Date => date !== null && isValid(date));

  if (dates.length === 0) return { startDate: null, endDate: null };

  return {
    startDate: dates.reduce((min, date) => date < min ? date : min),
    endDate: dates.reduce((max, date) => date > max ? date : max),
  };
}

function getRaceStatus(startDate: Date | null, endDate: Date | null, isPast: boolean): {
  status: "past" | "current" | "upcoming";
  label: string;
  icon: typeof CheckCircle;
} {
  const now = new Date();

  if (!startDate || !endDate) {
    return { status: "upcoming", label: "Bude oznámeno", icon: Clock };
  }

  if (isPast) {
    return { status: "past", label: "Dokončeno", icon: CheckCircle };
  }

  if (isWithinInterval(now, { start: startDate, end: endDate })) {
    return { status: "current", label: "Probíhá", icon: Lightning };
  }

  return { status: "upcoming", label: "Nadcházející", icon: Clock };
}

export function RaceCard({ race, onClick, isPast }: RaceCardProps) {
  const { startDate, endDate } = getEventDateRange(race);
  const { status, label, icon: StatusIcon } = getRaceStatus(startDate, endDate, isPast);
  const countryCode = countryFlags[race.Circuit.Location.country] || "UN";
  const localizedCountry = countryTranslations[race.Circuit.Location.country] || race.Circuit.Location.country;
  const hasSprint = !!race.Sprint;

  let formattedDateRange = "Bude oznámeno";
  try {
    if (startDate && endDate) {
      if (isSameDay(startDate, endDate)) {
        formattedDateRange = format(startDate, "d. MMMM", { locale: cs });
      } else {
        const startStr = format(startDate, "d.", { locale: cs });
        const endStr = format(endDate, "d. MMMM", { locale: cs });
        formattedDateRange = `${startStr} - ${endStr}`;
      }
    }
  } catch (error) {
    console.error("Error formatting race date range:", error);
  }

  return (
    <article
      onClick={onClick}
      className={`group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ${status === 'current'
        ? 'ring-2 ring-f1-red/60 shadow-xl shadow-f1-red/20'
        : 'hover:shadow-xl hover:shadow-black/30'
        } ${isPast ? 'opacity-70 hover:opacity-90' : ''}`}
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0f0f0f]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Decorative corner accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${isPast ? 'bg-gray-500/5' : 'bg-f1-red/5'
        } blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`} />

      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${status === 'current'
        ? 'bg-gradient-to-r from-transparent via-f1-red to-transparent animate-pulse'
        : isPast
          ? 'bg-gradient-to-r from-transparent via-gray-500/50 to-transparent'
          : 'bg-gradient-to-r from-transparent via-f1-red/70 to-transparent'
        }`} />

      {/* Content */}
      <div className="relative p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Country flag */}
            <div className="">
              <img
                src={getTwemojiUrl(countryCode)}
                alt={race.Circuit.Location.country}
                className="object-contain w-7 h-7  "
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-xl">🏁</span>';
                  }
                }}
              />
            </div>
            <div>
              <span className="text-gray-400 text-xs font-medium">{localizedCountry}</span>
              <span className="text-gray-600 mx-1.5">•</span>
              <span className="text-gray-500 text-xs">Kolo {race.round}</span>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${status === 'current'
              ? 'bg-f1-red text-white shadow-lg shadow-f1-red/30'
              : status === 'past'
                ? 'bg-gray-700/80 text-gray-300'
                : 'bg-gradient-to-r from-f1-red/90 to-f1-crimson/90 text-white shadow-md shadow-f1-red/20'
              }`}
          >
            <StatusIcon className="w-3 h-3" />
            {label}
          </Badge>
        </div>

        {/* Race name */}
        <h3 className="text-white font-bold text-lg sm:text-xl leading-tight mb-2 group-hover:text-white transition-colors">
          {race.raceName}
        </h3>

        {/* Circuit name */}
        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <span className="truncate">{race.Circuit.circuitName}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            {/* Date chip */}
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-sm text-gray-300 font-medium">{formattedDateRange}</span>
            </div>

            {/* Sprint indicator */}
            {hasSprint && (
              <div className="flex items-center gap-1 bg-f1-red/10 text-f1-red rounded-lg px-2 py-1.5 border border-f1-red/20">
                <Lightning className="w-3 h-3" />
                <span className="text-[11px] font-bold uppercase tracking-wide">Sprint</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-f1-red/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Round number watermark */}
      <div className="absolute bottom-4 right-4 text-6xl font-black text-white/[0.03] pointer-events-none select-none">
        {race.round}
      </div>
    </article>
  );
}
