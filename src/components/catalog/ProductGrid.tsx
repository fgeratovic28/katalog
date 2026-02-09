 import { useState, useMemo } from "react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Sve");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const unique = new Set(products.map(p => p.kategorija));
    return ["Sve", ...Array.from(unique)].filter(Boolean);
  }, [products]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "Sve" || p.kategorija === selectedCategory;
    const matchesSearch = p.naziv.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.opis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="mb-6 md:mb-8 space-y-4">
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Pretraži proizvode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {categories.map((category) => (
             <motion.button
               key={category}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setSelectedCategory(category)}
               className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                 selectedCategory === category
                   ? "gold-gradient text-primary-foreground shadow-gold"
                   : "bg-secondary text-secondary-foreground hover:bg-muted"
               }`}
             >
               {category}
             </motion.button>
           ))}
         </div>
       </div>
 
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
         {filteredProducts.map((product, index) => (
           <motion.div
             key={product.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: index * 0.05 }}
           >
             <ProductCard
              product={product}
              onClick={() => setSelectedProduct(product)}
              priority={index < 6}
            />
           </motion.div>
         ))}
       </div>
 
       {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery 
              ? "Nema proizvoda koji odgovaraju vašoj pretrazi."
              : "Nema proizvoda u ovoj kategoriji."}
          </p>
        </div>
      )}
 
       <ProductModal
         product={selectedProduct}
         isOpen={!!selectedProduct}
         onClose={() => setSelectedProduct(null)}
       />
     </>
   );
 }