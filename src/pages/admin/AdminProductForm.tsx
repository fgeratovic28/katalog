 import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Save, X, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { Product, Variant } from "@/types";
import imageCompression from 'browser-image-compression';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, uploadImage } = useAdmin();
  const { toast } = useToast();
  const isEditing = !!id;
  const [uploading, setUploading] = useState(false);

  // Derive unique categories from existing products
  const existingCategories = Array.from(new Set(products.map(p => p.kategorija))).filter(Boolean).sort();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    sizes: "",
    category: "",
    images: [] as string[],
    available: true,
    variants: [] as Variant[],
    isNew: false,
    isOnSale: false,
    oldPrice: "",
  });

  const [newVariant, setNewVariant] = useState({ name: "", price: "", oldPrice: "" });

  useEffect(() => {
    if (isEditing) {
      const product = products.find((p) => p.id === id);
      if (product) {
        setFormData({
          name: product.naziv,
          price: product.cena.toString(),
          description: product.opis,
          sizes: product.velicine.join(", "),
          category: product.kategorija,
          images: product.slike || [],
          available: product.dostupno,
          variants: product.varijante || [],
          isNew: product.is_new || false,
          isOnSale: product.is_on_sale || false,
          oldPrice: product.stara_cena ? product.stara_cena.toString() : "",
        });
      }
    }
  }, [id, isEditing, products]);

  const addVariant = () => {
    if (newVariant.name && newVariant.price) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { 
          name: newVariant.name, 
          price: parseFloat(newVariant.price),
          old_price: newVariant.oldPrice ? parseFloat(newVariant.oldPrice) : undefined
        }]
      }));
      setNewVariant({ name: "", price: "", oldPrice: "" });
    }
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      const newImages: string[] = [];
      
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        try {
          const compressedFile = await imageCompression(file, compressionOptions);
          const url = await uploadImage(compressedFile);
          if (url) {
            newImages.push(url);
          }
        } catch (error) {
          console.error("Compression failed:", error);
          // Fallback to original file if compression fails
          const url = await uploadImage(file);
          if (url) {
            newImages.push(url);
          }
        }
      }
      
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      toast({
        title: "Nedostaju podaci",
        description: "Molimo Vas unesite naziv proizvoda.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Nedostaju podaci",
        description: "Molimo Vas unesite kategoriju proizvoda.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Price validation: either price is set OR variants exist
    if ((!formData.price || isNaN(parseFloat(formData.price))) && formData.variants.length === 0) {
      toast({
        title: "Nedostaju podaci",
        description: "Molimo Vas unesite cenu ili dodajte varijante.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Determine price: user input > lowest variant price > 0
    let finalPrice = parseFloat(formData.price);
    if ((!finalPrice || isNaN(finalPrice)) && formData.variants.length > 0) {
        // Find lowest price among variants
        finalPrice = Math.min(...formData.variants.map(v => v.price));
    }
    
    const productData: Omit<Product, "id" | "created_at"> = {
      naziv: formData.name,
      cena: finalPrice || 0,
      opis: formData.description,
      velicine: formData.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      varijante: formData.variants,
      kategorija: formData.category,
      slike: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop"],
      dostupno: formData.available,
      is_new: formData.isNew,
      is_on_sale: formData.isOnSale,
      stara_cena: formData.isOnSale && formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
    };

    if (isEditing && id) {
      await updateProduct(id, productData);
    } else {
      await addProduct(productData);
    }

    navigate("/admin/products");
  };
 
   return (
     <div className="min-h-screen bg-background">
       <header className="bg-card border-b border-border sticky top-0 z-50">
         <div className="container mx-auto px-4">
           <div className="flex items-center justify-between h-16">
             <div className="flex items-center gap-4">
               <button
                 onClick={() => navigate("/admin/products")}
                 className="p-2 hover:bg-muted rounded-lg transition-colors"
               >
                 <ArrowLeft size={20} />
               </button>
               <h1 className="text-xl font-semibold">
                 {isEditing ? "Izmeni Proizvod" : "Novi Proizvod"}
               </h1>
             </div>
           </div>
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Naziv proizvoda</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Premium Leather Jacket"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cena (RSD)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={formData.variants.length > 0 ? "Opciono (koristi se cena varijante)" : "24990"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategorija</label>
                <input
                  type="text"
                  list="categories-list"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Jakne"
                />
                <datalist id="categories-list">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
             </div>
 
             <div className="space-y-2">
              <label className="text-sm font-medium">Opis</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Opis proizvoda..."
              />
            </div>

            {/* Variants Section */}
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Varijante (Opciono)</label>
                <span className="text-xs text-muted-foreground">Ako se unesu, zameniće fiksnu cenu</span>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Naziv (npr. 256GB)"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm bg-input border border-border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Cena"
                  value={newVariant.price}
                  onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                  className="w-24 px-3 py-2 text-sm bg-input border border-border rounded-lg"
                />
                 {formData.isOnSale && (
                  <input
                    type="number"
                    placeholder="Stara cena"
                    value={newVariant.oldPrice}
                    onChange={(e) => setNewVariant({ ...newVariant, oldPrice: e.target.value })}
                    className="w-24 px-3 py-2 text-sm bg-input border border-border rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={addVariant}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  <Plus size={18} />
                </button>
              </div>

              {formData.variants.length > 0 && (
                <div className="space-y-2">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center justify-between bg-card p-2 rounded border">
                      <span className="text-sm">
                        {variant.name} - {variant.price} RSD
                        {variant.old_price && (
                          <span className="ml-2 text-muted-foreground line-through text-xs">
                            {variant.old_price} RSD
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Veličine</label>
              <input
                type="text"
                 value={formData.sizes}
                 onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                 className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                 placeholder="S, M, L, XL"
               />
             </div>
 
             <div className="space-y-2">
              <label className="text-sm font-medium">Slike proizvoda</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className={`flex flex-col items-center justify-center aspect-square bg-secondary border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload size={24} className="mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground text-center px-2">
                    {uploading ? 'Uploading...' : 'Dodaj slike'}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Novo Switch */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isNew: !formData.isNew })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isNew ? "bg-black" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      formData.isNew ? "left-7" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium">Označi kao NOVO</span>
              </div>

              {/* Popust Switch */}
              <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isOnSale: !formData.isOnSale })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isOnSale ? "bg-red-500" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        formData.isOnSale ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium">Označi kao POPUST</span>
                </div>

                {/* Old Price Input */}
                {formData.isOnSale && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <label className="text-xs text-muted-foreground mb-1 block">Stara cena (pre popusta)</label>
                    <input
                      type="number"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="npr. 3000"
                    />
                  </motion.div>
                )}
              </div>
            </div>

             <div className="flex items-center gap-3">
               <button
                 type="button"
                 onClick={() => setFormData({ ...formData, available: !formData.available })}
                 className={`relative w-12 h-6 rounded-full transition-colors ${
                   formData.available ? "bg-emerald-500" : "bg-muted"
                 }`}
               >
                 <span
                   className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                     formData.available ? "left-7" : "left-1"
                   }`}
                 />
               </button>
               <span className="text-sm">Proizvod je dostupan</span>
             </div>
           </div>
 
           <div className="flex gap-4">
             <button
               type="button"
               onClick={() => navigate("/admin/products")}
               className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-muted transition-colors"
             >
               Otkaži
             </button>
             <motion.button
               type="submit"
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className="flex-1 py-3 gold-gradient rounded-lg font-semibold text-primary-foreground shadow-gold flex items-center justify-center gap-2"
             >
               <Save size={18} />
               Sačuvaj Proizvod
             </motion.button>
           </div>
         </form>
       </main>
     </div>
   );
 }