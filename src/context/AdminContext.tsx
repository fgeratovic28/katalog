import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, Order } from "@/types";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface AdminContextType {
  user: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  products: Product[];
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "created_at">) => Promise<{ error: any }>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<{ error: any }>;
  deleteProduct: (id: string) => Promise<{ error: any }>;
  uploadImage: (file: File) => Promise<string | null>;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, "id" | "created_at">) => Promise<{ data?: any; error: any }>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<{ error: any }>;
  getSetting: (key: string) => Promise<string | null>;
  updateSetting: (key: string, value: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize Auth and Fetch Data
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session);
      if (session) {
        fetchOrders();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session);
      if (session) {
        fetchOrders();
      } else {
        setOrders([]);
      }
    });

    // Initial fetch of products (public)
    fetchProducts();
    setLoading(false);

    return () => subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('proizvodi')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Greška",
        description: "Neuspešno učitavanje proizvoda.",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('porudzbine')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Greška",
        description: "Neuspešno učitavanje porudžbina.",
        variant: "destructive",
      });
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const addProduct = async (product: Omit<Product, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from('proizvodi').insert([product]);
      if (error) throw error;
      
      await fetchProducts();
      return { error: null };
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Greška",
        description: "Neuspešno dodavanje proizvoda.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('proizvodi')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;

      await fetchProducts();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Greška",
        description: "Neuspešno ažuriranje proizvoda.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('proizvodi').delete().eq('id', id);
      if (error) throw error;

      await fetchProducts();
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Greška",
        description: "Neuspešno brisanje proizvoda.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Greška",
        description: "Neuspešno otpremanje slike.",
        variant: "destructive",
      });
      return null;
    }
  };

  const addOrder = async (order: Omit<Order, "id" | "created_at">) => {
    try {
      // Use RPC to bypass RLS and return the created order
      // First try with email (if schema is updated)
      let { data, error } = await supabase.rpc('create_new_order', {
        p_ime_kupca: order.ime_kupca,
        p_email_kupca: order.email_kupca,
        p_adresa_kupca: order.adresa_kupca,
        p_grad_kupca: order.grad_kupca,
        p_postanski_broj_kupca: order.postanski_broj_kupca,
        p_telefon_kupca: order.telefon_kupca,
        p_artikli: order.artikli,
        p_ukupna_cena: order.ukupna_cena
      });

      // If failed, try without email (legacy schema compatibility)
      if (error) {
         console.warn("RPC failed with email, retrying without email param...", error);
         const { data: retryData, error: retryError } = await supabase.rpc('create_new_order', {
            p_ime_kupca: order.ime_kupca,
            // p_email_kupca omitted
            p_adresa_kupca: order.adresa_kupca,
            p_grad_kupca: order.grad_kupca,
            p_postanski_broj_kupca: order.postanski_broj_kupca,
            p_telefon_kupca: order.telefon_kupca,
            p_artikli: order.artikli,
            p_ukupna_cena: order.ukupna_cena
         });
         
         if (!retryError) {
             data = retryData;
             error = null;
         } else {
             // If legacy RPC also fails, keep the original error or try insert
             console.error("RPC retry also failed:", retryError);
         }
      }

      if (error) {
         console.error("RPC create_new_order failed, falling back to insert:", error);
         // Fallback to direct insert if RPC fails
         // Note: We remove email_kupca from insert if the column doesn't exist, but we can't know for sure.
         // We'll try inserting with email first.
         const { data: insertData, error: insertError } = await supabase.from('porudzbine').insert([order]).select();
         
         if (insertError) {
             // If insert with email fails, try without email
             console.warn("Insert with email failed, retrying without email...", insertError);
             const orderWithoutEmail = { ...order };
             delete (orderWithoutEmail as any).email_kupca;
             
             const { data: insertRetry, error: insertRetryError } = await supabase.from('porudzbine').insert([orderWithoutEmail]).select();
             if (insertRetryError) throw insertRetryError;
             return { data: insertRetry, error: null };
         }
         return { data: insertData, error: null };
      }
      
      // Wrap single object in array to match expected return type
      return { data: data ? [data] : null, error: null };
    } catch (error: any) {
       console.error("Error creating order:", error);
       toast({
         title: "Greška",
         description: "Neuspešno kreiranje porudžbine.",
         variant: "destructive",
       });
       return { data: null, error };
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      const { error } = await supabase
        .from('porudzbine')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;

      await fetchOrders();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Greška",
        description: "Neuspešna promena statusa porudžbine.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const getSetting = async (key: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error) throw error;
      return data?.value || null;
    } catch (error: any) {
      console.error('Error fetching setting:', error);
      // Optional: Don't show toast for getSetting as it might be internal/frequent
      return null;
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key, value });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: "Greška",
        description: "Neuspešno ažuriranje podešavanja.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        products,
        refreshProducts: fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        uploadImage,
        orders,
        refreshOrders: fetchOrders,
        addOrder,
        updateOrderStatus,
        getSetting,
        updateSetting,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
