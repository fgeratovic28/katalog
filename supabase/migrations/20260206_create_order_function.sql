-- 1. Fix RLS policies for the table (Fallback/Standard Access)
ALTER TABLE porudzbine ENABLE ROW LEVEL SECURITY;

-- Allow everyone to insert (Anonymous users need this)
DROP POLICY IF EXISTS "Everyone can create orders" ON porudzbine;
CREATE POLICY "Everyone can create orders" 
ON porudzbine FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users (Admins) to view orders
DROP POLICY IF EXISTS "Authenticated users can view orders" ON porudzbine;
CREATE POLICY "Authenticated users can view orders" 
ON porudzbine FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Create RPC Function to bypass RLS and return data (Preferred for Anon users)
-- This function allows anonymous users to insert AND get the created order ID back
CREATE OR REPLACE FUNCTION create_new_order(
  p_ime_kupca text,
  p_adresa_kupca text,
  p_grad_kupca text,
  p_postanski_broj_kupca text,
  p_telefon_kupca text,
  p_artikli jsonb,
  p_ukupna_cena numeric
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (admin), bypassing RLS
AS $$
DECLARE
  new_order_data jsonb;
BEGIN
  INSERT INTO porudzbine (
    ime_kupca,
    adresa_kupca,
    grad_kupca,
    postanski_broj_kupca,
    telefon_kupca,
    artikli,
    ukupna_cena,
    status
  ) VALUES (
    p_ime_kupca,
    p_adresa_kupca,
    p_grad_kupca,
    p_postanski_broj_kupca,
    p_telefon_kupca,
    p_artikli,
    p_ukupna_cena,
    'novo'
  )
  RETURNING to_jsonb(porudzbine.*) INTO new_order_data;
  
  RETURN new_order_data;
END;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION create_new_order TO anon, authenticated, service_role;
