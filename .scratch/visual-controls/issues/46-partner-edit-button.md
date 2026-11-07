# V46 — Unificar o botão de enviar foto/logotipo

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para extrair o botão comum e conferir os quatro usos lado a lado.
- **Anthropic** — Claude Haiku 5.5, para uma extração pequena com props claras e sem mudar o fluxo de upload.
- **Google** — Gemini 3.8 Flash, para aplicar o componente nos quatro pontos e comparar o resultado.

**Resumo:** o círculo clicável que mostra a foto ou o logotipo e abre o envio de imagem (Cloudinary) foi copiado em quatro telas, cada uma com pequenas diferenças de tamanho, cor da sombra no hover, ícone e variante do botão. O objetivo é ter um único componente e usá-lo nas quatro.

**Status:** aberto. Pedido do proprietário em 06/11/2026: "botão de upload de imagem de perfil do partner; existem vários desses e quero unificar".

**Bloqueado por.** Nenhum.

## Onde aparece hoje

| Tela (onde abrir no app)                              | Arquivo                                  | Diferenças observadas                                                                                                    |
| ----------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Administração → Parceiros → abrir parceiro (Logotipo da Marca) | `app/routes/app/admin/partner/$slug.tsx` | 96px (`size-24`), avatar `2xl`, `variant="ghost"`, véu `bg-foreground/40`, ícone 24px; "Remover imagem" com classes próprias |
| Administração → Clientes → abrir conta (Foto de Perfil)        | `app/routes/app/admin/client/$userId.tsx` | igual ao parceiro, mas `variant="unstyled"`                                                                               |
| Administração → Pessoas → cadastro/edição (Foto de Perfil)     | `app/components/features/AdminUserForm.tsx` | igual ao parceiro (`ghost`)                                                                                               |
| Minha Conta (Foto de Perfil)                                    | `app/routes/app/profile.tsx`             | 80px (`size-20`), avatar `xl` + `size-full`, `p-0`, `cursor-pointer`, véu `bg-black/40`, ícone 20px branco, `no-squircle!`, `gap-4` |

Os quatro repetem a mesma estrutura: `CloudinaryUpload` redondo + `UAvatar` + véu com `UploadIcon` no hover, ao lado de título, texto de ajuda e link "Remover".

## Entrega e aceite

- Criar um componente Uzzina reutilizável (por exemplo `UAvatarUpload` em `app/components/uzzina/`) que receba imagem, fallback, pasta do Cloudinary, `aria-label` e o retorno do upload. O envio continua pelo `CloudinaryUpload` existente, sem mudar pasta, recorte quadrado nem largura de saída de cada tela.
- Uma só aparência: formato redondo, um único tamanho, véu e ícone com tokens do tema (sem `bg-black`/`text-white` fixos), variante do botão definida uma vez. **Decisão do proprietário:** tamanho único (96px como no admin ou 80px como em Minha Conta).
- Foco por teclado com o anel padrão do Prism visível no círculo; o véu também aparece no foco, não só no hover. Desabilitado/enviando seguem os estados do botão.
- Avaliar se o bloco ao lado (título, texto de ajuda e "Remover imagem/foto") entra no mesmo componente ou fica nas telas; o link "Remover" usa `PrismButton link xs` sem classes próprias nos quatro.
- Substituir os quatro usos. Nomes acessíveis continuam específicos ("Alterar imagem do parceiro", "Alterar foto"). Salvamento automático do parceiro e salvamento manual de Minha Conta não mudam.
- Incluir o componente na galeria `/ui` (aba Componentes Uzzina) com `PropsPlayground`.
- Fora do escopo: botões de upload de mídia da gaveta, do Instagram, do gerenciador de conteúdo e do portal, que não são foto de perfil.

## Roteiro de validação

Abrir as quatro telas da tabela, conferir que o círculo tem o mesmo tamanho e o mesmo hover, chegar nele por Tab (anel visível), enviar uma imagem e remover em cada uma, no tema claro e no escuro.

## Resultado (06/11/2026)

**O que mudou.** Novo componente `UAvatarUpload` (`app/components/uzzina/UAvatarUpload.tsx`): círculo de 96px (único tamanho) que envolve `CloudinaryUpload` (variante `ghost`, recorte quadrado) e `UAvatar` 2xl. O véu usa `bg-foreground/40` e ícone `text-background`, e aparece no hover e no foco por teclado; o foco mostra o anel padrão do botão Prism. Props: `image`, `fallback`, `aria-label`, `cloudName`, `uploadPreset`, `folder`, `onUpload(url)`, `outputWidth` (padrão 400). Título, texto de ajuda e "Remover" ficaram nas telas, porque o texto difere por tela e juntar exigiria props só para isso. O link "Remover" agora é `PrismButton variant="link" size="xs"` sem classes próprias nas quatro telas.

**Arquivos.** `app/components/uzzina/UAvatarUpload.tsx` (novo), `app/components/ui-sections/UzzinaAvatarUploadSection.tsx` (novo, com `PropsPlayground`; sem credenciais o clique só registra aviso no console), `app/components/ui-sections/index.ts`, `app/routes/ui.tsx` (menu e seção), `app/routes/app/admin/partner/$slug.tsx`, `app/routes/app/admin/client/$userId.tsx`, `app/components/features/AdminUserForm.tsx`, `app/routes/app/profile.tsx`.

**Inalterado.** Pastas do Cloudinary, `aria-label`, `outputWidth`, salvamento automático do parceiro e salvamento manual de Minha Conta.

**Verificação.** Prettier nos arquivos alterados e `bun run typecheck` sem erros. Sem navegador, sem testes novos, sem dados reais.

**Falta.** Validação visual do proprietário nas quatro telas (tamanho igual, hover, Tab com anel, enviar e remover), em claro e escuro. Minha Conta passa de 80px para 96px, e o recuo `-ml-1` das telas de admin foi removido. Não commitado.
