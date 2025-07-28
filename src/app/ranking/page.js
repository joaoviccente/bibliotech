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
      showError('Erro ao carregar ranking');
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
        return '📚';
    }
  };

  const getCorPosicao = (posicao) => {
    switch (posicao) {
      case 1:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 2:
        return 'bg-gray-100 border-gray-300 text-gray-800';
      case 3:
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-white border-gray-200 text-gray-900';
    }
  };

  const getFiltroTexto = () => {
    return 'Ranking Geral';
  };

  if (isLoading) {
    return <Loading message="Carregando ranking..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏆 Ranking de Leitores
        </h1>
        <p className="text-gray-600">
          Descubra quem são os estudantes mais dedicados à leitura
        </p>
      </div>

      {/* Minha posição */}
      {minhaPosicao && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                Sua Posição no Ranking
              </h3>
              <p className="text-blue-700">
                Você está na {minhaPosicao}ª posição no ranking geral
              </p>
            </div>
            <div className="text-4xl">
              {getTrofeu(minhaPosicao)}
            </div>
          </div>
        </div>
      )}

      {/* Ranking */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {getFiltroTexto()}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Baseado no número total de livros lidos pelos estudantes
          </p>
        </div>

        {rankings.length > 0 ? (
          <div className="space-y-4">
            {rankings.map((estudante, index) => {
              const posicao = index + 1;
              const isUsuarioAtual = user && estudante.id_aluno === user.id_aluno;
              
              return (
                <div
                  key={estudante.id_aluno}
                  className={`
                    flex items-center justify-between p-6 rounded-lg border-2 transition-all
                    ${isUsuarioAtual ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''}
                    ${getCorPosicao(posicao)}
                  `}
                >
                  {/* Lado esquerdo - Posição e informações do estudante */}
                  <div className="flex items-center space-x-4">
                    {/* Posição e troféu */}
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-1">
                        {getTrofeu(posicao)}
                      </div>
                      <span className="text-lg font-bold">
                        #{posicao}
                      </span>
                    </div>

                    {/* Avatar e informações */}
                    <div className="flex items-center space-x-4">
                      {/* Avatar simulado */}
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {estudante.nome.charAt(0).toUpperCase()}
                      </div>

                      {/* Nome e curso */}
                      <div>
                        <h3 className={`font-semibold ${isUsuarioAtual ? 'text-blue-900' : 'text-gray-900'}`}>
                          {estudante.nome}
                          {isUsuarioAtual && (
                            <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                              Você
                            </span>
                          )}
                        </h3>
                        <p className={`text-sm ${isUsuarioAtual ? 'text-blue-700' : 'text-gray-600'}`}>
                          {estudante.curso}
                        </p>
                        <p className={`text-xs ${isUsuarioAtual ? 'text-blue-600' : 'text-gray-500'}`}>
                          Matrícula: {estudante.matricula}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lado direito - Estatísticas */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isUsuarioAtual ? 'text-blue-900' : 'text-gray-900'}`}>
                      {estudante.livros_lidos || 0}
                    </div>
                    <div className={`text-sm ${isUsuarioAtual ? 'text-blue-700' : 'text-gray-600'}`}>
                      {estudante.livros_lidos === 1 ? 'livro lido' : 'livros lidos'}
                    </div>
                    
                    {/* Estatísticas adicionais */}
                    {estudante.dias_lendo > 0 && (
                      <div className={`text-xs mt-1 ${isUsuarioAtual ? 'text-blue-600' : 'text-gray-500'}`}>
                        {estudante.dias_lendo} dias lendo
                      </div>
                    )}
                    
                    {estudante.genero_favorito && (
                      <div className={`text-xs ${isUsuarioAtual ? 'text-blue-600' : 'text-gray-500'}`}>
                        Gênero favorito: {estudante.genero_favorito}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado de ranking</h3>
            <p className="text-gray-500">
              Ainda não há dados suficientes para gerar o ranking no período selecionado.
            </p>
          </div>
        )}
      </div>

      {/* Motivação */}
      {rankings.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">
            Continue Lendo! 📖✨
          </h3>
          <p className="text-blue-100">
            A leitura expande horizontes e transforma vidas. Cada livro é uma nova aventura!
          </p>
        </div>
      )}
    </div>
  );
}
