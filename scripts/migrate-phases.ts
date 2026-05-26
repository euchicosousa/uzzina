import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão configurados no ambiente.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function run() {
  console.log("Iniciando migração de fases...");
  console.log(`Conectando ao banco de dados: ${supabaseUrl}`);

  // 1. Busca quantidade de linhas que serão afetadas
  const { count, error: countError } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("phase", "fazer");

  if (countError) {
    console.error("Erro ao buscar contagem de ações:", countError);
    process.exit(1);
  }

  console.log(`Encontradas ${count} ações na fase 'fazer'.`);

  if (count === 0) {
    console.log("Nenhuma ação precisa ser migrada. Migração finalizada.");
    process.exit(0);
  }

  // 2. Executa a migração
  const { error: updateError } = await supabase
    .from("actions")
    .update({ phase: "estrategia" })
    .eq("phase", "fazer");

  if (updateError) {
    console.error("Erro durante a atualização das fases:", updateError);
    process.exit(1);
  }

  console.log("Migração de fase concluída com sucesso! Todas as ações 'fazer' agora são 'estrategia'.");
  process.exit(0);
}

run();
