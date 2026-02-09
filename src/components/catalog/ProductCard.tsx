 import { motion } from "framer-motion";
 import { Product } from "@/types";
 import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  priority?: boolean;
}

export function ProductCard({ product, onClick, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
     return new Intl.NumberFormat("sr-RS").format(price) + " RSD";
   };
 
   const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.varijante && product.varijante.length > 0) {
        onClick(); // Open modal if variants exist
        return;
    }
    
    // Legacy behavior for products without variants
    if (product.velicine && product.velicine.length > 0) {
        addToCart(product, product.velicine[0]);
        toast({
          title: "Proizvod dodat u korpu! ✅",
          duration: 2000,
        });
    } else {
        // No sizes/variants, just add product
        addToCart(product, "");
        toast({
          title: "Proizvod dodat u korpu! ✅",
          duration: 2000,
        });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-lg bg-card border border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-gold">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={product.slike[0]}
            alt={product.naziv}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {!product.dostupno && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-muted-foreground font-medium tracking-wider">
                RASPRODATO
              </span>
            </div>
          )}
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.is_on_sale && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                {product.stara_cena && product.stara_cena > product.cena
                  ? `-${Math.round(((product.stara_cena - product.cena) / product.stara_cena) * 100)}%`
                  : "AKCIJA"}
              </span>
            )}
          </div>
          
          <div className="absolute top-3 right-3 z-10">
             {product.is_new && (
              <span className="bg-black/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider backdrop-blur-sm">
                NOVO
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {product.kategorija}
            </p>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {product.naziv}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {product.is_on_sale && product.stara_cena ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                    {formatPrice(product.stara_cena)}
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(product.cena)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {formatPrice(product.cena)}
                </span>
              )}
            </div>
          </div>

          {product.dostupno && (
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handleAddToCart}
               className="w-full py-2.5 px-4 gold-gradient rounded-md font-medium text-sm text-primary-foreground flex items-center justify-center gap-2 transition-all hover:shadow-gold"
             >
               <ShoppingBag size={16} />
               {product.varijante && product.varijante.length > 0 ? "IZABERI" : "DODAJ U KORPU"}
            </motion.button>
           )}
         </div>
       </div>
     </motion.div>
   );
 }