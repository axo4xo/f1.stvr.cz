import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchRaceResults, Race } from "@/services/f1Service";
import { format, parseISO, isValid, isWithinInterval, isSameDay } from "date-fns";
import { cs } from "date-fns/locale";
import { Calendar, MapPin, Clock, Trophy, Info, X, Lightning, ArrowSquareOut, CheckCircle } from "@phosphor-icons/react";

interface RaceDetailsProps {
  race: Race | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RaceResult {
  position: string;
  Driver: {
    code: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    name: string;
  };
  Time?: {
    time: string;
  };
  status?: string;
}

interface RaceResultsResponse {
  Results: RaceResult[];
}

const countryFlags: { [key: string]: string } = {
  "Italy": "IT", "Monaco": "MC", "Spain": "ES", "UK": "GB", "United Kingdom": "GB",
  "USA": "US", "United States": "US", "Austria": "AT", "Belgium": "BE",
  "Netherlands": "NL", "Hungary": "HU", "Azerbaijan": "AZ", "Canada": "CA",
  "France": "FR", "Germany": "DE", "Japan": "JP", "Mexico": "MX", "Brazil": "BR",
  "Australia": "AU", "Bahrain": "BH", "Saudi Arabia": "SA", "China": "CN",
  "Singapore": "SG", "Qatar": "QA", "UAE": "AE", "United Arab Emirates": "AE",
};

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

function getRaceStatus(startDate: Date | null, endDate: Date | null): {
  status: "past" | "current" | "upcoming";
  label: string;
  icon: typeof Clock;
} {
  const now = new Date();

  if (!startDate || !endDate) {
    return { status: "upcoming", label: "Bude oznámeno", icon: Clock };
  }

  if (endDate < now) {
    return { status: "past", label: "Dokončeno", icon: CheckCircle };
  }

  if (isWithinInterval(now, { start: startDate, end: endDate })) {
    return { status: "current", label: "Právě probíhá", icon: Lightning };
  }

  return { status: "upcoming", label: "Nadcházející", icon: Clock };
}

export function RaceDetails({ race, isOpen, onClose }: RaceDetailsProps) {
  const [raceResults, setRaceResults] = useState<RaceResultsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRaceResults = async () => {
      if (!race) return;

      const { endDate } = getEventDateRange(race);
      if (!endDate) return;

      try {
        const today = new Date();
        if (endDate < today) {
          try {
            setLoading(true);
            const results = await fetchRaceResults(race.season, race.round);
            setRaceResults(results);
            setLoading(false);
          } catch (err) {
            setError("Nepodařilo se načíst výsledky závodu");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error checking race date:", err);
      }
    };

    if (isOpen && race) {
      getRaceResults();
    }
  }, [isOpen, race]);

  if (!race) return null;

  const { startDate, endDate } = getEventDateRange(race);
  const { status, label, icon: StatusIcon } = getRaceStatus(startDate, endDate);
  const isSprintWeekend = !!race.Sprint;
  const countryCode = countryFlags[race.Circuit.Location.country] || "UN";

  let formattedDateRange = "Bude oznámeno";
  try {
    if (startDate && endDate) {
      if (isSameDay(startDate, endDate)) {
        formattedDateRange = format(startDate, "EEEE d. MMMM yyyy", { locale: cs });
      } else {
        const startStr = format(startDate, "d.", { locale: cs });
        const endStr = format(endDate, "d. MMMM yyyy", { locale: cs });
        formattedDateRange = `${startStr} - ${endStr}`;
      }
    }
  } catch (error) {
    console.error("Error formatting race date range:", error);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-b from-[#151515] to-[#0a0a0a] text-white border-white/5 max-w-2xl w-[calc(100%-2rem)] rounded-2xl max-h-[90vh] overflow-auto p-0">
        {/* Header with flag background */}
        <div className="relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-f1-red/10 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-f1-red/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

          {/* Close button */}
          <DialogClose className="absolute right-4 top-4 z-10 rounded-xl p-2 bg-black/40 backdrop-blur-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
            <X className="h-4 w-4" />
          </DialogClose>

          {/* Content */}
          <div className="relative p-6 pb-4">
            <div className="flex items-start gap-4 mb-4">
              {/* Flag */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
                  alt={race.Circuit.Location.country}
                  className="w-9 h-6 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Race info */}
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg ${status === 'current'
                      ? 'bg-f1-red text-white shadow-lg shadow-f1-red/30'
                      : status === 'past'
                        ? 'bg-gray-700/80 text-gray-300'
                        : 'bg-gradient-to-r from-f1-red/90 to-f1-crimson/90 text-white'
                    }`}>
                    <StatusIcon className="w-3 h-3" />
                    {label}
                  </Badge>
                  <Badge className="bg-white/10 text-white/80 border border-white/10 text-[11px]">
                    Kolo {race.round}
                  </Badge>
                  {isSprintWeekend && (
                    <Badge className="bg-f1-red/10 text-f1-red border border-f1-red/20 text-[11px]">
                      <Lightning className="w-3 h-3 mr-1" />
                      Sprint
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-black leading-tight text-white">
                  {race.raceName}
                </DialogTitle>
                <p className="text-gray-400 text-sm mt-1 truncate">{race.Circuit.circuitName}</p>
              </div>
            </div>

            {/* Date bar */}
            <div className="flex items-center gap-2 text-gray-300 bg-white/5 backdrop-blur-sm rounded-xl p-3 text-sm border border-white/5">
              <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium">{formattedDateRange}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-6">
          <Tabs defaultValue="schedule">
            <TabsList className="bg-white/5 border border-white/10 rounded-xl mb-4 p-1 w-full flex">
              <TabsTrigger value="schedule" className="flex-1 rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-f1-red data-[state=active]:to-f1-crimson data-[state=active]:text-white data-[state=active]:shadow-lg">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Program
              </TabsTrigger>
              <TabsTrigger value="circuit" className="flex-1 rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-f1-red data-[state=active]:to-f1-crimson data-[state=active]:text-white data-[state=active]:shadow-lg">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                Okruh
              </TabsTrigger>
              {status === "past" && (
                <TabsTrigger value="results" className="flex-1 rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-f1-red data-[state=active]:to-f1-crimson data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Trophy className="h-3.5 w-3.5 mr-1.5" />
                  Výsledky
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="schedule" className="mt-0 focus-visible:outline-none">
              <div className="space-y-2">
                {race.FirstPractice && (
                  <EventItem
                    title="1. trénink"
                    date={race.FirstPractice.date}
                    time={race.FirstPractice.time}
                  />
                )}

                {isSprintWeekend && race.SprintQualifying && (
                  <EventItem
                    title="Kvalifikace sprintu"
                    date={race.SprintQualifying.date}
                    time={race.SprintQualifying.time}
                    isSprint
                  />
                )}

                {isSprintWeekend && race.Sprint && (
                  <EventItem
                    title="Sprint"
                    date={race.Sprint.date}
                    time={race.Sprint.time}
                    isSprint
                    highlight
                  />
                )}

                {!isSprintWeekend && race.SecondPractice && (
                  <EventItem
                    title="2. trénink"
                    date={race.SecondPractice.date}
                    time={race.SecondPractice.time}
                  />
                )}

                {!isSprintWeekend && race.ThirdPractice && (
                  <EventItem
                    title="3. trénink"
                    date={race.ThirdPractice.date}
                    time={race.ThirdPractice.time}
                  />
                )}

                {race.Qualifying && (
                  <EventItem
                    title="Kvalifikace"
                    date={race.Qualifying.date}
                    time={race.Qualifying.time}
                    highlight
                  />
                )}

                <EventItem
                  title="Závod"
                  date={race.date}
                  time={race.time}
                  highlight
                  isMain
                />
              </div>
            </TabsContent>

            <TabsContent value="circuit" className="mt-0 focus-visible:outline-none">
              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5 transition-all hover:bg-white/[0.07]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs font-medium mb-0.5">Lokalita</p>
                    <p className="font-bold text-white truncate">
                      {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                    </p>
                  </div>
                </div>

                <a
                  href={race.Circuit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/5 rounded-xl p-4 border border-white/5 transition-all hover:bg-white/[0.07] hover:border-f1-red/30 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-f1-red/20 to-f1-red/10 flex items-center justify-center border border-f1-red/20 group-hover:border-f1-red/40 transition-colors">
                      <ArrowSquareOut className="h-5 w-5 text-f1-red" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-500 text-xs font-medium mb-0.5">Oficiální stránky</p>
                      <p className="font-bold text-f1-red group-hover:text-white transition-colors">
                        Navštívit stránky okruhu
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </TabsContent>

            {status === "past" && (
              <TabsContent value="results" className="mt-0 focus-visible:outline-none">
                {loading && (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                )}
                {error && (
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-900/30 text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {!loading && !error && !raceResults && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Výsledky zatím nejsou k dispozici</p>
                  </div>
                )}
                {!loading && !error && raceResults && raceResults.Results && (
                  <div className="space-y-1.5">
                    {raceResults.Results.slice(0, 10).map((result, index) => (
                      <ResultRow key={result.position} result={result} index={index} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EventItem({ title, date, time, highlight = false, isMain = false, isSprint = false }: {
  title: string;
  date?: string;
  time?: string;
  highlight?: boolean;
  isMain?: boolean;
  isSprint?: boolean;
}) {
  let formattedDate = "Bude oznámeno";
  let formattedTime = "Bude oznámeno";

  try {
    if (date) {
      const eventDate = parseISO(`${date}T${time || '00:00:00Z'}`);
      if (isValid(eventDate)) {
        formattedDate = format(eventDate, "EEEE d. MMM", { locale: cs });
        formattedTime = time ? format(eventDate, "HH:mm") : 'Bude oznámeno';
      }
    }
  } catch (error) {
    console.error("Error formatting event date:", error);
  }

  const isCurrentEvent = () => {
    if (!date || !time) return false;
    const eventDate = parseISO(`${date}T${time}`);
    if (!isValid(eventDate)) return false;
    const eventEnd = new Date(eventDate);
    eventEnd.setHours(eventEnd.getHours() + 2);
    return isWithinInterval(new Date(), { start: eventDate, end: eventEnd });
  };

  const isCurrent = isCurrentEvent();

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${isCurrent
        ? 'bg-gradient-to-r from-f1-red/20 to-f1-red/5 border border-f1-red/30'
        : isMain
          ? 'bg-gradient-to-r from-f1-red/10 to-transparent border border-f1-red/20'
          : highlight
            ? 'bg-white/[0.04] border border-white/10'
            : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]'
      }`}>
      <div className="flex items-center gap-3">
        <div className={`w-1 h-8 rounded-full ${isCurrent || isMain ? 'bg-f1-red' : isSprint ? 'bg-f1-red/50' : highlight ? 'bg-white/30' : 'bg-white/10'
          }`} />
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${isCurrent || isMain ? 'text-f1-red' : highlight ? 'text-white' : 'text-gray-300'
              }`}>
              {title}
            </span>
            {isCurrent && (
              <span className="px-1.5 py-0.5 bg-f1-red text-white text-[10px] font-bold rounded animate-pulse">
                LIVE
              </span>
            )}
            {isSprint && !isCurrent && (
              <Lightning className="w-3 h-3 text-f1-red" />
            )}
          </div>
          <span className="text-xs text-gray-500 capitalize">{formattedDate}</span>
        </div>
      </div>
      <div className={`text-right font-bold ${isCurrent || isMain ? 'text-white' : 'text-gray-300'}`}>
        {formattedTime}
      </div>
    </div>
  );
}

function ResultRow({ result, index }: { result: RaceResult; index: number }) {
  const positionColors = {
    1: 'text-yellow-400',
    2: 'text-gray-300',
    3: 'text-amber-600',
  };

  const position = parseInt(result.position);
  const positionColor = positionColors[position as 1 | 2 | 3] || 'text-gray-500';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${index < 3 ? 'bg-white/[0.04]' : 'bg-white/[0.02]'
      } border border-white/5 hover:bg-white/[0.06] transition-all`}>
      {/* Position */}
      <div className="w-8 text-center">
        <span className={`text-lg font-black ${positionColor}`}>{result.position}</span>
      </div>

      {/* Driver */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/10 rounded text-white/80 border border-white/10">
            {result.Driver.code}
          </span>
          <span className="text-gray-400 text-sm">{result.Driver.givenName}</span>
          <span className="text-white font-bold text-sm">{result.Driver.familyName}</span>
        </div>
        <p className="text-gray-600 text-xs mt-0.5 truncate">{result.Constructor.name}</p>
      </div>

      {/* Time */}
      <div className="text-right">
        <span className="text-sm font-medium text-gray-300">
          {result.Time ? result.Time.time : (result.status || 'DNF')}
        </span>
      </div>
    </div>
  );
}
