# IA-M02 — Planejar Minha Conta em abas

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para propor abas, navegação e salvamento com base na tela atual.
- **Anthropic** — Claude Haiku 5.5, para propor abas, navegação e salvamento com base na tela atual.
- **Google** — Gemini 3.8 Flash, para propor abas, navegação e salvamento com base na tela atual.

**Entrega:** proposta de organização de Minha Conta com abas no desktop e no celular, agrupando dados pessoais, aparência e preferências de IA em seções fáceis de encontrar.

**Bloqueios:** nenhum para planejar. Usar o contrato de padrões pessoais do IA-M01 quando a aba IA for ligada à funcionalidade real. O seletor junto das gerações pode ser entregue antes do redesenho.

**Status:** encerrado

- [x] Propor organização com PrismTabs. Investigar quatro abas: Informações pessoais, Aparência, Funcionamento e Uso de IA. Comparar a proposta com o seletor móvel atual e o layout em duas colunas do desktop.
- [x] Mapear tema e paleta para Aparência. Em Funcionamento, reunir layout padrão, visualização inicial de Hoje e a preferência da sidebar do Instagram. Em Uso de IA, apresentar a franquia compartilhada da agência conforme o contrato de acesso atual e verificar a visibilidade por papel. Avaliar onde entram os futuros padrões por comando e o retorno aos padrões do sistema.
- [x] Definir o que salva ao confirmar o formulário e o que salva imediatamente por ação explícita. Preservar rascunhos ao trocar de aba, revelar a aba de um campo inválido e evitar sobrescrever preferências salvas por outra superfície.
- [x] Rever navegação, foco, quebra no celular, rolagem e acesso ao botão de salvar. Preservar preview de tema, autorizações e fluxo de sessão.
- [x] Entregar proposta visual e roteiro de aceite antes de alterar Minha Conta. Usar o armazenamento atual de preferências enquanto ele atender à organização escolhida.

## Proposta — 06/11/2026

[Proposta de abas em Minha Conta](../../../docs/audits/2026-11-06-ia-m02-profile-tabs-proposal.md)

- Quatro abas `PrismTabs` em todos os tamanhos: Informações pessoais, Aparência, Funcionamento e Uso de IA (modelos padrão e medidor), substituindo as duas colunas.
- Um único formulário e o botão Salvar no cabeçalho; rascunhos preservados com `shouldForceMount`; campo inválido revela sua aba.
- Salvar apenas os campos alterados (patch parcial) para não sobrescrever preferências gravadas pelo menu ou pela busca.
- Pergunta principal: a aba mostra o consumo pessoal (hoje) ou a franquia da agência; o roteiro de aceite está no documento.

## Encerramento — 06/11/2026

Implementação finalizada e validada no branch `proposal/ia-m02-profile-tabs`:
- Minha Conta dividida em 4 abas PrismTabs (`personal`, `appearance`, `behavior`, `ai`) no mobile e no desktop.
- Indicador visual (`data-slot="unsaved-indicator"`) de alterações não salvas por aba e estado dirty reativo por formulário/rascunho.
- Envio de patch parcial (`newPreferences`) contendo apenas campos alterados pelo usuário, sem sobrescrever preferências alteradas por outras superfícies.
- Componente `ProfileSetting` padronizando título, badge opcional à direita com `justify-between` e descrição.
- Seletor da sidebar do Instagram com `PrismToggleGroup` full-width e mockup animado da página do parceiro com linhas/grades sutis sem skeletons.
- Aba de Uso de IA exibe o medidor contextualizado como franquia compartilhada da agência e badge de período.
- E-mail da conta obtido da sessão autenticada (`supabase.auth.getSession()`).
- Typecheck limpo (0 erros) e testes automatizados 4/4 passando.
