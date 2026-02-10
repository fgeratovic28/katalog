-- 1. Dodavanje kolone order_code
ALTER TABLE porudzbine ADD COLUMN IF NOT EXISTS order_code text;
-- Postavljamo UNIQUE ograničenje da bismo osigurali jedinstvenost
ALTER TABLE porudzbine DROP CONSTRAINT IF EXISTS porudzbine_order_code_key;
ALTER TABLE porudzbine ADD CONSTRAINT porudzbine_order_code_key UNIQUE (order_code);

-- 2. Funkcija za generisanje nasumičnog koda (6 karaktera: A-Z, 0-9)
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z}';
    result text := '';
    i integer := 0;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || chars[1+floor(random()*array_length(chars, 1))::int];
    END LOOP;
    RETURN result;
END;
$$;

-- 3. Ažurirana create_new_order funkcija koja generiše i čuva kod
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
    v_order_code text;
    done bool;
BEGIN
    done := false;
    -- Petlja za generisanje jedinstvenog koda
    WHILE NOT done LOOP
        v_order_code := generate_order_code();
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
                status,
                order_code
            ) VALUES (
                p_ime_kupca,
                p_email_kupca,
                p_adresa_kupca,
                p_grad_kupca,
                p_postanski_broj_kupca,
                p_telefon_kupca,
                p_artikli,
                p_ukupna_cena,
                'Primljeno',
                v_order_code
            )
            RETURNING * INTO new_order;
            
            done := true;
        EXCEPTION WHEN unique_violation THEN
            -- Ako kod već postoji (mala verovatnoća), probaj ponovo
            done := false;
        END;
    END LOOP;

    RETURN row_to_json(new_order);
END;
$$;

-- 4. Ažurirana get_order_status funkcija da pretražuje po order_code ILI id
CREATE OR REPLACE FUNCTION get_order_status(p_query text)
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
        'id', id,
        'order_code', order_code,
        'ime_kupca', ime_kupca,
        'ukupna_cena', ukupna_cena
    ) INTO result
    FROM porudzbine
    WHERE order_code = p_query OR id::text = p_query;

    RETURN result;
END;
$$;
