import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function Success() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO
        title="Uspešna Porudžbina"
        description="Vaša porudžbina je uspešno primljena. Hvala Vam na poverenju."
      />
      <motion.div  
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-6 shadow-lg"
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-success" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Uspešna porudžbina!</h1>
          <p className="text-muted-foreground">
            Hvala Vam na poverenju. Poslali smo Vam e-mail potvrdu sa detaljima porudžbine.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 gold-gradient rounded-lg font-semibold text-primary-foreground shadow-gold transition-transform hover:scale-105 active:scale-95"
          >
            <ShoppingBag size={18} />
            Nastavi kupovinu
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
