# 15: Tema e paleta persistem a última escolha

**What to build:** Alternâncias rápidas e rede lenta não fazem as preferências voltarem para uma escolha antiga.

**Blocked by:** Nenhum

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

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
- [ ] Última escolha é persistida após a fila esvaziar.
- [ ] Alterações durante write não exigem novo clique para salvar.
- [ ] Conta atual não recebe timer/resposta anterior.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

