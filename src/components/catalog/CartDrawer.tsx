 import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAdmin } from "@/context/AdminContext";
import { CustomerInfo } from "@/types";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { addOrder } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sr-RS").format(price) + " RSD";
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const requiredFields = [
      { key: 'firstName', label: 'Ime' },
      { key: 'lastName', label: 'Prezime' },
      { key: 'email', label: 'E-mail adresa' },
      { key: 'address', label: 'Adresa' },
      { key: 'city', label: 'Grad' },
      { key: 'postalCode', label: 'Poštanski broj' },
      { key: 'phone', label: 'Broj telefona' },
    ];

    const missingFields = requiredFields.filter(field => !formData[field.key as keyof CustomerInfo]);

    if (missingFields.length > 0) {
      toast({
        title: "Nedostaju podaci",
        description: `Molimo Vas popunite obavezna polja: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    
    const orderData = {
      ime_kupca: `${formData.firstName} ${formData.lastName}`,
      email_kupca: formData.email,
      adresa_kupca: formData.address,
      grad_kupca: formData.city,
      postanski_broj_kupca: formData.postalCode,
      telefon_kupca: formData.phone,
      artikli: items,
      ukupna_cena: totalPrice,
      status: "Primljeno" as const,
    };

    const { data: orderResponse, error } = await addOrder(orderData);

    if (!error) {
      // 1. Send confirmation email
      const orderId = orderResponse?.[0]?.id || "N/A";
      const trackingLink = `${window.location.origin}/provera?id=${orderId}`;

      const emailParams = {
        id_porudzbine: orderId,
        link_za_proveru: trackingLink,
        ime_butika: "Katalog",
        lista_artikala_sa_velicinama_i_cenama: items.map(item => 
          `- ${item.product.naziv} (${item.variant ? item.variant.name : item.size}): ${item.quantity}x ${formatPrice(item.variant ? item.variant.price : item.product.cena)}`
        ).join('\n'),
        ukupna_cena: formatPrice(totalPrice),
        ime_kupca: `${formData.firstName} ${formData.lastName}`,
        adresa: formData.address,
        grad: formData.city,
        email_kupca: formData.email, // Promenjeno iz to_email u email_kupca da se poklapa sa template-om
      };

      console.log("Attempting to send email with params:", emailParams);
      console.log("Service ID:", import.meta.env.VITE_EMAIL_SERVICE_ID ? "Present" : "Missing");
      console.log("Template ID:", import.meta.env.VITE_EMAIL_TEMPLATE_ID ? "Present" : "Missing");
      console.log("Public Key:", import.meta.env.VITE_EMAIL_PUBLIC_KEY ? "Present" : "Missing");

      try {
        const response = await emailjs.send(
          import.meta.env.VITE_EMAIL_SERVICE_ID,
          import.meta.env.VITE_EMAIL_TEMPLATE_ID,
          emailParams,
          import.meta.env.VITE_EMAIL_PUBLIC_KEY
        );
        console.log("Email sent successfully!", response.status, response.text);
      } catch (emailError: any) {
        console.error("Failed to send email. Detailed error:", emailError);
        // Check if it's an object with text property (common in EmailJS)
        if (emailError.text) {
             console.error("EmailJS Error Text:", emailError.text);
        }
        
        toast({
          title: "Napomena: E-mail nije poslat",
          description: `Greška: ${emailError.text || emailError.message || "Nepoznata greška"}. Proverite konzolu za detalje.`,
          variant: "destructive",
          duration: 5000,
        });
      }

      // 2. Telegram notification via Edge Function
      try {
        const { error: funcError } = await supabase.functions.invoke('telegram-notification', {
          body: { order: { ...orderData, id: orderResponse?.[0]?.id } }
        });

        if (funcError) throw funcError;
      } catch (tgError) {
        console.error("Failed to send Telegram notification:", tgError);
      }

      setOrderComplete(true);
      clearCart();
      setIsSubmitting(false);
      
      // 3. Redirect to Success page
      navigate('/success');
      
      // Reset form (optional since we redirect, but good practice)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
      });
      setShowCheckout(false);
      setIsCartOpen(false);
      setOrderComplete(false); // Reset state
    } else {
      console.error("Error creating order:", error);
      setIsSubmitting(false);
      // Toast is handled in AdminContext
    }
  };
 
   return (
     <AnimatePresence>
       {isCartOpen && (
         <>
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setIsCartOpen(false)}
             className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
           />
           <motion.div
             initial={{ opacity: 0, x: "100%" }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: "100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 300 }}
             className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-card border-l border-border z-50 flex flex-col"
           >
             <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <ShoppingBag size={20} className="text-primary" />
                 <h2 className="text-lg font-semibold">
                   {showCheckout ? "Checkout" : "Korpa"}
                 </h2>
               </div>
               <button
                 onClick={() => setIsCartOpen(false)}
                 className="p-2 hover:bg-muted rounded-full transition-colors"
               >
                 <X size={20} />
               </button>
             </div>
 
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {orderComplete ? (
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex flex-col items-center justify-center h-full text-center space-y-4"
                 >
                   <CheckCircle size={64} className="text-success" />
                   <h3 className="text-2xl font-semibold">Hvala Vam!</h3>
                   <p className="text-muted-foreground">
                    Porudžbina je uspešno poslata! Prodavac će Vas kontaktirati uskoro.
                  </p>
                 </motion.div>
               ) : showCheckout ? (
                <form onSubmit={handleSubmitOrder} className="space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ime</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prezime</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-mail adresa <span className="text-destructive">*</span></label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="vasa@adresa.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adresa</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Grad</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Poštanski broj</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Broj telefona</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
 
                   <div className="pt-4 border-t border-border">
                     <div className="flex justify-between text-lg font-semibold mb-4">
                       <span>Ukupno:</span>
                       <span className="text-primary">{formatPrice(totalPrice)}</span>
                     </div>
                     <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className="w-full py-4 gold-gradient rounded-lg font-semibold text-primary-foreground shadow-gold disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 className="animate-spin" /> Obrađujemo...
                        </span>
                      ) : (
                        "POTVRDI PORUDŽBINU"
                      )}
                    </motion.button>
                   </div>
                 </form>
               ) : items.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                   <ShoppingBag size={48} className="text-muted-foreground" />
                   <p className="text-muted-foreground">Vaša korpa je prazna.</p>
                 </div>
               ) : (
                 items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 bg-secondary/50 rounded-lg border border-border"
                    >
                      <img
                        src={item.product.slike[0]}
                        alt={item.product.naziv}
                        className="w-20 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-sm">{item.product.naziv}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.variant ? "Varijanta: " : "Veličina: "}{item.size}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(item.variant ? item.variant.price : item.product.cena)}
                        </p>
                      <div className="flex items-center gap-2">
                         <button
                           onClick={() =>
                             updateQuantity(item.product.id, item.size, item.quantity - 1)
                           }
                           className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-border transition-colors"
                         >
                           <Minus size={14} />
                         </button>
                         <span className="text-sm w-6 text-center">{item.quantity}</span>
                         <button
                           onClick={() =>
                             updateQuantity(item.product.id, item.size, item.quantity + 1)
                           }
                           className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-border transition-colors"
                         >
                           <Plus size={14} />
                         </button>
                         <button
                           onClick={() => removeFromCart(item.product.id, item.size)}
                           className="ml-auto p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   </motion.div>
                 ))
               )}
             </div>
 
             {!orderComplete && items.length > 0 && !showCheckout && (
               <div className="border-t border-border p-4 space-y-4 bg-card">
                 <div className="flex justify-between text-lg font-semibold">
                   <span>Ukupno:</span>
                   <span className="text-primary">{formatPrice(totalPrice)}</span>
                 </div>
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => setShowCheckout(true)}
                   className="w-full py-4 gold-gradient rounded-lg font-semibold text-primary-foreground shadow-gold"
                 >
                   NASTAVI KA PLAĆANJU
                 </motion.button>
                 <button
                   onClick={() => setIsCartOpen(false)}
                   className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
                 >
                   Nastavi kupovinu
                 </button>
               </div>
             )}
 
             {showCheckout && !orderComplete && (
               <div className="border-t border-border p-4 bg-card">
                 <button
                   onClick={() => setShowCheckout(false)}
                   className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
                 >
                   ← Nazad na korpu
                 </button>
               </div>
             )}
           </motion.div>
         </>
       )}
     </AnimatePresence>
   );
 }