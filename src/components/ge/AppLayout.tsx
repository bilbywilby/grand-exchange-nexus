import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Swords, LayoutGrid, Wifi, WifiOff } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
const ConnectionStatus = () => {
  const { isSuccess, isError } = useQuery({
    queryKey: ['health-check'],
    queryFn: () => fetch('/api/health').then(res => res.json()),
    refetchInterval: 30000,
    retry: 2,
  });
  const status = isSuccess ? 'online' : isError ? 'offline' : 'connecting';
  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'online' && <Wifi className="h-4 w-4 text-green-400" />}
      {status === 'offline' && <WifiOff className="h-4 w-4 text-red-400" />}
      <span className={`capitalize ${status === 'online' ? 'text-green-400' : status === 'offline' ? 'text-red-400' : 'text-yellow-400'}`}>
        {status}
      </span>
    </div>
  );
};
const NavContent = () => (
  <>
    <NavLink
      to="/"
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white ${
          isActive ? 'bg-slate-800 text-white' : ''
        }`
      }
    >
      <LayoutGrid className="h-4 w-4" />
      Dashboard
    </NavLink>
    <NavLink
      to="/category/1"
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white ${
          isActive ? 'bg-slate-800 text-white' : ''
        }`
      }
    >
      <Swords className="h-4 w-4" />
      Catalogue
    </NavLink>
  </>
);
export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-950 text-white">
      {!isMobile && (
        <div className="hidden border-r border-slate-800 bg-slate-900/50 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:h-[60px] lg:px-6">
              <Link to="/" className="flex items-center gap-2 font-semibold text-yellow-400">
                <Swords className="h-6 w-6" />
                <span>GE Nexus</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <NavContent />
              </nav>
            </div>
            <div className="mt-auto p-4 border-t border-slate-800">
              <ConnectionStatus />
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col">
        {isMobile && (
          <header className="flex h-14 items-center gap-4 border-b border-slate-800 bg-slate-900/50 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent border-slate-700 hover:bg-slate-800">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-slate-900 border-r-slate-800 text-white">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4 text-yellow-400">
                    <Swords className="h-6 w-6" />
                    <span>GE Nexus</span>
                  </Link>
                  <NavContent />
                </nav>
                <div className="mt-auto">
                  <ConnectionStatus />
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              <h1 className="font-semibold text-lg text-yellow-400">Grand Exchange Nexus</h1>
            </div>
          </header>
        )}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}