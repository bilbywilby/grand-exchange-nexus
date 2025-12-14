import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getRunecraftingProfits } from '@/lib/api';
import type { SkillProfitsResponse } from '@/types/osrs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Download, Search, Terminal, Info, ArrowUpDown } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
type SortKey = 'name' | 'profitPer' | 'gpPerHr' | 'costPer' | 'revenuePer' | 'limit';
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.02 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
export function RunecraftingTable({ batchQuantity, onItemClick }: { batchQuantity: number, onItemClick: (id: number) => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'gpPerHr', dir: 'desc' });
    const queryClient = useQueryClient();
    const { data, isLoading, error, isFetching } = useQuery<SkillProfitsResponse>({
        queryKey: ['runecrafting'],
        queryFn: getRunecraftingProfits,
        refetchInterval: 1000 * 60 * 5,
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
    const totals = useMemo(() => {
        if (!sortedData) return { totalCost: 0, totalRevenue: 0, totalProfit: 0 };
        return sortedData.reduce((acc, item) => {
            acc.totalCost += item.costPer * batchQuantity;
            acc.totalRevenue += item.revenuePer * batchQuantity;
            acc.totalProfit += item.profitPer * batchQuantity;
            return acc;
        }, { totalCost: 0, totalRevenue: 0, totalProfit: 0 });
    }, [sortedData, batchQuantity]);
    const handleSort = (key: SortKey) => {
        setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
    };
    const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['runecrafting'] });
    const handleExportCSV = () => {
        const headers = ["Recipe", "Profit/Item (gp)", "GP/Hr (est)", "Cost/Item (gp)", "Revenue/Item (gp)", "Buy Limit", "Notes"];
        const rows = sortedData.map(item => [`"${item.name.replace(/"/g, '""')}"`, item.profitPer, item.gpPerHr, item.costPer, item.revenuePer, item.limit, `"${item.notes}"`].join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'ge_runecrafting_profits.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const SortableHeader = ({ sortKey, children, className = '' }: { sortKey: SortKey, children: React.ReactNode, className?: string }) => (
        <TableHead onClick={() => handleSort(sortKey)} className={cn("cursor-pointer hover:text-white", className)}>
            <div className="flex items-center justify-end">
                {children}
                {sort.key === sortKey && <ArrowUpDown className="ml-2 h-4 w-4" />}
            </div>
        </TableHead>
    );
    return (
        <div className="max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl font-bold tracking-tight text-yellow-400">Runecrafting Profits</h1>
                <p className="mt-2 text-lg text-slate-300">Find the most profitable runes to craft.</p>
            </motion.div>
            <Alert className="mt-8 bg-blue-900/20 border-blue-500 text-blue-300">
                <Info className="h-4 w-4" /><AlertTitle>Method Details</AlertTitle>
                <AlertDescription>GP/hr estimates assume use of pouches and the Abyss. Stamina potions are recommended.</AlertDescription>
            </Alert>
            <Card className="mt-8 bg-slate-900/70 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div><CardTitle>Profit/Loss per Essence</CardTitle><CardDescription>Last updated: {lastUpdated.toLocaleTimeString()}</CardDescription></div>
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
                            <TableHeader><TableRow className="hover:bg-transparent border-slate-800">
                                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-white text-yellow-400"><div className="flex items-center">Rune {sort.key === 'name' && <ArrowUpDown className="ml-2 h-4 w-4" />}</div></TableHead>
                                <SortableHeader sortKey="profitPer"><span className="text-yellow-400">Profit/Essence</span></SortableHeader>
                                <SortableHeader sortKey="gpPerHr" className="font-bold text-yellow-300">GP/Hr (est)</SortableHeader>
                                <SortableHeader sortKey="costPer"><span className="text-red-400">Cost</span></SortableHeader>
                                <SortableHeader sortKey="revenuePer"><span className="text-green-400">Revenue</span></SortableHeader>
                                <SortableHeader sortKey="limit"><span className="text-slate-400">Limit</span></SortableHeader>
                            </TableRow></TableHeader>
                            {isLoading ? (
                                <TableBody>{Array.from({ length: 5 }).map((_, i) => (<TableRow key={i} className="border-slate-800"><TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell></TableRow>))}</TableBody>
                            ) : error ? (
                                <TableBody><TableRow><TableCell colSpan={6}><Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert></TableCell></TableRow></TableBody>
                            ) : (
                                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                                    {sortedData.map((item) => (
                                        <motion.tr key={item.name} variants={itemVariants} className="border-slate-800 hover:bg-slate-800/50 cursor-pointer" onClick={() => onItemClick(item.productId)}>
                                            <TableCell className="font-medium text-white hover:text-yellow-300">{item.name}<p className="text-xs text-slate-400">{item.notes}</p></TableCell>
                                            <TableCell className={cn("text-right font-semibold", item.profitPer > 0 ? 'text-green-400' : 'text-red-400')}>{formatPrice(item.profitPer)} gp</TableCell>
                                            <TableCell className="text-right font-bold text-yellow-300">{formatPrice(item.gpPerHr)} gp</TableCell>
                                            <TableCell className="text-right text-slate-400">{formatPrice(item.costPer)} gp</TableCell>
                                            <TableCell className="text-right text-slate-400">{formatPrice(item.revenuePer)} gp</TableCell>
                                            <TableCell className="text-right text-slate-400">{item.limit.toLocaleString()}</TableCell>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            )}
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-6 bg-slate-900/70 border-slate-800 backdrop-blur-sm">
                <CardHeader><CardTitle>Batch Totals (for {batchQuantity.toLocaleString()} actions)</CardTitle></CardHeader>
                <CardContent className="space-y-2 pt-4 text-sm">
                    <div className="flex justify-between"><span>Total Cost:</span> <span className="font-mono text-red-400">{formatPrice(totals.totalCost)} gp</span></div>
                    <div className="flex justify-between"><span>Total Revenue:</span> <span className="font-mono text-green-400">{formatPrice(totals.totalRevenue)} gp</span></div>
                    <div className="flex justify-between font-bold text-base"><span>Total Profit:</span> <span className={cn("font-mono", totals.totalProfit > 0 ? 'text-green-300' : 'text-red-300')}>{formatPrice(totals.totalProfit)} gp</span></div>
                </CardContent>
            </Card>
        </div>
    );
}