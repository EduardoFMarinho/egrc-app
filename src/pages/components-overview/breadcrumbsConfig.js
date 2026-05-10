export const routeMapping = {
  "/dashboard/resumo": { title: "Dashboard", parent: null },
  "/dashboard/analytics": { title: "Analytics", parent: null },

  "/empresas/lista": { title: "Empresas", parent: null },
  "/empresas/criar": {
    title: "Nova Empresa",
    editTitle: "Editar Empresa",
    parent: "/empresas/lista",
  },

  "/departamentos/lista": { title: "Departamentos", parent: null },
  "/departamentos/criar": {
    title: "Novo Departamento",
    editTitle: "Editar Departamento",
    parent: "/departamentos/lista",
  },

  "/processos/lista": { title: "Processos", parent: null },
  "/processos/criar": {
    title: "Novo Processo",
    editTitle: "Editar Processo",
    parent: "/processos/lista",
  },

  "/dados/lista": { title: "Dados", parent: null },
  "/dados/criar": {
    title: "Novo Dado",
    editTitle: "Editar Dado",
    parent: "/dados/lista",
  },

  "/contas/lista": { title: "Contas", parent: null },
  "/contas/criar": {
    title: "Nova Conta",
    editTitle: "Editar Conta",
    parent: "/contas/lista",
  },

  "/ativos/lista": { title: "Ativos", parent: null },
  "/ativos/criar": {
    title: "Novo Ativo",
    editTitle: "Editar Ativo",
    parent: "/ativos/lista",
  },

  "/riscos/lista": { title: "Riscos", parent: null },
  "/riscos/criar": {
    title: "Novo Risco",
    editTitle: "Editar Risco",
    parent: "/riscos/lista",
  },

  "/ciclos/lista": { title: "Ciclos", parent: null },
  "/ciclos/criar": {
    title: "Novo Ciclo",
    editTitle: "Editar Ciclo",
    parent: "/ciclos/lista",
  },

  "/avaliacoes/lista": { title: "Avaliações de Risco", parent: null },
  "/avaliacoes/criar": {
    title: "Nova Avaliação de Risco",
    editTitle: "Editar Avaliação de Risco",
    parent: "/avaliacoes/lista",
  },

  "/indices/lista": { title: "Índices", parent: null },
  "/indices/criar": {
    title: "Novo Índice",
    editTitle: "Editar Índice",
    parent: "/indices/lista",
  },

  "/questionarios/lista": { title: "Questionários", parent: null },

  "/questionarios/criar": {
    title: "Novo Questionário",
    editTitle: "Editar Questionário",
    parent: "/avaliacoes/criar",
  },

  "/incidentes/lista": { title: "Incidentes", parent: null },
  "/incidentes/criar": {
    title: "Novo Incidente",
    editTitle: "Editar Incidente",
    parent: "/incidentes/lista",
  },

  "/categorias/lista": { title: "Categorias", parent: null },
  "/categorias/criar": {
    title: "Nova Categoria",
    editTitle: "Editar Categoria",
    parent: "/categorias/lista",
  },

  "/perfis/lista": { title: "Perfis", parent: null },
  "/perfis/criar": {
    title: "Novo Perfil",
    editTitle: "Editar Perfil",
    parent: "/perfis/lista",
  },

  "/controles/lista": { title: "Controles", parent: null },
  "/controles/criar": {
    title: "Novo Controle",
    editTitle: "Editar Controle",
    parent: "/controles/lista",
  },

  "/ipes/lista": { title: "IPEs", parent: null },
  "/ipes/criar": {
    title: "Novo IPE",
    editTitle: "Editar IPE",
    parent: "/ipes/lista",
  },

  "/objetivos/lista": { title: "Objetivos", parent: null },
  "/objetivos/criar": {
    title: "Novo Objetivo",
    editTitle: "Editar Objetivo",
    parent: "/objetivos/lista",
  },

  "/fase/lista": { title: "Fases de Teste", parent: null },
  "/fase/criar": {
    title: "Nova Fase",
    editTitle: "Editar Fase",
    parent: "/testes/criar",
  },

  "/esg/lista": { title: "Perfil ESG", parent: null },
  "/esg/criar": {
    title: "Novo Perfil ESG",
    editTitle: "Editar Perfil ESG",
    parent: "/esg/lista",
  },

  "/indicadores/lista": { title: "Indicadores", parent: null },
  "/indicadores/criar": {
    title: "Novo Indicador",
    editTitle: "Editar Indicador",
    parent: "/indicadores/lista",
  },

  "/priorizacao/lista": { title: "Ciclo Priorização", parent: null },
  "/priorizacao/criar": {
    title: "Novo Ciclo Priorização",
    editTitle: "Editar Ciclo Priorização",
    parent: "/priorizacao/lista",
  },

  "/medida/lista": { title: "Medidas", parent: null },
  "/medida/criar": {
    title: "Nova Medida",
    editTitle: "Editar Medida",
    parent: "/medida/lista",
  },

  "/dimensao/lista": { title: "Dimensões", parent: null },
  "/dimensao/criar": {
    title: "Nova Dimensão",
    editTitle: "Editar Dimensão",
    parent: "/dimensao/lista",
  },

  "/fonteDeDados/lista": { title: "Fonte de dados", parent: null },
  "/fonteDeDados/criar": {
    title: "Nova Fonte de Dados",
    editTitle: "Editar Fonte de Dados",
    parent: "/fonteDeDados/lista",
  },

  "/fatoresEmissao/lista": { title: "Fatores de emissão", parent: null },
  "/fatoresEmissao/criar": {
    title: "Novo Fator de Emissão",
    editTitle: "Editar Fator de Emissão",
    parent: "/fatoresEmissao/lista",
  },

  "/gestaoColeta/lista": { title: "Gestão de Coletas", parent: null },

  "/colaboradores/lista": { title: "Colaboradores", parent: null },
  "/colaboradores/criar": {
    title: "Novo Colaborador",
    editTitle: "Editar Colaborador",
    parent: "/colaboradores/lista",
  },
  "/colaboradores/trocar-senha": { title: "Trocar Senha", parent: null },

  "/temas/lista": { title: "Temas", parent: null },
  "/temas/criar": {
    title: "Novo Tema",
    editTitle: "Editar Tema",
    parent: "/temas/lista",
  },
  "/temas/editar/<<themeCode>>": {
    title: "Editar Tema",
    parent: "/temas/lista",
  },

  "/impactoEsg/lista": { title: "Impacto ESG", parent: null },
  "/impactoEsg/criar": {
    title: "Novo Impacto ESG",
    editTitle: "Editar Impacto ESG",
    parent: "/impactoEsg/lista",
  },

  "/grupoTemas/lista": { title: "Grupo", parent: null },
  "/grupoTemas/criar": {
    title: "Novo Grupo",
    editTitle: "Editar Grupo",
    parent: "/grupoTemas/lista",
  },
  "/grupoTemas/editar/<<idThemeGroup>>": {
    title: "Editar Grupo",
    parent: "/grupoTemas/lista",
  },

  "/coleta/lista": { title: "Métrica com coleta", parent: null },
  "/coleta/criar": {
    title: "Nova Métrica",
    editTitle: "Editar Métrica",
    parent: "/coleta/lista",
  },
  "/coleta/editar/<<id>>": {
    title: "Editar Métrica",
    parent: "/coleta/lista",
  },

  "/padroesFrameworks/lista": { title: "Padrões e frameworks", parent: null },
  "/padroesFrameworks/criar": {
    title: "Novo Padrão",
    editTitle: "Editar Padrão",
    parent: "/padroesFrameworks/lista",
  },

  "/ods/lista": { title: "ODS", parent: null },
  "/ods/criar": {
    title: "Novo ODS",
    editTitle: "Editar ODS",
    parent: "/ods/lista",
  },
  "/ods/editar/<<idOds>>": {
    title: "Editar ODS",
    parent: "/ods/lista",
  },

  "/projetos/lista": { title: "Projetos", parent: null },
  "/projetos/criar": {
    title: "Novo Projeto",
    editTitle: "Editar Projeto",
    parent: "/projetos/lista",
  },

  "/normativas/lista": { title: "Normativas", parent: null },
  "/normativas/criar": {
    title: "Nova Normativa",
    editTitle: "Editar Normativa",
    parent: "/normativas/lista",
  },
  "/normativos/aprovar": {
    title: "Aprovar Normativa",
    parent: "/normativas/lista",
  },

  "/planos/lista": { title: "Planos", parent: null },
  "/planos/criar": {
    title: "Novo Plano",
    editTitle: "Editar Plano",
    parent: "/planos/lista",
  },

  "/deficiencias/lista": { title: "Deficiências", parent: null },
  "/deficiencias/criar": {
    title: "Nova Deficiência",
    editTitle: "Editar Deficiência",
    parent: "/deficiencias/lista",
  },

  "/testes/lista": { title: "Testes", parent: null },
  "/testes/criar": {
    title: "Novo Teste",
    editTitle: "Editar Teste",
    parent: "/testes/lista",
  },
};

export const addRoute = (path, title, parent = null, editTitle = null) => {
  routeMapping[path] = { title, parent, editTitle };
};

export const getRouteInfo = (path, options = {}) => {
  const route = routeMapping[path];
  if (!route) return null;

  const { isEdit = false } = options;
  return {
    ...route,
    activeTitle: isEdit && route.editTitle ? route.editTitle : route.title,
  };
};

export const buildBreadcrumbPath = (pathname, options = {}) => {
  const items = [];
  let currentRoute = routeMapping[pathname];

  if (!currentRoute) {
    const matchingKey = Object.keys(routeMapping).find((key) => {
      if (!key.includes("<<")) return false;
      const regexStr = key.replace(/<<.*?>>/g, ".*");
      const regex = new RegExp(`^${regexStr}$`);
      return regex.test(pathname);
    });
    if (matchingKey) {
      currentRoute = routeMapping[matchingKey];
    }
  }

  if (!currentRoute) {
    return items;
  }

  const { isEdit = false, customTitle = null, recordName = null } = options;

  const buildPath = (route) => {
    if (route.parent) {
      const parentRoute = routeMapping[route.parent];
      if (parentRoute) {
        buildPath(parentRoute);

        let parentTitle =
          parentRoute.editTitle ||
          parentRoute.title.replace(/^Novo\s|^Nova\s/i, "Editar ");

        const savedParentName =
          typeof window !== "undefined"
            ? sessionStorage.getItem(`breadcrumb_${route.parent}`)
            : null;

        if (savedParentName) {
          const shortName =
            savedParentName.length > 40
              ? `${savedParentName.substring(0, 40)}...`
              : savedParentName;
          parentTitle = `${parentTitle}: ${shortName}`;
        }

        items.push({
          title: parentTitle,
          path: route.parent,
          isLink: true,
        });
      }
    }
  };

  buildPath(currentRoute);

  let finalTitle = currentRoute.title;

  if (customTitle) {
    finalTitle = customTitle;
  } else {
    if (isEdit && currentRoute.editTitle) {
      finalTitle = currentRoute.editTitle;
    } else if (isEdit) {
      finalTitle = finalTitle.replace(/^Novo\s|^Nova\s/i, "Editar ");
    }

    if (isEdit && recordName) {
      const shortName =
        recordName.length > 40
          ? `${recordName.substring(0, 40)}...`
          : recordName;
      finalTitle = `${finalTitle}: ${shortName}`;
    }
  }

  items.push({
    title: finalTitle,
    path: pathname,
    isLink: false,
  });

  return items;
};
