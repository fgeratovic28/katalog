 import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Product, Variant } from "@/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedSize("");
      setSelectedVariant(null);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const hasVariants = product.varijante && product.varijante.length > 0;
  const currentPrice = selectedVariant ? selectedVariant.price : product.cena;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sr-RS").format(price) + " RSD";
  };

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast({
        title: "Molimo izaberite varijantu",
        variant: "destructive",
      });
      return;
    }

    if (!hasVariants && product.velicine.length > 0 && !selectedSize) {
      // Auto-select first size if not selected (legacy behavior)
      const defaultSize = product.velicine[0];
      addToCart(product, defaultSize, quantity);
    } else if (hasVariants) {
       addToCart(product, selectedVariant!.name, quantity, selectedVariant!);
    } else {
       addToCart(product, selectedSize || "", quantity);
    }

    toast({
      title: "Proizvod dodat u korpu! ✅",
      duration: 2000,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[500px] bg-card border-l border-border z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold">Detalji Proizvoda</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted relative group">
                <Carousel className="w-full h-full">
                  <CarouselContent className="h-full">
                    {product.slike.map((img, index) => (
                      <CarouselItem key={index} className="h-full">
                        <img
                          src={img}
                          alt={`${product.naziv} - slika ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {product.slike.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </Carousel>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                    {product.kategorija}
                  </p>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {product.naziv}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {(product.is_on_sale && product.stara_cena && !selectedVariant) || 
                   (selectedVariant && selectedVariant.old_price) ? (
                    <>
                      <p className="text-lg text-muted-foreground line-through decoration-destructive/50">
                        {formatPrice(selectedVariant ? selectedVariant.old_price! : product.stara_cena!)}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatPrice(currentPrice)}
                      </p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(currentPrice)}
                    </p>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {product.opis}
                </p>

                {hasVariants ? (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Izaberite opciju</label>
                    <div className="flex flex-wrap gap-2">
                      {product.varijante!.map((variant) => (
                        <button
                          key={variant.name}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            selectedVariant?.name === variant.name
                              ? "gold-gradient text-primary-foreground shadow-gold"
                              : "bg-secondary text-secondary-foreground hover:bg-muted border border-border"
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  product.velicine.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Veličina</label>
                      <div className="flex flex-wrap gap-2">
                        {product.velicine.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                              selectedSize === size
                                ? "gold-gradient text-primary-foreground shadow-gold"
                                : "bg-secondary text-secondary-foreground hover:bg-muted border border-border"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}

                <div className="space-y-3">
                   <label className="text-sm font-medium">Količina</label>
                   <div className="flex items-center gap-4">
                     <button
                       onClick={() => setQuantity(Math.max(1, quantity - 1))}
                       className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                     >
                       <Minus size={18} />
                     </button>
                     <span className="text-lg font-medium w-8 text-center">
                       {quantity}
                     </span>
                     <button
                       onClick={() => setQuantity(quantity + 1)}
                       className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                     >
                       <Plus size={18} />
                     </button>
                   </div>
                 </div>
 
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={handleAddToCart}
                   disabled={!product.dostupno}
                   className="w-full py-4 gold-gradient rounded-lg font-semibold text-primary-foreground flex items-center justify-center gap-2 shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <ShoppingBag size={20} />
                   DODAJ U KORPU
                 </motion.button>
               </div>
             </div>
           </motion.div>
         </>
       )}
     </AnimatePresence>
   );
 }