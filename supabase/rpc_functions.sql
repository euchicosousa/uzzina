-- Função para buscar actions da Home com filtragem de servidor
-- Execute este script no SQL Editor do Supabase (Substitua a função anterior)

CREATE OR REPLACE FUNCTION get_home_actions(
  p_user_id uuid,
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone,
  p_today_end timestamp with time zone
)
RETURNS SETOF actions -- Retorna linhas da tabela actions
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_admin boolean;
  v_partner_slugs text[];
BEGIN
  -- 1. Verificar se o usuário é Admin (buscando na tabela 'people')
  SELECT admin INTO v_is_admin 
  FROM people 
  WHERE user_id = p_user_id
  LIMIT 1;

  -- 2. Buscar slugs dos Parceiros permitidos (não arquivados e vinculados ao usuário)
  -- Assumindo que users_ids é array de UUID (Correção aqui)
  SELECT array_agg(slug) INTO v_partner_slugs
  FROM partners
  WHERE archived = false
  AND users_ids @> ARRAY[p_user_id]; 

  -- Se não encontrar parceiros, não retorna nada (segurança)
  IF v_partner_slugs IS NULL THEN
    RETURN;
  END IF;

  -- 3. Retornar as Actions filtradas
  -- Lógica combinada de Admin, Parceiros e Data
  RETURN QUERY
  SELECT *
  FROM actions
  WHERE archived = false
  AND (
    -- Filtragem de Responsável:
    -- Se Admin, vê tudo. Se User, deve estar em 'responsibles'.
    (v_is_admin = true)
    OR
    (responsibles @> ARRAY[p_user_id]) -- Assumindo responsibles como UUID[] (Correção aqui)
  )
  AND (
    -- Filtragem de Parceiro (Overlap):
    -- A action deve pertencer a um parceiro permitido
    partners && v_partner_slugs
  )
  AND (
    -- Filtragem de Data/Estado (Combinada OR):
    -- 1. Actions do Calendário (dentro do intervalo start-end)
    (date >= p_start_date AND date <= p_end_date)
    OR
    -- 2. Actions Atrasadas/Dashboard (não finalizadas até hoje)
    (state != 'finished' AND date <= p_today_end)
  )
  ORDER BY date ASC;
END;
$$;
