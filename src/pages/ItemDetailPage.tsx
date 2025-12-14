import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/ge/AppLayout';
import { getItemDetail, getGraph } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceChart } from '@/components/ge/PriceChart';
import { ArrowLeft, Terminal, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ItemDetailApiResponse, GraphApiResponse } from '@/types/osrs';
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
export function ItemDetailPage() {
  const { itemId } = useParams();
  const parsedItemId = parseInt(itemId || '0', 10);
  const { data: detailData, isLoading: isDetailLoading, error: detailError } = useQuery<ItemDetailApiResponse>({
    queryKey: ['itemDetail', parsedItemId],
    queryFn: () => getItemDetail(parsedItemId),
    enabled: !!parsedItemId,
  });
  const { data: graphData, isLoading: isGraphLoading, error: graphError } = useQuery<GraphApiResponse>({
    queryKey: ['graph', parsedItemId],
    queryFn: () => getGraph(parsedItemId),
    enabled: !!parsedItemId,
  });
  const item = detailData?.item;
  if (isDetailLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="w-full aspect-square" />
              <Skeleton className="h-6 w-full mt-4" />
              <Skeleton className="h-20 w-full mt-2" />
            </div>
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (detailError || !item) {
    return (
      <AppLayout>
        <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300 max-w-2xl mx-auto">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{detailError?.message || 'Item not found.'}</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 w-full">
        <Button asChild variant="ghost" className="mb-6 hover:bg-slate-800">
          <Link to="/category/1"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalogue</Link>
        </Button>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 flex flex-col items-center">
                <img src={item.icon_large} alt={item.name} className="w-32 h-32 object-contain" />
                <h1 className="text-2xl font-bold text-yellow-400 mt-4 text-center">{item.name}</h1>
                <p className="text-sm text-slate-400 mt-2 text-center">{item.description}</p>
                <span className={`mt-4 text-xs font-semibold px-2 py-1 rounded ${item.members === 'true' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-slate-700 text-slate-300'}`}>
                  {item.members === 'true' ? 'Members' : 'Free-to-Play'}
                </span>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-yellow-400">Market Trends</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400">30 Day</p>
                  <TrendIndicator trend={item.day30.trend} change={item.day30.change} />
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400">90 Day</p>
                  <TrendIndicator trend={item.day90.trend} change={item.day90.change} />
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400">180 Day</p>
                  <TrendIndicator trend={item.day180.trend} change={item.day180.change} />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-yellow-400">180-Day Price History</CardTitle>
              </CardHeader>
              <CardContent>
                {isGraphLoading && <Skeleton className="h-64 w-full" />}
                {graphError && <p className="text-red-400">Could not load graph data.</p>}
                {graphData && <PriceChart data={graphData} />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}