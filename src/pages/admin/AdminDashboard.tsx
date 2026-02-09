 import { motion } from "framer-motion";
 import { Package, ShoppingCart, DollarSign, Plus, ClipboardList, LogOut, Settings } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import { useAdmin } from "@/context/AdminContext";
 
 export default function AdminDashboard() {
   const { products, orders, logout } = useAdmin();
  const navigate = useNavigate();

  const activeProducts = products.filter((p) => p.dostupno).length;
  const newOrders = orders.filter((o) => o.status === "novo" || o.status === "Primljeno").length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthRevenue = orders
    .filter(o => {
      const date = new Date(o.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, o) => sum + o.ukupna_cena, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sr-RS").format(price) + " RSD";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const stats = [
    {
      label: "Ukupno Porudžbina",
      value: orders.length,
      icon: ShoppingCart,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Zarada (Ovaj mesec)",
      value: formatPrice(currentMonthRevenue),
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Aktivni Proizvodi",
      value: activeProducts,
      icon: Package,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
  ];
 
   return (
     <div className="min-h-screen bg-background">
       <header className="bg-card border-b border-border sticky top-0 z-50">
         <div className="container mx-auto px-4">
           <div className="flex items-center justify-between h-16">
             <h1 className="text-xl font-semibold">
               <span className="text-primary">Admin</span> Panel
             </h1>
             <button
               onClick={handleLogout}
               className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
             >
               <LogOut size={18} />
               Odjavi se
             </button>
           </div>
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-8">
         <div className="mb-8">
           <h2 className="text-2xl font-bold text-foreground mb-2">Dobrodošli nazad!</h2>
           <p className="text-muted-foreground">Evo pregleda vaše prodavnice.</p>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           {stats.map((stat, index) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className="bg-card border border-border rounded-xl p-6"
             >
               <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                   <stat.icon className={stat.color} size={24} />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">{stat.label}</p>
                   <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
 
         <div className="mb-8">
           <h3 className="text-lg font-semibold text-foreground mb-4">Brze Akcije</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => navigate("/admin/products/new")}
               className="p-6 bg-card border border-border rounded-xl flex items-center gap-4 hover:border-primary/50 transition-colors group"
             >
               <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center">
                 <Plus size={24} className="text-primary-foreground" />
               </div>
               <div className="text-left">
                 <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                   Dodaj Novi Proizvod
                 </p>
                 <p className="text-sm text-muted-foreground">Kreiraj novu stavku u katalogu</p>
               </div>
             </motion.button>
 
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => navigate("/admin/orders")}
               className="p-6 bg-card border border-border rounded-xl flex items-center gap-4 hover:border-primary/50 transition-colors group relative"
             >
               <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                 <ClipboardList size={24} className="text-blue-400" />
               </div>
               <div className="text-left">
                 <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                   Pregledaj Porudžbine
                 </p>
                 <p className="text-sm text-muted-foreground">Upravljaj narudžbama kupaca</p>
               </div>
               {newOrders > 0 && (
                <span className="absolute top-4 right-4 px-2 py-1 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                  {newOrders} Primljeno
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/settings")}
              className="p-6 bg-card border border-border rounded-xl flex items-center gap-4 hover:border-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <Settings size={24} className="text-gray-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Podešavanja
                </p>
                <p className="text-sm text-muted-foreground">Konfiguracija obaveštenja</p>
              </div>
            </motion.button>
          </div>
        </div>
 
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-card border border-border rounded-xl p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-foreground">Poslednje Porudžbine</h3>
               <button
                 onClick={() => navigate("/admin/orders")}
                 className="text-sm text-primary hover:underline"
               >
                 Vidi sve
               </button>
             </div>
             <div className="space-y-3">
               {orders.slice(0, 3).map((order) => (
                 <div
                   key={order.id}
                   className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                 >
                   <div>
                     <p className="font-medium text-sm">{order.id}</p>
                     <p className="text-xs text-muted-foreground">
                      {order.ime_kupca}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-primary">
                      {formatPrice(order.ukupna_cena)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === "novo" || order.status === "Primljeno"
                          ? "bg-blue-500/20 text-blue-400"
                          : order.status === "U obradi"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : order.status === "poslato" || order.status === "Poslato"
                          ? "bg-purple-500/20 text-purple-400"
                          : order.status === "Isporučeno"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : order.status === "otkazano"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {order.status === "novo" ? "Primljeno" : order.status}
                    </span>
                   </div>
                 </div>
               ))}
             </div>
           </div>
 
           <div className="bg-card border border-border rounded-xl p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-foreground">Proizvodi</h3>
               <button
                 onClick={() => navigate("/admin/products")}
                 className="text-sm text-primary hover:underline"
               >
                 Vidi sve
               </button>
             </div>
             <div className="space-y-3">
               {products.slice(0, 3).map((product) => (
                 <div
                   key={product.id}
                   className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                >
                  <img
                    src={product.slike[0]}
                    alt={product.naziv}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{product.naziv}</p>
                    <p className="text-xs text-muted-foreground">{product.kategorija}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-primary">
                      {formatPrice(product.cena)}
                    </p>
                    <span
                      className={`text-xs ${
                        product.dostupno ? "text-emerald-400" : "text-muted-foreground"
                      }`}
                    >
                      {product.dostupno ? "Dostupno" : "Nedostupno"}
                    </span>
                  </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </main>
     </div>
   );
 }