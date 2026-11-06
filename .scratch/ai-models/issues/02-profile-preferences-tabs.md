# IA-M02 — Planejar Minha Conta em abas

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para propor abas, navegação e salvamento com base na tela atual.
- **Anthropic** — Claude Haiku 5.5, para propor abas, navegação e salvamento com base na tela atual.
- **Google** — Gemini 3.8 Flash, para propor abas, navegação e salvamento com base na tela atual.

**Entrega:** proposta de organização de Minha Conta com abas no desktop e no celular, agrupando dados pessoais, aparência e preferências de IA em seções fáceis de encontrar.

**Bloqueios:** nenhum para planejar. Usar o contrato de padrões pessoais do IA-M01 quando a aba IA for ligada à funcionalidade real. O seletor junto das gerações pode ser entregue antes do redesenho.

**Status:** proposta entregue para aceite do proprietário

- [ ] Propor organização com PrismTabs. Investigar quatro abas: Informações pessoais, Aparência, Funcionamento e Uso de IA. Comparar a proposta com o seletor móvel atual e o layout em duas colunas do desktop.
- [ ] Mapear tema e paleta para Aparência. Em Funcionamento, reunir layout padrão, visualização inicial de Hoje e a preferência da sidebar do Instagram. Em Uso de IA, apresentar a franquia compartilhada da agência conforme o contrato de acesso atual e verificar a visibilidade por papel. Avaliar onde entram os futuros padrões por comando e o retorno aos padrões do sistema.
- [ ] Definir o que salva ao confirmar o formulário e o que salva imediatamente por ação explícita. Preservar rascunhos ao trocar de aba, revelar a aba de um campo inválido e evitar sobrescrever preferências salvas por outra superfície.
- [ ] Rever navegação, foco, quebra no celular, rolagem e acesso ao botão de salvar. Preservar preview de tema, autorizações e fluxo de sessão.
- [ ] Entregar proposta visual e roteiro de aceite antes de alterar Minha Conta. Usar o armazenamento atual de preferências enquanto ele atender à organização escolhida.

## Proposta — 06/11/2026

[Proposta de abas em Minha Conta](../../../docs/audits/2026-11-06-ia-m02-profile-tabs-proposal.md)

- Quatro abas `PrismTabs` em todos os tamanhos: Informações pessoais, Aparência, Funcionamento e Uso de IA (modelos padrão e medidor), substituindo as duas colunas.
- Um único formulário e o botão Salvar no cabeçalho; rascunhos preservados com `shouldForceMount`; campo inválido revela sua aba.
- Salvar apenas os campos alterados (patch parcial) para não sobrescrever preferências gravadas pelo menu ou pela busca.
- Pergunta principal: a aba mostra o consumo pessoal (hoje) ou a franquia da agência; o roteiro de aceite está no documento.

## Conferência do branch no app real — 06/11/2026

Servido a partir de `proposal/ia-m02-profile-tabs` (`7345909`), em `127.0.0.1:5176`, com a sessão do proprietário e largura de celular (503px). Só leitura, sem salvar nada.
- Quatro abas PrismTabs (Informações pessoais, Aparência, Funcionamento, Uso de IA) com rolagem horizontal. A linha de seleção acompanha a aba ativa. Salvar Alterações fica no cabeçalho.
- Aparência mostra tema, cor de destaque e Usar Cores dos Clientes. Funcionamento mostra layout padrão, visualização inicial do Hoje e sidebar do Instagram. Uso de IA mostra a franquia de novembro (4,64%, 27 gerações) e os três padrões no GPT-6 Luna, com o botão de voltar oculto.
- Não verificado: envio parcial e revelação de campo inválido, que exigiriam apertar Salvar com dados reais. Fica para o roteiro do proprietário.
- Já existia antes do branch: os blocos "Usar Cores dos Clientes" e "Sidebar do Instagram" ficam em caixa com borda (`UPreferenceSwitch`, pendente no DS01).
