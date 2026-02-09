export interface Variant {
  name: string;
  price: number;
  old_price?: number;
}

export interface Product {
  id: string;
  created_at?: string;
  naziv: string;
  cena: number;
  opis: string;
  slike: string[];
  velicine: string[]; // Deprecated, but kept for compatibility
  varijante?: Variant[];
  kategorija: string;
  dostupno: boolean;
  is_new?: boolean;
  is_on_sale?: boolean;
  stara_cena?: number;
}

export interface CartItem {
  product: Product;
  variant?: Variant; // Selected variant
  size?: string; // Legacy support
  quantity: number;
}

export interface Order {
  id: string;
  created_at: string;
  ime_kupca: string;
  email_kupca: string;
  adresa_kupca: string;
  grad_kupca: string;
  postanski_broj_kupca: string;
  telefon_kupca: string;
  artikli: CartItem[];
  ukupna_cena: number;
  status: 'Primljeno' | 'U obradi' | 'Poslato' | 'Isporučeno' | 'novo' | 'otkazano' | string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}
