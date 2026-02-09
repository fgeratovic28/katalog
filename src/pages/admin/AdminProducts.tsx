 import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, ArrowLeft, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminProducts() {
  const { products, updateProduct, deleteProduct } = useAdmin();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const uniqueCategories = Array.from(new Set(products.map((p) => p.kategorija))).sort();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sr-RS").format(price) + " RSD";
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.naziv.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.kategorija === categoryFilter;
    const matchesAvailability =
      availabilityFilter === "all"
        ? true
        : availabilityFilter === "available"
        ? p.dostupno
        : !p.dostupno;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin")}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold">Upravljanje Proizvodima</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/products/new")}
              className="flex items-center gap-2 px-4 py-2 gold-gradient rounded-lg font-medium text-sm text-primary-foreground shadow-gold"
            >
              <Plus size={18} />
              Dodaj Proizvod
            </motion.button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pretraži proizvode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-40 px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
              >
                <option value="all">Sve kategorije</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full sm:w-40 px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
            >
              <option value="all">Svi statusi</option>
              <option value="available">Dostupno</option>
              <option value="unavailable">Nedostupno</option>
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Proizvod</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Kategorija</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Cena</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.slike[0]}
                          alt={product.naziv}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="font-medium text-sm line-clamp-1">{product.naziv}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {product.kategorija}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-primary">
                      {formatPrice(product.cena)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => updateProduct(product.id, { dostupno: !product.dostupno })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          product.dostupno ? "bg-emerald-500" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                            product.dostupno ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </td>
                     <td className="px-4 py-3">
                       <div className="flex items-center justify-end gap-2">
                         <button
                           onClick={() => navigate(`/admin/products/${product.id}`)}
                           className="p-2 hover:bg-muted rounded-lg transition-colors"
                         >
                           <Pencil size={16} />
                         </button>
                         <button
                          onClick={() => setProductToDelete(product.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nema proizvoda za prikaz.
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija se ne može poništiti. Ovo će trajno obrisati proizvod iz baze podataka.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}