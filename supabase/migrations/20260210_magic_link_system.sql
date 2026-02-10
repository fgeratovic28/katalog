-- 1. Add edit_token column
ALTER TABLE porudzbine ADD COLUMN IF NOT EXISTS edit_token text;

-- 2. Update create_new_order to generate order_code AND edit_token
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
    v_edit_token text;
    done bool;
BEGIN
    done := false;
    
    -- Generate a secure random token for editing
    v_edit_token := encode(gen_random_bytes(32), 'hex');

    -- Loop for unique order_code
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
                order_code,
                edit_token
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
                v_order_code,
                v_edit_token
            )
            RETURNING * INTO new_order;
            
            done := true;
        EXCEPTION WHEN unique_violation THEN
            -- If order_code exists, retry
            done := false;
        END;
    END LOOP;

    RETURN row_to_json(new_order);
END;
$$;

-- 3. Update get_order_status to handle edit permission AND lookup by token
CREATE OR REPLACE FUNCTION get_order_status(p_query text, p_token text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_record porudzbine%ROWTYPE;
    can_edit boolean := false;
    v_status text;
    lookup_by_token boolean := false;
BEGIN
    -- Try to find by order_code, id, OR edit_token
    SELECT * INTO order_record
    FROM porudzbine
    WHERE order_code = p_query 
       OR id::text = p_query
       OR (edit_token IS NOT NULL AND edit_token = p_query);

    IF order_record.id IS NULL THEN
        RETURN NULL;
    END IF;

    v_status := order_record.status;
    
    -- Determine if looked up by token
    IF order_record.edit_token = p_query THEN
        lookup_by_token := true;
    END IF;

    -- Check permission
    -- 1. If looked up by token directly -> Implicitly valid token
    -- 2. If looked up by ID/Code AND p_token matches -> Valid token
    IF v_status = 'Primljeno' THEN
        IF lookup_by_token THEN
            can_edit := true;
        ELSIF p_token IS NOT NULL AND order_record.edit_token = p_token THEN
            can_edit := true;
        END IF;
    END IF;

    -- Return object
    RETURN json_build_object(
        'status', v_status,
        'created_at', order_record.created_at,
        'id', order_record.id,
        'order_code', order_record.order_code,
        'ime_kupca', order_record.ime_kupca,
        'ukupna_cena', order_record.ukupna_cena,
        'can_edit', can_edit,
        -- Sensitive fields
        'adresa_kupca', CASE WHEN can_edit THEN order_record.adresa_kupca ELSE NULL END,
        'grad_kupca', CASE WHEN can_edit THEN order_record.grad_kupca ELSE NULL END,
        'postanski_broj_kupca', CASE WHEN can_edit THEN order_record.postanski_broj_kupca ELSE NULL END,
        'telefon_kupca', CASE WHEN can_edit THEN order_record.telefon_kupca ELSE NULL END,
        'email_kupca', CASE WHEN can_edit THEN order_record.email_kupca ELSE NULL END
    );
END;
$$;

-- 4. New RPC to update order details
CREATE OR REPLACE FUNCTION update_order_details(
    p_order_id uuid,
    p_token text,
    p_ime_kupca text,
    p_email_kupca text,
    p_adresa_kupca text,
    p_grad_kupca text,
    p_postanski_broj_kupca text,
    p_telefon_kupca text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_record porudzbine%ROWTYPE;
    updated_order porudzbine;
BEGIN
    SELECT * INTO order_record
    FROM porudzbine
    WHERE id = p_order_id;

    IF order_record.id IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Validate Token
    IF order_record.edit_token IS NULL OR order_record.edit_token != p_token THEN
        RAISE EXCEPTION 'Invalid edit token';
    END IF;

    -- Validate Status
    IF order_record.status != 'Primljeno' THEN
        RAISE EXCEPTION 'Order cannot be edited in current status';
    END IF;

    -- Update
    UPDATE porudzbine
    SET
        ime_kupca = p_ime_kupca,
        email_kupca = p_email_kupca,
        adresa_kupca = p_adresa_kupca,
        grad_kupca = p_grad_kupca,
        postanski_broj_kupca = p_postanski_broj_kupca,
        telefon_kupca = p_telefon_kupca
    WHERE id = p_order_id
    RETURNING * INTO updated_order;

    RETURN row_to_json(updated_order);
END;
$$;

GRANT EXECUTE ON FUNCTION update_order_details TO anon, authenticated, service_role;
