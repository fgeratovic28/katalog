import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Search, Package, CheckCircle2, Clock, Truck, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

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

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setOrderId(idFromUrl);
      checkStatus(idFromUrl);
    }
  }, [searchParams]);

  const checkStatus = async (id: string) => {
    if (!id.trim()) return;
    
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const { data, error } = await supabase.rpc('get_order_status', { p_order_id: id });

      if (error) throw error;

      if (!data) {
        setError("Porudžbina sa ovim ID-jem nije pronađena.");
      } else {
        // Map legacy 'novo' to 'Primljeno'
        let currentStatus = data.status;
        if (currentStatus === 'novo') currentStatus = 'Primljeno';
        
        setStatus(currentStatus);
        setOrderDate(new Date(data.created_at).toLocaleDateString("sr-RS"));
      }
    } catch (err: any) {
      console.error("Error fetching status:", err);
      setError("Došlo je do greške prilikom provere statusa. Proverite ID i pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkStatus(orderId);
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
          <p className="text-muted-foreground">Unesite ID porudžbine koji ste dobili na e-mail</p>
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
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
