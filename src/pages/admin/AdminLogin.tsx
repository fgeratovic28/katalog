 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Lock, Mail, AlertCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError("");
   
   if (!email || !password) {
     toast({
       title: "Nedostaju podaci",
       description: "Molimo Vas unesite email i šifru.",
       variant: "destructive",
       duration: 3000,
     });
     return;
   }

   const { error } = await login(email, password);
    if (!error) {
      navigate("/admin");
    } else {
      setError("Pogrešan email ili šifra.");
    }
  };
 
   return (
     <div className="min-h-screen bg-background flex items-center justify-center p-4">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-md"
       >
         <div className="text-center mb-8">
           <div className="w-16 h-16 mx-auto rounded-full gold-gradient flex items-center justify-center mb-4">
             <Lock size={28} className="text-primary-foreground" />
           </div>
           <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
           <p className="text-muted-foreground mt-2">Prijavite se za pristup</p>
         </div>
 
         <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-sm text-destructive"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Šifra</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
 
           <motion.button
             type="submit"
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             className="w-full py-4 gold-gradient rounded-lg font-semibold text-primary-foreground shadow-gold"
           >
             PRIJAVI SE
           </motion.button>
         </form>
 
         <p className="text-center text-sm text-muted-foreground mt-6">
           <a href="/" className="hover-gold">← Nazad na prodavnicu</a>
         </p>
       </motion.div>
     </div>
   );
 }