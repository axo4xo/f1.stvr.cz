import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid, isSameDay, isWithinInterval } from "date-fns";
import { cs } from "date-fns/locale";
import type { Race } from "@/services/f1Service";
import { CalendarIcon, MapPinIcon, ChevronRightIcon } from "lucide-react";

interface RaceCardProps {
  race: Race;
  onClick: () => void;
  isPast: boolean;
}

const countryTranslations: { [key: string]: string } = {
  "Italy": "Itálie",
  "Monaco": "Monako",
  "Spain": "Španělsko",
  "UK": "Velká Británie",
  "United Kingdom": "Velká Británie",
  "USA": "USA",
  "United States": "Spojené státy americké",
  "Austria": "Rakousko",
  "Belgium": "Belgie",
  "Netherlands": "Nizozemsko",
  "Hungary": "Maďarsko",
  "Azerbaijan": "Ázerbájdžán",
  "Canada": "Kanada",
  "France": "Francie",
  "Germany": "Německo",
  "Japan": "Japonsko",
  "Mexico": "Mexiko",
  "Brazil": "Brazílie",
  "Australia": "Austrálie",
  "Bahrain": "Bahrajn",
  "Saudi Arabia": "Saúdská Arábie",
  "China": "Čína",
  "Singapore": "Singapur",
  "Qatar": "Katar",
  "UAE": "SAE",
  "United Arab Emirates": "Spojené arabské emiráty",
};

const countryFlags: { [key: string]: string } = {
  "Italy": "🇮🇹",
  "Monaco": "🇲🇨",
  "Spain": "🇪🇸",
  "UK": "🇬🇧",
  "United Kingdom": "🇬🇧",
  "USA": "🇺🇸",
  "United States": "🇺🇸",
  "Austria": "🇦🇹",
  "Belgium": "🇧🇪",
  "Netherlands": "🇳🇱",
  "Hungary": "🇭🇺",
  "Azerbaijan": "🇦🇿",
  "Canada": "🇨🇦",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Japan": "🇯🇵",
  "Mexico": "🇲🇽",
  "Brazil": "🇧🇷",
  "Australia": "🇦🇺",
  "Bahrain": "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  "China": "🇨🇳",
  "Singapore": "🇸🇬",
  "Qatar": "🇶🇦",
  "UAE": "🇦🇪",
  "United Arab Emirates": "🇦🇪",
};

function getCountryNameInCzech(englishCountryName: string): string {
  return countryTranslations[englishCountryName] || englishCountryName;
}

function getCountryFlagEmoji(englishCountryName: string): string {
  return countryFlags[englishCountryName] || "🏁"; // Default flag if not found
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
  className: string;
} {
  const now = new Date();

  if (!startDate || !endDate) {
    return {
      status: "upcoming",
      label: "Bude oznámeno",
      className: "bg-f1-red hover:bg-f1-red/90",
    };
  }

  if (isPast) {
    return {
      status: "past",
      label: "Dokončeno",
      className: "bg-gray-700 hover:bg-gray-600",
    };
  }

  if (isWithinInterval(now, { start: startDate, end: endDate })) {
    return {
      status: "current",
      label: "Teď",
      className: "bg-f1-red hover:bg-f1-red/90",
    };
  }

  return {
    status: "upcoming",
    label: "Nadcházející",
    className: "bg-f1-red hover:bg-f1-red/90",
  };
}

export function RaceCard({ race, onClick, isPast }: RaceCardProps) {
  const { startDate, endDate } = getEventDateRange(race);
  const { status, label, className } = getRaceStatus(startDate, endDate, isPast);

  let formattedDateRange = "Bude oznámeno";

  try {
    if (startDate && endDate) {
      if (isSameDay(startDate, endDate)) {
        formattedDateRange = format(startDate, "d. MMMM yyyy", { locale: cs });
      } else {
        const startStr = format(startDate, "d.", { locale: cs });
        const endStr = format(endDate, "d. MMMM yyyy", { locale: cs });
        formattedDateRange = `${startStr} - ${endStr}`;
      }
    }
  } catch (error) {
    console.error("Error formatting race date range:", error);
  }

  const localizedCountryName = getCountryNameInCzech(race.Circuit.Location.country);
  const flagEmoji = getCountryFlagEmoji(race.Circuit.Location.country);

  // Format race date for mobile display
  const getRaceDate = () => {
    try {
      if (race.date) {
        const raceDate = parseISO(`${race.date}T${race.time || '00:00:00Z'}`);
        if (isValid(raceDate)) {
          return format(raceDate, "d. MMM", { locale: cs });
        }
      }
      return "";
    } catch (error) {
      return "";
    }
  };

  const raceDay = getRaceDate();

  return (
    <Card
      className={`race-card cursor-pointer relative overflow-hidden rounded-2xl border-0 ${status === 'current' ? 'ring-2 ring-f1-red/50' : ''}`}
      onClick={onClick}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 w-full h-1 ${isPast ? 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600' : 'bg-gradient-to-r from-f1-red via-f1-crimson to-f1-red'}`}></div>

      {/* Glow effect for current races */}
      {status === 'current' && (
        <div className="absolute inset-0 bg-gradient-to-b from-f1-red/10 to-transparent pointer-events-none"></div>
      )}

      <CardContent className="p-5 sm:p-6 relative">
        <div className="flex justify-between items-start">
          <div className="space-y-2 pr-6 sm:pr-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{flagEmoji}</span>
              <span className="text-gray-400 text-xs sm:text-sm font-medium">{localizedCountryName}</span>
            </div>
            <h3 className="text-white font-bold text-lg sm:text-xl leading-tight">{race.raceName}</h3>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs sm:text-sm">
              <MapPinIcon className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{race.Circuit.circuitName}</span>
            </div>
          </div>
          <Badge
            variant={isPast ? "secondary" : "default"}
            className={`${className} transition-all rounded-lg px-3 py-1 text-xs font-semibold ${!isPast ? 'shadow-lg shadow-f1-red/20' : ''}`}
          >
            {label}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-4 sm:mt-5">
          <div className="flex items-center text-gray-300 bg-white/5 backdrop-blur-sm rounded-xl py-2 px-3 flex-1 border border-white/5">
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">{formattedDateRange}</span>
          </div>
          <div className="text-gray-500 ml-3 sm:hidden">
            <ChevronRightIcon className="h-5 w-5" />
          </div>
        </div>

        {/* Round indicator */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6 opacity-10 text-4xl font-black text-white pointer-events-none">
          {race.round}
        </div>
      </CardContent>
    </Card>
  );
}
