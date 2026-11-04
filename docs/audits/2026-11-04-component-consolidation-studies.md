# Consolidação de componentes UZZINA — 04/11/2026

Estudos por três subagentes somente leitura, a pedido do proprietário. Não autorizam refatoração automática.

## Sprint e responsáveis

Possível componente UPeopleCombobox com mode responsibles/sprint (isSprint também viável). Compartilhar consulta, filtro por parceiros, busca, lista, avatares e aparência de Responsáveis. Regras por modo e callback tipado permanecem distintas.

Sprint adiciona pessoa fora dos responsáveis às duas listas; remover sprint mantém responsável; Shift torna somente a sprint exclusiva. Callback entrega as duas listas para gravação conjunta. Sprint fecha após seleção; Responsáveis fica aberto no clique comum. Apresentação atual também difere, pois Sprint usa grupo de até dois avatares e contador, enquanto Responsáveis exibe nomes.

Dois consumidores operacionais: EssentialsTab e ActionFormFooter; diálogos de lote são independentes. Migrar preservando esses contratos antes de remover os componentes antigos.

## Nomes

Recomendação U para componentes compartilhados próprios, Prism para primitivos, nomes de domínio para páginas/estruturas de fluxo. CalendarToolbar e seletores próprios podem ganhar U. UIcons.tsx exporta Icons, uma inconsistência concreta.

Uzzina*Section identifica arquivos de documentação da galeria, não uma terceira família operacional. São 19 arquivos encontrados nesta convenção. Padronizar por grupos atualizando arquivo/export/imports/galeria/referências, em rodada separada das mudanças funcionais.

## Loaders

ULoader tem 12 usos operacionais concentrados no cadastro do parceiro. Encontrados 16 spinners externos a ele: oito carregamentos de página (portal/revisão, administração e redefinição de senha) e oito inline (BulkActionMenu, três InstagramTab, EssentialsTab, ActionFormFooter, criação de data e Sonner).

Priorizar indicadores inline, preservando escala de botão (12/16/20px). Páginas podem usar 32/48px após decidir o atual caso de 40px da revisão. ULoader precisa permitir cor herdada, atributos acessíveis e nomes dos controles; hoje força text-muted-foreground. Skeletons, blocos pulsantes e gradiente de IA cumprem outras funções e ficam fora dessa migração.

## UToggleInput para PrismToggle

Um consumidor operacional no cadastro do parceiro e a galeria. Wrapper atual tem checkbox nativo; formulário lê archived igual a on. PrismToggle é botão aria-pressed. Usar estado controlado isSelected/onChange, preservar autosave e incluir hidden input name archived/value on apenas quando marcado. Resolver aparência do estado Arquivado, pois PrismToggle não oferece variante destructive atual. Não há consumidor operacional da opção radio.

## Mudança autorizada já aplicada

RichTextEditor compactToolbar agora tem padrão true, com opção explícita false preservando barra completa. Consumidores com valor explícito continuam escolhendo sua apresentação. Testes de teclado ajustados para verificar ambos os modos.

Aceites explícitos registrados nesta rodada: RichTextEditor, UAdminItemCard (V29), UAvatarSelector (V28) e UPreferenceSwitch (V27), com sinal de OK no cabeçalho/menu. Demais propostas acima permanecem em estudo.
