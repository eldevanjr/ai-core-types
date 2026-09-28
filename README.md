# ai-core-types

Tipos TypeScript gerados a partir dos [JSON Schemas](https://github.com/eldevanjr/ai-core) do `ai-core`
(plano §22 / CA-17). Fonte única: os modelos Pydantic do `ai-core`; aqui não há
modelo escrito à mão.

## Como funciona

```
ai-core (Pydantic)  ->  ai_core.schemas  ->  schemas/*.schema.json  ->  dist/index.d.ts
```

- `schemas/` são gerados por `uv run python -m ai_core.schemas schemas`.
- `dist/index.d.ts` é gerado por `node scripts/generate.mjs` (sem dependências).

## Uso

```ts
import type { Workspace, SearchResult, TaskProposal } from 'ai-core-types'
```

Enquanto os repositórios são separados, aponte o consumidor para esta pasta
(`"ai-core-types": "file:../ai-core-types"`) ou use `pnpm link`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm schemas` | Regenera os JSON Schemas a partir do `ai-core`. |
| `pnpm generate` | Regenera `dist/` a partir de `schemas/`. |
| `pnpm build` | `schemas` + `generate`. |
| `pnpm test` | Testa o gerador (node:test, sem dependências externas). |

Rode `pnpm build` sempre que os modelos do `ai-core` mudarem.

## Licença

Apache-2.0. Veja [LICENSE](LICENSE).
