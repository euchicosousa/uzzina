# Localhost usando produção

Em 27/10/2026 o proprietário solicitou retirar o banco de staging do desenvolvimento habitual, devido à necessidade recorrente de reativação, e autorizou usar produção no localhost. A alteração é de configuração local; projeto remoto de staging, dados e histórico foram preservados.

## Configuração vigente

- `bun run dev` inicia Vite por Node, no modo `production`, em `http://127.0.0.1:5176`, com porta fixa.
- `.env.production.local`, ignorado pelo Git e com permissão privada 0600, contém as mesmas configurações de banco, OpenAI e Cloudinary da cópia de publicação `.env.vercel-production.local`.
- A única diferença intencional é APP_ORIGIN: localhost no arquivo de desenvolvimento, domínio publicado na cópia para Vercel.
- Navegador e APIs locais usam o mesmo projeto de produção, `dfepmjcozszswocwvdpq`. As contas são as reais de produção; as contas fictícias de staging deixam de ser usadas no login local.
- O modo de configuração `production` não substitui o servidor de desenvolvimento pelo preview estático. As APIs continuam disponíveis pelo adaptador local.
- O adaptador mantém UZZINA_LOCAL_AI_COMPAT=false nesse modo; a reserva persistente de IA de produção permanece obrigatória.
- O build local também lê o arquivo padrão de produção. Publicação Vercel mantém suas variáveis próprias e não foi alterada.
- Arquivos/scripts explicitamente destinados a staging permanecem históricos e não foram redirecionados para produção. Nenhum teste de escrita de staging foi executado em produção.

## Verificações

- Configuração carregada pelo Vite conferida sem imprimir valores privados: URLs do navegador e servidor coincidem com produção; credenciais correspondem à cópia de publicação; APP_ORIGIN local/público preservados em seus respectivos arquivos.
- Arquivo de ambiente ignorado pelo Git; ausência de secret key nas variáveis VITE_ conferida. Build examinado em memória para confirmar que as chaves privadas Supabase/OpenAI não foram incluídas nos arquivos do frontend.
- Auth de produção respondeu HTTP200 a GET de settings com chave pública. Uma consulta HEAD de people com o cliente Supabase e a chave de servidor confirmou leitura, sem retornar linhas ou dados pessoais. Nenhuma mutação, login real, geração de IA ou upload realizado.
- Servidor reiniciado pelo novo comando. O módulo efetivamente entregue pelo localhost contém o endpoint de produção e não o antigo endpoint de staging. GET /api/ai retornou405 pelo handler real, antes de autenticação/quota/geração.
- Plugin real do Vite, inicializado no modo production em middleware, manteve UZZINA_LOCAL_AI_COMPAT=false.
- 401 testes passaram; format, lint, typecheck e build passaram; sete verificações serverless passaram. Aviso conhecido de chunks grandes permanece. Diff e referências conferidos.

## Limites

Não houve alteração de schema, permissões, Auth remoto, projeto Vercel, push ou deploy. O login com a conta pessoal do proprietário ainda depende da entrada dele no navegador; nenhuma senha foi solicitada ou recuperada. Edições futuras feitas pelo usuário no localhost atingem os mesmos dados de produção por decisão explícita dele.

Ticket01 de organização do painel permanece preparado localmente para revisão; tickets02–04 não foram iniciados nesta mudança de ambiente.
