import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
interface FlipperSettings {
  minVolume: number;
  taxRate: number;
  topN: number;
}
interface SettingsPanelProps {
  flipperSettings: FlipperSettings;
  herbloreBatch: number;
  onFlipperSettingsChange: (settings: FlipperSettings) => void;
  onHerbloreBatchChange: (batch: number) => void;
}
export function SettingsPanel({
  flipperSettings,
  herbloreBatch,
  onFlipperSettingsChange,
  onHerbloreBatchChange,
}: SettingsPanelProps) {
  const queryClient = useQueryClient();
  const [localFlipperSettings, setLocalFlipperSettings] = useState(flipperSettings);
  const [localHerbloreBatch, setLocalHerbloreBatch] = useState(herbloreBatch);
  const handleApply = () => {
    onFlipperSettingsChange(localFlipperSettings);
    onHerbloreBatchChange(localHerbloreBatch);
    queryClient.invalidateQueries({ queryKey: ['flipper'] });
    queryClient.invalidateQueries({ queryKey: ['herblore'] });
    toast.success('Settings applied and data refreshed!');
  };
  return (
    <div className="max-w-4xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold tracking-tight text-yellow-400">Settings</h1>
        <p className="mt-2 text-lg text-slate-300">Customize your Grand Exchange Nexus experience.</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle>Flipper Settings</CardTitle>
            <CardDescription>Adjust parameters for the item flipper tool.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="minVolume">Min 24h Volume</Label>
              <Input id="minVolume" type="number" value={localFlipperSettings.minVolume} onChange={e => setLocalFlipperSettings(s => ({ ...s, minVolume: Number(e.target.value) }))} className="bg-slate-800 border-slate-700" />
            </div>
            <div>
              <Label htmlFor="taxRate">GE Tax Rate</Label>
              <Input id="taxRate" type="number" value={localFlipperSettings.taxRate} onChange={e => setLocalFlipperSettings(s => ({ ...s, taxRate: Number(e.target.value) }))} step="0.001" className="bg-slate-800 border-slate-700" />
            </div>
            <div>
              <Label htmlFor="topN">Top N Results</Label>
              <Input id="topN" type="number" value={localFlipperSettings.topN} onChange={e => setLocalFlipperSettings(s => ({ ...s, topN: Number(e.target.value) }))} className="bg-slate-800 border-slate-700" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle>Herblore Settings</CardTitle>
            <CardDescription>Set the default batch size for profit calculations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="batchQty">Potion Batch Quantity</Label>
              <Input id="batchQty" type="number" value={localHerbloreBatch} onChange={e => setLocalHerbloreBatch(Math.max(0, Number(e.target.value)))} className="bg-slate-800 border-slate-700 mt-1" />
            </div>
            <Slider value={[localHerbloreBatch]} onValueChange={([val]) => setLocalHerbloreBatch(val)} max={10000} step={100} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={handleApply} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold">
          Apply & Refresh Data
        </Button>
      </div>
    </div>
  );
}