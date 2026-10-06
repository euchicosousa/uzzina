# 08: Atualizar ação com conflito explícito

**What to build:** Uma gravação baseada em versão antiga não sobrescreve silenciosamente outra edição.

**Blocked by:** Nenhum

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Arquivos: app/lib/supabase.mutations.ts; app/hooks/useActionMutations.tsx; app/utils/validation.ts; componentes que chamam handleAction; API de arquivos do04 se já existir. Criar migration de timestamp canônico.
1. Usar updated_at confirmado como versão, preservando string exata recebida do banco. Novo contrato updateActionClient(id, patch, expectedUpdatedAt). Metadado expectedUpdatedAt não é coluna do patch nem campo livre do formulário.
2. Migration: preencher updated_at NULL de registros legados e definir default de servidor para inserts. Trigger BEFORE UPDATE em actions define NEW.updated_at = greatest(clock_timestamp(), OLD.updated_at + interval '1 microsecond'), tratando legado NULL com coalesce. Levantar triggers existentes antes de adicionar para evitar dois donos de updated_at; registrar conflito concreto se houver.
3. UPDATE filtra id E updated_at esperado, retorna linha confirmada. Zero linhas → ActionConflictError tipado; não retornar sucesso, não reenviar automaticamente sobre versão nova. Nenhum caller pode omitir versão em update; criação é separada.
4. Adaptar todos os caminhos de update de ação única (gaveta, calendário, Kanban e portal work_files) para fornecer versão canônica. A API do portal exige expectedUpdatedAt e devolve409 em conflito. Reads retornam versão.
5. Remover updated_at gerado pelo browser como fonte de verdade. Cache/gaveta usam timestamp da resposta; exibir “Esta ação mudou. Recarregue antes de salvar” em conflito, preservando edição para recuperação.
6. Bulk recebe tratamento por ID no11. Marcar incompatibilidade até esse ticket, sem liberar migrations/API incompatíveis em produção.

## Testes e alcance
Interface: updateActionClient real e handler de arquivos real; SDK externo falso inspeciona filtro esperado. Casos: patch omisso preserva campos; retorno vazio é conflito; resposta dá nova versão; segunda atualização usa nova versão. Banco real: duas transações lendo V e tentando salvar; só uma confirma. Migration pendente não vira teste aprovado.
NAVEGADOR: N07 do17.

## Acceptance criteria
- [ ] Updates não têm sucesso com zero linhas.
- [ ] Versão é retornada pelo banco e usada sem reformatar.
- [ ] Conflito preserva edição e tem mensagem específica.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.
