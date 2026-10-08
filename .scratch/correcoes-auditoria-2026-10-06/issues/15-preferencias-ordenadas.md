# 15: Tema e paleta persistem a última escolha

**What to build:** Alternâncias rápidas e rede lenta não fazem as preferências voltarem para uma escolha antiga.

**Blocked by:** Nenhum

**Status:** código e navegador controlado verificados; banco real/produção pendentes.

## Execução prescrita
Arquivos: app/components/layout/Header.tsx (HeaderMenu); app/lib/preferences.ts; hooks de tema.
1. Extrair controlador de persistência usado realmente por HeaderMenu, com debounce250ms, um write em voo e pending patch por campo. Usar último valor escolhido; resposta antiga não remove pendência nova.
2. Write retorna confirmação do servidor; estado confirmado + patches pendentes formam preferências atuais. Quando write termina, despachar próximo patch sem depender de novo clique. Falha conserva pendência, mensagem e tentativa explícita.
3. Unmount cancela timer sem usar identidade antiga na nova tela. Escolha já em voo pode concluir, mas não altera UI de outra conta. Mudança de person reinicializa controlador.
4. Preservar preferências desconhecidas no JSON. Persistência por RPC de merge parcial no servidor, com auth.uid()=dono e chaves permitidas de preferências atuais; transação faz merge do patch com preferences, sem devolver controle admin ao browser. Migration e grants complementam07.
5. Atualização visual permanece imediata; status de persistência não bloqueia troca de tema.

## Testes e alcance
Interface: HeaderMenu real (exportação nomeada para montagem se necessário) e controlador de produção usado por ele; SDK/clock falsos. ThemeA→paletteB enquanto write1 pendente: final tem ambos; falha1 não perde alteração2; remount comB não escreve preferênciasA. Mock não é um objeto local com fila inventada.
BANCO: merge parcial e permissão da RPC pendentes se sem acesso. NAVEGADOR: N14 do17.

## Acceptance criteria
- [x] Última escolha é persistida após a fila esvaziar.
- [x] Alterações durante write não exigem novo clique para salvar.
- [x] Conta atual não recebe timer/resposta anterior.

## Resultado do executor — 07/10/2026
HEAD `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`; alterações anteriores preservadas. Nenhuma migration aplicada ou gravação real.

**Defeito comprovado antes da correção:** `check-preferences-browser.cjs` abriu o HeaderMenu real, segurou a resposta da troca de tema e escolheu outra paleta. Observou duas gravações simultâneas onde deveria haver uma; falhou com `2 !== 1`. A fila anterior também substituía o JSON inteiro e não oferecia recuperação visível da falha.

**Alterações:**
- `app/lib/preference-persistence.ts`: controlador realmente usado pela UI; debounce250ms, uma gravação, patch por campo, confirmação do servidor com pendências mais recentes sobrepostas. Falha devolve campos à fila sem sobrescrever escolha nova e aguarda retry explícito. Dispose/identidade invalidam timers e callbacks antigos.
- `app/hooks/usePreferencePersistence.ts`: integra RPC, geração de sessão do QueryClient, dono por montagem e mensagem PT-BR; HeaderMenu oferece **Tentar salvar preferências**. Atualização visual continua imediata. Mantido o objeto person existente como origem das preferências para o perfil; nenhum provider genérico novo.
- `Header.tsx`: removida fila antiga; usa o controlador. `profile.tsx`: dados do perfil continuam pelo caminho existente, preferências passam pelo merge RPC. Se RPC falhar, formulário não anuncia sucesso. Operações de perfil/dados e preferências são separadas, não uma transação única.
- `app/routes/app.tsx`: bootstrap aplica também tema salvo da conta, além da paleta; impede herdar tema local de outra conta após recarga/troca.
- `20261007020000_preferences_merge.sql`: `update_my_preferences(p_patch)` deriva auth.uid(), exige membro ativo, valida seis chaves/tipos/paleta/cores, faz merge atômico e conserva chaves futuras existentes. Revoga UPDATE direto de preferences; perfil migrou para RPC. Não permite escolher dono nem alterar admin. Types, AGENTS, Knowledge Item e matriz SQL atualizados.

**Evidências:** seis testes do controlador de produção passaram: confirmação/merge, última escolha, erro/retry, debounce, unmount e identidade/resposta antiga. HeaderMenu real passou em Chromium1440 e390 com toque emulado: prévia imediata, write1 atrasado sem write2 simultâneo, envio automático da pendência, recarga com última escolha, chave futura preservada, erro sem perder escolha e retry. Script também verifica o perfil pelo novo contrato. Serviços HTTP e persistência fictícios; isto não prova PostgreSQL ou persistência física.

**Reprodução:** app local5177; configurar `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_EXECUTABLE`, `PORTAL_TEST_URL`; executar `node scripts/check-preferences-browser.cjs`. Móvel: `PREFERENCES_TEST_WIDTH=390`. Não usa dados reais.

**Condição de implantação:** migration NÃO aplicada. Sem RPC, salvar preferências retorna erro recuperável. Frontend e migration07/15 devem ser implantados de forma compatível. A matriz SQL inclui merge/chaves desconhecidas, grants, rejeição de tipos/chaves arbitrárias e membro inativo; ainda não executada. Disputa em duas conexões reais também pendente. Não certificar banco pela fila JavaScript ou resposta HTTP controlada.

Verificação final da rodada:254 testes/0 falhas/752 asserções/20 arquivos; tipagem, lint sem avisos e build passam. Aviso de chunks>500kB já existente. A contagem menor resulta da retirada rastreável de cópias descrita no16, não da omissão de falhas.

Verificação adicional do perfil: salvamento pelo RPC passou em1440 e390. Em1440, resposta dos dados do perfil foi atrasada e houve logout antes de liberá-la; o callback antigo não enviou preferências nem atualizou UI/localStorage após a troca de geração. `profile.tsx` verifica geração antes da segunda operação e ao receber confirmação. Esse cenário adicional de logout ainda não foi repetido em390.

## Passo2 — validação PostgreSQL local,07/10/2026

Migration executada em PostgreSQL15.1 temporário com baseline exportado reconstruído, sem dados reais. Matriz e duas conexões/locks passaram: quota com uma reserva permitida, preferências sem perder patches/campos desconhecidos. Resultado em docs/audits/2026-10-07-passo-2-banco-de-teste.md. Supabase/GoTrue/PostgREST/produção ainda não homologados; banco enviado não foi alterado.
