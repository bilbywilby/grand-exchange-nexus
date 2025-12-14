import { useQuery } from '@tanstack/react-query';
import { getItemDetail, getGraph } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceChart } from '@/components/ge/PriceChart';
import { Terminal, TrendingDown, TrendingUp, Minus, Heart, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { ItemDetailApiResponse, GraphApiResponse } from '@/types/osrs';
import { useFavorites } from '@/lib/favorites';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
const TrendIndicator = ({ trend, change }: { trend: string; change: string }) => {
  const isPositive = trend === 'positive';
  const isNegative = trend === 'negative';
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const color = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-400';
  return (
    <div className={`flex items-center ${color}`}>
      <Icon className="h-5 w-5 mr-2" />
      <span className="font-semibold">{change}</span>
    </div>
  );
};
export function ItemDetailModal({ itemId, onClose }: { itemId: number | null, onClose: () => void }) {
  const { toggleFavorite, isFavorited } = useFavorites();
  const { data: detailData, isLoading: isDetailLoading, error: detailError } = useQuery<ItemDetailApiResponse>({
    queryKey: ['itemDetail', itemId],
    queryFn: () => getItemDetail(itemId!),
    enabled: !!itemId,
  });
  const { data: graphData, isLoading: isGraphLoading, error: graphError } = useQuery<GraphApiResponse>({
    queryKey: ['graph', itemId],
    queryFn: () => getGraph(itemId!),
    enabled: !!itemId,
  });
  const item = detailData?.item;
  const handleCopyPrice = () => {
    if (item?.current.price) {
      navigator.clipboard.writeText(item.current.price.toString().replace(/,/g, ''));
      toast.success('Price copied to clipboard!');
    }
  };
  return (
    <Dialog open={!!itemId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-slate-900/80 border-slate-800 text-white backdrop-blur-lg">
        {isDetailLoading && (
          <div className="grid md:grid-cols-3 gap-8 p-6">
            <div className="md:col-span-1"><Skeleton className="w-full aspect-square" /></div>
            <div className="md:col-span-2 space-y-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-64 w-full" /></div>
          </div>
        )}
        {detailError && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300 m-6">
            <Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{detailError.message}</AlertDescription>
          </Alert>
        )}
        {item && (
          <div className="grid md:grid-cols-3 gap-8 p-6">
            <div className="md:col-span-1">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 flex flex-col items-center">
                  <img src={item.icon_large} alt={item.name} className="w-32 h-32 object-contain" />
                  <h1 className="text-2xl font-bold text-yellow-400 mt-4 text-center">{item.name}</h1>
                  <p className="text-sm text-slate-400 mt-2 text-center">{item.description}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="group" onClick={handleCopyPrice}>
                      <span className="text-lg font-bold text-yellow-300">{formatPrice(item.current.price)} gp</span>
                      <Copy className="ml-2 h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                    </Button>
                  </div>
                  <span className={`mt-4 text-xs font-semibold px-2 py-1 rounded ${item.members === 'true' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-slate-700 text-slate-300'}`}>
                    {item.members === 'true' ? 'Members' : 'Free-to-Play'}
                  </span>
                  <Button variant="ghost" size="lg" className="mt-4 w-full hover:bg-yellow-500/20 group" onClick={() => toggleFavorite(item.id)}>
                    <Heart className={cn("mr-2 h-5 w-5 text-slate-400 transition-all", isFavorited(item.id) ? 'text-yellow-400 fill-current' : 'group-hover:text-yellow-400')} />
                    {isFavorited(item.id) ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-yellow-400">Market Trends</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-sm text-slate-400">30 Day</p><TrendIndicator trend={item.day30.trend} change={item.day30.change} /></div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-sm text-slate-400">90 Day</p><TrendIndicator trend={item.day90.trend} change={item.day90.change} /></div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-sm text-slate-400">180 Day</p><TrendIndicator trend={item.day180.trend} change={item.day180.change} /></div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-yellow-400">180-Day Price History</CardTitle></CardHeader>
                <CardContent>
                  {isGraphLoading && <Skeleton className="h-64 w-full" />}
                  {graphError && <p className="text-red-400">Could not load graph data.</p>}
                  {graphData && <PriceChart data={graphData} />}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}