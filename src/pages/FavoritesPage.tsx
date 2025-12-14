import { useQueries } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/ge/AppLayout';
import { ItemGrid } from '@/components/ge/ItemGrid';
import { getItemDetail } from '@/lib/api';
import { useFavorites } from '@/lib/favorites';
import type { Item, ItemDetailApiResponse } from '@/types/osrs';
export function FavoritesPage() {
  const { favorites } = useFavorites();
  const results = useQueries({
    queries: favorites.map(id => ({
      queryKey: ['itemDetail', id],
      queryFn: () => getItemDetail(id),
    })),
  });
  const isLoading = results.some(result => result.isLoading);
  const favoriteItems: Item[] = results
    .filter(result => result.isSuccess && result.data)
    .map(result => (result.data as ItemDetailApiResponse).item as unknown as Item);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="py-8 md:py-10 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-yellow-400">Your Favorites</h1>
            <p className="mt-2 text-lg text-slate-300">A collection of your saved items for quick access.</p>
          </motion.div>
          <div className="mt-12">
            {favorites.length === 0 && !isLoading ? (
              <div className="text-center py-16 text-slate-400 bg-slate-900/50 rounded-lg">
                <h3 className="text-xl font-semibold text-white">No Favorites Yet</h3>
                <p className="mt-2">Click the heart icon on any item to add it to your favorites.</p>
              </div>
            ) : (
              <ItemGrid items={favoriteItems} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}