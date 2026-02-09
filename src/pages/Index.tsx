 import { Header } from "@/components/catalog/Header";
 import { ProductGrid } from "@/components/catalog/ProductGrid";
 import { CartDrawer } from "@/components/catalog/CartDrawer";
 import { Footer } from "@/components/catalog/Footer";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

const Index = () => {
   const { products } = useAdmin();
  
  // Filter only available products
  const availableProducts = products.filter(p => p.dostupno);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Nova Kolekcija"
        description="Otkrijte našu ekskluzivnu selekciju premium proizvoda. Kvalitet, stil i elegancija na jednom mestu."
        keywords="katalog, odeća, moda, nova kolekcija, premium"
      />
      <Header />
      <CartDrawer />

      <main className="pt-20 md:pt-24">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Nova</span>{" "}
              <span className="text-primary">Kolekcija</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Otkrijte našu ekskluzivnu selekciju premium proizvoda. Kvalitet, stil i elegancija na jednom mestu.
            </p>
          </motion.div>

          <ProductGrid products={availableProducts} />
        </section>
      </main>

      <Footer />
    </div>
  );
 };
 
 export default Index;
