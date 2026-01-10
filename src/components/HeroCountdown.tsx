import { useState, useEffect, useMemo } from "react";
import { Race } from "@/services/f1Service";
import { parseISO, isValid, differenceInSeconds } from "date-fns";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { MapPin, Calendar, CaretRight } from "@phosphor-icons/react";

interface HeroCountdownProps {
  races: Race[];
  onRaceClick: (race: Race) => void;
}

const countryFlags: { [key: string]: string } = {
  "Italy": "IT", "Monaco": "MC", "Spain": "ES", "UK": "GB", "United Kingdom": "GB",
  "USA": "US", "United States": "US", "Austria": "AT", "Belgium": "BE",
  "Netherlands": "NL", "Hungary": "HU", "Azerbaijan": "AZ", "Canada": "CA",
  "France": "FR", "Germany": "DE", "Japan": "JP", "Mexico": "MX", "Brazil": "BR",
  "Australia": "AU", "Bahrain": "BH", "Saudi Arabia": "SA", "China": "CN",
  "Singapore": "SG", "Qatar": "QA", "UAE": "AE", "United Arab Emirates": "AE",
};

// Convert country code to Twemoji URL
function getTwemojiUrl(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => (0x1F1E6 + char.charCodeAt(0) - 65).toString(16))
    .join('-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`;
}

export function HeroCountdown({ races, onRaceClick }: HeroCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const nextRace = useMemo(() => {
    const now = new Date();
    return races.find((race) => {
      const raceDate = parseISO(`${race.date}T${race.time || "00:00:00Z"}`);
      return isValid(raceDate) && raceDate > now;
    });
  }, [races]);

  const raceDate = useMemo(() => {
    if (!nextRace) return null;
    return parseISO(`${nextRace.date}T${nextRace.time || "00:00:00Z"}`);
  }, [nextRace]);

  useEffect(() => {
    if (!raceDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = differenceInSeconds(raceDate, now);

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = diff % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [raceDate]);

  if (!nextRace) return null;

  const countryCode = countryFlags[nextRace.Circuit.Location.country] || "UN";
  const formattedDate = raceDate && isValid(raceDate)
    ? format(raceDate, "d. MMMM yyyy, HH:mm", { locale: cs })
    : "Bude oznámeno";

  return (
    <section className="relative overflow-hidden mb-8 sm:mb-12">
      {/* Background gradient with racing stripes */}
      <div className="absolute inset-0 bg-gradient-to-br from-f1-dark via-[#1a0a0a] to-f1-dark" />
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-f1-red/20 to-transparent transform skew-x-12" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-f1-red/10 to-transparent" />
      </div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-12">
        {/* Top label */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-f1-red/50" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-f1-red uppercase">
            Nadcházející závod
          </span>
          <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-f1-red/50" />
        </div>

        {/* Race info */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="">
              <img
                src={getTwemojiUrl(countryCode)}
                alt={nextRace.Circuit.Location.country}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="text-white/40 text-sm sm:text-base font-medium">Kolo {nextRace.round}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            {nextRace.raceName}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-f1-red" />
              <span>{nextRace.Circuit.circuitName}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-f1-red" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-8">
          <CountdownUnit value={timeLeft.days} label="dny" />
          <div className="text-f1-red text-2xl sm:text-4xl font-light self-center opacity-50">:</div>
          <CountdownUnit value={timeLeft.hours} label="hodiny" />
          <div className="text-f1-red text-2xl sm:text-4xl font-light self-center opacity-50">:</div>
          <CountdownUnit value={timeLeft.minutes} label="minuty" />
          <div className="text-f1-red text-2xl sm:text-4xl font-light self-center opacity-50 hidden sm:block">:</div>
          <div className="hidden sm:block">
            <CountdownUnit value={timeLeft.seconds} label="sekundy" highlight />
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={() => onRaceClick(nextRace)}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-f1-red to-f1-crimson text-white font-bold text-sm rounded-xl shadow-lg shadow-f1-red/25 hover:shadow-f1-red/40 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
          >
            <span className="relative z-10">Více detailů</span>
            <CaretRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-gradient-to-r from-f1-crimson to-f1-red opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-f1-red/50 to-transparent" />
    </section>
  );
}

function CountdownUnit({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center ${highlight
        ? 'bg-gradient-to-br from-f1-red/20 to-f1-crimson/10 border border-f1-red/30'
        : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10'
        }`}>
        <span className={`text-2xl sm:text-4xl font-black tabular-nums ${highlight ? 'text-f1-red' : 'text-white'}`}>
          {String(value).padStart(2, '0')}
        </span>
        {highlight && (
          <div className="absolute inset-0 rounded-2xl animate-pulse-subtle bg-f1-red/5" />
        )}
      </div>
      <span className="text-[10px] sm:text-xs text-gray-500 mt-2 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}
