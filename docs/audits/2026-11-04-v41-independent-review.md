# V41 — revisão independente da migração de nomes

Revisão em 04/11/2026 pelo coordenador e subagente econômico Luna, somente leitura do código. Base `d7efe5f`, entrega `57a7be3`; checkout limpo ao iniciar. Os documentos de tickets incluídos nesse commit também incorporam a atualização documental da rodada anterior.

## Resultado

Não encerrar ainda. A migração real foi feita: nove arquivos foram renomeados de features para uzzina, com símbolos/tipos/imports e consumidores atualizados. `Icons` virou `UIcons` no arquivo já existente; `UPeopleCombobox` já existia pelo V40. Não foram encontrados os antigos arquivos de compatibilidade nem aliases `New as Old`. O tamanho do diff se explica principalmente pelos consumidores e pela documentação, sem comprovar por si um problema.

## Correções necessárias

1. **Mudança de comportamento e visual fora do escopo:** `app/components/uzzina/UActionDatePicker.tsx:64–99` não é somente renomeação. Foram removidos `cellSize="sm"`, divisor, rótulo visível e tamanho sm do campo de hora; adicionados caption dropdown, posição bottom, ciclo de 24 horas e novo texto do gatilho. Sem data, o campo agora mostra 12:00 e editar a hora cria uma data atual; `setHours(hour, minute, 0, 0)` também zera segundos/milissegundos antes preservados. Ao fechar o popover, `handleOpenChange` chama `onSelect` para essa nova data. Restaurar o comportamento/visual anterior mantendo nomes/imports U; qualquer mudança funcional exige decisão própria. Este é o bloqueador de encerramento, por contrariar o critério explícito de migração mecânica do V41 e reabrir visual aprovado.
2. **Rótulos da galeria incompletos:** `UzzinaPhaseIconSection.tsx:68/117/120` e `UzzinaPartnerCelebrationsSelectorSection.tsx:134/175/178` ainda apresentam os nomes sem U em playground/cabeçalho, enquanto o menu usa o nome novo. Alinhar esses rótulos sem alterar IDs/hashes existentes.
3. **Registro de commit desatualizado:** o ticket ainda indicava somente registro em d7efe5f e o índice dizia Em preparação. Corrigido nesta revisão para `57a7be3`, preservando o status de revisão com ajustes pendentes.

## Limites

Busca de referências, comparação dos renomes e leitura dos consumidores. A alteração no teste de persistência de Planejamento é formatação, sem mudança semântica identificada. Sem teste visual nesta rodada, sem escrita em produção e sem mudanças no código pelo revisor. `node node_modules/typescript/bin/tsc --noEmit` passou no coordenador.

## Resolução dos achados — 04/11/2026

Por autorização do proprietário, UActionDatePicker foi restaurado integralmente da base d7efe5f, com a única alteração do nome exportado. Comparação integral antes/depois confirmou esse limite. Os seis rótulos apontados na galeria foram atualizados para os nomes U, preservando IDs/hashes. Prettier/Biome/typecheck passaram. Achados encerrados localmente; migração permanece em 57a7be3 e correções finais ainda sem novo commit. O resultado inicial acima é histórico anterior à correção. Sem teste visual/deploy nesta rodada.

## Aceite final — 04/11/2026

Proprietário aprovou o V41 integralmente e autorizou encerramento/commit das correções. Achados resolvidos e ticket encerrado; as pendências descritas acima representam o histórico anterior ao aceite.
