import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConstructorStandings } from "@/services/f1Service";
import { SkeletonCard } from "./SkeletonCard";
import { TrophyIcon, CarIcon } from "lucide-react";

export function ConstructorStandingsTable() {
  const { standings, loading, error } = useConstructorStandings();

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-900/20 border border-red-900 text-center">
        <p className="text-red-400">{error}</p>
        <p className="text-gray-400 text-sm mt-1">Zkuste to prosím později</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl">
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="text-gray-500 w-16 text-center font-semibold">Poz</TableHead>
            <TableHead className="text-gray-500 font-semibold">Tým</TableHead>
            <TableHead className="text-gray-500 hidden md:table-cell font-semibold">Národnost</TableHead>
            <TableHead className="text-gray-500 text-right font-semibold">Body</TableHead>
            <TableHead className="text-gray-500 text-right font-semibold">Vítězství</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((standing, index) => (
            <TableRow
              key={standing.position}
              className={`border-white/5 transition-all hover:bg-gradient-to-r hover:from-f1-red/5 hover:to-transparent ${index < 3 ? 'bg-gradient-to-r from-white/[0.02] to-transparent' : ''}`}
            >
              <TableCell className="font-medium text-center relative py-4">
                {parseInt(standing.position) <= 3 ? (
                  <div className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 opacity-10 ${parseInt(standing.position) === 1 ? 'text-yellow-400' :
                    parseInt(standing.position) === 2 ? 'text-gray-300' : 'text-amber-600'
                    }`}>
                    <TrophyIcon className="h-10 w-10" />
                  </div>
                ) : null}
                <span className={`relative z-10 font-black text-lg ${parseInt(standing.position) === 1 ? 'text-yellow-400' :
                  parseInt(standing.position) === 2 ? 'text-gray-300' :
                    parseInt(standing.position) === 3 ? 'text-amber-600' : 'text-gray-400'
                  }`}>{standing.position}</span>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-f1-red to-f1-crimson"></div>
                  <span className="font-bold text-white">{standing.Constructor.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-gray-400">{standing.Constructor.nationality}</TableCell>
              <TableCell className="text-right font-black text-lg py-4">
                <span className={parseInt(standing.position) === 1 ? "gradient-text-red" : "text-white"}>{standing.points}</span>
              </TableCell>
              <TableCell className="text-right py-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-white font-bold border border-white/10">
                  {standing.wins}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
