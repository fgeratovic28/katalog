import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Search, Package, Clock, Truck, Home, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: "Primljeno", label: "Primljeno", icon: Package, description: "Porudžbina je primljena" },
  { id: "U obradi", label: "U obradi", icon: Clock, description: "Pakujemo vašu porudžbinu" },
  { id: "Poslato", label: "Poslato", icon: Truck, description: "Kurir je preuzeo paket" },
  { id: "Isporučeno", label: "Isporučeno", icon: Home, description: "Uspešno uručeno" },
];

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDate, setOrderDate] = useState<string | null>(null);
  
  // Edit State
  const [canEdit, setCanEdit] = useState(false);
  const [editToken, setEditToken] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    ime_kupca: "",
    email_kupca: "",
    adresa_kupca: "",
    grad_kupca: "",
    postanski_broj_kupca: "",
    telefon_kupca: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    const tokenFromUrl = searchParams.get("token");
    
    if (tokenFromUrl) {
      setEditToken(tokenFromUrl);
      checkStatus(tokenFromUrl, tokenFromUrl);
    } else if (idFromUrl) {
      setOrderId(idFromUrl);
      checkStatus(idFromUrl);
    }
  }, [searchParams]);

  const checkStatus = async (query: string, token?: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setStatus(null);
    setCanEdit(false);

    try {
      const { data, error } = await supabase.rpc('get_order_status', { 
        p_query: query,
        p_token: token || null
      });

      if (error) throw error;

      if (!data) {
        setError("Porudžbina nije pronađena.");
      } else {
        // Map legacy 'novo' to 'Primljeno'
        let currentStatus = data.status;
        if (currentStatus === 'novo') currentStatus = 'Primljeno';
        
        setStatus(currentStatus);
        setOrderDate(new Date(data.created_at).toLocaleDateString("sr-RS"));
        setOrderData(data);
        
        // Update input field with found order code if it wasn't typed
        if (data.order_code) {
           setOrderId(data.order_code);
        }

        if (data.can_edit) {
          setCanEdit(true);
          // Pre-fill form
          setEditFormData({
            ime_kupca: data.ime_kupca || "",
            email_kupca: data.email_kupca || "",
            adresa_kupca: data.adresa_kupca || "",
            grad_kupca: data.grad_kupca || "",
            postanski_broj_kupca: data.postanski_broj_kupca || "",
            telefon_kupca: data.telefon_kupca || ""
          });
          // Also set edit token if we looked up by it, to ensure we have it for updates
          if (token) setEditToken(token);
        }
      }
    } catch (err: any) {
      console.error("Error fetching status:", err);
      setError("Došlo je do greške prilikom provere statusa. Proverite ID/Link i pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset token when searching manually by ID
    setEditToken(null);
    checkStatus(orderId);
  };

  const handleUpdateOrder = async () => {
    if (!orderData?.id || !editToken) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.rpc('update_order_details', {
        p_order_id: orderData.id,
        p_token: editToken,
        p_ime_kupca: editFormData.ime_kupca,
        p_email_kupca: editFormData.email_kupca,
        p_adresa_kupca: editFormData.adresa_kupca,
        p_grad_kupca: editFormData.grad_kupca,
        p_postanski_broj_kupca: editFormData.postanski_broj_kupca,
        p_telefon_kupca: editFormData.telefon_kupca
      });

      if (error) throw error;

      toast({
        title: "Uspešno izmenjeno!",
        description: "Podaci o porudžbini su ažurirani.",
      });
      
      setIsDialogOpen(false);
      // Refresh data
      checkStatus(orderData.order_code || orderData.id, editToken);

    } catch (err: any) {
      console.error("Update error:", err);
      toast({
        title: "Greška",
        description: err.message || "Došlo je do greške prilikom izmene podataka.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!status) return -1;
    // Map status to index
    const index = STEPS.findIndex(s => s.id === status);
    // Fallback for unexpected statuses
    if (index === -1) {
        if (status === 'novo') return 0;
        return 0; 
    }
    return index;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <SEO
        title="Praćenje Porudžbine"
        description="Pratite status vaše porudžbine u realnom vremenu. Unesite ID porudžbine i saznajte gde se nalazi vaš paket."
        keywords="praćenje porudžbine, status paketa, dostava, katalog"
      />
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Pratite vašu porudžbinu</h1>
          <p className="text-muted-foreground">Unesite kod porudžbine koji ste dobili na e-mail</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pretraga</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Unesite ID porudžbine (npr. 123e4567...)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Proveravam..." : "Proveri"}
              </Button>
            </form>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm"
              >
                {error}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Status Porudžbine</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Datum: {orderDate}
                  </span>
                </div>
                <CardDescription>
                  Vaša porudžbina je trenutno u fazi: <span className="font-semibold text-primary">{status}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="py-8">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-secondary -translate-y-1/2 z-0 hidden md:block" />
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 hidden md:block"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                  />

                  <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                    {STEPS.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2">
                          <div 
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                              ${isCompleted 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "bg-background border-muted text-muted-foreground"
                              }
                              ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}
                            `}
                          >
                            {isCompleted ? (
                              <Icon size={20} />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                            )}
                          </div>
                          
                          <div className="md:text-center">
                            <p className={`font-medium text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground hidden md:block mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
              {canEdit && (
                <CardFooter className="flex justify-center border-t pt-6">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Izmeni podatke o isporuci
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Izmena podataka</DialogTitle>
                        <DialogDescription>
                          Možete izmeniti podatke sve dok je porudžbina u statusu "Primljeno".
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Ime i prezime</Label>
                          <Input
                            id="name"
                            value={editFormData.ime_kupca}
                            onChange={(e) => setEditFormData({ ...editFormData, ime_kupca: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editFormData.email_kupca}
                            onChange={(e) => setEditFormData({ ...editFormData, email_kupca: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Telefon</Label>
                          <Input
                            id="phone"
                            value={editFormData.telefon_kupca}
                            onChange={(e) => setEditFormData({ ...editFormData, telefon_kupca: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="address">Adresa</Label>
                          <Input
                            id="address"
                            value={editFormData.adresa_kupca}
                            onChange={(e) => setEditFormData({ ...editFormData, adresa_kupca: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="city">Grad</Label>
                            <Input
                              id="city"
                              value={editFormData.grad_kupca}
                              onChange={(e) => setEditFormData({ ...editFormData, grad_kupca: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="zip">Poštanski broj</Label>
                            <Input
                              id="zip"
                              value={editFormData.postanski_broj_kupca}
                              onChange={(e) => setEditFormData({ ...editFormData, postanski_broj_kupca: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleUpdateOrder} disabled={isUpdating}>
                          {isUpdating && <Clock className="mr-2 h-4 w-4 animate-spin" />}
                          Sačuvaj izmene
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
