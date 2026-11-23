# Programar uma publicação do Instagram para uma data

**Status:** código de salvamento/listagem/cancelamento e executor de Stories em produção (`aa63f990`, deploy READY); RPCs aplicadas (`20261123190136`); segredo confirmado na Vercel e no Supabase Vault. Cron ainda não ativado; falta validar a publicação automática real.

**Bloqueado por:** 03

## Resultado esperado

Na gaveta da ação → Instagram → Publicação, programar o conteúdo da ação para uma data e hora. A programação aceita todos os formatos imediatos suportados: imagem no feed, carrossel, vídeo no feed, Reel e Stories. O formato continua vindo da categoria da ação. Para Stories, a equipe seleciona e ordena vários arquivos; cada item da sequência tem seu próprio resultado. Para os outros formatos, a seleção segue as regras de publicação imediata (um arquivo ou carrossel).

## Critérios de aceite

- [x] Preparar salvamento autenticado e listagem local de ocorrências de Stories com snapshot dos arquivos, perfil, horário UTC e fuso; SQL ainda não aplicado.
- [ ] Aceitar imagem de feed, carrossel, vídeo de feed, Reel e Stories, com a validação de mídia já usada na publicação imediata.
- [x] Preparar executor para sequência de Stories, com resultado individual e estados de falha/resultado incerto; ainda sem execução real via Cron.
- [ ] Publicar com app fechado e permitir alterar agendamentos pendentes.
- [ ] Tratar falha parcial, concorrência, reconexão e resposta incerta.
- [ ] Duplicar a ação copia arquivos e conteúdo, sem copiar agendamentos nem histórico.
- [ ] Validar separadamente os cinco formatos no perfil de teste; não considerar testes manuais no painel do Composio como validação do fluxo da UZZINA.

## Etapas de implementação

1. **Preparado localmente:** salvar/listar autenticado, validar parceiro/ação/perfil/conteúdo e cancelar ocorrências pendentes. A gravação em lote é atômica via RPC.
2. **Preparado localmente:** reserva atômica e executor protegido reutilizando o endpoint Instagram existente e o proxy Composio. Envia a sequência na ordem; timeout após pedido de publicação fica incerto, sem repetição automática.
3. **Concluído:** `bun run typecheck`, `bun run test:serverless` (9 endpoints) e build passaram. Migration aplicada como `20261123190136`; segredo confirmado na Vercel e Vault; commit `aa63f990` está publicado em produção com deploy READY.
4. **Pendente:** criar Cron a cada minuto com `pg_cron`/`pg_net` e confirmar estados, erros e chamadas nos logs. A ativação iniciará a publicação automática de ocorrências vencidas.
5. Validar no perfil de teste, com atenção especial à ordem, falha parcial e não duplicação após timeout.

### Ativação do worker

Não agendar jobs antes do deploy Ready da API e da configuração segura do segredo. Gerar um valor próprio com `openssl rand -hex 32`; cadastrá-lo na Vercel como `INSTAGRAM_SCHEDULER_SECRET` e no Supabase Vault como `uzzina_instagram_scheduler_secret`. Não gravar o valor no repositório nem em logs. Depois que a migration estiver aplicada e o deploy estiver Ready, agendar:

```sql
select cron.schedule(
  'uzzina-instagram-publish-worker',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://uzzina.cnvt.com.br/api/instagram-publish',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'uzzina_instagram_scheduler_secret'
        )
      ),
      body := '{"operation":"runDue"}'::jsonb
    );
  $$
);
```

O plano Hobby da Vercel permite Cron no máximo uma vez ao dia, então não atende horário de postagem; o desenho usa Supabase Cron para chamar por HTTP o endpoint existente da UZZINA. Um disparo por minuto equivaleria a 44.640 chamadas em 31 dias; como referência, a página de preços da Vercel mostra 1 milhão de invocações de função por mês incluídas no Hobby. O consumo de computação e o comportamento sob pico precisam ser conferidos no projeto antes de ativar o job. [Supabase Cron](https://supabase.com/docs/guides/cron) · [Preços da Vercel](https://vercel.com/pricing) · [Limites de Cron da Vercel](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing)

## Referências

[Plano da integração](../../../docs/plans/instagram-composio.md)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
