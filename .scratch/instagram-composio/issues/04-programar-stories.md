# Programar uma publicação do Instagram para uma data

**Status: concluído (25/11/2026).** Aceito pelo proprietário (calendário mostra os itens do dia; margem de 2 min, cancelamento, tentar novamente e copiar funcionando; os demais testes ficam para depois, e o ticket reabre se houver erro). Histórico: salvamento/listagem/cancelamento e executor de Stories em produção (`aa63f990`, deploy READY); RPCs aplicadas (`20261123190136`); segredo na Vercel e no Vault; Cron ativo a cada minuto. Três Stories foram publicados automaticamente via worker. Correção da RPC aplicada como `20261123195548`. A revisão `05b7e5a4`, com o calendário Publicações, tem registro de deploy bem-sucedido em 23/11 e inclui a margem de dois minutos no cliente e na API. Programação aceita pelo proprietário em 25/11/2026. Em 26/11, o proprietário confirmou que duplicar uma ação não leva seus agendamentos e aprovou o calendário `/app/instagram`. [Estado e evidências](../../../docs/audits/CURRENT.md)

**Dependência:** [publicação imediata](03-publicar-agora.md), já usada em produção. A cobertura individual dos formatos segue em aberto.

## Resultado esperado

Na gaveta da ação → Instagram → Publicação, programar o conteúdo da ação para uma data e hora. A programação aceita todos os formatos imediatos suportados: imagem no feed, carrossel, vídeo no feed, Reel e Stories. O formato continua vindo da categoria da ação. Para Stories, a equipe seleciona e ordena vários arquivos; cada item da sequência tem seu próprio resultado. Para os outros formatos, a seleção segue as regras de publicação imediata (um arquivo ou carrossel).

## Critérios de aceite

- [x] Salvar e listar ocorrências de Stories com sessão autenticada e snapshot dos arquivos, perfil, horário UTC e fuso. SQL aplicado em produção.
- [ ] Aceitar imagem de feed, carrossel, vídeo de feed, Reel e Stories, com a validação de mídia já usada na publicação imediata.
- [x] Executor de sequência validado pelo Cron: três Stories chegaram ao estado publicado com resultado individual.
- [x] Publicar com app fechado via Cron e permitir cancelar ocorrências pendentes; alteração de horário ainda não está disponível.
- [ ] Tratar falha parcial, concorrência, reconexão e resposta incerta.
- [x] Duplicar a ação não copia agendamentos (confirmado pelo proprietário em 26/11).
- [x] Conferir em produção a tela Publicações (`/app/instagram`). Selecionar um parceiro conectado, escolher um dia com evento e abrir a ação. O proprietário dá o aceite visual.
- [ ] Validar separadamente os cinco formatos no perfil de teste; não considerar testes manuais no painel do Composio como validação do fluxo da UZZINA.

## Etapas de implementação

1. **Publicado:** salvar/listar autenticado, validar parceiro/ação/perfil/conteúdo e cancelar ocorrências pendentes. A gravação em lote é atômica via RPC.
2. **Publicado:** reserva atômica e executor protegido reutilizando o endpoint Instagram existente e o proxy Composio. Envia a sequência na ordem; timeout após pedido de publicação fica incerto, sem repetição automática.
3. **Concluído:** `bun run typecheck`, `bun run test:serverless` (9 endpoints) e build passaram. Migration aplicada como `20261123190136`; segredo confirmado na Vercel e Vault; commit `aa63f990` está publicado em produção com deploy READY.
4. **Concluído:** Cron ativo a cada minuto. Após corrigir o limite SQL de `GREATEST/LEAST`, três Stories foram publicados automaticamente; detalhes e limites em [relatório de validação](../../../docs/audits/2026-11-23-instagram-scheduler-smoke.md).
5. **Publicado, com conferência pendente:** verificar a seleção de horário com margem de dois minutos e a tela Publicações com calendário mensal, lista diária e atualização manual. Permanecem os testes específicos de falha parcial e não duplicação após timeout. A Planta encaminha a triagem. A Prova prepara a leitura do calendário para aceite do proprietário.

### Ativação do worker

Registro do procedimento já executado em produção. Para instalação futura em outro ambiente autorizado, confirmar o deploy Ready da API e a configuração segura do segredo antes de agendar. Gerar um valor próprio com `openssl rand -hex 32`; cadastrá-lo na Vercel como `INSTAGRAM_SCHEDULER_SECRET` e no Supabase Vault como `uzzina_instagram_scheduler_secret`. Não gravar o valor no repositório nem em logs. Depois que a migration estiver aplicada e o deploy estiver Ready, agendar:

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

O plano Hobby da Vercel permite Cron no máximo uma vez ao dia, então não atende horário de postagem; o desenho usa Supabase Cron para chamar por HTTP o endpoint existente da UZZINA. Um disparo por minuto equivaleria a 44.640 chamadas em 31 dias; como referência, a página de preços da Vercel mostra 1 milhão de invocações de função por mês incluídas no Hobby. O consumo de computação e o comportamento sob pico seguem como pontos de acompanhamento. [Supabase Cron](https://supabase.com/docs/guides/cron) · [Preços da Vercel](https://vercel.com/pricing) · [Limites de Cron da Vercel](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing)

## Referências

[Plano da integração](../../../docs/plans/instagram-composio.md)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
