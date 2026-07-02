-- Atualização da função RPC get_home_actions para suportar o novo modelo de Phase ('done')
-- Execute este script no SQL Editor do Supabase.
--
-- NOTA: Totalmente seguro para ir para o Git (sem dados sensíveis).

CREATE OR REPLACE FUNCTION public.get_home_actions(
    p_user_id uuid,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone,
    p_today_end timestamp with time zone
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
    AND archived = false
    AND phase != 'done'                           -- Atualizado de 'concluido' para 'done'
    AND date >= p_start_date
    AND date <= p_end_date;
$function$;
