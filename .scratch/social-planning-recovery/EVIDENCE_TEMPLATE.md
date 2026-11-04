# TNN — evidência de execução

**Status:** não executado
**Executor:** preencher
**Revisor:** preencher quando revisado
**Data e base/diff:** preencher com identificação verificável

## Escopo e dependências

Registrar requisitos cumpridos, bloqueios conferidos e fontes D1–D6 utilizadas. Referenciar o ticket atribuído. Não assumir aprovação por existir texto no documento de decisões.

## Alteração concreta

Descrever comportamento antes/depois, caminho ativo utilizado e arquivos/símbolos modificados. Diferenciar código preparado de código efetivamente executado.

## Ambiente e fronteiras

- Identificação sanitizada do banco isolado e guarda que impede produção; nunca incluir URL com credenciais.
- Identidades/papéis/parceiros das fixtures e limpeza usada.
- Componentes reais, fronteiras substituídas e motivo de cada substituição.
- Versão de código/schema usada pelo teste.

## Resultados por teste obrigatório

Uma linha por ID do ticket. Não agrupar cenários negativos em um único PASS.

| ID        | Comando exato | Entrada/ação executada | Esperado  | Observado, incluindo IDs/contagens/versões | Estado        |
| --------- | ------------- | ---------------------- | --------- | ------------------------------------------ | ------------- |
| preencher | preencher     | preencher              | preencher | preencher                                  | não executado |

Estados de teste: passou, falhou, não executado. Teste pulado é não executado; não é passou.

## Prova de regressão

Indicar defeito anterior, caso que o detecta e evidência reproduzível antes/depois. Não executar versões defeituosas contra produção. Se a prova anterior está no relatório de revisão, referenciar cenário e demonstrar que a expectativa nova o rejeita.

## Concorrência, falha e recuperação

Quando exigido, indicar número de conexões, pedidos, falha injetada, instante da perda da resposta e consultas finais. Uma contagem de callbacks não substitui contagem de linhas no banco.

## Camadas de entrega

| Camada                               | Evidência/estado                           |
| ------------------------------------ | ------------------------------------------ |
| Código preparado                     | preencher                                  |
| Migration executada em banco isolado | preencher ou não se aplica                 |
| SQL aplicado remotamente             | não realizado, salvo evidência específica  |
| Provedor controlado                  | preencher ou não se aplica                 |
| Provedor real/qualidade editorial    | não verificado, salvo evidência específica |
| Interface no navegador               | preencher ou pendente                      |
| Aceite visual do proprietário        | pendente, salvo confirmação específica     |
| Deploy Ready                         | não realizado, salvo evidência específica  |

## Parecer

Critérios atendidos: preencher. Critérios faltantes: preencher. Se houver teste obrigatório sem execução ou prova inadequada, usar implemented-unverified; se falhou, verification-failed. Não preencher completed por padrão. Anexar pendência ao ticket responsável sem iniciar trabalho fora do escopo.
