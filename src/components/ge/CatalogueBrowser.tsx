import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ItemGrid } from '@/components/ge/ItemGrid';
import { getCategory, getItems, OSRS_SINGLE_CATEGORY_ID } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import type { ItemsApiResponse, CategoryApiResponse } from '@/types/osrs';
const AlphaFilter = ({ alpha, onAlphaChange, isLoading }: { alpha: string, onAlphaChange: (alpha: string) => void, isLoading: boolean }) => {
  const letters = ['#', ...'abcdefghijklmnopqrstuvwxyz'.split('')];
  return (
    <div className="flex flex-wrap gap-1 justify-center mb-8">
      {letters.map((letter) => (
        <Button
          key={letter}
          variant={alpha === letter ? 'default' : 'outline'}
          size="sm"
          onClick={() => onAlphaChange(letter)}
          disabled={isLoading}
          className={`w-8 h-8 p-0 ${alpha === letter ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
        >
          {letter.toUpperCase()}
        </Button>
      ))}
    </div>
  );
};
export function CatalogueBrowser({ onItemClick }: { onItemClick: (id: number) => void }) {
  const [alpha, setAlpha] = useState('a');
  const [page, setPage] = useState(1);
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery<CategoryApiResponse>({
    queryKey: ['category', OSRS_SINGLE_CATEGORY_ID],
    queryFn: () => getCategory(OSRS_SINGLE_CATEGORY_ID),
  });
  const { data: itemsData, isLoading: isItemsLoading, error: itemsError } = useQuery<ItemsApiResponse>({
    queryKey: ['items', OSRS_SINGLE_CATEGORY_ID, alpha, page],
    queryFn: () => getItems(OSRS_SINGLE_CATEGORY_ID, alpha, page),
    enabled: !!categoryData,
  });
  const handleAlphaChange = (newAlpha: string) => {
    setAlpha(newAlpha);
    setPage(1);
  };
  const totalPages = itemsData ? Math.ceil(itemsData.total / 12) : 1;
  return (
    <div className="max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">Item Catalogue</h1>
      <p className="text-slate-400 mb-8">Browse items by selecting a letter below.</p>
      {isCategoryLoading ? (
        <div className="flex flex-wrap gap-1 justify-center mb-8">
          {Array.from({ length: 27 }).map((_, i) => <Skeleton key={i} className="w-8 h-8" />)}
        </div>
      ) : (
        <AlphaFilter alpha={alpha} onAlphaChange={handleAlphaChange} isLoading={isItemsLoading} />
      )}
      {itemsError && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Items</AlertTitle>
          <AlertDescription>{itemsError.message}</AlertDescription>
        </Alert>
      )}
      <ItemGrid items={itemsData?.items} isLoading={isItemsLoading} onItemClick={onItemClick} />
      {itemsData && itemsData.total > 12 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }} className={page === 1 ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
              <PaginationItem><PaginationLink isActive>{page}</PaginationLink></PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }} className={page === totalPages ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-center text-sm text-slate-400 mt-2">Page {page} of {totalPages}</p>
        </div>
      )}
    </div>
  );
}