# GEMINI.md — Frontend Workspace

> Comportamentos específicos do Antigravity para o workspace de Frontend.
> Em caso de conflito com `agents.md`, as regras aqui têm precedência.

---

## Políticas de Revisão de Artefatos

| Contexto | Política |
|----------|----------|
| Implementação de nova entidade CRUD completa | `Request Review` — apresentar plano dos 5 passos antes de executar |
| Alterações em `MainRoutes.js` ou `breadcrumbsConfig.js` | `Request Review` — erros nesses arquivos quebram a aplicação inteira |
| Ajustes de estilo, texto ou linter | `Agent Decides` |

---

## Configuração do Terminal

### ✅ Permitidos Automaticamente
```
npm run build
npm run lint
npm install
git status / git diff / git log
```

### ❌ Bloqueados — Requerem Aprovação Manual
```
rm -rf
npm uninstall (pacotes críticos)
```

---

## Design de Artefatos

Antes de iniciar qualquer nova entidade, o agente deve produzir um **Plano dos 5 Passos** em Markdown listando:
- Nomes dos arquivos que serão criados ou modificados.
- Endpoint da API que será consumido.
- Campo de código de negócio utilizado na URL.
- Prefira entender o comportamento do sistema lendo os arquivos ao invés de abrir o navegador.
- Só utilize o navegador quando o usuário pedir ou quando for estritamente necessário para obter alguma informação.

Ao concluir, gerar o **output do `npm run build`** como artefato de evidência obrigatório.

---

## Slash Commands Disponíveis

| Comando | Workflow | Descrição |
|---------|----------|-----------|
| `/newentity [nome\|endpoint\|codeField]` | `newentity.md` | Adicionar nova entidade CRUD completa |
