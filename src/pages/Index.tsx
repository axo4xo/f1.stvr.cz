import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRaceSchedule, Race } from "@/services/f1Service";
import { RaceCard } from "@/components/RaceCard";
import { RaceDetails } from "@/components/RaceDetails";
import { DriverStandingsTable } from "@/components/DriverStandingsTable";
import { ConstructorStandingsTable } from "@/components/ConstructorStandingsTable";
import { HeroCountdown } from "@/components/HeroCountdown";
import { CalendarDots, Medal, Flag } from "@phosphor-icons/react";
import { isWithinInterval, parseISO } from "date-fns";

const Index = () => {
  const { schedule, loading, error } = useRaceSchedule();
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("calendar");

  const handleRaceClick = (race: Race) => {
    setSelectedRace(race);
    setDetailsOpen(true);
  };

  const getEventDateRange = (race: Race) => {
    const dates = [
      race.FirstPractice && parseISO(`${race.FirstPractice.date}T${race.FirstPractice.time || '00:00:00Z'}`),
      race.SecondPractice && parseISO(`${race.SecondPractice.date}T${race.SecondPractice.time || '00:00:00Z'}`),
      race.ThirdPractice && parseISO(`${race.ThirdPractice.date}T${race.ThirdPractice.time || '00:00:00Z'}`),
      race.Qualifying && parseISO(`${race.Qualifying.date}T${race.Qualifying.time || '00:00:00Z'}`),
      race.Sprint && parseISO(`${race.Sprint.date}T${race.Sprint.time || '00:00:00Z'}`),
      parseISO(`${race.date}T${race.time || '00:00:00Z'}`),
    ].filter((date): date is Date => date !== null);

    if (dates.length === 0) return { startDate: null, endDate: null };

    return {
      startDate: dates.reduce((min, date) => date < min ? date : min),
      endDate: dates.reduce((max, date) => date > max ? date : max),
    };
  };

  const isRacePast = (race: Race) => {
    const { endDate } = getEventDateRange(race);
    if (!endDate) return false;
    return endDate < new Date();
  };

  const isRaceCurrent = (race: Race) => {
    const { startDate, endDate } = getEventDateRange(race);
    if (!startDate || !endDate) return false;
    const now = new Date();
    return isWithinInterval(now, { start: startDate, end: endDate });
  };

  const pastRaces = schedule.filter(isRacePast);
  const currentRaces = schedule.filter(isRaceCurrent);
  const upcomingRaces = schedule.filter(race => !isRacePast(race) && !isRaceCurrent(race));

  useEffect(() => {
    const handleTabChange = (tab: string) => {
      setActiveTab(tab);
    };

    document.addEventListener("tabChange", (e: CustomEvent<{ tab: string }>) => handleTabChange(e.detail.tab));
    return () => {
      document.removeEventListener("tabChange", (e: CustomEvent<{ tab: string }>) => handleTabChange(e.detail.tab));
    };
  }, []);

  return (
    <div className="min-h-screen text-white relative flex flex-col">
      {/* Background elements */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] pointer-events-none" />
      <div className="fixed inset-0 noise-overlay pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-2xl bg-black/80 border-b border-white/5">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4 px-4 sm:px-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/logo26.png" alt="Logo" width={36} height={36} className="rounded-xl" />
                <div className="absolute -inset-1 bg-f1-red/20 rounded-xl blur-xl opacity-50" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white leading-none">
                  f1<span className="text-f1-red">.</span>stvr<span className="text-f1-red">.</span>cz
                </h1>
                <p className="text-[10px] text-gray-500 tracking-widest uppercase">Sezóna 2026</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavButton
                active={activeTab === "calendar"}
                onClick={() => setActiveTab("calendar")}
                icon={CalendarDots}
                label="Závody"
              />
              <NavButton
                active={activeTab === "drivers"}
                onClick={() => setActiveTab("drivers")}
                icon={Medal}
                label="Jezdci"
              />
              <NavButton
                active={activeTab === "constructors"}
                onClick={() => setActiveTab("constructors")}
                icon={Flag}
                label="Týmy"
              />
            </nav>

          </div>
        </div>
        {/* Accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-f1-red/50 to-transparent" />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 pb-24 sm:pb-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="calendar" className="mt-0 focus-visible:outline-none">
            {/* Hero Countdown - only show when not loading and have races */}
            {!loading && !error && schedule.length > 0 && (
              <HeroCountdown races={schedule} onRaceClick={handleRaceClick} />
            )}

            <div className="container mx-auto px-4 sm:px-6">
              {error && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-900/20 to-red-900/10 border border-red-900/30 text-center mb-8">
                  <p className="text-red-400 font-medium">{error}</p>
                  <p className="text-gray-500 text-sm mt-1">Nepodařilo se načíst data o závodech. Zkuste to prosím později.</p>
                </div>
              )}

              {loading ? (
                <div className="py-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 sm:py-8">
                  {/* Current races section */}
                  {currentRaces.length > 0 && (
                    <RaceSection
                      title="Právě probíhá"
                      races={currentRaces}
                      onRaceClick={handleRaceClick}
                      isPast={false}
                      accentColor="f1-red"
                      showPulse
                    />
                  )}

                  {/* Upcoming races section */}
                  {upcomingRaces.length > 0 && (
                    <RaceSection
                      title="Nadcházející závody"
                      subtitle={`${upcomingRaces.length} ${upcomingRaces.length === 1 ? 'závod' : upcomingRaces.length < 5 ? 'závody' : 'závodů'} zbývá`}
                      races={upcomingRaces}
                      onRaceClick={handleRaceClick}
                      isPast={false}
                      accentColor="f1-red"
                    />
                  )}

                  {/* Past races section */}
                  {pastRaces.length > 0 && (
                    <RaceSection
                      title="Dokončené závody"
                      subtitle={`${pastRaces.length} ${pastRaces.length === 1 ? 'závod' : pastRaces.length < 5 ? 'závody' : 'závodů'}`}
                      races={pastRaces}
                      onRaceClick={handleRaceClick}
                      isPast={true}
                      accentColor="gray-500"
                      defaultCollapsed={upcomingRaces.length > 3}
                    />
                  )}

                  {/* No races fallback */}
                  {!loading && !error && schedule.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <CalendarDots className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-400 font-medium">Pro sezónu 2026 zatím nejsou k dispozici žádná data.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Driver Standings Tab */}
          <TabsContent value="drivers" className="mt-0 focus-visible:outline-none">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <SectionHeader
                title="Šampionát jezdců"
                subtitle="Aktuální pořadí v mistrovství světa"
              />
              <DriverStandingsTable />
            </div>
          </TabsContent>

          {/* Constructor Standings Tab */}
          <TabsContent value="constructors" className="mt-0 focus-visible:outline-none">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <SectionHeader
                title="Pohár konstruktérů"
                subtitle="Aktuální pořadí týmů v mistrovství"
              />
              <ConstructorStandingsTable />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-black/95 backdrop-blur-2xl border-t border-white/5 pb-safe">
          <div className="flex items-center justify-around py-2 px-4">
            <MobileNavButton
              active={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
              icon={CalendarDots}
              label="Závody"
            />
            <MobileNavButton
              active={activeTab === "drivers"}
              onClick={() => setActiveTab("drivers")}
              icon={Medal}
              label="Jezdci"
            />
            <MobileNavButton
              active={activeTab === "constructors"}
              onClick={() => setActiveTab("constructors")}
              icon={Flag}
              label="Týmy"
            />
          </div>
        </div>
      </nav>

      {/* Footer - Desktop only */}
      <footer className="relative z-10 hidden sm:block border-t border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-f1-red to-f1-crimson flex items-center justify-center">
                <img src="/logo26.png" alt="Logo" className="w-full h-full" />
              </div>
              <span className="text-sm font-medium text-gray-400">f1.stvr.cz</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Data poskytuje <a href="https://api.jolpi.ca/ergast/" target="_blank" rel="noopener noreferrer" className="text-f1-red hover:text-white transition-colors">Jolpica API</a></span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Není spojeno s Formula 1 ani FIA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Race details modal */}
      <RaceDetails
        race={selectedRace}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
};

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CalendarDots;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active
        ? 'bg-gradient-to-r from-f1-red to-f1-crimson text-white shadow-lg shadow-f1-red/25'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function MobileNavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CalendarDots;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-xl transition-all ${active ? 'text-f1-red' : 'text-gray-500'
        }`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-f1-red/10' : ''}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-medium mt-0.5">{label}</span>
      {active && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-f1-red shadow-lg shadow-f1-red/50" />
      )}
    </button>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">{title}</h2>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );
}

function RaceSection({
  title,
  subtitle,
  races,
  onRaceClick,
  isPast,
  accentColor,
  showPulse = false,
  defaultCollapsed = false,
}: {
  title: string;
  subtitle?: string;
  races: Race[];
  onRaceClick: (race: Race) => void;
  isPast: boolean;
  accentColor: string;
  showPulse?: boolean;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const displayedRaces = collapsed ? races.slice(0, 3) : races;

  return (
    <section className="mb-10 sm:mb-12">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-6 rounded-full bg-${accentColor} ${showPulse ? 'animate-pulse' : ''}`} />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {races.length > 3 && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
          >
            {collapsed ? `Zobrazit vše (${races.length})` : 'Skrýt'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {displayedRaces.map((race) => (
          <RaceCard
            key={race.round}
            race={race}
            onClick={() => onRaceClick(race)}
            isPast={isPast}
          />
        ))}
      </div>
    </section>
  );
}

export default Index;
