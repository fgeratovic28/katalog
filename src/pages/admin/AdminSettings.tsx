import { useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminSettings() {
  const { getSetting, updateSetting } = useAdmin();
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const id = await getSetting('telegram_chat_id');
    if (id) setChatId(id);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatId.trim()) {
      toast.error("Molimo Vas unesite Telegram Chat ID.");
      return;
    }

    setSaving(true);
    const { error } = await updateSetting('telegram_chat_id', chatId);
    setSaving(false);
    
    if (error) {
      console.error(error);
      toast.error("Greška pri čuvanju podešavanja.");
    } else {
      toast.success("Podešavanja uspešno sačuvana.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Podešavanja</h1>
        <Button variant="outline" onClick={() => navigate("/admin")}>
          Nazad
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSave} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="chatId">Telegram Chat ID</Label>
            <Input
              id="chatId"
              placeholder="Unesite Telegram Chat ID"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              ID na koji će stizati obaveštenja o novim porudžbinama.
            </p>
          </div>

          <Button type="submit" disabled={saving || loading} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Čuvanje...
              </>
            ) : (
              "Sačuvaj"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
