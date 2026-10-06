# 16: Provar as demais correções com componentes reais

**What to build:** Busca, calendário, arquivados, stories e notificações continuam funcionando com estados corretos, além dos fluxos críticos.

**Blocked by:** 01, 09, 11, 13, 15

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Arquivos: GlobalSearchCommand; routes/dash/index; models/queries de people; admin/users; AdminGuard; comboboxes; useActionShortcut; Header; InstagramTab/ActionFormDrawer.
1. Substituir testes antigos restantes conforme classificacao-dos-testes.md, em pequenos ciclos por comportamento. Não refatorar todas as views para teste; criar providers reais/SDK externo falso.
2. Busca real: parceiro acessível entre múltiplos, parceiro ausente com fallback e resposta antiga descartada. Erro tem estado explícito, não resultado vazio de sucesso.
3. Calendário real: navegar janeiro31→fevereiro→março e dezembro→janeiro. Capturar query HTTP (ou dash-client real com fetch falso) e comparar datas literais esperadas domingo–sábado, usando clock fixo e TZ=America/Fortaleza. Não testar só addMonths.
4. fetchPeople/fetchAllPeople reais: captura de consulta visible=true vs consulta administrativa; montar lista admin com ativo/arquivado e verificar seções.
5. Guard real com person comum/admin; é teste da UI. Checagem administrativa no servidor/banco continua06/07.
6. Combobox compacto montado: getByRole encontra nome acessível. Hook de atalho real em alvo focado, preservando inputs/editors. Stories monta abaInstagram; post/reels/carousel e estratégias têm rótulos reais; funçãoisSocialMediaContent atual permanece.
7. Header real: notificação comdata inválida não quebra; vazio correto; sininho temnome eabre. DOM pode verificar estado e rótulo, não posicionamento/portal na tela.
8. Retirar simulações substituídas e registrar tabela antigo→novo ou →Nxx. Manter cobertura de cada comportamento necessário sem preservar contagem55 como meta.

## Testes e alcance
Interface: componentes/hooks/models listados, produção real. A classificação define o limite: getBoundingClientRect falsificado não encerra visibilidade, clique simulado não encerra touch, label string inventada não encerra componente.
NAVEGADOR: N15/N16 e referências cruzadas do17.

## Acceptance criteria
- [ ] Nenhum teste restante usa regra copiada como objeto sob teste.
- [ ] Erros/vazio/sucesso são observados em UI real montada.
- [ ] Casos de geometria são retirados da contagem local e marcados no17.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

