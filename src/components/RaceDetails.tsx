import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchRaceResults, Race } from "@/services/f1Service";
import { format, parseISO, isValid, isWithinInterval, isSameDay } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarIcon, MapPinIcon, FlagIcon, ClockIcon, TrophyIcon, InfoIcon, XIcon } from "lucide-react";

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
  className: string;
} {
  const now = new Date();

  if (!startDate || !endDate) {
    return {
      status: "upcoming",
      label: "Bude oznámeno",
      className: "bg-f1-red",
    };
  }

  if (endDate < now) {
    return {
      status: "past",
      label: "Dokončeno",
      className: "bg-gray-700",
    };
  }

  if (isWithinInterval(now, { start: startDate, end: endDate })) {
    return {
      status: "current",
      label: "Právě probíhá",
      className: "bg-f1-red",
    };
  }

  return {
    status: "upcoming",
    label: "Nadcházející",
    className: "bg-f1-red",
  };
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

      // Check if the race date has passed to fetch results
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
  const { status, label, className } = getRaceStatus(startDate, endDate);
  const isSprintWeekend = !!race.Sprint; // Determine if it's a sprint weekend

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
      <DialogContent className={`bg-gradient-to-b from-[#141414] to-[#0a0a0a] text-white border-white/5 max-w-3xl w-[calc(100%-2rem)] rounded-2xl sm:rounded-2xl max-h-[95vh] md:max-h-[85vh] overflow-auto p-5 sm:p-7 ${status === 'current' ? 'ring-2 ring-f1-red/30' : ''}`}>
        <DialogClose className="absolute right-4 top-4 rounded-xl p-2.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
          <XIcon className="h-4 w-4" />
        </DialogClose>

        <DialogHeader className="">
          <div className="flex flex-row justify-between items-start pr-8">
            <div>
              <div className="flex flex-row gap-2 items-center mb-3">
                <Badge className={`${className} text-white shadow-lg ${status !== 'past' ? 'shadow-f1-red/20' : ''}`}>
                  {label}
                </Badge>
                <Badge className="bg-white/10 text-white border border-white/10">Kolo {race.round}</Badge>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-black leading-tight">{race.raceName}</DialogTitle>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">{race.Circuit.circuitName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center text-gray-300 bg-white/5 backdrop-blur-sm rounded-xl p-3 text-sm mb-3 mt-2 border border-white/5">
          <CalendarIcon className="h-4 w-4 mr-2.5 text-gray-500 flex-shrink-0" />
          <span className="line-clamp-1 font-medium">{formattedDateRange}</span>
        </div>

        <Tabs defaultValue="schedule">
          <TabsList className="bg-white/5 border border-white/10 rounded-xl mb-5 p-1.5 w-full flex">
            <TabsTrigger value="schedule" className="flex-1 rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-f1-red data-[state=active]:to-f1-crimson data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-f1-red/20">
              <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="block">Program</span>
            </TabsTrigger>
            <TabsTrigger value="circuit" className="flex-1 rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-f1-red data-[state=active]:to-f1-crimson data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-f1-red/20">
              <MapPinIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="block">Okruh</span>
            </TabsTrigger>
            {status === "past" && (
              <TabsTrigger value="results" className="flex-1 rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-f1-red data-[state=active]:to-f1-crimson data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-f1-red/20">
                <TrophyIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="block">Výsledky</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="schedule">
            <h4 className="font-bold text-lg sm:text-xl mb-4 sm:mb-5">Program závodního víkendu</h4>
            <div className="space-y-1">
              {race.FirstPractice && (
                <EventItem
                  title="1. trénink"
                  date={race.FirstPractice.date}
                  time={race.FirstPractice.time}
                />
              )}

              {isSprintWeekend && race.SprintQualifying && (
                <EventItem
                  title="Kvalifikace pro Sprint"
                  date={race.SprintQualifying.date}
                  time={race.SprintQualifying.time}
                />
              )}

              {isSprintWeekend && race.Sprint && (
                <EventItem
                  title="Sprint"
                  date={race.Sprint.date}
                  time={race.Sprint.time}
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
              />
            </div>
          </TabsContent>

          <TabsContent value="circuit" className="pt-1">
            <h4 className="font-bold text-lg sm:text-xl mb-5">Informace o okruhu</h4>
            <div className="space-y-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 flex items-center gap-4 border border-white/5 transition-all hover:bg-white/[0.07]">
                <div className="bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-xl flex-shrink-0 border border-white/10">
                  <MapPinIcon className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">Lokalita</p>
                  <p className="font-bold text-base sm:text-lg text-white">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 flex items-center gap-4 border border-white/5 transition-all hover:bg-white/[0.07]">
                <div className="bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-xl flex-shrink-0 border border-white/10">
                  <InfoIcon className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">Oficiální stránky</p>
                  <a
                    href={race.Circuit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-f1-red hover:text-f1-crimson transition-colors font-bold text-base sm:text-lg"
                  >
                    Navštívit stránky
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>

          {status === "past" && (
            <TabsContent value="results" className="pt-1">
              <h4 className="font-bold text-lg sm:text-xl mb-5">Výsledky závodu</h4>
              {loading && <p className="text-gray-400 text-sm sm:text-base">Načítání výsledků...</p>}
              {error && <p className="text-red-400 text-sm sm:text-base">{error}</p>}
              {!loading && !error && !raceResults && (
                <p className="text-gray-400 text-sm sm:text-base">Výsledky zatím nejsou k dispozici</p>
              )}
              {!loading && !error && raceResults && raceResults.Results && (
                <div className="overflow-x-auto -mx-4 sm:mx-0 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5">
                  <div className="min-w-[480px]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-500 text-xs sm:text-sm font-semibold">Poz</th>
                          <th className="text-left py-3 px-4 text-gray-500 text-xs sm:text-sm font-semibold">Jezdec</th>
                          <th className="text-left py-3 px-4 text-gray-500 text-xs sm:text-sm font-semibold">Tým</th>
                          <th className="text-right py-3 px-4 text-gray-500 text-xs sm:text-sm font-semibold">Čas/Rozdíl</th>
                        </tr>
                      </thead>
                      <tbody>
                        {raceResults.Results.map((result: RaceResult, index: number) => (
                          <tr key={result.position} className={`border-b border-white/5 last:border-0 transition-all hover:bg-gradient-to-r hover:from-f1-red/5 hover:to-transparent ${index < 3 ? 'bg-white/[0.02]' : ''}`}>
                            <td className={`py-3 px-4 text-sm font-black ${parseInt(result.position) === 1 ? 'text-yellow-400' : parseInt(result.position) === 2 ? 'text-gray-300' : parseInt(result.position) === 3 ? 'text-amber-600' : 'text-gray-400'}`}>{result.position}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="font-bold mr-2 text-white bg-white/10 px-2 py-1 rounded-lg text-xs">{result.Driver.code}</span>
                              <span className="text-gray-300">{result.Driver.givenName}</span> <span className="font-bold text-white">{result.Driver.familyName}</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">{result.Constructor.name}</td>
                            <td className="py-3 px-4 text-right text-sm font-medium text-gray-300">
                              {result.Time ? result.Time.time : (result.status || 'DNF')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function EventItem({ title, date, time, highlight = false }: {
  title: string;
  date?: string;
  time?: string;
  highlight?: boolean;
}) {
  let formattedDate = "Bude oznámeno";
  let formattedTime = "Bude oznámeno";

  try {
    if (date) {
      const eventDate = parseISO(`${date}T${time || '00:00:00Z'}`);
      if (isValid(eventDate)) {
        formattedDate = format(eventDate, "EEEE, d. MMMM", { locale: cs });
        formattedTime = time ? format(eventDate, "HH:mm", { locale: cs }) : 'Bude oznámeno';
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
    eventEnd.setHours(eventEnd.getHours() + 2); // Assume events last 2 hours

    return isWithinInterval(new Date(), { start: eventDate, end: eventEnd });
  };

  const isCurrent = isCurrentEvent();
  return (
    <div className={`flex justify-between items-center p-4 rounded-xl transition-all ${isCurrent ? 'bg-gradient-to-r from-f1-red/15 to-f1-red/5 border-l-[3px] border-l-f1-red ring-1 ring-f1-red/20' :
      highlight ? 'bg-gradient-to-r from-f1-red/10 to-transparent border-l-[3px] border-l-f1-red' :
        'bg-white/[0.03] border-l-[3px] border-l-gray-600 hover:bg-white/[0.05]'
      }`}>
      <div className="flex items-center gap-3">
        <span className={`font-semibold text-sm sm:text-base ${isCurrent ? 'text-f1-red' :
          highlight ? 'text-f1-red' :
            'text-white'
          }`}>{title}</span>
        {isCurrent && (
          <span className="px-2 py-0.5 bg-f1-red text-white text-xs font-bold rounded-full animate-pulse">LIVE</span>
        )}
      </div>
      <div className="text-right">
        <span className="block text-xs sm:text-sm text-gray-500">{formattedDate}</span>
        <span className="block text-sm sm:text-base font-bold text-white">{formattedTime}</span>
      </div>
    </div>
  );
}
