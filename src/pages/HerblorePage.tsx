import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/ge/AppLayout';
import { getHerbloreProfits } from '@/lib/api';
import type { HerbProfitsResponse } from '@/types/osrs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Download, Search, Terminal, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
const formatPrice = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}b`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}m`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toLocaleString();
};
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};
export function HerblorePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [batchQuantity, setBatchQuantity] = useState(1000);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const queryClient = useQueryClient();
    const { data, isLoading, error, isFetching } = useQuery<HerbProfitsResponse>({
        queryKey: ['herblore'],
        queryFn: getHerbloreProfits,
        refetchInterval: 1000 * 60 * 5, // 5 minutes
    });
    useEffect(() => {
        if (data) setLastUpdated(new Date());
    }, [data]);
    const filteredData = useMemo(() => {
        return data?.data.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ?? [];
    }, [data, searchTerm]);
    const totals = useMemo(() => {
        if (!filteredData) return { totalCost: 0, totalSell: 0, totalProfit: 0 };
        return filteredData.reduce((acc, item) => {
            acc.totalCost += item.cost_per_potion * batchQuantity;
            acc.totalSell += item.sell_price_unf * batchQuantity;
            acc.totalProfit += item.profit_per_potion * batchQuantity;
            return acc;
        }, { totalCost: 0, totalSell: 0, totalProfit: 0 });
    }, [filteredData, batchQuantity]);
    const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['herblore'] });
    const handleExportCSV = () => {
        const headers = ["Herb", "Profit/Potion (gp)", "Cost/Potion (gp)", "Sell Price (UNF) (gp)"];
        const rows = filteredData.map(item => [
            `"${item.name.replace(/"/g, '""')}"`,
            item.profit_per_potion,
            item.cost_per_potion,
            item.sell_price_unf
        ].join(','));
        const totalsRow = [
            `"Totals for ${batchQuantity} potions"`,
            totals.totalProfit,
            totals.totalCost,
            totals.totalSell
        ].join(',');
        const csvContent = [headers.join(','), ...rows, '', 'Batch Totals', totalsRow].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ge_herblore_profits.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="py-8 md:py-10 lg:py-12">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl font-bold tracking-tight text-yellow-400">Herblore Profits</h1>
                        <p className="mt-2 text-lg text-slate-300">Calculate profits from cleaning grimy herbs and making unfinished potions.</p>
                    </motion.div>
                    <Alert className="mt-8 bg-blue-900/20 border-blue-500 text-blue-300">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Method Details</AlertTitle>
                        <AlertDescription>
                            This method requires the Desert Hard Diary or a Herblore Cape to have Zahur clean herbs for 200gp each. You must clean the first herb in your inventory yourself. Prices are fetched from the Grand Exchange.
                        </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                        <Card className="lg:col-span-2 bg-slate-900/70 border-slate-800 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <CardTitle>Profit/Loss per Herb</CardTitle>
                                        <CardDescription>Last updated: {lastUpdated.toLocaleTimeString()}</CardDescription>
                                    </div>
                                    <div className="relative w-full sm:w-auto sm:max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input placeholder="Search herb..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-slate-800 border-slate-700" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent border-slate-800">
                                                <TableHead className="text-yellow-400">Herb</TableHead>
                                                <TableHead className="text-right text-yellow-400">Profit / Potion</TableHead>
                                                <TableHead className="text-right text-red-400">Cost / Potion</TableHead>
                                                <TableHead className="text-right text-green-400">Sell Price (UNF)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        {isLoading ? (
                                            <TableBody>
                                                {Array.from({ length: 10 }).map((_, i) => (
                                                    <TableRow key={i} className="border-slate-800"><TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                                                ))}
                                            </TableBody>
                                        ) : error ? (
                                            <TableBody><TableRow><TableCell colSpan={4}><Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert></TableCell></TableRow></TableBody>
                                        ) : (
                                            <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                                                {filteredData.map((item) => (
                                                    <motion.tr key={item.name} variants={itemVariants} className="border-slate-800 hover:bg-slate-800/50">
                                                        <TableCell className="font-medium text-white"><Link to={`/item/${item.unf_id}`} className="hover:underline hover:text-yellow-300">{item.name}</Link></TableCell>
                                                        <TableCell className={cn("text-right font-semibold", item.profit_per_potion > 0 ? 'text-green-400' : 'text-red-400')}>{formatPrice(item.profit_per_potion)} gp</TableCell>
                                                        <TableCell className="text-right text-slate-400">{formatPrice(item.cost_per_potion)} gp</TableCell>
                                                        <TableCell className="text-right text-slate-400">{formatPrice(item.sell_price_unf)} gp</TableCell>
                                                    </motion.tr>
                                                ))}
                                            </motion.tbody>
                                        )}
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm">
                                <CardHeader><CardTitle>Batch Calculator</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="batchQty">Potion Quantity</Label>
                                        <Input id="batchQty" type="number" value={batchQuantity} onChange={e => setBatchQuantity(Math.max(0, Number(e.target.value)))} className="bg-slate-800 border-slate-700 mt-1" />
                                    </div>
                                    <Slider value={[batchQuantity]} onValueChange={([val]) => setBatchQuantity(val)} max={10000} step={100} />
                                    <div className="space-y-2 pt-4 text-sm">
                                        <div className="flex justify-between"><span>Total Cost:</span> <span className="font-mono text-red-400">{formatPrice(totals.totalCost)} gp</span></div>
                                        <div className="flex justify-between"><span>Total Revenue:</span> <span className="font-mono text-green-400">{formatPrice(totals.totalSell)} gp</span></div>
                                        <div className="flex justify-between font-bold text-base"><span>Total Profit:</span> <span className={cn("font-mono", totals.totalProfit > 0 ? 'text-green-300' : 'text-red-300')}>{formatPrice(totals.totalProfit)} gp</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm">
                                <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <Button onClick={handleRefresh} disabled={isFetching} className="w-full bg-blue-600 hover:bg-blue-700">
                                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                                        {isFetching ? 'Refreshing...' : 'Refresh Data'}
                                    </Button>
                                    <Button onClick={handleExportCSV} variant="outline" className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export as CSV
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}