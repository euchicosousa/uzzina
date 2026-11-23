-- Atualiza actions.time (minutos) para os padrões atuais de CATEGORIES em
-- app/lib/CONSTANTS.ts. Execute o bloco de atualização repetidamente até
-- retornar zero linhas. Cada execução altera no máximo 500 ações.
--
-- A carga aplica o novo padrão a todas as ações das categorias listadas,
-- inclusive ações arquivadas e tempos ajustados manualmente. O trigger vigente
-- de actions atualiza updated_at para que a mudança seja observável no app.

-- 1) Prévia agregada: confira quantas ações serão alteradas por categoria.
WITH category_defaults(category, target_time) AS (
  VALUES
    ('ads', 30),
    ('capture', 120),
    ('carousel', 50),
    ('design', 70),
    ('dev', 90),
    ('finance', 10),
    ('meeting', 60),
    ('post', 30),
    ('print', 30),
    ('reels', 40),
    ('sm', 40),
    ('stories', 20),
    ('todo', 10)
)
SELECT
  a.category,
  d.target_time AS novo_time_minutos,
  count(*) AS acoes_que_serao_atualizadas
FROM public.actions AS a
JOIN category_defaults AS d ON d.category = a.category
WHERE a.time IS DISTINCT FROM d.target_time
GROUP BY a.category, d.target_time
ORDER BY a.category;

-- 2) Um lote por execução (máximo 500 ações). Execute de novo até não retornar
-- linhas. SKIP LOCKED permite repetir sem esperar por ações em uso concorrente.
WITH category_defaults(category, target_time) AS (
  VALUES
    ('ads', 30),
    ('capture', 120),
    ('carousel', 50),
    ('design', 70),
    ('dev', 90),
    ('finance', 10),
    ('meeting', 60),
    ('post', 30),
    ('print', 30),
    ('reels', 40),
    ('sm', 40),
    ('stories', 20),
    ('todo', 10)
), batch AS (
  SELECT a.id, d.target_time
  FROM public.actions AS a
  JOIN category_defaults AS d ON d.category = a.category
  WHERE a.time IS DISTINCT FROM d.target_time
  ORDER BY a.id
  LIMIT 500
  FOR UPDATE OF a SKIP LOCKED
), updated AS (
  UPDATE public.actions AS a
  SET time = batch.target_time
  FROM batch
  WHERE a.id = batch.id
  RETURNING 1
)
SELECT count(*) AS acoes_atualizadas_neste_lote FROM updated;

-- Categorias desconhecidas ficam fora da carga e podem ser inspecionadas com:
-- SELECT category, count(*) FROM public.actions
-- GROUP BY category ORDER BY category;
