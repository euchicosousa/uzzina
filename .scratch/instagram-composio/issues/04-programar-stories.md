# Programar uma publicação do Instagram para uma data

**Status:** escopo ampliado em 23/11/2026; implementação ainda não iniciada.

**Bloqueado por:** 03

## Resultado esperado

Na gaveta da ação → Instagram → Publicação, programar o conteúdo da ação para uma data e hora. A programação aceita todos os formatos imediatos suportados: imagem no feed, carrossel, vídeo no feed, Reel e Stories. O formato continua vindo da categoria da ação. Para Stories, a equipe seleciona e ordena vários arquivos; cada item da sequência tem seu próprio resultado. Para os outros formatos, a seleção segue as regras de publicação imediata (um arquivo ou carrossel).

## Critérios de aceite

- [ ] Guardar seleção, snapshot das mídias, perfil conectado, formato fixo da categoria, data, fuso, legenda aplicável e ordem.
- [ ] Aceitar imagem de feed, carrossel, vídeo de feed, Reel e Stories, com a validação de mídia já usada na publicação imediata.
- [ ] Executar e apresentar resultados por ocorrência; sequência de Stories preserva a ordem e registra cada Story individualmente.
- [ ] Publicar com app fechado e permitir cancelar ou alterar agendamentos pendentes.
- [ ] Tratar falha parcial, concorrência, reconexão e resposta incerta.
- [ ] Duplicar a ação copia arquivos e conteúdo, sem copiar agendamentos nem histórico.
- [ ] Validar separadamente os cinco formatos no perfil de teste; não considerar testes manuais no painel do Composio como validação do fluxo da UZZINA.

## Etapas de implementação

1. Salvar e listar programações autenticadas, validando autorização da ação, perfil atual, formato, arquivos e horário futuro. Reusar as tabelas já aplicadas em produção.
2. Implementar reserva atômica das ocorrências vencidas e um executor protegido que reutilize o fluxo de publicação da UZZINA sem exigir sessão interativa. Ele será adicionado ao endpoint Instagram já existente para não aumentar a contagem de funções Vercel.
3. Acionar esse executor por Supabase Cron e acompanhar estados, resultados, erros e itens parciais/incertos.
4. Permitir cancelar ou alterar ocorrências ainda pendentes e mostrar a programação na ação.
5. Validar no perfil de teste, com atenção especial a sequência parcial de Stories e a não duplicação após timeout.

O plano Hobby da Vercel permite Cron no máximo uma vez ao dia, então não atende horário de postagem; o desenho usa Supabase Cron para chamar por HTTP o endpoint existente da UZZINA. Um disparo por minuto equivaleria a 44.640 chamadas em 31 dias; como referência, a página de preços da Vercel mostra 1 milhão de invocações de função por mês incluídas no Hobby. O consumo de computação e o comportamento sob pico precisam ser conferidos no projeto antes de ativar o job. [Supabase Cron](https://supabase.com/docs/guides/cron) · [Preços da Vercel](https://vercel.com/pricing) · [Limites de Cron da Vercel](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing)

## Referências

[Plano da integração](../../../docs/plans/instagram-composio.md)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
