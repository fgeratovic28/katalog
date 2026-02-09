-- Skripta za dodavanje email kolone i ažuriranje RPC funkcije

-- 1. Dodavanje kolone email_kupca u tabelu porudzbine
ALTER TABLE porudzbine 
ADD COLUMN IF NOT EXISTS email_kupca text;

-- 2. Ažuriranje funkcije create_new_order da prihvata email
CREATE OR REPLACE FUNCTION create_new_order(
    p_ime_kupca text,
    p_email_kupca text, -- Novi parametar
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
        email_kupca, -- Čuvanje email-a
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
        'novo'
    )
    RETURNING * INTO new_order;

    RETURN row_to_json(new_order);
END;
$$;
