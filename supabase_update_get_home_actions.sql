-- Atualização da função RPC get_home_actions
-- Mudanças: 
--   1. phase != 'done'  (de 'concluido' para 'done')
--   2. Filtro por p_partner_slugs para excluir partners ocultos/arquivados
--
-- Execute este script no SQL Editor do Supabase.
-- NOTA: Totalmente seguro para ir para o Git (sem dados sensíveis).

CREATE OR REPLACE FUNCTION public.get_home_actions(
    p_user_id uuid,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone,
    p_today_end timestamp with time zone,
    p_partner_slugs text[] DEFAULT NULL
)
RETURNS SETOF actions
LANGUAGE sql
SECURITY DEFINER
AS $function$
  SELECT *
  FROM actions
  WHERE 
    (
      responsibles @> array[p_user_id]            -- uuid[] @> uuid[]
      OR 
      sprints @> array[p_user_id::text]           -- text[] @> text[]
    )
    AND (archived = false OR archived IS NULL)   -- Aceita NULL (registros antigos)
    AND date >= p_start_date
    AND date <= p_end_date
    -- Filtra apenas ações cujos partners estão na lista de visíveis/ativos
    AND (p_partner_slugs IS NULL OR partners && p_partner_slugs);
-- NOTA: Sem filtro de phase — o calendário exibe ações de todas as fases (incluindo done).
-- O filtro de phase fica em fetchAllLateActions, que é a seção separada de atrasadas.
$function$;
