import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/ge/AppLayout';
import { ItemGrid } from '@/components/ge/ItemGrid';
import { getCategory, getItems, OSRS_CATEGORIES, OSRS_SINGLE_CATEGORY_ID } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import type { ItemsApiResponse, CategoryApiResponse } from '@/types/osrs';
const AlphaFilter = ({ alpha, onAlphaChange, isLoading }) => {
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
export function CategoryPage() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentAlpha = searchParams.get('alpha') || 'a';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const parsedCategoryId = parseInt(categoryId || '1', 10);
  const category = OSRS_CATEGORIES.find(c => c.id === parsedCategoryId) || OSRS_CATEGORIES[0];
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery<CategoryApiResponse>({
    queryKey: ['category', OSRS_SINGLE_CATEGORY_ID],
    queryFn: () => getCategory(OSRS_SINGLE_CATEGORY_ID),
  });
  const { data: itemsData, isLoading: isItemsLoading, error: itemsError } = useQuery<ItemsApiResponse>({
    queryKey: ['items', OSRS_SINGLE_CATEGORY_ID, currentAlpha, currentPage],
    queryFn: () => getItems(OSRS_SINGLE_CATEGORY_ID, currentAlpha, currentPage),
    enabled: !!categoryData,
  });
  const handleAlphaChange = (alpha: string) => {
    setSearchParams({ alpha, page: '1' });
  };
  const handlePageChange = (page: number) => {
    setSearchParams({ alpha: currentAlpha, page: page.toString() });
  };
  const totalPages = itemsData ? Math.ceil(itemsData.total / 12) : 1;
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">{category.name}</h1>
        <p className="text-slate-400 mb-8">Browse items by selecting a letter below.</p>
        {isCategoryLoading ? (
          <div className="flex flex-wrap gap-1 justify-center mb-8">
            {Array.from({ length: 27 }).map((_, i) => <Skeleton key={i} className="w-8 h-8" />)}
          </div>
        ) : (
          <AlphaFilter alpha={currentAlpha} onAlphaChange={handleAlphaChange} isLoading={isItemsLoading} />
        )}
        {itemsError && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Items</AlertTitle>
            <AlertDescription>{itemsError.message}</AlertDescription>
          </Alert>
        )}
        <ItemGrid items={itemsData?.items} isLoading={isItemsLoading} />
        {itemsData && itemsData.total > 12 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>
                {/* Simplified pagination display */}
                <PaginationItem><PaginationLink isActive>{currentPage}</PaginationLink></PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-center text-sm text-slate-400 mt-2">Page {currentPage} of {totalPages}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}