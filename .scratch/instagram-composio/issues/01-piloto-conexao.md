# Comprovar a conexão e as permissões do Instagram

**Status:** piloto técnico concluído. Consumo da sessão do Playground registrado. Proposta para a próxima etapa entregue.

**Bloqueado por:** Nenhum

## Resultado esperado

Verificar com uma conta Empresa de teste a conexão gerenciada e o alcance das permissões necessárias, com relatório do que funcionou.

## Critérios de aceite

- [x] Conectar perfil de teste e verificar publicação de Story e post, listagem de posts e leitura de insights e comentários.
- [x] Registrar permissões, formatos, erros e chamadas observadas no painel, inclusive alternativas se faltarem permissões.
- [x] Medir tamanho de uma pequena amostra importada e estimar crescimento para 15 parceiros.
- [x] Entregar resultado e proposta para aprovação antes da implementação.

## Evidências e estimativa

- Conexão profissional gerenciada validada com `@euchicosousa`. A configuração mostrada pelo proprietário inclui os escopos `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_insights`, `instagram_business_manage_comments` e `instagram_business_manage_messages`. Mensagens não fazem parte da proposta. Na conexão por parceiro, validar o conjunto mínimo e o consentimento pelo projeto da UZZINA.
- Validados no conector o perfil, a listagem de posts, insights da conta, insights de uma publicação e uma primeira página de comentários. Demografia retornou `Not enough users` e `reposts` falhou na mídia testada. Exibir métricas indisponíveis separadamente de zero e consultar métricas compatíveis com cada formato.
- O proprietário confirmou imagem no feed, Reel compartilhado no feed e Stories de imagem e vídeo, inclusive a sequência imagem, vídeo, imagem. O Instagram adaptou a imagem 4:5 para preencher o Story. A leitura posterior da sequência pelo endpoint não foi confirmada, embora a sequência tenha sido vista no app. Stickers e menções ficam em aberto.
- Medição em 22/11, horário de Fortaleza. Uma execução de listagem retornou cinco posts, com cursor para outra página. Apenas ID, data, formato, legenda e permalink somaram 2.941 bytes em JSON UTF-8, cerca de 588 bytes por post. Para 15 parceiros com cinco posts de feed por semana, cerca de 3.900 posts anuais dão 2,3 MB de JSON bruto. A estimativa exclui índices, estrutura interna do PostgreSQL, mídias, Stories, snapshots de insights e comentários. Nenhum dado foi gravado no Supabase.
- A captura de Usage enviada pelo proprietário mostra 15 chamadas de ferramentas nos últimos sete dias, todas associadas a um usuário de teste do Playground, em uma sessão. Em Top apps, são 8 do Instagram e 7 do Composio. O painel também mostra 6 chamadas na métrica de apps gerenciados e taxa de erro de 26,7% (4 de 15). Os 6 são uma métrica separada do total de 15. A captura não consolida as chamadas feitas pelo conector do Codex nem confirma o débito mensal. Uma chamada de listagem foi observada separadamente no Codex. Medir o consumo por operação com o projeto da UZZINA quando a conexão por parceiro estiver preparada.
- Próxima etapa proposta. Em Administração → Parceiros, conectar o Instagram por parceiro, conferir o perfil de destino e estados de conexão com o projeto da UZZINA. Validar com a conta de teste antes de publicar pelo app.

## Referências

[Plano da integração](../../../docs/plans/instagram-composio.md)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
