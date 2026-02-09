-- 1. Ažuriranje default vrednosti za status kolonu
ALTER TABLE porudzbine 
ALTER COLUMN status SET DEFAULT 'Primljeno';

-- 2. Funkcija za javno dobavljanje statusa porudžbine (za tracking stranicu)
CREATE OR REPLACE FUNCTION get_order_status(p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'status', status,
        'created_at', created_at,
        'id', id
    ) INTO result
    FROM porudzbine
    WHERE id = p_order_id;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_order_status TO anon, authenticated, service_role;

-- 3. Ažuriranje create_new_order funkcije da postavlja status 'Primljeno'
CREATE OR REPLACE FUNCTION create_new_order(
    p_ime_kupca text,
    p_email_kupca text,
    p_adresa_kupca text,
    p_grad_kupca text,
    p_postanski_broj_kupca text,
    p_telefon_kupca text,
    p_artikli jsonb,
    p_ukupna_cena numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order porudzbine;
BEGIN
    INSERT INTO porudzbine (
        ime_kupca,
        email_kupca,
        adresa_kupca,
        grad_kupca,
        postanski_broj_kupca,
        telefon_kupca,
        artikli,
        ukupna_cena,
        status
    ) VALUES (
        p_ime_kupca,
        p_email_kupca,
        p_adresa_kupca,
        p_grad_kupca,
        p_postanski_broj_kupca,
        p_telefon_kupca,
        p_artikli,
        p_ukupna_cena,
        'Primljeno' -- Promenjeno iz 'novo' u 'Primljeno'
    )
    RETURNING * INTO new_order;

    RETURN row_to_json(new_order);
END;
$$;
