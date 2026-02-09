 import { ShoppingBag, PackageSearch } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex-1 flex justify-center md:justify-start">
             <Link to="/" className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                 <span className="text-primary-foreground font-bold text-lg">O</span>
               </div>
               <span className="text-xl md:text-2xl font-semibold tracking-wide">
                 <span className="text-primary">ORIGINAL</span>
                 <span className="text-foreground ml-1">STORE</span>
               </span>
             </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to="/provera" 
              className="p-2 hover-gold text-foreground/80 hover:text-foreground transition-colors"
              title="Prati porudžbinu"
            >
              <PackageSearch size={24} />
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover-gold"
            >
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 gold-gradient rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}