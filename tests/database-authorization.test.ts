import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Ticket 07: Autorizações Reproduzíveis no Banco", () => {
  const rootDir = resolve(import.meta.dir, "..");
  const migrationPath = resolve(rootDir, "supabase/migrations/20261006030000_database_authorization.sql");
  const inspectSqlPath = resolve(rootDir, "scripts/inspect-db-security.sql");
  const testMatrixSqlPath = resolve(rootDir, "scripts/test-database-matrix.sql");

  const migrationSql = readFileSync(migrationPath, "utf8");
  const inspectSql = readFileSync(inspectSqlPath, "utf8");
  const testMatrixSql = readFileSync(testMatrixSqlPath, "utf8");

  it("garante que todas as tabelas públicas ativam RLS explicitamente", () => {
    const requiredTables = [
      "actions",
      "partners",
      "clients",
      "people",
      "action_comments",
      "dash_sessions",
      "review_links",
    ];

    for (const table of requiredTables) {
      expect(migrationSql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it("garante revogação categórica de privilégios para a role anon nas tabelas privadas", () => {
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.actions FROM anon;");
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.partners FROM anon;");
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.clients FROM anon;");
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.people FROM anon;");
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.action_comments FROM anon;");
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.dash_sessions FROM anon, authenticated;");
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.review_links FROM anon, authenticated;");
  });

  it("garante que funções auxiliares de segurança usam search_path fixo e SECURITY DEFINER", () => {
    expect(migrationSql).toContain("CREATE OR REPLACE FUNCTION public.is_active_member()");
    expect(migrationSql).toContain("CREATE OR REPLACE FUNCTION public.is_active_admin()");
    expect(migrationSql).toContain("SET search_path = public");
  });

  it("garante proteção da tabela people contra auto-promoção a admin por membros comuns", () => {
    expect(migrationSql).toContain("people_update_self_or_admin");
    // Garante que o WITH CHECK exige admin = false para não-admins
    expect(migrationSql).toContain("admin = false");
  });

  it("garante que RPC get_home_actions e get_app_bootstrap derivam auth.uid() e validam identidade", () => {
    expect(migrationSql).toContain("CREATE OR REPLACE FUNCTION public.get_home_actions(");
    expect(migrationSql).toContain("v_auth_uid := auth.uid();");
    expect(migrationSql).toContain("Acesso negado: chamada não autenticada");
    expect(migrationSql).toContain("Acesso negado: identidade solicitada não corresponde à sessão autenticada");

    expect(migrationSql).toContain("CREATE OR REPLACE FUNCTION public.get_app_bootstrap(");
    expect(migrationSql).toContain("REVOKE ALL ON FUNCTION public.get_home_actions");
    expect(migrationSql).toContain("REVOKE ALL ON FUNCTION public.get_app_bootstrap");
  });

  it("garante que o script de inspeção é estritamente somente-leitura", () => {
    const uppercaseInspect = inspectSql.toUpperCase();
    expect(uppercaseInspect).not.toContain("INSERT INTO");
    expect(uppercaseInspect).not.toContain("UPDATE ");
    expect(uppercaseInspect).not.toContain("DELETE FROM");
    expect(uppercaseInspect).not.toContain("DROP TABLE");
    expect(uppercaseInspect).not.toContain("ALTER TABLE");
    expect(uppercaseInspect).toContain("SELECT");
    expect(uppercaseInspect).toContain("PG_POLICIES");
    expect(uppercaseInspect).toContain("INFORMATION_SCHEMA.ROLE_TABLE_GRANTS");
  });

  it("garante que a matriz de teste executa em transação e termina com ROLLBACK", () => {
    expect(testMatrixSql).toContain("BEGIN;");
    expect(testMatrixSql).toContain("ROLLBACK;");
    expect(testMatrixSql).toContain("SET LOCAL ROLE anon;");
    expect(testMatrixSql).toContain("SET LOCAL ROLE authenticated;");
  });
});
