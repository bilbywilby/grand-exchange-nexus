import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swords, LayoutGrid, Wifi, WifiOff, TrendingUp, Heart, Leaf, Settings, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ItemDetailModal } from '@/components/ge/ItemDetailModal';
import { DashboardContent } from '@/components/ge/DashboardContent';
import { CatalogueBrowser } from '@/components/ge/CatalogueBrowser';
import { FlipperTable } from '@/components/ge/FlipperTable';
import { HerbloreTable } from '@/components/ge/HerbloreTable';
import { FavoritesGrid } from '@/components/ge/FavoritesGrid';
import { SettingsPanel } from '@/components/ge/SettingsPanel';
import { Toaster } from '@/components/ui/sonner';
type Tab = 'dashboard' | 'catalogue' | 'flipper' | 'herblore' | 'favorites' | 'settings';
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
const NavContent = ({ activeTab, onTabChange }: { activeTab: Tab, onTabChange: (tab: Tab) => void }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'catalogue', icon: Swords, label: 'Catalogue' },
    { id: 'flipper', icon: TrendingUp, label: 'Flipper' },
    { id: 'herblore', icon: Leaf, label: 'Herblore' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;
  return (
    <>
      {navItems.map(item => (
        <Button
          key={item.id}
          variant="ghost"
          onClick={() => onTabChange(item.id)}
          className={cn(
            'w-full justify-start flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-slate-800',
            activeTab === item.id ? 'bg-slate-800 text-white' : ''
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </>
  );
};
export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [flipperSettings, setFlipperSettings] = useState({ minVolume: 100000, taxRate: 0.01, topN: 100 });
  const [herbloreBatch, setHerbloreBatch] = useState(1000);
  const isMobile = useIsMobile();
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardContent onCategoryClick={() => setCurrentTab('catalogue')} />;
      case 'catalogue':
        return <CatalogueBrowser onItemClick={setSelectedItemId} />;
      case 'flipper':
        return <FlipperTable settings={flipperSettings} onItemClick={setSelectedItemId} />;
      case 'herblore':
        return <HerbloreTable batchQuantity={herbloreBatch} onItemClick={setSelectedItemId} />;
      case 'favorites':
        return <FavoritesGrid onItemClick={setSelectedItemId} />;
      case 'settings':
        return <SettingsPanel
          flipperSettings={flipperSettings}
          herbloreBatch={herbloreBatch}
          onFlipperSettingsChange={setFlipperSettings}
          onHerbloreBatchChange={setHerbloreBatch}
        />;
      default:
        return <DashboardContent onCategoryClick={() => setCurrentTab('catalogue')} />;
    }
  };
  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-950 text-white">
        {!isMobile && (
          <div className="hidden border-r border-slate-800 bg-slate-900/50 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:h-[60px] lg:px-6">
                <div className="flex items-center gap-2 font-semibold text-yellow-400">
                  <Swords className="h-6 w-6" />
                  <span>GE Nexus</span>
                </div>
              </div>
              <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  <NavContent activeTab={currentTab} onTabChange={setCurrentTab} />
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
                    <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-yellow-400">
                      <Swords className="h-6 w-6" />
                      <span>GE Nexus</span>
                    </div>
                    <NavContent activeTab={currentTab} onTabChange={setCurrentTab} />
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
            {renderContent()}
          </main>
        </div>
      </div>
      <ItemDetailModal itemId={selectedItemId} onClose={() => setSelectedItemId(null)} />
      <Toaster theme="dark" />
    </>
  );
}