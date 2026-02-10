 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import CookieConsent from "@/components/CookieConsent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
 import { CartProvider } from "@/context/CartContext";
 import { AdminProvider, useAdmin } from "@/context/AdminContext";
 import Index from "./pages/Index";
 import NotFound from "./pages/NotFound";
 import AdminLogin from "./pages/admin/AdminLogin";
 import AdminDashboard from "./pages/admin/AdminDashboard";
 import AdminProducts from "./pages/admin/AdminProducts";
 import AdminProductForm from "./pages/admin/AdminProductForm";
 import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import Success from "./pages/Success";
import OrderTracking from "./pages/OrderTracking";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();
 
 function ProtectedRoute({ children }: { children: React.ReactNode }) {
   const { isAuthenticated } = useAdmin();
   
   if (!isAuthenticated) {
     return <Navigate to="/admin/login" replace />;
   }
   
   return <>{children}</>;
 }
 
 const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
     <TooltipProvider>
       <AdminProvider>
         <CartProvider>
           <Toaster />
           <Sonner />
          <CookieConsent />
          <BrowserRouter>
             <Routes>
               <Route path="/" element={<Index />} />
              <Route path="/success" element={<Success />} />
              <Route path="/provera" element={<OrderTracking />} />
              <Route path="/uslovi-koriscenja" element={<TermsOfService />} />
              <Route path="/politika-privatnosti" element={<PrivacyPolicy />} />
              
              {/* Admin Routes */}
               <Route path="/admin/login" element={<AdminLogin />} />
               <Route
                 path="/admin"
                 element={
                   <ProtectedRoute>
                     <AdminDashboard />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/admin/products"
                 element={
                   <ProtectedRoute>
                     <AdminProducts />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/admin/products/new"
                 element={
                   <ProtectedRoute>
                     <AdminProductForm />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/admin/products/:id"
                 element={
                   <ProtectedRoute>
                     <AdminProductForm />
                   </ProtectedRoute>
                 }
               />
               <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
               
               {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
               <Route path="*" element={<NotFound />} />
             </Routes>
           </BrowserRouter>
         </CartProvider>
       </AdminProvider>
     </TooltipProvider>
   </QueryClientProvider>
  </HelmetProvider>
);
 
 export default App;
