# Planejamento — travamento e avisos do console

Investigação em 19/11/2026, na `main` local. O Terra leve investigou entrada direta com parceiro fictício, seleção e recarga. O ensaio inicial usava o cache da fixture preenchido com uma lista vazia de datas comemorativas. Nessa condição a tela abriu com respostas 200 e 404 para a consulta de propostas.

## Travamento reproduzido

Ao remover a lista de comemorações do cache da fixture e simular resposta indisponível para essa consulta, a versão anterior da rota gerou `Maximum update depth exceeded` no Chromium. A pilha apontou para a atualização da coleção React Aria através do componente `<item>`. Enquanto a consulta não devolvia dados, o fallback criava um array vazio em cada renderização. A dependência do efeito mudava, o efeito gravava outro array vazio e disparava a próxima renderização. O aviso do roteador vinha depois da exceção.

Em uma cópia temporária, a troca isolada do fallback por um array vazio estável fez a tela carregar sem o erro nas mesmas condições. Na correção local, o fallback é estável e o efeito também conserva o estado anterior quando a seleção continua igual. Isso evita atualizações repetidas durante carregamento ou falha. [Rota](../../../app/routes/app/planejamento.tsx)

## Outros sinais do console

- **404 ao listar propostas.** A resposta simulada reproduziu os registros da captura com a tela aberta. É uma falha da consulta de propostas, distinta da lista de comemorações usada para reproduzir o travamento. A causa do 404 no ambiente real continua sem confirmação nesta rodada. [Consulta de propostas](../../../app/models/social_plans.ts)
- **Aviso de `<Focusable>`.** Não apareceu nas rotas e interações reproduzidas pelo Terra. A captura indica que algum filho recebe foco sem papel interativo compatível. Sua origem exata permanece em aberto.

As verificações usaram componentes reais em cópia isolada, parceiros fictícios, respostas controladas e bloqueio de rede externa. Nenhuma consulta real, migração, commit ou publicação.

Na mesma cópia, a Mesa atual abriu com a consulta de comemorações indisponível. O Chromium também confirmou o 60º dia disponível e o 61º bloqueado pelo calendário, os sete conteúdos em três dias, e a composição 3/2/1 mantendo seis itens na lista.
