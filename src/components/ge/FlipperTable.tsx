import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getFlipOpportunities } from '@/lib/api';
import type { FlipOpportunity, FlipOpportunitiesResponse } from '@/types/osrs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Download, Search, Terminal, ArrowUpDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
type SortKey = 'name' | 'profit_per_item_gp' | 'buy_limit' | 'volume_24h' | 'total_potential_profit_gp';
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.02 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
export function FlipperTable({ settings, onItemClick }: { settings: { minVolume: number, taxRate: number, topN: number }, onItemClick: (id: number) => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'total_potential_profit_gp', dir: 'desc' });
    const queryClient = useQueryClient();
    const { data, isLoading, error, isFetching } = useQuery<FlipOpportunitiesResponse>({
        queryKey: ['flipper', settings],
        queryFn: () => getFlipOpportunities(settings.minVolume, settings.taxRate, settings.topN),
        refetchInterval: 60000,
    });
    useEffect(() => { if (data) setLastUpdated(new Date()); }, [data]);
    const sortedData = useMemo(() => {
        const filtered = data?.data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];
        return filtered.sort((a, b) => {
            const valA = a[sort.key];
            const valB = b[sort.key];
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sort.dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return sort.dir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
        });
    }, [data, searchTerm, sort]);
    const handleSort = (key: SortKey) => {
        setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
    };
    const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['flipper'] });
    const handleExportCSV = () => {
        const headers = ["ID", "Name", "Buy Price (gp)", "Sell Price (gp)", "Profit/Item (gp)", "Buy Limit", "24h Volume", "Potential Profit (gp)"];
        const rows = sortedData.map(item => [item.id, `"${item.name.replace(/"/g, '""')}"`, item.buy_price, item.sell_price, item.profit_per_item_gp, item.buy_limit, item.volume_24h, item.total_potential_profit_gp].join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'ge_flipper_opportunities.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const SortableHeader = ({ sortKey, children }: { sortKey: SortKey, children: React.ReactNode }) => (
        <TableHead onClick={() => handleSort(sortKey)} className="cursor-pointer hover:text-white">
            <div className="flex items-center justify-end">
                {children}
                {sort.key === sortKey && <ArrowUpDown className="ml-2 h-4 w-4" />}
            </div>
        </TableHead>
    );
    return (
        <div className="max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl font-bold tracking-tight text-yellow-400">GE Flipper</h1>
                <p className="mt-2 text-lg text-slate-300">Discover high-profit flipping opportunities in the Grand Exchange.</p>
            </motion.div>
            <Card className="mt-8 bg-slate-900/70 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Top Opportunities</CardTitle>
                            <CardDescription>Last updated: {lastUpdated.toLocaleTimeString()}</CardDescription>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-slate-800 border-slate-700" /></div>
                            <Button onClick={handleRefresh} disabled={isFetching} size="icon"><RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /></Button>
                            <Button onClick={handleExportCSV} variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-800">
                                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-white text-yellow-400"><div className="flex items-center">Name {sort.key === 'name' && <ArrowUpDown className="ml-2 h-4 w-4" />}</div></TableHead>
                                    <SortableHeader sortKey="profit_per_item_gp"><span className="text-yellow-400">Profit/Item</span></SortableHeader>
                                    <SortableHeader sortKey="buy_limit"><span className="text-slate-400">Buy Limit</span></SortableHeader>
                                    <SortableHeader sortKey="volume_24h"><span className="text-slate-400">24h Volume</span></SortableHeader>
                                    <SortableHeader sortKey="total_potential_profit_gp"><span className="font-bold text-yellow-300">Potential Profit</span></SortableHeader>
                                </TableRow>
                            </TableHeader>
                            {isLoading ? (
                                <TableBody>{Array.from({ length: 10 }).map((_, i) => (<TableRow key={i} className="border-slate-800"><TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell></TableRow>))}</TableBody>
                            ) : error ? (
                                <TableBody><TableRow><TableCell colSpan={5}><Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert></TableCell></TableRow></TableBody>
                            ) : sortedData.length === 0 ? (
                                <TableBody><TableRow><TableCell colSpan={5} className="text-center h-24 text-slate-400">No profitable margins found.</TableCell></TableRow></TableBody>
                            ) : (
                                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                                    {sortedData.map((item) => (
                                        <motion.tr key={item.id} variants={itemVariants} className="border-slate-800 hover:bg-slate-800/50 cursor-pointer" onClick={() => onItemClick(item.id)}>
                                            <TableCell className="font-medium text-white hover:text-yellow-300">{item.name}</TableCell>
                                            <TableCell className="text-right text-yellow-400">{formatPrice(item.profit_per_item_gp)} gp</TableCell>
                                            <TableCell className="text-right">{item.buy_limit.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">{item.volume_24h.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-bold text-yellow-300">{formatPrice(item.total_potential_profit_gp)} gp</TableCell>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            )}
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}