import { CategoryGrid } from '@/components/ge/CategoryGrid';
import { OSRS_CATEGORIES } from '@/lib/api';
import { motion } from 'framer-motion';
export function DashboardContent({ onCategoryClick }: { onCategoryClick: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-yellow-400 sm:text-6xl">
            Grand Exchange Nexus
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            A premium, visually immersive interface for the Old School RuneScape Grand Exchange.
          </p>
        </motion.div>
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Browse Categories</h2>
          <CategoryGrid categories={OSRS_CATEGORIES} onCategoryClick={onCategoryClick} />
        </div>
        <footer className="text-center text-slate-500 mt-24">
          <p>Built with ❤️ at Cloudflare</p>
        </footer>
      </div>
    </div>
  );
}