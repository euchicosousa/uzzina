"""Reconstruct exported catalogs for disposable PostgreSQL tests, never production.

Usage: python3 scripts/build-db-test-baseline.py inventory.csv > /tmp/baseline.sql
Auth has a minimal users table and auth.uid() claim adapter: this is not GoTrue.
No business data is copied. Application SQL definitions come from the inventory.
"""
import csv
import io
import json
import sys


def identifier(value):
    return '"' + value.replace('"', '""') + '"'


def literal(value):
    return "'" + value.replace("'", "''") + "'"


csv.field_size_limit(2000000)
with open(sys.argv[1], encoding="utf-8") as source:
    inventory = json.loads(next(csv.DictReader(io.StringIO(source.read())))["inventory"])
print("""-- TEST ONLY: metadata reconstructed from the owner's inventory.
DO $$ BEGIN
 IF current_database() NOT LIKE 'uzzina_test_%' THEN
  RAISE EXCEPTION 'Disposable uzzina_test_ database required';
 END IF;
END $$;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='supabase_admin') THEN CREATE ROLE supabase_admin NOLOGIN; END IF;
END $$;
CREATE SCHEMA auth;
CREATE SCHEMA extensions;
CREATE TABLE auth.users(id UUID PRIMARY KEY, aud TEXT, role TEXT, email TEXT, raw_user_meta_data JSONB DEFAULT '{}'::jsonb);
CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
CREATE EXTENSION moddatetime WITH SCHEMA extensions;
SET search_path = public, extensions;
""")
for name in sorted({row["name"] for row in inventory["enums"]}):
    labels = [literal(row["label"]) for row in inventory["enums"] if row["name"] == name]
    print(f"CREATE TYPE public.{identifier(name)} AS ENUM ({','.join(labels)});")
for relation in inventory["relations"]:
    if relation["kind"] != "r":
        raise ValueError("This baseline supports ordinary tables only")
    table = relation["name"]
    columns = []
    for col in sorted(inventory["columns"], key=lambda row: row["ordinal_position"]):
        if col["table_name"] != table:
            continue
        name = col["udt_name"]
        sql_type = identifier(name[1:]) + "[]" if name.startswith("_") else identifier(name)
        sql_type = identifier(col["udt_schema"]) + "." + sql_type
        definition = identifier(col["column_name"]) + " " + sql_type
        if col["column_default"] is not None:
            definition += " DEFAULT " + col["column_default"]
        if col["is_nullable"] == "NO":
            definition += " NOT NULL"
        columns.append(definition)
    print(f"CREATE TABLE public.{identifier(table)} (" + ",\n".join(columns) + ");")
for row in sorted(inventory["constraints"], key=lambda row: row["type"] == "f"):
    print(f"ALTER TABLE public.{identifier(row['table'])} ADD CONSTRAINT {identifier(row['name'])} {row['definition']};")
constraint_names = {row["name"] for row in inventory["constraints"]}
for row in inventory["indexes"]:
    if row["indexname"] not in constraint_names:
        print(row["indexdef"] + ";")
for relation in inventory["relations"]:
    table = identifier(relation["name"])
    if relation["rls_enabled"]:
        print(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;")
    print(f"GRANT ALL ON public.{table} TO anon, authenticated, service_role;")
for function in inventory["functions"]:
    print(function["definition"] + ";")
for row in inventory["policies"]:
    roles = ",".join(identifier(role) for role in row["roles"])
    policy = f"CREATE POLICY {identifier(row['policyname'])} ON public.{identifier(row['tablename'])} AS {row['permissive']} FOR {row['cmd']} TO {roles}"
    if row["using_expression"] is not None:
        policy += f" USING ({row['using_expression']})"
    if row["check_expression"] is not None:
        policy += f" WITH CHECK ({row['check_expression']})"
    print(policy + ";")
for function in inventory["functions"]:
    signature = f"{identifier(function['schema'])}.{identifier(function['name'])}({function['arguments']})"
    print(f"REVOKE ALL ON FUNCTION {signature} FROM PUBLIC, anon, authenticated, service_role;")
    for role in function["execute_roles"]:
        if role["allowed"]:
            print(f"GRANT EXECUTE ON FUNCTION {signature} TO {identifier(role['role'])};")
for trigger in inventory["triggers"]:
    print(trigger["definition"] + ";")
for owner in ("postgres", "supabase_admin"):
    print(f"ALTER DEFAULT PRIVILEGES FOR ROLE {owner} IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;")
    print(f"ALTER DEFAULT PRIVILEGES FOR ROLE {owner} IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;")
