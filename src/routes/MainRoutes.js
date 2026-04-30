import { lazy } from 'react';

// project import
import Loadable from '../components/Loadable';
import DashboardLayout from '../layout/Dashboard';
import PagesLayout from '../layout/Pages';
import SimpleLayout from '../layout/Simple';
import { SimpleLayoutType } from '../config';


// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('../pages/dashboard/resumo')));
const DashboardAnalytics = Loadable(lazy(() => import('../pages/dashboard/analytics')));

const ListaEmpresas = Loadable(lazy(() => import('../pages/apps/empresas/listaEmpresas')));
const ListaDepartamentos = Loadable(lazy(() => import('../pages/apps/departamentos/listaDepartamentos')));
const ListaProcessos = Loadable(lazy(() => import('../pages/apps/processos/listaProcessos')));
const ListaDados = Loadable(lazy(() => import('../pages/apps/dados/listaDados')));
const ListaContas = Loadable(lazy(() => import('../pages/apps/contas/listaContas')));
const ListaFaseTeste = Loadable(lazy(() => import('../pages/apps/configuracoes/listaFaseTeste')));
const ListaQuestionariosMain = Loadable(lazy(() => import('../pages/apps/configuracoes/listaQuestionariosMain')));
const ListaAtivos = Loadable(lazy(() => import('../pages/apps/ativos/listaAtivos')));
const ListaRiscos = Loadable(lazy(() => import('../pages/apps/riscos/listaRiscos')));
const ListaCiclos = Loadable(lazy(() => import('../pages/apps/ciclos/listaCiclos')));
const ListaControles = Loadable(lazy(() => import('../pages/apps/controles/listaControles')));
const ListaIpes = Loadable(lazy(() => import('../pages/apps/ipes/listaIpes')));
const NovaEmpresa = Loadable(lazy(() => import('../pages/apps/empresas/novaEmpresa')));
const ListaIndice = Loadable(lazy(() => import('../pages/apps/indices/listaIndices')));
const ListaIncidentes = Loadable(lazy(() => import('../pages/apps/incidentes/listaIncidentes')));
const ListaCategorias = Loadable(lazy(() => import('../pages/apps/categorias/listaCategorias')));
const ListaPerfil = Loadable(lazy(() => import('../pages/apps/perfisAnalise/listaPerfis')));
const ListaNormativos = Loadable(lazy(() => import('../pages/apps/tela2/listaNormativos')));
const ListaLibreOffice = Loadable(lazy(() => import('../pages/apps/tela2/listaLibreOffice')));
const ListaPlanos = Loadable(lazy(() => import('../pages/apps/tela2/listaPlanos')));
const ListaESG = Loadable(lazy(() => import('../pages/apps/tela2/listaPerfilEsg')));
const ListaColaboradores = Loadable(lazy(() => import('../pages/apps/colaboradores/listaColaboradores')));
const ListaImpactoEsg = Loadable(lazy(() => import('../pages/apps/tela2/listaImpactoEsg')));
const ListaTema = Loadable(lazy(() => import('../pages/apps/tela2/listaTema')));
const ListaOds = Loadable(lazy(() => import('../pages/apps/tela2/listaOds')));
const ListaGrupoTemas = Loadable(lazy(() => import('../pages/apps/tela2/listaGrupoTemas')));
const ListaPadroesFrameworks = Loadable(lazy(() => import('../pages/apps/tela2/listaPadroesFrameworks')));
const ListaPriorizacao = Loadable(lazy(() => import('../pages/apps/tela2/listaPriorizacao')));
const ListaObjetivos = Loadable(lazy(() => import('../pages/apps/objetivos/listaObjetivos')));
const ListaProjetos = Loadable(lazy(() => import('../pages/apps/tela2/listaProjetos')));
const ListaDeficiencias = Loadable(lazy(() => import('../pages/apps/tela2/listaDeficiencias')));
const ListaTestes = Loadable(lazy(() => import('../pages/apps/tela2/listaTestes')));
const ListaIndicadores = Loadable(lazy(() => import('../pages/apps/tela2/listaIndicadores')));
const ListaMedida = Loadable(lazy(() => import('../pages/apps/tela2/listaMedidas')));
const ListaColeta = Loadable(lazy(() => import('../pages/apps/tela2/listaColeta')));
const ListaDimensao = Loadable(lazy(() => import('../pages/apps/tela2/listaDimensao')));
const ListaFonteDeDados = Loadable(lazy(() => import('../pages/apps/tela2/listaFonteDeDados')));
const ListaGestaoColeta = Loadable(lazy(() => import('../pages/apps/configuracoes/ListagemDeGestaoDeColeta')));
const ListaFatoresEmissao = Loadable(lazy(() => import('../pages/apps/tela2/listaFatoresEmissao')));
const NovoDepartamento = Loadable(lazy(() => import('../pages/apps/departamentos/novoDepartamento')));
const NovoProcesso = Loadable(lazy(() => import('../pages/apps/processos/novoProcesso')));
const NovoDado = Loadable(lazy(() => import('../pages/apps/dados/novoDado')));
const NovaDimensao = Loadable(lazy(() => import('../pages/apps/configuracoes/novaDimensao')));
const NovoESG = Loadable(lazy(() => import('../pages/apps/configuracoes/novoPerfilEsg')));
const NovoTema = Loadable(lazy(() => import('../pages/apps/configuracoes/novoTema')));
const NovoGrupoTemas = Loadable(lazy(() => import('../pages/apps/configuracoes/novoGrupoTemas')));
const NovaPriorizacao = Loadable(lazy(() => import('../pages/apps/configuracoes/novaPriorizacao')));
const NovaConta = Loadable(lazy(() => import('../pages/apps/contas/novaConta')));
const NovoAtivo = Loadable(lazy(() => import('../pages/apps/ativos/novoAtivo')));
const NovoRisco = Loadable(lazy(() => import('../pages/apps/riscos/novoRisco')));
const NovoIndicador = Loadable(lazy(() => import('../pages/apps/configuracoes/novoIndicador')));
const NovoPadroesFrameworks = Loadable(lazy(() => import('../pages/apps/configuracoes/novoPadroesFrameworks')));
const NovoImpactoEsg = Loadable(lazy(() => import('../pages/apps/configuracoes/novoImpactoEsg')));
const NovaMedida = Loadable(lazy(() => import('../pages/apps/configuracoes/novaMedida')));
const NovoCiclo = Loadable(lazy(() => import('../pages/apps/ciclos/novoCiclo')));
const NovaFaseTeste = Loadable(lazy(() => import('../pages/apps/configuracoes/novaFaseTeste')));
const NovoIndice = Loadable(lazy(() => import('../pages/apps/indices/novoIndice')));
const NovoFatoresEmissao = Loadable(lazy(() => import('../pages/apps/configuracoes/novoFatoresEmissao')));
const NovoIncidente = Loadable(lazy(() => import('../pages/apps/incidentes/novoIncidente')));
const NovaCategoria = Loadable(lazy(() => import('../pages/apps/categorias/novaCategoria')));
const NovoPerfil = Loadable(lazy(() => import('../pages/apps/perfisAnalise/novoPerfil')));
const DetalheColeta = Loadable(lazy(() => import('../pages/apps/configuracoes/DetalheColeta')));
const NovaColeta = Loadable(lazy(() => import('../pages/apps/configuracoes/novaColeta')));
const NovoControle = Loadable(lazy(() => import('../pages/apps/controles/novoControle')));
const NovoColaborador = Loadable(lazy(() => import('../pages/apps/colaboradores/novoColaborador')));
const NovaNormativa = Loadable(lazy(() => import('../pages/apps/configuracoes/novaNormativa')));
const NovaFonteDeDados = Loadable(lazy(() => import('../pages/apps/configuracoes/novaFonteDeDados')));
const NovoPlano = Loadable(lazy(() => import('../pages/apps/configuracoes/novoPlano')));
const NovaDeficiencia = Loadable(lazy(() => import('../pages/apps/configuracoes/novaDeficiencia')));
const NovoTeste = Loadable(lazy(() => import('../pages/apps/configuracoes/novoTeste')));
const NovoIpe = Loadable(lazy(() => import('../pages/apps/ipes/novoIpe')));
const NovoOds = Loadable(lazy(() => import('../pages/apps/configuracoes/novoOds')));
const NovoObjetivo = Loadable(lazy(() => import('../pages/apps/objetivos/novoObjetivo')));
const NovoQuestionario = Loadable(lazy(() => import('../pages/apps/configuracoes/novoQuestionario')));
const NovoProjeto = Loadable(lazy(() => import('../pages/apps/configuracoes/novoProjeto')));
const ListaAvaliacaoRisco = Loadable(lazy(() => import('../pages/apps/avaliacoesRisco/listaAvaliacaoRisco')));
const NovaAvaliacaoRisco = Loadable(lazy(() => import('../pages/apps/avaliacoesRisco/novaAvaliacaoRisco')));
const LibreOffice = Loadable(lazy(() => import('../pages/extra-pages/sample-page')));
const AuthLogin = Loadable(lazy(() => import('../pages/auth/login')));
const AuthRegister = Loadable(lazy(() => import('../pages/auth/register')));
const TrocarSenha = Loadable(lazy(() => import('../pages/apps/colaboradores/TrocarSenha')));
const DetalhesUsuario = Loadable(lazy(() => import('../sections/apps/chat/UserDetails')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'dashboard',
          children: [
            {
              path: 'resumo',
              element: <DashboardDefault />
            },
            {
              path: 'analytics',
              element: <DashboardAnalytics />
            },
          ]
        },
        {
          path: 'empresas',
          children: [
            {
              path: 'lista',
              element: <ListaEmpresas />
            },
            {
              path: 'criar',
              element: <NovaEmpresa />
            },
          ]
        },
        {
          path: 'departamentos',
          children: [
            {
              path: 'lista',
              element: <ListaDepartamentos />
            },
            {
              path: 'criar',
              element: <NovoDepartamento />
            },
          ]
        },
        {
          path: 'processos',
          children: [
            {
              path: 'lista',
              element: <ListaProcessos />
            },
            {
              path: 'criar',
              element: <NovoProcesso />
            },
          ]
        },
        {
          path: 'dados',
          children: [
            {
              path: 'lista',
              element: <ListaDados />
            },
            {
              path: 'criar',
              element: <NovoDado />
            },
          ]
        },
        {
          path: 'contas',
          children: [
            {
              path: 'lista',
              element: <ListaContas />
            },
            {
              path: 'criar',
              element: <NovaConta />
            },
          ]
        },
        {
          path: 'ativos',
          children: [
            {
              path: 'lista',
              element: <ListaAtivos />
            },
            {
              path: 'criar',
              element: <NovoAtivo />
            },
          ]
        },
        {
          path: 'riscos',
          children: [
            {
              path: 'lista',
              element: <ListaRiscos />
            },
            {
              path: 'criar',
              element: <NovoRisco />
            },
          ]
        },
        {
          path: 'ciclos',
          children: [
            {
              path: 'lista',
              element: <ListaCiclos />
            },
            {
              path: 'criar',
              element: <NovoCiclo />
            },
          ]
        },
        {
          path: 'avaliacoes',
          children: [
            {
              path: 'lista',
              element: <ListaAvaliacaoRisco />
            },
            {
              path: 'criar',
              element: <NovaAvaliacaoRisco />
            },
          ]
        },
        {
          path: 'indices',
          children: [
            {
              path: 'lista',
              element: <ListaIndice />
            },
            {
              path: 'criar',
              element: <NovoIndice />
            },
          ]
        },
        {
          path: 'questionarios',
          children: [
            {
              path: 'criar',
              element: <NovoQuestionario />
            },
            {
              path: 'lista',
              element: <ListaQuestionariosMain />
            },
          ]
        },
        {
          path: 'incidentes',
          children: [
            {
              path: 'lista',
              element: <ListaIncidentes />
            },
            {
              path: 'criar',
              element: <NovoIncidente />
            },
          ]
        },
        {
          path: 'categorias',
          children: [
            {
              path: 'lista',
              element: <ListaCategorias />
            },
            {
              path: 'criar',
              element: <NovaCategoria />
            },
          ]
        },
        {
          path: 'perfis',
          children: [
            {
              path: 'lista',
              element: <ListaPerfil />
            },
            {
              path: 'criar',
              element: <NovoPerfil />
            },
          ]
        },
        {
          path: 'detalheColeta',
          children: [
            {
              path: 'criar',
              element: <DetalheColeta />
            },
          ]
        },
        {
          path: 'controles',
          children: [
            {
              path: 'lista',
              element: <ListaControles />
            },
            {
              path: 'criar',
              element: <NovoControle />
            },
          ]
        },
        {
          path: 'ipes',
          children: [
            {
              path: 'lista',
              element: <ListaIpes />
            },
            {
              path: 'criar',
              element: <NovoIpe />
            },
          ]
        },
        {
          path: 'objetivos',
          children: [
            {
              path: 'lista',
              element: <ListaObjetivos />
            },
            {
              path: 'criar',
              element: <NovoObjetivo />
            },
          ]
        },
        {
          path: 'fase',
          children: [
            {
              path: 'lista',
              element: <ListaFaseTeste />
            },
            {
              path: 'criar',
              element: <NovaFaseTeste />
            },
          ]
        },
        {
          path: 'projetos',
          children: [
            {
              path: 'lista',
              element: <ListaProjetos />
            },
            {
              path: 'criar',
              element: <NovoProjeto />
            },
          ]
        },
        {
          path: 'normativas',
          children: [
            {
              path: 'lista',
              element: <ListaNormativos />
            },
            {
              path: 'criar',
              element: <NovaNormativa />
            },
          ]
        },
        {
          path: 'normativos',
          children: [
            {
              path: 'aprovar',
              element: <NovaNormativa />
            }
          ]
        },
        {
          path: 'planos',
          children: [
            {
              path: 'lista',
              element: <ListaPlanos />
            },
            {
              path: 'criar',
              element: <NovoPlano />
            },
          ]
        },
        {
          path: 'deficiencias',
          children: [
            {
              path: 'lista',
              element: <ListaDeficiencias />
            },
            {
              path: 'criar',
              element: <NovaDeficiencia />
            },
          ]
        },
        {
          path: 'libreOffice',
          children: [
            {
              path: 'lista',
              element: <ListaLibreOffice />
            },
            {
              path: 'iframe',
              element: <LibreOffice />
            },
          ]
        },
        {
          path: 'esg',
          children: [
            {
              path: 'lista',
              element: <ListaESG />
            },
            {
              path: 'criar',
              element: <NovoESG />
            },
            {
              path: 'editar/:id',
              element: <NovoESG />
            },
          ]
        },
        {
          path: 'colaboradores',
          children: [
            {
              path: 'lista',
              element: <ListaColaboradores />
            },
            {
              path: 'criar',
              element: <NovoColaborador />
            },
            {
              path: 'trocar-senha', 
              element: <TrocarSenha />
            },
            {
              path: 'detalhes-usuario', 
              element: <DetalhesUsuario />
            },
          ]
        },
        {
          path: 'ods',
          children: [
            {
              path: 'lista',
              element: <ListaOds />
            },
            {
              path: 'criar',
              element: <NovoOds />
            },
            {
              path: 'editar/:id',
              element: <NovoOds />
            },
          ]
        },
        {
          path: 'temas',
          children: [
            {
              path: 'lista',
              element: <ListaTema />
            },
            {
              path: 'criar',
              element: <NovoTema />
            },
            {
              path: 'editar/:themeCode',
              element: <NovoTema />
            },
          ]
        },
        {
          path: 'grupoTemas',
          children: [
            {
              path: 'lista',
              element: <ListaGrupoTemas />
            },
            {
              path: 'criar',
              element: <NovoGrupoTemas />
            },
            {
              path: 'editar/:id',
              element: <NovoGrupoTemas />
            },
          ]
        },
        {
          path: 'impactoEsg',
          children: [
            {
              path: 'lista',
              element: <ListaImpactoEsg />
            },
            {
              path: 'criar',
              element: <NovoImpactoEsg />
            },
            {
              path: 'editar/:id',
              element: <NovoImpactoEsg />
            },
          ]
        },
        {
          path: 'indicadores',
          children: [
            {
              path: 'lista',
              element: <ListaIndicadores />
            },
            {
              path: 'criar',
              element: <NovoIndicador />
            },
            {
              path: 'editar/:id',
              element: <NovoIndicador />
            },
          ]
        },
        {
          path: 'coleta',
          children: [
            {
              path: 'lista',
              element: <ListaColeta />
            },
            {
              path: 'criar',
              element: <NovaColeta />
            },
            {
              path: 'editar/:id',
              element: <NovaColeta />
            },
          ]
        },
        {
          path: 'dimensao',
          children: [
            {
              path: 'lista',
              element: <ListaDimensao />
            },
            {
              path: 'criar',
              element: <NovaDimensao />
            },
            {
              path: 'editar/:id',
              element: <NovaDimensao />
            },
          ]
        },
        {
          path: 'medida',
          children: [
            {
              path: 'lista',
              element: <ListaMedida />
            },
            {
              path: 'criar',
              element: <NovaMedida />
            },
            {
              path: 'editar/:id',
              element: <NovaMedida />
            },
          ]
        },
        {
          path: 'fonteDeDados',
          children: [
            {
              path: 'lista',
              element: <ListaFonteDeDados />
            },
            {
              path: 'criar',
              element: <NovaFonteDeDados />
            },
            {
              path: 'editar/:id',
              element: <NovaFonteDeDados />
            },
          ]
        },
        {
          path: 'fatoresEmissao',
          children: [
            {
              path: 'lista',
              element: <ListaFatoresEmissao />
            },
            {
              path: 'criar',
              element: <NovoFatoresEmissao />
            },
            {
              path: 'editar/:id',
              element: <NovoFatoresEmissao />
            },
          ]
        },
        {
          path: 'gestaoColeta',
          children: [
            {
              path: 'lista',
              element: <ListaGestaoColeta />
            },
          ]
        },
        {
          path: 'padroesFrameworks',
          children: [
            {
              path: 'lista',
              element: <ListaPadroesFrameworks />
            },
            {
              path: 'criar',
              element: <NovoPadroesFrameworks />
            },
          ]
        },
        {
          path: 'priorizacao',
          children: [
            {
              path: 'lista',
              element: <ListaPriorizacao />
            },
            {
              path: 'criar',
              element: <NovaPriorizacao />
            },
            {
              path: 'editar/:id',
              element: <NovaPriorizacao />
            },
          ]
        },
        {
          path: 'testes',
          children: [
            {
              path: 'lista',
              element: <ListaTestes />
            },
            {
              path: 'criar',
              element: <NovoTeste />
            },
          ]
        },
      ]
    },
    {
      path: '/auth',
      element: <PagesLayout />,
      children: [
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'register',
          element: <AuthRegister />
        },
      ]
    },
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
      ]
    }
  ]
};

export default MainRoutes;
