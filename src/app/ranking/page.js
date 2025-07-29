'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, alunosService } from '@/services';
import { useSimpleAlert } from '@/components/SimpleAlert';
import Loading from '@/components/Loading';

/**
 * Página de ranking dos estudantes mais leitores
 */
export default function RankingPage() {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [minhaPosicao, setMinhaPosicao] = useState(null);
  const [filtros, setFiltros] = useState({
    pesquisa: '',
    turma: 'todos',
    serie: 'todos'
  });
  
  const router = useRouter();
  const { showError } = useSimpleAlert();

  const loadRanking = useCallback(async () => {
    try {
      const rankingData = await alunosService.ranking('geral');
      setRankings(rankingData);

      // Encontrar posição do usuário atual
      if (user) {
        const posicao = rankingData.findIndex(item => item.id_aluno === user.id_aluno) + 1;
        setMinhaPosicao(posicao > 0 ? posicao : null);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      // Mock data para demonstração
      setRankings([
        { id_aluno: 1, nome: 'Milena Chaves', curso: 'Administração', serie: '3º Ano', livros_lidos: 23, genero_favorito: 'Tech' },
        { id_aluno: 2, nome: 'João Vicente', curso: 'Informática', serie: '3º Ano', livros_lidos: 17, genero_favorito: 'Educacional' },
        { id_aluno: 3, nome: 'Iago Farias', curso: 'Informática', serie: '3º Ano', livros_lidos: 12, genero_favorito: 'Educacional' },
        { id_aluno: 4, nome: 'Igor Farias', curso: 'Enfermagem', serie: '3º Ano', livros_lidos: 12, genero_favorito: 'Tech' },
        { id_aluno: 5, nome: 'André Melo', curso: 'Informática', serie: '3º Ano', livros_lidos: 10, genero_favorito: 'Tech' },
        { id_aluno: 6, nome: 'Matheus', curso: 'Administração', serie: '3º Ano', livros_lidos: 10, genero_favorito: 'Tech' }
      ]);
    }
  }, [user, showError]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        if (!authService.isAuthenticated() || !authService.isAluno()) {
          router.push('/login');
          return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        showError('Erro ao carregar ranking');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router, showError]);

  useEffect(() => {
    if (user) {
      loadRanking();
    }
  }, [user, loadRanking]);

  const getTrofeu = (posicao) => {
    switch (posicao) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getGeneroColor = (genero) => {
    const colors = {
      'Tech': 'bg-green-100 text-green-800',
      'Educacional': 'bg-purple-100 text-purple-800',
      'Didático': 'bg-blue-100 text-blue-800',
      'Literatura': 'bg-yellow-100 text-yellow-800',
      'Romance': 'bg-pink-100 text-pink-800',
      'Ação': 'bg-red-100 text-red-800'
    };
    return colors[genero] || 'bg-gray-100 text-gray-800';
  };

  const calcularRankings = () => {
    if (rankings.length === 0) return { topAluno: null, topTurma: null, topGenero: null };

    // Top aluno
    const topAluno = rankings[0];

    // Top turma (agrupamento por curso)
    const turmasAgrupadas = rankings.reduce((acc, aluno) => {
      if (!acc[aluno.curso]) {
        acc[aluno.curso] = { nome: aluno.curso, total_livros: 0, alunos: 0 };
      }
      acc[aluno.curso].total_livros += aluno.livros_lidos;
      acc[aluno.curso].alunos += 1;
      return acc;
    }, {});

    const topTurma = Object.values(turmasAgrupadas).sort((a, b) => b.total_livros - a.total_livros)[0];

    // Top gênero
    const generosAgrupados = rankings.reduce((acc, aluno) => {
      if (!acc[aluno.genero_favorito]) {
        acc[aluno.genero_favorito] = { nome: aluno.genero_favorito, frequencia: 0 };
      }
      acc[aluno.genero_favorito].frequencia += aluno.livros_lidos;
      return acc;
    }, {});

    const topGenero = Object.values(generosAgrupados).sort((a, b) => b.frequencia - a.frequencia)[0];

    return { topAluno, topTurma, topGenero };
  };

  const { topAluno, topTurma, topGenero } = calcularRankings();

  const filtrarRankings = () => {
    let resultado = [...rankings];

    if (filtros.pesquisa) {
      const termo = filtros.pesquisa.toLowerCase();
      resultado = resultado.filter(aluno => 
        aluno.nome.toLowerCase().includes(termo)
      );
    }

    if (filtros.turma !== 'todos') {
      resultado = resultado.filter(aluno => aluno.curso === filtros.turma);
    }

    if (filtros.serie !== 'todos') {
      resultado = resultado.filter(aluno => aluno.serie === filtros.serie);
    }

    return resultado;
  };

  const rankingsFiltrados = filtrarRankings();

  if (isLoading) {
    return <Loading message="Carregando ranking..." />;
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 min-h-screen">
      {/* Header Section */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Ranking de Empréstimos
          </h1>
          <p className="text-green-100">
            Rankings de alunos com mais livros lidos, turma com mais empréstimos e gênero mais lido
          </p>
        </div>

        {/* Top 3 Stats - Improved visibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Top Aluno */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-30">
            <div className="flex items-center mb-3">
              <span className="text-4xl mr-3">🥇</span>
              <div>
                <div className="text-gray-900 text-sm font-bold mb-1 bg-white px-2 py-1 rounded">Aluno que mais leu:</div>
                <div className="text-gray-900 text-lg font-bold bg-white px-2 py-1 rounded mb-1">
                  {topAluno ? topAluno.nome : 'Carregando...'}
                </div>
                <div className="text-gray-700 text-sm font-medium bg-white px-2 py-1 rounded">
                  {topAluno ? `${topAluno.livros_lidos} livros` : ''}
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Turma */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-30">
            <div className="flex items-center mb-3">
              <span className="text-4xl mr-3">🏆</span>
              <div>
                <div className="text-gray-900 text-sm font-bold mb-1 bg-white px-2 py-1 rounded">Turma com mais livros:</div>
                <div className="text-gray-900 text-lg font-bold bg-white px-2 py-1 rounded mb-1">
                  {topTurma ? topTurma.nome : 'Carregando...'}
                </div>
                <div className="text-gray-700 text-sm font-medium bg-white px-2 py-1 rounded">
                  {topTurma ? `${topTurma.total_livros} livros` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Top Gênero */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-30">
            <div className="flex items-center mb-3">
              <span className="text-4xl mr-3">📚</span>
              <div>
                <div className="text-gray-900 text-sm font-bold mb-1 bg-white px-2 py-1 rounded">Gênero mais lido:</div>
                <div className="text-gray-900 text-lg font-bold bg-white px-2 py-1 rounded mb-1">
                  {topGenero ? topGenero.nome : 'Carregando...'}
                </div>
                <div className="text-gray-700 text-sm font-medium bg-white px-2 py-1 rounded">
                  {topGenero ? `${topGenero.frequencia} leituras` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-t-3xl px-6 py-8 min-h-screen">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ranking Geral</h2>
          
          {/* Filters - Improved contrast and removed "Todos" button */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filtros.pesquisa}
                  onChange={(e) => setFiltros(prev => ({ ...prev, pesquisa: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                  placeholder="Pesquisar por nome do aluno"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <select 
                  value={filtros.turma}
                  onChange={(e) => setFiltros(prev => ({ ...prev, turma: e.target.value }))}
                  className="appearance-none px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="todos">Todas as Turmas</option>
                  <option value="Informática">Informática</option>
                  <option value="Administração">Administração</option>
                  <option value="Enfermagem">Enfermagem</option>
                  <option value="Edificações">Edificações</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        {rankingsFiltrados.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Série
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Total de Livros Lidos
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Gênero mais lido
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rankingsFiltrados.map((estudante, index) => {
                    const posicao = index + 1;
                    const isUsuarioAtual = user && estudante.id_aluno === user.id_aluno;
                    const isTop3 = posicao <= 3;
                    
                    return (
                      <tr
                        key={estudante.id_aluno}
                        className={`hover:bg-gray-50 ${
                          isUsuarioAtual ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        {/* Posição */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              posicao === 1 ? 'bg-yellow-100' :
                              posicao === 2 ? 'bg-gray-100' :
                              posicao === 3 ? 'bg-orange-100' :
                              'bg-green-100'
                            }`}>
                              {getTrofeu(posicao) ? (
                                <span className="text-xl">{getTrofeu(posicao)}</span>
                              ) : (
                                <span className="text-sm font-medium text-green-600">{posicao}º</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Nome */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                              {estudante.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${isUsuarioAtual ? 'text-blue-900' : 'text-gray-900'}`}>
                                {estudante.nome}
                                {isUsuarioAtual && (
                                  <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                    Você
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Turma */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{estudante.curso}</div>
                        </td>

                        {/* Série */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{estudante.serie}</div>
                        </td>

                        {/* Total de Livros Lidos */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {estudante.livros_lidos} livros
                          </div>
                        </td>

                        {/* Gênero mais lido */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getGeneroColor(estudante.genero_favorito)}`}>
                            {estudante.genero_favorito}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar os filtros para encontrar mais resultados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
