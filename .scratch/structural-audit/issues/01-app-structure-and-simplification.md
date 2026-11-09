# ARQ-01 — Auditar a estrutura da UZZINA e propor simplificações

**Status.** Aberto para investigação. A entrega é um relatório da estrutura atual e uma proposta de mudanças priorizadas.

**Bloqueado por.** Nenhum ticket para iniciar a investigação. Cada mudança proposta depende de autorização explícita do proprietário.

## Objetivo

Entender quais partes da UZZINA sustentam os fluxos atuais, quais mantêm caminhos antigos e onde uma mudança simples exige editar vários lugares. Identificar módulos que podem ser retirados com segurança, responsabilidades que podem ficar em um só lugar e partes que vale manter como estão por causa de seus contratos. O proprietário deve conseguir decidir o que vale mexer pelo efeito que a mudança teria em um fluxo reconhecível do app ou no trabalho de manutenção.

## Cobertura

- **App interno.** Sessão e carregamento inicial, Hoje e Home, telas do parceiro, calendários, Kanban, Sprint, busca, notificações, gaveta de ação, Instagram, Minha Conta, administração, Planejamento e entrada de Leads.
- **Superfícies públicas.** Página inicial, portal de clientes e revisão pública. Conferir separação de identidade, permissões e dependências compartilhadas com a equipe. Integrações com outros repositórios entram como fronteiras, pelo que a UZZINA consome ou expõe.
- **Camadas de suporte.** Rotas e componentes Prism/Uzzina, hooks e contextos, estado e cache, modelos e serviços, APIs e execução em segundo plano, integrações, contratos de banco, scripts, build, configuração de deploy, testes e dependências diretas.

## Como conduzir

1. **Fixar a base.** Registrar commit, estado do checkout, contratos lidos e quais ambientes a evidência representa. Inventariar pontos de entrada e montar um mapa de responsabilidades e dependências. Cobrir todas as áreas acima, marcando profundidade e lacunas. Rastrear de ponta a ponta pelo menos salvar uma ação, abrir um conteúdo pela revisão pública e gerar uma estratégia. Nesses percursos, mostrar onde ficam autorização, validação, regras de negócio, atualização de estado e tratamento de falha.
2. **Verificar candidatos a remoção.** Investigar módulos, exports, rotas, handlers, scripts, dependências e configurações aparentemente sem uso. Cruzar referências com rotas geradas, imports dinâmicos, aliases, comandos de pacote, rewrites, tarefas agendadas, chamadas externas, triggers e RPCs quando aplicável. Classificar separadamente ausência de uso demonstrada, código preservado ou fluxo adormecido, e uso inconclusivo. Registrar as verificações feitas e o que ainda depende de confirmação externa. Ausência de import estático, por si só, não sustenta remoção.
3. **Procurar simplificações com efeito concreto.** Investigar responsabilidades espalhadas, regras duplicadas que podem divergir, dependências circulares, componentes ou hooks que concentram fluxos distintos, camadas que apenas repassam dados e caminhos paralelos de leitura, escrita ou autenticação. Para cada candidato, mostrar um exemplo de manutenção ou falha, onde a regra vive hoje, onde ficaria e por que o custo da mudança compensa. Conferir se caminhos semelhantes têm diferenças intencionais de identidade, cache, permissões ou compatibilidade.
4. **Ordenar propostas que possam ser aprovadas separadamente.** Comparar benefício, evidência, esforço, risco de regressão e dependências. Identificar ganhos pequenos e seguros, mudanças maiores que pedem preparação e itens a manter ou adiar. Para mudanças maiores, dividir por fluxo verificável, explicitar o que precisa acontecer primeiro e como validar ou reverter cada etapa. Se houver impacto no banco ou na publicação, separar código local, aplicação de SQL, validação e deploy.

## Critérios de conclusão

- [ ] O relatório apresenta um mapa da arquitetura atual, a matriz de cobertura e os percursos rastreados. Explica o que foi verificado em código, o que foi reproduzido com dados controlados e o que segue inconclusivo, sem extrapolar para produção.
- [ ] Cada achado prioritário inclui evidência rastreável, o fluxo e o local que o proprietário reconhece, o antes e o depois proposto, dependências, esforço, risco e uma verificação objetiva. Candidatos a remoção têm justificativa separada de propostas de simplificação.
- [ ] O resumo executivo indica as primeiras decisões para o proprietário, com opções de manter, retirar, simplificar ou investigar melhor. Para mudanças sem diferença visual esperada, diz o que deve continuar funcionando na tela e qual trabalho de manutenção ficaria mais simples.
- [ ] A entrega fica em relatório e proposta. Qualquer verificação executável usa ambiente isolado e dados fictícios, com preservação das mudanças externas no checkout. Nenhum código de implementação, exclusão de módulo, branch de implementação, SQL aplicado ou publicação faz parte desta etapa.

## Modelos sugeridos

- **Codex — GPT-6 Astra, raciocínio extra-alto (preferido).** Cruzar toda a arquitetura e arbitrar candidatos a remoção que dependem de evidências em rotas, servidor, banco e deploy.
- **Codex — GPT-6.1 Sol, raciocínio extra-alto.** Conduzir o estudo por fluxos, rastreando regras duplicadas e produzindo propostas pequenas com critérios de validação.
- **Codex — GPT-6.1 Terra, raciocínio extra-alto.** Aprofundar o inventário de dependências e os caminhos de execução quando a principal dificuldade for comprovar uso indireto.
