'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, livrosService, alunosService } from '@/services';
import { useSimpleAlert } from '@/components/SimpleAlert';
import Loading from '@/components/Loading';

/**
 * Página inicial da aplicação - Dashboard principal
 */
export default function HomePage() {
  const [user, setUser] = useState(null);
  const [topLeitores, setTopLeitores] = useState([]);
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [generosStats, setGenerosStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const { showError } = useSimpleAlert();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        if (!authService.isAuthenticated() || !authService.isAluno()) {
          router.push('/login');
          return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        // Carregar dados do dashboard
        await Promise.all([
          loadTopLeitores(),
          loadRecomendacoes(),
          loadGenerosStats()
        ]);

      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showError('Erro ao carregar informações do dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router, showError]);

  const loadTopLeitores = async () => {
    try {
      const ranking = await alunosService.ranking('geral');
      setTopLeitores(ranking.slice(0, 3));
    } catch (error) {
      console.error('Erro ao carregar top leitores:', error);
      // Mock data para demonstração
      setTopLeitores([
        { id_aluno: 1, nome: 'Iago Farias', curso: '3º ano Informática', livros_lidos: 15, genero_favorito: 'Tech' },
        { id_aluno: 2, nome: 'Igor Farias', curso: '3º ano Informática', livros_lidos: 12, genero_favorito: 'Educacional' },
        { id_aluno: 3, nome: 'João Vicente', curso: '3º ano Redes', livros_lidos: 10, genero_favorito: 'Tech' }
      ]);
    }
  };

  const loadRecomendacoes = async () => {
    try {
      const livros = await livrosService.buscarDisponiveis(true); // Apenas livros disponíveis na página inicial
      setRecomendacoes(livros.slice(0, 6));
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      // Mock data para demonstração
      setRecomendacoes([
        { id_livro: 1, nome: 'Arquitetura Limpa', autor: 'Robert C. Martin', genero: 'Tech', preco: 'R$ 23,23', onde_encontrar: 'Amazon.com' },
        { id_livro: 2, nome: 'Clean Code', autor: 'Robert C. Martin', genero: 'Tech', preco: 'Grátis', onde_encontrar: 'BiblioTech' },
        { id_livro: 3, nome: 'Aprenda C#', autor: 'Microsoft', genero: 'Tech', preco: 'R$ 23,23', onde_encontrar: 'Amazon.com' },
        { id_livro: 4, nome: 'Calcule mais', autor: 'João Silva', genero: 'Didático', preco: 'Grátis', onde_encontrar: 'BiblioTech' },
        { id_livro: 5, nome: 'Fundamentos da Física', autor: 'Halliday', genero: 'Didático', preco: 'Grátis', onde_encontrar: 'BiblioTech' },
        { id_livro: 6, nome: 'POO', autor: 'Diversos', genero: 'Tech', preco: 'R$ 23,23', onde_encontrar: 'Amazon.com' }
      ]);
    }
  };

  const loadGenerosStats = async () => {
    try {
      // Mock data baseado no protótipo
      setGenerosStats([
        { genero: 'Romance', porcentagem: 12, cor: '#3B82F6' },
        { genero: 'Ação', porcentagem: 8, cor: '#EF4444' },
        { genero: 'Literatura', porcentagem: 8, cor: '#F59E0B' },
        { genero: 'Comédia', porcentagem: 8, cor: '#10B981' },
        { genero: 'Educacional', porcentagem: 64, cor: '#8B5CF6' }
      ]);
    } catch (error) {
      console.error('Erro ao carregar stats de gêneros:', error);
    }
  };

  const getTrofeu = (posicao) => {
    switch (posicao) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '📚';
    }
  };

  const getGeneroColor = (genero) => {
    const colors = {
      'Romance': 'bg-pink-100 text-pink-800',
      'Ação': 'bg-red-100 text-red-800',
      'Literatura': 'bg-yellow-100 text-yellow-800',
      'Comédia': 'bg-green-100 text-green-800',
      'Educacional': 'bg-purple-100 text-purple-800',
      'Didático': 'bg-blue-100 text-blue-800',
      'Tech': 'bg-green-100 text-green-800'
    };
    return colors[genero] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <Loading message="Carregando dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 min-h-screen">
      {/* Header Section */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Leitores da Semana
          </h1>
          <button 
            onClick={() => router.push('/ranking')}
            className="text-green-100 hover:text-white text-sm"
          >
            Visualizar ranking completo
          </button>
        </div>

        {/* Top 3 Leitores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topLeitores.map((leitor, index) => (
            <div key={leitor.id_aluno} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-green-600 font-bold">
                  {leitor.nome?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">{leitor.nome}</h3>
              <p className="text-green-100 text-sm mb-4">{leitor.curso}</p>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <div className="text-center">
                  <div className="text-2xl mb-1">{getTrofeu(index + 1)}</div>
                  <div className="text-2xl font-bold text-gray-900">{index + 1}º</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-t-3xl px-6 py-8 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recomendações de Livros */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recomendações de Livros</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gênero</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Onde encontrar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recomendacoes.map((livro) => (
                      <tr key={livro.id_livro} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm mr-3">
                              📖
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{livro.nome}</div>
                              <div className="text-sm text-gray-500">{livro.autor}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getGeneroColor(livro.genero)}`}>
                            {livro.genero}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{livro.onde_encontrar}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{livro.preco}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar com estatísticas */}
          <div className="space-y-6">
            {/* Gráfico de Gêneros */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gêneros de livros mais lidos da Semana
              </h3>
              
              {/* Gráfico de Pizza Simulado */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-32 h-32 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 36%)' }}></div>
                  <div className="absolute inset-0 bg-blue-500" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 88% 100%)' }}></div>
                  <div className="absolute inset-0 bg-red-500" style={{ clipPath: 'polygon(50% 50%, 88% 100%, 80% 100%)' }}></div>
                  <div className="absolute inset-0 bg-yellow-500" style={{ clipPath: 'polygon(50% 50%, 80% 100%, 72% 100%)' }}></div>
                  <div className="absolute inset-0 bg-green-500" style={{ clipPath: 'polygon(50% 50%, 72% 100%, 50% 100%, 50% 0%)' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">64%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legenda */}
              <div className="space-y-2">
                {generosStats.map((stat) => (
                  <div key={stat.genero} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: stat.cor }}></div>
                      <span className="text-sm text-gray-600">{stat.genero}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stat.porcentagem}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cards de Vídeo Educativo */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">GABARITANDO FÁCIL</h4>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">5:30</span>
                </div>
                <h3 className="font-bold text-lg mb-2">GEOMETRIA PLANA NO ENEM</h3>
                <p className="text-sm text-green-100 mb-3">PARTE 1</p>
                <div className="mb-3">
                  <h5 className="font-medium text-sm">Descrição</h5>
                  <p className="text-xs text-green-100">Vídeo aula sobre Geometria Plana para o Enem e vestibulares!</p>
                </div>
                <button className="w-full bg-white bg-opacity-20 text-white py-2 rounded font-medium text-sm hover:bg-opacity-30 transition-colors">
                  Assistir
                </button>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">REDAÇÃO</h4>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">8:45</span>
                </div>
                <h3 className="font-bold text-lg mb-2">ESTRUTURA DA REDAÇÃO PARA</h3>
                <p className="text-sm text-yellow-100 mb-3">O ENEM E VESTIBULARES</p>
                <div className="mb-3">
                  <h5 className="font-medium text-sm">Descrição</h5>
                  <p className="text-xs text-yellow-100">Vídeo aula sobre a estrutura básica da redação para o Enem e vestibulares!</p>
                </div>
                <button className="w-full bg-white bg-opacity-20 text-white py-2 rounded font-medium text-sm hover:bg-opacity-30 transition-colors">
                  Assistir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
