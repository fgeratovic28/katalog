 import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Eye, X, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
 import { Order } from "@/types";
 
 export default function AdminOrders() {
   const { orders, updateOrderStatus } = useAdmin();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sr-RS").format(price) + " RSD";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.ime_kupca.toLowerCase().includes(search.toLowerCase()) ||
      (o.order_code && o.order_code.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "Primljeno"
        ? o.status === "novo" || o.status === "Primljeno"
        : o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "novo":
      case "Primljeno":
        return "bg-blue-500/20 text-blue-400";
      case "U obradi":
        return "bg-yellow-500/20 text-yellow-400";
      case "poslato":
      case "Poslato":
        return "bg-purple-500/20 text-purple-400";
      case "Isporučeno":
        return "bg-emerald-500/20 text-emerald-400";
      case "otkazano":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "novo":
        return "Primljeno";
      case "Primljeno":
        return "Primljeno";
      case "U obradi":
        return "U obradi";
      case "poslato":
      case "Poslato":
        return "Poslato";
      case "Isporučeno":
        return "Isporučeno";
      case "otkazano":
        return "Otkazano";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold">Porudžbine</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pretraži po ID-u ili imenu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Order["status"] | "all")}
              className="w-full md:w-48 px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
            >
              <option value="all">Svi statusi</option>
              <option value="Primljeno">Primljeno</option>
              <option value="U obradi">U obradi</option>
              <option value="Poslato">Poslato</option>
              <option value="Isporučeno">Isporučeno</option>
              <option value="otkazano">Otkazano</option>
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Kupac</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Artikli</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Ukupno</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Datum</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Detalji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-sm">{order.order_code || order.id.slice(0, 8) + '...'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">
                          {order.ime_kupca}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.telefon_kupca}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {order.artikli.length} artikal(a)
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-primary">
                      {formatPrice(order.ukupna_cena)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status === 'novo' ? 'Primljeno' : order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value="Primljeno">Primljeno</option>
                        <option value="U obradi">U obradi</option>
                        <option value="Poslato">Poslato</option>
                        <option value="Isporučeno">Isporučeno</option>
                        <option value="otkazano">Otkazano</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nema porudžbina za prikaz.
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
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
                <h2 className="text-lg font-semibold">Porudžbina {selectedOrder.order_code || selectedOrder.id.slice(0, 8) + '...'}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Datum</span>
                    <span className="text-sm">{formatDate(selectedOrder.created_at)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Podaci o kupcu</h3>
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Ime:</span>{" "}
                      {selectedOrder.ime_kupca}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Adresa:</span>{" "}
                      {selectedOrder.adresa_kupca}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Grad:</span>{" "}
                      {selectedOrder.grad_kupca}, {selectedOrder.postanski_broj_kupca}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Telefon:</span>{" "}
                      {selectedOrder.telefon_kupca}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Artikli</h3>
                  <div className="space-y-3">
                    {selectedOrder.artikli.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-3 bg-secondary/50 rounded-lg"
                      >
                        <img
                          src={item.product.slike[0]}
                          alt={item.product.naziv}
                          className="w-16 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.naziv}</p>
                          <p className="text-xs text-muted-foreground">
                            Veličina: {item.size} | Količina: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-primary mt-1">
                            {formatPrice(item.product.cena * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Ukupno:</span>
                    <span className="text-primary">{formatPrice(selectedOrder.ukupna_cena)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
 }