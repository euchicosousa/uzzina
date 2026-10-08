-- STAGING ONLY: zacrrtilppvekiyoybzn, empty Supabase project.

-- Reconstruct application metadata from inventory dated 2026-10-07.

-- Never replace auth schemas/functions/roles or copy business rows.

-- Not a production migration or a complete dump (varchar typmods unavailable).

SET search_path = public, extensions;

DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p')) THEN
  RAISE EXCEPTION 'Empty public schema required for staging bootstrap';
 END IF;
 IF to_regclass('auth.users') IS NULL OR to_regprocedure('auth.uid()') IS NULL THEN
  RAISE EXCEPTION 'Real Supabase Auth required';
 END IF;
END $$;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

CREATE TYPE public."sow" AS ENUM ('marketing','socialmedia','demand');

CREATE TABLE public."action_comments" (
  "id" "pg_catalog"."uuid" DEFAULT gen_random_uuid() NOT NULL,
  "action_id" "pg_catalog"."uuid" NOT NULL,
  "author_id" "pg_catalog"."text" NOT NULL,
  "author_name" "pg_catalog"."text" NOT NULL,
  "content" "pg_catalog"."text" NOT NULL,
  "created_at" "pg_catalog"."timestamptz" DEFAULT now() NOT NULL,
  "is_user" "pg_catalog"."bool" DEFAULT false NOT NULL,
  "is_internal" "pg_catalog"."bool" DEFAULT false,
  "mentions" "pg_catalog"."uuid"[] DEFAULT '{}'::uuid[]
);

ALTER TABLE public."action_comments" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."action_comments" FROM PUBLIC, anon, authenticated;

GRANT ALL ON public."action_comments" TO service_role;

CREATE TABLE public."actions" (
  "id" "pg_catalog"."uuid" DEFAULT gen_random_uuid() NOT NULL,
  "created_at" "pg_catalog"."timestamp" NOT NULL,
  "updated_at" "pg_catalog"."timestamp" NOT NULL,
  "title" "pg_catalog"."text" NOT NULL,
  "description" "pg_catalog"."text",
  "date" "pg_catalog"."timestamp" NOT NULL,
  "responsibles" "pg_catalog"."uuid"[] NOT NULL,
  "user_id" "pg_catalog"."uuid" DEFAULT auth.uid() NOT NULL,
  "color" "pg_catalog"."text" DEFAULT '#ffffff'::text NOT NULL,
  "time" "pg_catalog"."int2" DEFAULT '5'::smallint NOT NULL,
  "priority" "pg_catalog"."text" NOT NULL,
  "category" "pg_catalog"."text" NOT NULL,
  "archived" "pg_catalog"."bool" DEFAULT false,
  "partners" "pg_catalog"."text"[] NOT NULL,
  "instagram_caption" "pg_catalog"."text",
  "content_files" "pg_catalog"."text"[],
  "work_files" "pg_catalog"."text"[],
  "sprints" "pg_catalog"."text"[],
  "phase" "pg_catalog"."text" DEFAULT 'idea'::text NOT NULL,
  "content_description" "pg_catalog"."text",
  "strategies" "pg_catalog"."jsonb"
);

ALTER TABLE public."actions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."actions" FROM PUBLIC, anon, authenticated;

GRANT ALL ON public."actions" TO service_role;

CREATE TABLE public."celebrations" (
  "created_at" "pg_catalog"."timestamptz" DEFAULT now() NOT NULL,
  "title" "pg_catalog"."text" NOT NULL,
  "date" "pg_catalog"."text" NOT NULL,
  "id" "pg_catalog"."uuid" DEFAULT gen_random_uuid() NOT NULL
);

ALTER TABLE public."celebrations" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."celebrations" FROM PUBLIC, anon, authenticated;

GRANT ALL ON public."celebrations" TO service_role;

CREATE TABLE public."clients" (
  "id" "pg_catalog"."uuid" DEFAULT gen_random_uuid() NOT NULL,
  "name" "pg_catalog"."text",
  "created_at" "pg_catalog"."timestamptz" DEFAULT now(),
  "active" "pg_catalog"."bool" DEFAULT true NOT NULL,
  "password" "pg_catalog"."text",
  "partners" "pg_catalog"."text"[] NOT NULL,
  "email" "pg_catalog"."text" NOT NULL,
  "image" "pg_catalog"."text",
  "password_hash" "pg_catalog"."text"
);

ALTER TABLE public."clients" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."clients" FROM PUBLIC, anon, authenticated;

GRANT ALL ON public."clients" TO service_role;

CREATE TABLE public."leads" (
  "id" "pg_catalog"."uuid" DEFAULT gen_random_uuid() NOT NULL,
  "name" "pg_catalog"."text" NOT NULL,
  "whatsapp" "pg_catalog"."text" NOT NULL,
  "main_need" "pg_catalog"."text",
  "answers" "pg_catalog"."jsonb" DEFAULT '[]'::jsonb,
  "completed" "pg_catalog"."bool" DEFAULT false,
  "created_at" "pg_catalog"."timestamptz" DEFAULT now(),
  "updated_at" "pg_catalog"."timestamptz" DEFAULT now()
);

ALTER TABLE public."leads" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."leads" FROM PUBLIC, anon, authenticated;

GRANT ALL ON public."leads" TO service_role;

CREATE TABLE public."notifications" (
  "id" "pg_catalog"."uuid" DEFAULT gen_random_uuid() NOT NULL,
  "recipient_id" "pg_catalog"."uuid" NOT NULL,
  "comment_id" "pg_catalog"."uuid",
  "action_id" "pg_catalog"."uuid" NOT NULL,
  "type" "pg_catalog"."text" DEFAULT 'mention'::text NOT NULL,
  "author_name" "pg_catalog"."text" DEFAULT ''::text NOT NULL,
  "action_title" "pg_catalog"."text" DEFAULT ''::text NOT NULL,
  "comment_excerpt" "pg_catalog"."text" DEFAULT ''::text NOT NULL,
  "read_at" "pg_catalog"."timestamptz",
  "created_at" "pg_catalog"."timestamptz" DEFAULT now() NOT NULL
);

ALTER TABLE public."notifications" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."notifications" FROM PUBLIC, anon, authenticated;

GRANT ALL ON public."notifications" TO service_role;

CREATE TABLE public."partners" (
  "id" "pg_catalog"."uuid" DEFAULT gen_random_uuid() NOT NULL,
  "created_at" "pg_catalog"."timestamptz" DEFAULT now() NOT NULL,
  "title" "pg_catalog"."text" NOT NULL,
  "slug" "pg_catalog"."text" NOT NULL,
  "short" "pg_catalog"."text" NOT NULL,
  "users_ids" "pg_catalog"."uuid"[] NOT NULL,
  "context" "pg_catalog"."text",
  "colors" "pg_catalog"."text"[] NOT NULL,
  "image" "pg_catalog"."text",
  "sow" "public"."sow" DEFAULT 'socialmedia'::sow NOT NULL,
  "archived" "pg_catalog"."bool" DEFAULT false NOT NULL,
  "instagram_caption_tail" "pg_catalog"."text",
  "voice" "pg_catalog"."text"
);

ALTER TABLE public."partners" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."partners" FROM PUBLIC, anon, authenticated;

GRANT ALL ON public."partners" TO service_role;

CREATE TABLE public."people" (
  "id" "pg_catalog"."uuid" DEFAULT gen_random_uuid() NOT NULL,
  "created_at" "pg_catalog"."timestamptz" DEFAULT now() NOT NULL,
  "name" "pg_catalog"."text" NOT NULL,
  "email" "pg_catalog"."text",
  "user_id" "pg_catalog"."uuid" NOT NULL,
  "image" "pg_catalog"."text",
  "admin" "pg_catalog"."bool" DEFAULT false NOT NULL,
  "surname" "pg_catalog"."text" NOT NULL,
  "initials" "pg_catalog"."varchar" NOT NULL,
  "short" "pg_catalog"."varchar" NOT NULL,
  "areas" "pg_catalog"."text"[] NOT NULL,
  "visible" "pg_catalog"."bool" DEFAULT true NOT NULL,
  "preferences" "pg_catalog"."jsonb" DEFAULT '{"theme": "system", "defaultViewVariant": "line", "showInstagramSidebar": true}'::jsonb
);

ALTER TABLE public."people" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."people" FROM PUBLIC, anon, authenticated;

GRANT ALL ON public."people" TO service_role;

ALTER TABLE public."action_comments" ADD CONSTRAINT "action_comments_pkey" PRIMARY KEY (id);

ALTER TABLE public."actions" ADD CONSTRAINT "actions_pkey" PRIMARY KEY (id);

ALTER TABLE public."celebrations" ADD CONSTRAINT "celebrations_pkey" PRIMARY KEY (id);

ALTER TABLE public."clients" ADD CONSTRAINT "clients_pkey" PRIMARY KEY (id);

ALTER TABLE public."leads" ADD CONSTRAINT "leads_pkey" PRIMARY KEY (id);

ALTER TABLE public."notifications" ADD CONSTRAINT "notifications_pkey" PRIMARY KEY (id);

ALTER TABLE public."partners" ADD CONSTRAINT "partners_pkey" PRIMARY KEY (id);

ALTER TABLE public."partners" ADD CONSTRAINT "partners_short_key" UNIQUE (short);

ALTER TABLE public."partners" ADD CONSTRAINT "partners_slug_key" UNIQUE (slug);

ALTER TABLE public."people" ADD CONSTRAINT "people_pkey" PRIMARY KEY (id);

ALTER TABLE public."people" ADD CONSTRAINT "people_user_id_key" UNIQUE (user_id);

ALTER TABLE public."action_comments" ADD CONSTRAINT "action_comments_action_id_fkey" FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE;

ALTER TABLE public."actions" ADD CONSTRAINT "actions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE public."notifications" ADD CONSTRAINT "notifications_action_id_fkey" FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE;

ALTER TABLE public."notifications" ADD CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES action_comments(id) ON DELETE CASCADE;

ALTER TABLE public."people" ADD CONSTRAINT "people_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

CREATE INDEX leads_whatsapp_idx ON public.leads USING btree (whatsapp);

CREATE INDEX idx_notifications_recipient ON public.notifications USING btree (recipient_id);

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (recipient_id) WHERE (read_at IS NULL);

CREATE FUNCTION public.update_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
