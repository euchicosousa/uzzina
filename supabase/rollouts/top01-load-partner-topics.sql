-- TOP-01 Phase 4: load the approved partner topics and classify old actions by color.
-- PREPARED, NOT APPLIED. Needs the owner's explicit authorization, and Phase 1
-- (20261116140000_partner_topics.sql) must already be applied in production.
-- Input: .scratch/action-topics/topicos-lista-aprovada.json (16 partners, 66 topics), embedded below.
--
-- Safety design:
--  * One transaction with lock_timeout.
--  * Only trg_actions_updated_at is disabled around the UPDATE (and re-enabled in the same
--    transaction; if the transaction fails, DDL rolls back and the trigger stays enabled).
--    This keeps actions.updated_at untouched, so open drawers do not report version conflicts
--    and update ordering is not shuffled. ALTER TABLE ... DISABLE TRIGGER takes a brief
--    SHARE ROW EXCLUSIVE lock on actions (lock_timeout applies); it is not session_replication_role,
--    so FK triggers keep working.
--  * trg_actions_topic_ownership stays enabled: it re-validates that each topic belongs to a partner of the action.
--  * Only actions with topic_id IS NULL are touched; actions.color is never changed.
--  * Match: lower(btrim(color)), '#abc' -> '#aabbcc', equal to the color of a topic of one of the
--    action partners; if several partners match, the earliest in actions.partners wins. All categories.
-- Run once. Re-running fails on the unique topic title index (no double load).
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TEMP TABLE _top01_before ON COMMIT DROP AS
  SELECT count(*) AS actions_n, max(updated_at) AS max_updated_at,
         md5(string_agg(id::text || updated_at::text, ',' ORDER BY id)) AS fingerprint
  FROM public.actions;

INSERT INTO public.partner_topics (partner_id, position, title, color)
WITH list AS (
  SELECT x.partner, x.position, x.title, x.color
  FROM jsonb_to_recordset($json$[{"partner":"agenciacnvt","position":1,"title":"Portfólio","color":"#000000"},{"partner":"agenciacnvt","position":2,"title":"Autoridade","color":"#f9fafc"},{"partner":"agenciacnvt","position":3,"title":"Educação","color":"#999999"},{"partner":"draanaliarocha","position":1,"title":"Puericultura","color":"#fabcb5"},{"partner":"draanaliarocha","position":2,"title":"Maternidade","color":"#8394a8"},{"partner":"draanaliarocha","position":3,"title":"Opinião","color":"#86cbb7"},{"partner":"brendavasconcelos","position":1,"title":"Puericultura","color":"#f05cc1"},{"partner":"brendavasconcelos","position":2,"title":"Atração","color":"#7b3df0"},{"partner":"brendavasconcelos","position":3,"title":"Maternidade","color":"#f9e66c"},{"partner":"brendavasconcelos","position":4,"title":"Mitos e verdades","color":"#66e597"},{"partner":"brendavasconcelos","position":5,"title":"Conselhos e cuidados","color":"#80b7ff"},{"partner":"euchicosousa","position":1,"title":"Posicionamento","color":"#0000ff"},{"partner":"euchicosousa","position":2,"title":"Atração","color":"#f2f2ed"},{"partner":"euchicosousa","position":3,"title":"Opinião","color":"#ffffff"},{"partner":"clinicadengo","position":1,"title":"Amamentação","color":"#dcb1e2"},{"partner":"clinicadengo","position":2,"title":"Pediatria","color":"#eec8dd"},{"partner":"clinicadengo","position":3,"title":"Dengo","color":"#eacbd1"},{"partner":"clinicadengo","position":4,"title":"Psicologia","color":"#c2ceea"},{"partner":"clinicadengo","position":5,"title":"Nutrição infantil","color":"#cfeabd"},{"partner":"clinicadengo","position":6,"title":"Urologia","color":"#eceab1"},{"partner":"clinicadengo","position":7,"title":"Fisioterapia","color":"#a2dbdd"},{"partner":"clinicadengo","position":8,"title":"Parceria São Luiz","color":"#c0ccb8"},{"partner":"clinicadengo","position":9,"title":"Parentalidade","color":"#eeddab"},{"partner":"clinicaunivetsobral","position":1,"title":"Atração","color":"#987c2f"},{"partner":"clinicaunivetsobral","position":2,"title":"Casos e datas","color":"#f8f4e2"},{"partner":"clinicaunivetsobral","position":3,"title":"Bastidores","color":"#3c320b"},{"partner":"clinicaunivetsobral","position":4,"title":"Produtos e serviços","color":"#000000"},{"partner":"clinicaunivetsobral","position":5,"title":"Cuidados","color":"#e1ce84"},{"partner":"clinicaunivetsobral","position":6,"title":"Saúde animal","color":"#5b8c40"},{"partner":"draiaratomaz","position":1,"title":"Histeroscopia","color":"#e3c0c7"},{"partner":"draiaratomaz","position":2,"title":"Ultrassonografia","color":"#b36b6b"},{"partner":"draiaratomaz","position":3,"title":"Bastidores","color":"#e5d1cd"},{"partner":"dramargaridacarneiro","position":1,"title":"Educação","color":"#5fa4ad"},{"partner":"dramargaridacarneiro","position":2,"title":"Curiosidades","color":"#ed7d96"},{"partner":"dramargaridacarneiro","position":3,"title":"Casos","color":"#67b35f"},{"partner":"dramargaridacarneiro","position":4,"title":"Rotina","color":"#efe240"},{"partner":"exactaconsultoria","position":1,"title":"Dica de livro","color":"#000000"},{"partner":"exactaconsultoria","position":2,"title":"Notícia","color":"#c8ba74"},{"partner":"exactaconsultoria","position":3,"title":"Dica","color":"#f2edd4"},{"partner":"hospitaldrthomazcorrea","position":1,"title":"Serviços","color":"#447240"},{"partner":"hospitaldrthomazcorrea","position":2,"title":"Educação","color":"#dce5d1"},{"partner":"hospitaldrthomazcorrea","position":3,"title":"Corpo clínico","color":"#022c07"},{"partner":"hospitaldrthomazcorrea","position":4,"title":"Datas","color":"#f56d24"},{"partner":"lumatorremarques","position":1,"title":"Sono infantil","color":"#f0dab0"},{"partner":"lumatorremarques","position":2,"title":"Maternidade real","color":"#a76d63"},{"partner":"lumatorremarques","position":3,"title":"Consultoria","color":"#eabebe"},{"partner":"odontomelo","position":1,"title":"Educação","color":"#000000"},{"partner":"parksobral","position":1,"title":"Cardápio","color":"#003780"},{"partner":"parksobral","position":2,"title":"Experiência","color":"#c69653"},{"partner":"parksobral","position":3,"title":"Pratos e eventos","color":"#ece1c6"},{"partner":"smartmed_massape","position":1,"title":"Serviços","color":"#4f3a9c"},{"partner":"smartmed_massape","position":2,"title":"Corpo clínico","color":"#301868"},{"partner":"smartmed_massape","position":3,"title":"Datas e campanhas","color":"#e2e5e9"},{"partner":"smartmed_massape","position":4,"title":"Terapias infantis","color":"#7db030"},{"partner":"smartmed_massape","position":5,"title":"Atendimentos do dia","color":"#999999"},{"partner":"smartmed_massape","position":6,"title":"Oftalmologia","color":"#5fa4ad"},{"partner":"toroburgerandbeer","position":1,"title":"Produto","color":"#fff7ed"},{"partner":"toroburgerandbeer","position":2,"title":"Atração","color":"#ff1a1a"},{"partner":"toroburgerandbeer","position":3,"title":"Engajamento","color":"#7a2500"},{"partner":"toroburgerandbeer","position":4,"title":"Bastidores","color":"#000000"},{"partner":"toroburgerandbeer","position":5,"title":"Ofertas","color":"#dc2626"},{"partner":"toroburgerandbeer","position":6,"title":"Ocasiões","color":"#f25145"},{"partner":"videresaude","position":1,"title":"Institucional","color":"#e9e8e4"},{"partner":"videresaude","position":2,"title":"Aniversários","color":"#1e40af"},{"partner":"videresaude","position":3,"title":"Especialidades","color":"#123b6a"},{"partner":"videresaude","position":4,"title":"Datas","color":"#172554"}]$json$::jsonb)
    AS x(partner text, position int, title text, color text)
)
SELECT p.id, l.position, l.title, l.color
FROM list l
JOIN public.partners p ON p.slug = l.partner
ORDER BY l.partner, l.position;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.partner_topics) <> 66 THEN
    RAISE EXCEPTION 'Expected 66 topics after insert, found %', (SELECT count(*) FROM public.partner_topics);
  END IF;
END $$;

ALTER TABLE public.actions DISABLE TRIGGER trg_actions_updated_at;

CREATE TEMP TABLE _top01_updated (id uuid, topic_id uuid, partner text, topic_title text) ON COMMIT DROP;

WITH norm AS (
  SELECT a.id, a.archived, a.category, a.partners,
    CASE
      WHEN lower(btrim(a.color)) ~ '^#[0-9a-f]{6}$' THEN lower(btrim(a.color))
      WHEN lower(btrim(a.color)) ~ '^#[0-9a-f]{3}$' THEN
        '#' || regexp_replace(substr(lower(btrim(a.color)), 2), '(.)', '\1\1', 'g')
    END AS ncolor
  FROM public.actions a
  WHERE a.topic_id IS NULL AND a.partners IS NOT NULL
),
cand AS (
  SELECT n.id, n.archived, n.category, pr.slug AS partner, pr.ord, t.id AS topic_id, t.title,
    row_number() OVER (PARTITION BY n.id ORDER BY pr.ord) AS rn
  FROM norm n
  CROSS JOIN LATERAL unnest(n.partners) WITH ORDINALITY AS pr(slug, ord)
  JOIN public.partners p ON p.slug = pr.slug
  JOIN public.partner_topics t ON t.partner_id = p.id AND t.color = n.ncolor
  WHERE n.ncolor IS NOT NULL
),
upd AS (
  UPDATE public.actions a
  SET topic_id = c.topic_id
  FROM cand c
  WHERE c.rn = 1 AND a.id = c.id AND a.topic_id IS NULL
  RETURNING a.id, a.topic_id
)
INSERT INTO _top01_updated
SELECT u.id, u.topic_id, p.slug, t.title
FROM upd u
JOIN public.partner_topics t ON t.id = u.topic_id
JOIN public.partners p ON p.id = t.partner_id;

ALTER TABLE public.actions ENABLE TRIGGER trg_actions_updated_at;

-- Guards: trigger re-enabled and no updated_at changed.
DO $$
BEGIN
  IF (SELECT tgenabled FROM pg_trigger WHERE tgrelid = 'public.actions'::regclass AND tgname = 'trg_actions_updated_at') <> 'O' THEN
    RAISE EXCEPTION 'trg_actions_updated_at is not enabled';
  END IF;
  IF (SELECT md5(string_agg(id::text || updated_at::text, ',' ORDER BY id)) FROM public.actions)
     IS DISTINCT FROM (SELECT fingerprint FROM _top01_before) THEN
    RAISE EXCEPTION 'actions.updated_at changed during the load';
  END IF;
END $$;

-- Summary: topics inserted per partner.
SELECT p.slug AS partner, count(*) AS topics_inserted
FROM public.partner_topics t JOIN public.partners p ON p.id = t.partner_id
GROUP BY p.slug ORDER BY p.slug;

-- Summary: actions updated per partner/topic.
SELECT partner, topic_title, count(*) AS actions_updated
FROM _top01_updated GROUP BY partner, topic_title ORDER BY partner, topic_title;

-- Summary: totals.
SELECT (SELECT count(*) FROM public.partner_topics) AS topics_total,
       (SELECT count(*) FROM _top01_updated) AS actions_updated_total,
       (SELECT count(*) FROM public.actions WHERE topic_id IS NOT NULL) AS actions_with_topic_total,
       (SELECT count(*) FROM public.actions) AS actions_total;

COMMIT;

-- ROLLBACK (run only if the load must be undone; actions.color is never touched).
-- Identifies the loaded topics by partner slug + title + color from the same list.
-- BEGIN;
-- SET LOCAL lock_timeout = '5s';
-- ALTER TABLE public.actions DISABLE TRIGGER trg_actions_updated_at;
-- WITH list AS (
--   SELECT x.partner, x.position, x.title, x.color
--   FROM jsonb_to_recordset($json$[{"partner":"agenciacnvt","position":1,"title":"Portfólio","color":"#000000"},{"partner":"agenciacnvt","position":2,"title":"Autoridade","color":"#f9fafc"},{"partner":"agenciacnvt","position":3,"title":"Educação","color":"#999999"},{"partner":"draanaliarocha","position":1,"title":"Puericultura","color":"#fabcb5"},{"partner":"draanaliarocha","position":2,"title":"Maternidade","color":"#8394a8"},{"partner":"draanaliarocha","position":3,"title":"Opinião","color":"#86cbb7"},{"partner":"brendavasconcelos","position":1,"title":"Puericultura","color":"#f05cc1"},{"partner":"brendavasconcelos","position":2,"title":"Atração","color":"#7b3df0"},{"partner":"brendavasconcelos","position":3,"title":"Maternidade","color":"#f9e66c"},{"partner":"brendavasconcelos","position":4,"title":"Mitos e verdades","color":"#66e597"},{"partner":"brendavasconcelos","position":5,"title":"Conselhos e cuidados","color":"#80b7ff"},{"partner":"euchicosousa","position":1,"title":"Posicionamento","color":"#0000ff"},{"partner":"euchicosousa","position":2,"title":"Atração","color":"#f2f2ed"},{"partner":"euchicosousa","position":3,"title":"Opinião","color":"#ffffff"},{"partner":"clinicadengo","position":1,"title":"Amamentação","color":"#dcb1e2"},{"partner":"clinicadengo","position":2,"title":"Pediatria","color":"#eec8dd"},{"partner":"clinicadengo","position":3,"title":"Dengo","color":"#eacbd1"},{"partner":"clinicadengo","position":4,"title":"Psicologia","color":"#c2ceea"},{"partner":"clinicadengo","position":5,"title":"Nutrição infantil","color":"#cfeabd"},{"partner":"clinicadengo","position":6,"title":"Urologia","color":"#eceab1"},{"partner":"clinicadengo","position":7,"title":"Fisioterapia","color":"#a2dbdd"},{"partner":"clinicadengo","position":8,"title":"Parceria São Luiz","color":"#c0ccb8"},{"partner":"clinicadengo","position":9,"title":"Parentalidade","color":"#eeddab"},{"partner":"clinicaunivetsobral","position":1,"title":"Atração","color":"#987c2f"},{"partner":"clinicaunivetsobral","position":2,"title":"Casos e datas","color":"#f8f4e2"},{"partner":"clinicaunivetsobral","position":3,"title":"Bastidores","color":"#3c320b"},{"partner":"clinicaunivetsobral","position":4,"title":"Produtos e serviços","color":"#000000"},{"partner":"clinicaunivetsobral","position":5,"title":"Cuidados","color":"#e1ce84"},{"partner":"clinicaunivetsobral","position":6,"title":"Saúde animal","color":"#5b8c40"},{"partner":"draiaratomaz","position":1,"title":"Histeroscopia","color":"#e3c0c7"},{"partner":"draiaratomaz","position":2,"title":"Ultrassonografia","color":"#b36b6b"},{"partner":"draiaratomaz","position":3,"title":"Bastidores","color":"#e5d1cd"},{"partner":"dramargaridacarneiro","position":1,"title":"Educação","color":"#5fa4ad"},{"partner":"dramargaridacarneiro","position":2,"title":"Curiosidades","color":"#ed7d96"},{"partner":"dramargaridacarneiro","position":3,"title":"Casos","color":"#67b35f"},{"partner":"dramargaridacarneiro","position":4,"title":"Rotina","color":"#efe240"},{"partner":"exactaconsultoria","position":1,"title":"Dica de livro","color":"#000000"},{"partner":"exactaconsultoria","position":2,"title":"Notícia","color":"#c8ba74"},{"partner":"exactaconsultoria","position":3,"title":"Dica","color":"#f2edd4"},{"partner":"hospitaldrthomazcorrea","position":1,"title":"Serviços","color":"#447240"},{"partner":"hospitaldrthomazcorrea","position":2,"title":"Educação","color":"#dce5d1"},{"partner":"hospitaldrthomazcorrea","position":3,"title":"Corpo clínico","color":"#022c07"},{"partner":"hospitaldrthomazcorrea","position":4,"title":"Datas","color":"#f56d24"},{"partner":"lumatorremarques","position":1,"title":"Sono infantil","color":"#f0dab0"},{"partner":"lumatorremarques","position":2,"title":"Maternidade real","color":"#a76d63"},{"partner":"lumatorremarques","position":3,"title":"Consultoria","color":"#eabebe"},{"partner":"odontomelo","position":1,"title":"Educação","color":"#000000"},{"partner":"parksobral","position":1,"title":"Cardápio","color":"#003780"},{"partner":"parksobral","position":2,"title":"Experiência","color":"#c69653"},{"partner":"parksobral","position":3,"title":"Pratos e eventos","color":"#ece1c6"},{"partner":"smartmed_massape","position":1,"title":"Serviços","color":"#4f3a9c"},{"partner":"smartmed_massape","position":2,"title":"Corpo clínico","color":"#301868"},{"partner":"smartmed_massape","position":3,"title":"Datas e campanhas","color":"#e2e5e9"},{"partner":"smartmed_massape","position":4,"title":"Terapias infantis","color":"#7db030"},{"partner":"smartmed_massape","position":5,"title":"Atendimentos do dia","color":"#999999"},{"partner":"smartmed_massape","position":6,"title":"Oftalmologia","color":"#5fa4ad"},{"partner":"toroburgerandbeer","position":1,"title":"Produto","color":"#fff7ed"},{"partner":"toroburgerandbeer","position":2,"title":"Atração","color":"#ff1a1a"},{"partner":"toroburgerandbeer","position":3,"title":"Engajamento","color":"#7a2500"},{"partner":"toroburgerandbeer","position":4,"title":"Bastidores","color":"#000000"},{"partner":"toroburgerandbeer","position":5,"title":"Ofertas","color":"#dc2626"},{"partner":"toroburgerandbeer","position":6,"title":"Ocasiões","color":"#f25145"},{"partner":"videresaude","position":1,"title":"Institucional","color":"#e9e8e4"},{"partner":"videresaude","position":2,"title":"Aniversários","color":"#1e40af"},{"partner":"videresaude","position":3,"title":"Especialidades","color":"#123b6a"},{"partner":"videresaude","position":4,"title":"Datas","color":"#172554"}]$json$::jsonb)
--     AS x(partner text, position int, title text, color text)
-- ),
-- loaded AS (
--   SELECT t.id FROM public.partner_topics t
--   JOIN public.partners p ON p.id = t.partner_id
--   JOIN list l ON l.partner = p.slug AND lower(btrim(l.title)) = lower(btrim(t.title)) AND l.color = t.color
-- )
-- UPDATE public.actions SET topic_id = NULL WHERE topic_id IN (SELECT id FROM loaded);
-- ALTER TABLE public.actions ENABLE TRIGGER trg_actions_updated_at;
-- WITH list AS (
--   SELECT x.partner, x.position, x.title, x.color
--   FROM jsonb_to_recordset($json$[{"partner":"agenciacnvt","position":1,"title":"Portfólio","color":"#000000"},{"partner":"agenciacnvt","position":2,"title":"Autoridade","color":"#f9fafc"},{"partner":"agenciacnvt","position":3,"title":"Educação","color":"#999999"},{"partner":"draanaliarocha","position":1,"title":"Puericultura","color":"#fabcb5"},{"partner":"draanaliarocha","position":2,"title":"Maternidade","color":"#8394a8"},{"partner":"draanaliarocha","position":3,"title":"Opinião","color":"#86cbb7"},{"partner":"brendavasconcelos","position":1,"title":"Puericultura","color":"#f05cc1"},{"partner":"brendavasconcelos","position":2,"title":"Atração","color":"#7b3df0"},{"partner":"brendavasconcelos","position":3,"title":"Maternidade","color":"#f9e66c"},{"partner":"brendavasconcelos","position":4,"title":"Mitos e verdades","color":"#66e597"},{"partner":"brendavasconcelos","position":5,"title":"Conselhos e cuidados","color":"#80b7ff"},{"partner":"euchicosousa","position":1,"title":"Posicionamento","color":"#0000ff"},{"partner":"euchicosousa","position":2,"title":"Atração","color":"#f2f2ed"},{"partner":"euchicosousa","position":3,"title":"Opinião","color":"#ffffff"},{"partner":"clinicadengo","position":1,"title":"Amamentação","color":"#dcb1e2"},{"partner":"clinicadengo","position":2,"title":"Pediatria","color":"#eec8dd"},{"partner":"clinicadengo","position":3,"title":"Dengo","color":"#eacbd1"},{"partner":"clinicadengo","position":4,"title":"Psicologia","color":"#c2ceea"},{"partner":"clinicadengo","position":5,"title":"Nutrição infantil","color":"#cfeabd"},{"partner":"clinicadengo","position":6,"title":"Urologia","color":"#eceab1"},{"partner":"clinicadengo","position":7,"title":"Fisioterapia","color":"#a2dbdd"},{"partner":"clinicadengo","position":8,"title":"Parceria São Luiz","color":"#c0ccb8"},{"partner":"clinicadengo","position":9,"title":"Parentalidade","color":"#eeddab"},{"partner":"clinicaunivetsobral","position":1,"title":"Atração","color":"#987c2f"},{"partner":"clinicaunivetsobral","position":2,"title":"Casos e datas","color":"#f8f4e2"},{"partner":"clinicaunivetsobral","position":3,"title":"Bastidores","color":"#3c320b"},{"partner":"clinicaunivetsobral","position":4,"title":"Produtos e serviços","color":"#000000"},{"partner":"clinicaunivetsobral","position":5,"title":"Cuidados","color":"#e1ce84"},{"partner":"clinicaunivetsobral","position":6,"title":"Saúde animal","color":"#5b8c40"},{"partner":"draiaratomaz","position":1,"title":"Histeroscopia","color":"#e3c0c7"},{"partner":"draiaratomaz","position":2,"title":"Ultrassonografia","color":"#b36b6b"},{"partner":"draiaratomaz","position":3,"title":"Bastidores","color":"#e5d1cd"},{"partner":"dramargaridacarneiro","position":1,"title":"Educação","color":"#5fa4ad"},{"partner":"dramargaridacarneiro","position":2,"title":"Curiosidades","color":"#ed7d96"},{"partner":"dramargaridacarneiro","position":3,"title":"Casos","color":"#67b35f"},{"partner":"dramargaridacarneiro","position":4,"title":"Rotina","color":"#efe240"},{"partner":"exactaconsultoria","position":1,"title":"Dica de livro","color":"#000000"},{"partner":"exactaconsultoria","position":2,"title":"Notícia","color":"#c8ba74"},{"partner":"exactaconsultoria","position":3,"title":"Dica","color":"#f2edd4"},{"partner":"hospitaldrthomazcorrea","position":1,"title":"Serviços","color":"#447240"},{"partner":"hospitaldrthomazcorrea","position":2,"title":"Educação","color":"#dce5d1"},{"partner":"hospitaldrthomazcorrea","position":3,"title":"Corpo clínico","color":"#022c07"},{"partner":"hospitaldrthomazcorrea","position":4,"title":"Datas","color":"#f56d24"},{"partner":"lumatorremarques","position":1,"title":"Sono infantil","color":"#f0dab0"},{"partner":"lumatorremarques","position":2,"title":"Maternidade real","color":"#a76d63"},{"partner":"lumatorremarques","position":3,"title":"Consultoria","color":"#eabebe"},{"partner":"odontomelo","position":1,"title":"Educação","color":"#000000"},{"partner":"parksobral","position":1,"title":"Cardápio","color":"#003780"},{"partner":"parksobral","position":2,"title":"Experiência","color":"#c69653"},{"partner":"parksobral","position":3,"title":"Pratos e eventos","color":"#ece1c6"},{"partner":"smartmed_massape","position":1,"title":"Serviços","color":"#4f3a9c"},{"partner":"smartmed_massape","position":2,"title":"Corpo clínico","color":"#301868"},{"partner":"smartmed_massape","position":3,"title":"Datas e campanhas","color":"#e2e5e9"},{"partner":"smartmed_massape","position":4,"title":"Terapias infantis","color":"#7db030"},{"partner":"smartmed_massape","position":5,"title":"Atendimentos do dia","color":"#999999"},{"partner":"smartmed_massape","position":6,"title":"Oftalmologia","color":"#5fa4ad"},{"partner":"toroburgerandbeer","position":1,"title":"Produto","color":"#fff7ed"},{"partner":"toroburgerandbeer","position":2,"title":"Atração","color":"#ff1a1a"},{"partner":"toroburgerandbeer","position":3,"title":"Engajamento","color":"#7a2500"},{"partner":"toroburgerandbeer","position":4,"title":"Bastidores","color":"#000000"},{"partner":"toroburgerandbeer","position":5,"title":"Ofertas","color":"#dc2626"},{"partner":"toroburgerandbeer","position":6,"title":"Ocasiões","color":"#f25145"},{"partner":"videresaude","position":1,"title":"Institucional","color":"#e9e8e4"},{"partner":"videresaude","position":2,"title":"Aniversários","color":"#1e40af"},{"partner":"videresaude","position":3,"title":"Especialidades","color":"#123b6a"},{"partner":"videresaude","position":4,"title":"Datas","color":"#172554"}]$json$::jsonb)
--     AS x(partner text, position int, title text, color text)
-- )
-- DELETE FROM public.partner_topics t USING public.partners p, list l
--   WHERE p.id = t.partner_id AND l.partner = p.slug
--     AND lower(btrim(l.title)) = lower(btrim(t.title)) AND l.color = t.color;
-- COMMIT;
-- Note: after the UPDATE and before the DELETE the ON DELETE SET NULL FK would also null topic_id,
-- but doing the UPDATE first with the trigger disabled keeps updated_at untouched; the DELETE then
-- has no referencing actions. Do not delete topics first.
