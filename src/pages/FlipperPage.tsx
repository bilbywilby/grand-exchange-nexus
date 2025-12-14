import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/ge/AppLayout';
import { getFlipOpportunities } from '@/lib/api';
import type { FlipOpportunity } from '@/types/osrs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Download, Search, Terminal } from 'lucide-react';
const formatPrice = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}b`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}m`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toLocaleString();
};
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.02 },
    },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};
export function FlipperPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [minVolume, setMinVolume] = useState(100000);
    const [taxRate, setTaxRate] = useState(0.01);
    const [topN, setTopN] = useState(100);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['flipper', minVolume, taxRate, topN],
        queryFn: () => getFlipOpportunities(minVolume, taxRate, topN),
        refetchInterval: 60000,
        onSuccess: () => setLastUpdated(new Date()),
    });
    const filteredData = useMemo(() => {
        return data?.data.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ?? [];
    }, [data, searchTerm]);
    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['flipper'] });
    };
    const handleExportCSV = () => {
        const headers = ["ID", "Name", "Buy Price (gp)", "Sell Price (gp)", "Profit/Item (gp)", "Buy Limit", "24h Volume", "Potential Profit (gp)"];
        const rows = filteredData.map(item => [
            item.id,
            `"${item.name.replace(/"/g, '""')}"`,
            item.buy_price,
            item.sell_price,
            item.profit_per_item_gp,
            item.buy_limit,
            item.volume_24h,
            item.total_potential_profit_gp
        ].join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ge_flipper_opportunities.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="py-8 md:py-10 lg:py-12">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl font-bold tracking-tight text-yellow-400">GE Flipper</h1>
                        <p className="mt-2 text-lg text-slate-300">Discover high-profit flipping opportunities in the Grand Exchange.</p>
                    </motion.div>
                    <Card className="mt-8 bg-slate-900/70 border-slate-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Filters & Actions</CardTitle>
                            <CardDescription>Adjust parameters to refine your search for profitable flips.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div>
                                    <Label htmlFor="minVolume">Min 24h Volume</Label>
                                    <Input id="minVolume" type="number" value={minVolume} onChange={e => setMinVolume(Number(e.target.value))} className="bg-slate-800 border-slate-700" />
                                </div>
                                <div>
                                    <Label htmlFor="taxRate">GE Tax Rate</Label>
                                    <Input id="taxRate" type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} step="0.001" className="bg-slate-800 border-slate-700" />
                                </div>
                                <div>
                                    <Label htmlFor="topN">Top N Results</Label>
                                    <Input id="topN" type="number" value={topN} onChange={e => setTopN(Number(e.target.value))} className="bg-slate-800 border-slate-700" />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleRefresh} disabled={isFetching} className="w-full bg-blue-600 hover:bg-blue-700">
                                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                                        {isFetching ? 'Refreshing...' : 'Refresh'}
                                    </Button>
                                    <Button onClick={handleExportCSV} variant="outline" className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="mt-8 bg-slate-900/70 border-slate-800 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Top Opportunities</CardTitle>
                                    <CardDescription>
                                        Last updated: {lastUpdated.toLocaleTimeString()}
                                    </CardDescription>
                                </div>
                                <div className="relative w-full max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-slate-800 border-slate-700" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-800">
                                            <TableHead className="text-yellow-400">Name</TableHead>
                                            <TableHead className="text-right text-green-400">Buy Price</TableHead>
                                            <TableHead className="text-right text-red-400">Sell Price</TableHead>
                                            <TableHead className="text-right text-yellow-400">Profit / Item</TableHead>
                                            <TableHead className="text-right">Buy Limit</TableHead>
                                            <TableHead className="text-right">24h Volume</TableHead>
                                            <TableHead className="text-right font-bold text-yellow-300">Potential Profit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    {isLoading ? (
                                        <TableBody>
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <TableRow key={i} className="border-slate-800">
                                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    ) : error ? (
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300">
                                                        <Terminal className="h-4 w-4" />
                                                        <AlertTitle>Error Fetching Data</AlertTitle>
                                                        <AlertDescription>{error instanceof Error ? error.message : 'An unknown error occurred.'}</AlertDescription>
                                                    </Alert>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    ) : filteredData.length === 0 ? (
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-24 text-slate-400">
                                                    No profitable margins found with the current filters.
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    ) : (
                                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                                            {filteredData.map((item) => (
                                                <motion.tr
                                                    key={item.id}
                                                    variants={itemVariants}
                                                    className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                                                    onClick={() => navigate(`/item/${item.id}`)}
                                                >
                                                    <TableCell className="font-medium text-white">
                                                        <Link to={`/item/${item.id}`} className="hover:underline">{item.name}</Link>
                                                    </TableCell>
                                                    <TableCell className="text-right text-green-400">{formatPrice(item.buy_price)} gp</TableCell>
                                                    <TableCell className="text-right text-red-400">{formatPrice(item.sell_price)} gp</TableCell>
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
            </div>
        </AppLayout>
    );
}