import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Flag, House } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-f1-dark to-[#1a1a1a] text-white">
      <div className="text-center px-6 py-12 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800 max-w-md">
        <div className="mx-auto w-16 h-16 bg-f1-red/10 rounded-full flex items-center justify-center mb-6">
          <Flag className="h-8 w-8 text-f1-red" />
        </div>
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-6">Jejda! Stránka nebyla nalezena</p>
        <p className="text-gray-400 mb-8">Zdá se, že jste sjeli z trati. Tato stránka neexistuje nebo byla přesunuta.</p>
        <Button asChild className="bg-f1-red hover:bg-f1-red/90 text-white">
          <a href="/" className="flex items-center gap-2">
            <House className="h-4 w-4" />
            <span>Zpět na domovskou stránku</span>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
