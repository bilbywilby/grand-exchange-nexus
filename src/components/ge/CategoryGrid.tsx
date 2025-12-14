import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { OSRS_SINGLE_CATEGORY_ID } from '@/lib/api';
export function CategoryGrid({ categories }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
    >
      {categories.map((category) => (
        <motion.div key={category.id} variants={itemVariants}>
          <Link to={`/category/${OSRS_SINGLE_CATEGORY_ID}?alpha=a&page=1`} className="block group">
            <Card className="bg-slate-900 border-slate-800 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 transform hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <category.icon className="h-8 w-8 text-yellow-400 mb-4 transition-transform group-hover:scale-110" />
                <h3 className="text-base font-semibold text-white">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}