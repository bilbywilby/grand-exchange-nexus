import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import type { Item } from '@/types/osrs';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/favorites';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
const formatPrice = (price: string | number) => {
  if (typeof price === 'number') return price.toLocaleString();
  if (typeof price !== 'string') return 'N/A';
  let value = price.toLowerCase();
  let multiplier = 1;
  if (value.endsWith('k')) {
    multiplier = 1000;
    value = value.slice(0, -1);
  } else if (value.endsWith('m')) {
    multiplier = 1000000;
    value = value.slice(0, -1);
  } else if (value.endsWith('b')) {
    multiplier = 1000000000;
    value = value.slice(0, -1);
  }
  const num = parseFloat(value.replace(/,/g, ''));
  if (isNaN(num)) return price;
  return (num * multiplier).toLocaleString();
};
export function ItemGrid({ items, isLoading }: { items: Item[] | undefined, isLoading: boolean }) {
  const { toggleFavorite, isFavorited } = useFavorites();
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Skeleton className="h-12 w-12 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>No items found for this selection.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-slate-800/50 hover:bg-slate-700/70"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(item.id);
            }}
          >
            <Heart className={cn(
              "h-4 w-4 text-slate-400 transition-all",
              isFavorited(item.id) ? 'text-yellow-400 fill-current' : 'group-hover:text-yellow-400'
            )} />
          </Button>
          <Link to={`/item/${item.id}`} className="block group">
            <Card className="bg-slate-900 border-slate-800 h-full hover:border-yellow-400 transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 flex flex-col items-center text-center justify-between h-full">
                <img src={item.icon} alt={item.name} className="w-12 h-12 object-contain mb-2 transition-transform group-hover:scale-110" />
                <p className="text-sm font-medium text-white flex-grow">{item.name}</p>
                <p className="text-xs text-yellow-400 mt-2">{formatPrice(item.current.price)} gp</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}