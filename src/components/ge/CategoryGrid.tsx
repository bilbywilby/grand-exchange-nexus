import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
interface Category {
  id: number;
  name: string;
  icon: React.ElementType;
}
interface Props {
  categories: Category[];
  onCategoryClick?: () => void;
}
export function CategoryGrid({ categories, onCategoryClick }: Props) {
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
          <Button variant="ghost" className="block group h-full w-full p-0" onClick={onCategoryClick}>
            <Card className="bg-slate-900 border-slate-800 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 transform hover:-translate-y-1 w-full h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <category.icon className="h-8 w-8 text-yellow-400 mb-4 transition-transform group-hover:scale-110" />
                <h3 className="text-base font-semibold text-white">{category.name}</h3>
              </CardContent>
            </Card>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}